import { supabase } from '../lib/supabaseClient';

interface UserContext {
  level: number;
  xp: number;
  points: number;
  habits: Array<{ name: string; category: string; completionRate: number }>;
  recentTodos: Array<{ task: string; isCompleted: boolean; priority: number }>;
  activeQuests: number;
}

interface GeneratedQuest {
  title: string;
  description: string;
  type: 'main' | 'side';
  difficulty: 'easy' | 'medium' | 'hard';
  goals: Array<{
    type: string;
    target: number;
    description: string;
  }>;
  rewards: {
    xp: number;
    points: number;
  };
  duration_days: number;
}

export class AIQuestService {
  private static readonly GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  /**
   * Generate personalized quests based on user context
   */
  static async generatePersonalizedQuests(userId: string): Promise<GeneratedQuest[]> {
    try {
      // Fetch user context
      const context = await this.getUserContext(userId);
      
      // Generate quests using AI
      const quests = await this.callGeminiAPI(context);
      
      return quests;
    } catch (error) {
      console.error('Error generating quests:', error);
      return this.getFallbackQuests(userId);
    }
  }

  /**
   * Get user context for AI
   */
  private static async getUserContext(userId: string): Promise<UserContext> {
    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('level, xp, points')
      .eq('id', userId)
      .single();

    // Get habits (using any to avoid type errors with column names)
    const { data: habits } = await supabase
      .from('habits')
      .select('name, category, completionRate:completion_rate')
      .eq('user_id', userId)
      .limit(5) as any;

    // Get recent todos
    const { data: todos } = await supabase
      .from('todos')
      .select('task, is_completed, priority')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get active quests count
    const { data: activeQuests } = await supabase
      .from('user_quests')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active');

    return {
      level: profile?.level || 1,
      xp: profile?.xp || 0,
      points: profile?.points || 0,
      habits: (habits || []).map((h: any) => ({
        name: h.name,
        category: h.category,
        completionRate: h.completionRate || 0,
      })),
      recentTodos: (todos || []).map(t => ({
        task: t.task,
        isCompleted: t.is_completed,
        priority: t.priority,
      })),
      activeQuests: activeQuests?.length || 0,
    };
  }

  /**
   * Call Gemini API to generate quests
   */
  private static async callGeminiAPI(context: UserContext): Promise<GeneratedQuest[]> {
    if (!this.GEMINI_API_KEY) {
      console.warn('Gemini API key not found, using fallback quests');
      return [];
    }

    const prompt = this.buildPrompt(context);

    const response = await fetch(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    // Parse JSON from response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse quests from AI response');
    }

    const quests = JSON.parse(jsonMatch[0]);
    return quests;
  }

  /**
   * Build AI prompt based on user context
   */
  private static buildPrompt(context: UserContext): string {
    return `Bạn là một AI chuyên tạo nhiệm vụ (quests) cá nhân hóa cho ứng dụng năng suất ZenQuest.

THÔNG TIN NGƯỜI DÙNG:
- Level: ${context.level}
- XP: ${context.xp}
- Điểm: ${context.points}
- Số nhiệm vụ đang làm: ${context.activeQuests}

THÓI QUEN HIỆN TẠI:
${context.habits.map(h => `- ${h.name} (${h.category}): ${h.completionRate}% hoàn thành`).join('\n')}

CÔNG VIỆC GẦN ĐÂY:
${context.recentTodos.slice(0, 5).map(t => `- ${t.task} ${t.isCompleted ? '✅' : '⏳'}`).join('\n')}

YÊU CẦU:
Tạo 2-3 nhiệm vụ cá nhân hóa dựa trên thói quen và hoạt động của người dùng.
- 1 nhiệm vụ CHÍNH (main) - khó hơn, phần thưởng lớn
- 1-2 nhiệm vụ PHỤ (side) - dễ hơn, phần thưởng nhỏ

Trả về ĐÚNG định dạng JSON array sau (không thêm text khác):
[
  {
    "title": "Tên nhiệm vụ ngắn gọn",
    "description": "Mô tả chi tiết nhiệm vụ",
    "type": "main" hoặc "side",
    "difficulty": "easy", "medium", hoặc "hard",
    "goals": [
      {
        "type": "complete_todos" hoặc "complete_habits" hoặc "earn_points",
        "target": số lượng cần đạt,
        "description": "Mô tả mục tiêu"
      }
    ],
    "rewards": {
      "xp": số XP (50-500),
      "points": số điểm (10-100)
    },
    "duration_days": số ngày để hoàn thành (3-14)
  }
]

LƯU Ý:
- Nhiệm vụ phải liên quan đến thói quen/công việc của người dùng
- Phần thưởng phải cân bằng với độ khó
- Mục tiêu phải rõ ràng, đo lường được
- Sử dụng tiếng Việt`;
  }

  /**
   * Fallback quests when AI is not available
   */
  private static async getFallbackQuests(userId: string): Promise<GeneratedQuest[]> {
    return [
      {
        title: 'Chinh phục tuần mới',
        description: 'Hoàn thành 10 công việc trong tuần này để chứng minh sự kiên trì của bạn',
        type: 'main',
        difficulty: 'medium',
        goals: [
          {
            type: 'complete_todos',
            target: 10,
            description: 'Hoàn thành 10 công việc',
          },
        ],
        rewards: {
          xp: 200,
          points: 50,
        },
        duration_days: 7,
      },
      {
        title: 'Thói quen bền vững',
        description: 'Duy trì ít nhất 3 thói quen trong 5 ngày liên tiếp',
        type: 'side',
        difficulty: 'easy',
        goals: [
          {
            type: 'complete_habits',
            target: 15,
            description: 'Hoàn thành 15 lần check-in thói quen',
          },
        ],
        rewards: {
          xp: 100,
          points: 25,
        },
        duration_days: 5,
      },
    ];
  }

  /**
   * Save generated quests to database
   */
  static async saveQuestsToDatabase(quests: GeneratedQuest[]): Promise<void> {
    try {
      const questsToInsert = quests.map(quest => ({
        title: quest.title,
        description: quest.description,
        type: quest.type,
        difficulty: quest.difficulty,
        goals: quest.goals,
        rewards: quest.rewards,
        duration_days: quest.duration_days,
        background_image: this.getQuestImage(quest.type),
        is_ai_generated: true,
      }));

      const { error } = await supabase
        .from('quests')
        .insert(questsToInsert);

      if (error) {
        console.error('Error saving quests:', error);
      }
    } catch (error) {
      console.error('Error in saveQuestsToDatabase:', error);
    }
  }

  /**
   * Get background image based on quest type
   */
  private static getQuestImage(type: 'main' | 'side'): string {
    const images = {
      main: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      side: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
    };
    return images[type];
  }
}
