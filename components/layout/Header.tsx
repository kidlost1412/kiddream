
import React from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';

const IconButton: React.FC<{ children: React.ReactNode, onClick?: () => void, isActive?: boolean }> = ({ children, onClick, isActive }) => (
    <button onClick={onClick} className={`h-10 w-10 flex items-center justify-center rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/80'}`}>
        {children}
    </button>
);

const Header: React.FC = () => {
    const { user } = useAuthStore();
    const { toggleAIAssistant, isAIAssistantOpen } = useUIStore();

    if (!user) return null;

    return (
        <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 h-16 flex-shrink-0 flex items-center justify-between px-6">
            <div className="flex items-center gap-x-3">
                <div className="flex items-center gap-x-1 p-1 bg-slate-800 rounded-lg">
                     <IconButton isActive={false}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></IconButton>
                     <IconButton isActive={true}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg></IconButton>
                </div>
                <div className="flex items-center gap-x-2 bg-slate-800 text-slate-200 px-3 h-10 rounded-lg">
                    <button className="text-xl">-</button>
                    <span className="font-medium">7 Days</span>
                    <button className="text-xl">+</button>
                </div>
            </div>
            <div className="flex items-center gap-x-4">
                <button className="px-4 h-10 flex items-center gap-x-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    New Task
                </button>
                <div className="h-6 w-px bg-slate-700"></div>
                <IconButton><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg></IconButton>
                <IconButton><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></IconButton>
                <IconButton onClick={toggleAIAssistant} isActive={isAIAssistantOpen}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect x="4" y="12" width="8" height="8" rx="2"/><path d="M8 12v-2a2 2 0 1 1 4 0v2"/></svg>
                </IconButton>
                <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-10 h-10 rounded-full border-2 border-slate-600"
                />
            </div>
        </header>
    );
};

export default Header;
