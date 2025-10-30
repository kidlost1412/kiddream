
import { create } from 'zustand';

interface UIState {
  isAIAssistantOpen: boolean;
  toggleAIAssistant: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAIAssistantOpen: true, // Mặc định mở theo thiết kế
  toggleAIAssistant: () => set((state) => ({ isAIAssistantOpen: !state.isAIAssistantOpen })),
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
