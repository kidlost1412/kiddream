import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';
import ModelMessage from '../features/ai/ModelMessage';
import { useUIStore } from '../../stores/useUIStore';
import { supabase } from '../../lib/supabaseClient';

interface AIAssistantSidebarProps {
  isOpen: boolean;
}

const AIAssistantSidebar: React.FC<AIAssistantSidebarProps> = ({ isOpen }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toggleAIAssistant } = useUIStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        // Call our secure Netlify function instead of the Gemini service directly
        const response = await fetch('/api/ask-ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ messages: newMessages }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get response from AI assistant.');
        }

        const { response: responseText } = await response.json();
        const modelMessage: ChatMessage = { role: 'model', text: responseText };
        setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      const errorMessage: ChatMessage = { role: 'model', text: `Sorry, I am having trouble connecting. ${error.message}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className={`flex flex-col flex-shrink-0 bg-slate-900 border-l border-slate-700/50 transition-all duration-300 ease-in-out ${isOpen ? 'w-96' : 'w-0'}`} style={{transition: 'width 300ms ease-in-out'}}>
        <div className={`flex flex-col h-full overflow-hidden ${!isOpen ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50 flex-shrink-0">
                <h3 className="text-lg font-bold text-white">AI Assistant</h3>
                <button onClick={toggleAIAssistant} className="text-slate-400 hover:text-white">
                     <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.length === 0 && (
                     <div className="text-center text-slate-400 p-6 rounded-lg bg-slate-800/50">
                        <p>Xin chào! Tôi có thể giúp bạn quản lý công việc hôm nay như thế nào? Bạn có thể yêu cầu tôi tạo, cập nhật, hoặc xóa công việc. Bạn cũng có thể yêu cầu tôi lập kế hoạch cho một mục tiêu lớn hơn.</p>
                     </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 bg-indigo-500 rounded-full flex-shrink-0 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"></path><rect x="4" y="12" width="8" height="8" rx="2"></rect><path d="M8 12v-2a2 2 0 1 1 4 0v2"></path></svg></div>}
                        <div className={`max-w-xs p-3 rounded-lg ${msg.role === 'user' ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-slate-300'}`}>
                            {msg.role === 'model' ? <ModelMessage text={msg.text} /> : <p>{msg.text}</p>}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex-shrink-0"></div>
                        <div className="max-w-xs p-3 rounded-lg bg-slate-800">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-700/50 flex-shrink-0">
                <button className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700/70 text-slate-400 mb-3">
                    Ask me to create a task...
                </button>
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Or type your message..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 disabled:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
        </div>
    </aside>
  );
};

export default AIAssistantSidebar;
