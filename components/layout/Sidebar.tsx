import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../ui/Button';
import { useUIStore } from '../../stores/useUIStore';

const iconPaths = {
  dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  todos: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z",
  habits: "M12 2C6.48 2 2 6.48 2 2s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z",
  quests: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  shop: "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-1.45-5c.59 0 1.08-.34 1.33-.84l3.58-6.49c.11-.21.11-.46 0-.66s-.31-.34-.53-.34H5.21l-.94-2H1v2h2l3.6 7.59L6.16 13.8c-.16.29-.26.61-.26.95 0 1.1.9 2 2 2h10v-2H7.42c-.14 0-.25-.11-.25-.25s.11-.25.25-.25h8.13z",
  settings: "M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.44,0.17-0.48,0.41L9.2,5.15C8.6,5.39,8.08,5.71,7.58,6.09L5.19,5.13C4.96,5.06,4.71,5.13,4.59,5.35L2.67,8.67 c-0.11,0.2-0.06,0.47,0.12,0.61l2.03,1.58C4.78,11.36,4.76,11.68,4.76,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.34 c0.04,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.48-0.41l0.36-2.34c0.6-0.24,1.12-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0.01,0.59-0.22l1.92-3.32c0.11-0.2,0.06-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z",
  logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
};

const navLinks = [
  { to: '/', key: 'sidebar.dashboard', icon: 'dashboard' },
  { to: '/todos', key: 'sidebar.calendar', icon: 'todos' },
  { to: '/habits', key: 'sidebar.habits', icon: 'habits' },
  { to: '/quests', key: 'sidebar.quests', icon: 'quests' },
  { to: '/shop', key: 'sidebar.shop', icon: 'shop' },
  { to: '/inventory', key: 'sidebar.inventory', icon: 'shop' },
  { to: '/settings', key: 'sidebar.settings', icon: 'settings' },
];

const SidebarIcon = ({ path, className }: { path: string, className?: string }) => (
  <svg className={`h-6 w-6 ${className}`} fill="currentColor" viewBox="0 0 24 24">
    <path d={path}></path>
  </svg>
);

const Sidebar: React.FC = () => {
    const { signOut } = useAuthStore();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isSidebarCollapsed, toggleSidebar } = useUIStore();

    const handleLogout = () => {
        signOut();
        navigate('/login');
    };

  return (
    <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-56'} bg-slate-900 border-r border-slate-700/50 flex flex-col flex-shrink-0 transition-all duration-200`}>
      <div className="flex items-center justify-between h-16 border-b border-slate-700/50 px-3">
        <h1 className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 tracking-wider ${isSidebarCollapsed ? 'text-xl' : 'text-2xl'}`}>{isSidebarCollapsed ? 'ZQ' : 'ZenQuest'}</h1>
        <button
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}
          className="p-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            {isSidebarCollapsed ? (
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      </div>
      <nav className="flex-1 px-2 py-6 space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 font-medium ${
                isActive ? 'bg-slate-800 text-white' : ''
              }`
            }
          >
            <SidebarIcon path={iconPaths[link.icon as keyof typeof iconPaths]} />
            {!isSidebarCollapsed && <span>{t(link.key as any)}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700/50">
        <Button variant="secondary" className={`w-full ${isSidebarCollapsed ? 'justify-center' : 'justify-start pl-3'}`} onClick={handleLogout}>
            <SidebarIcon path={iconPaths.logout} />
            {!isSidebarCollapsed && <span className="ml-3">{t('auth.logout')}</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;