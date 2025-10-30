import type { Context, Config } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types_db';

const SYSTEM_INSTRUCTION = `You are Zen, a motivating and friendly AI productivity assistant for the ZenQuest app. 
Your goal is to help users manage tasks, build good habits, and stay on track. 
Keep your responses concise, encouraging, and actionable. You can use emojis to make the conversation more engaging.
If asked for suggestions, provide simple, actionable ideas for new tasks, habits, or quests.
Here is some context about the user's current situation:`;

interface MessagePayload {
  messages: Array<{ role: string; text: string }>;
}

export default async (req: Request, context: Context) => {
  // Validate environment variables - Fixed: use process.env instead of Netlify.env.get()
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing environment configuration.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse request body
    const { messages }: MessagePayload = await req.json();
    
    // Extract authorization token
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No token provided.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Fetch user context from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('username, level')
      .eq('id', user.id)
      .single();
      
    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const userContext = `Current User: ${profile.username}, Level ${profile.level}.`;
    
    // Call Gemini API with timeout protection
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const contents = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Add timeout wrapper (30 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI request timeout after 30 seconds')), 30000)
    );

    const aiPromise = ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: contents,
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}\n${userContext}`,
      },
    });

    const response = await Promise.race([aiPromise, timeoutPromise]) as any;
    
    return new Response(
      JSON.stringify({ response: response.text }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in ask-ai function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const config: Config = {
  path: "/api/ask-ai"
};