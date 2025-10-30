
export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  points: number;
}

export enum TodoPriority {
  Low,
  Medium,
  High,
}

export interface Todo {
  id: string;
  task: string;
  description?: string;
  dueDate: string; // Format: 'YYYY-MM-DD'
  startTime?: string; // Format: 'HH:mm'
  endTime?: string; // Format: 'HH:mm'
  priority: TodoPriority;
  isCompleted: boolean;
  completedAt?: string;
  projectId?: string;
  tags?: string[];
  color?: string; // e.g., 'bg-green-500'
  stakes?: {
    reward: number; // points gained
    penalty: number; // points lost
  }
}

// Represents a file attached to a todo item and stored in Supabase Storage
export interface TodoAttachment {
  id: string;
  todoId: string; // FK to todos.id
  fileName: string;
  fileUrl: string; // storage path or public URL
  fileType: string; // mime
  fileSize: number; // bytes
  uploadedAt: string; // ISO datetime
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category: 'Mind' | 'Body' | 'Spirit' | 'Productivity';
  goal: string;
  streak: number;
  completions: { [date: string]: boolean };
  completionRate: number; // Percentage
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side';
  goals: { description: string; target: number }[];
  rewards: { xp: number; points: number };
  backgroundImage: string;
}

export interface UserQuest extends Quest {
  status: 'locked' | 'in_progress' | 'completed';
  progress: number[];
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  category: 'Relax' | 'Focus' | 'Joy' | 'Growth';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
