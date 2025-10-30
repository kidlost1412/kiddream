export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ai_memory: {
        Row: {
          id: string
          last_updated: string | null
          memory_key: string
          memory_value: string | null
          user_id: string
        }
        Insert: {
          id?: string
          last_updated?: string | null
          memory_key: string
          memory_value?: string | null
          user_id: string
        }
        Update: {
          id?: string
          last_updated?: string | null
          memory_key?: string
          memory_value?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_memory_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      habit_logs: {
        Row: {
          completed_at: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      habits: {
        Row: {
          category: string | null
          created_at: string | null
          goal: string | null
          icon: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          goal?: string | null
          icon?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          goal?: string | null
          icon?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          level: number
          points: number
          updated_at: string | null
          username: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          id: string
          level?: number
          points?: number
          updated_at?: string | null
          username: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          id?: string
          level?: number
          points?: number
          updated_at?: string | null
          username?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      quests: {
        Row: {
          background_image: string | null
          description: string | null
          goals: Json | null
          id: string
          rewards: Json | null
          title: string
          type: string
        }
        Insert: {
          background_image?: string | null
          description?: string | null
          goals?: Json | null
          id?: string
          rewards?: Json | null
          title: string
          type: string
        }
        Update: {
          background_image?: string | null
          description?: string | null
          goals?: Json | null
          id?: string
          rewards?: Json | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          category: string | null
          cost: number
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          cost: number
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          cost?: number
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          color: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string
          end_time: string | null
          id: string
          is_completed: boolean
          priority: number
          stakes: Json | null
          start_time: string | null
          tags: string[] | null
          task: string
          user_id: string
        }
        Insert: {
          color?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          end_time?: string | null
          id?: string
          is_completed?: boolean
          priority?: number
          stakes?: Json | null
          start_time?: string | null
          tags?: string[] | null
          task: string
          user_id: string
        }
        Update: {
          color?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          end_time?: string | null
          id?: string
          is_completed?: boolean
          priority?: number
          stakes?: Json | null
          start_time?: string | null
          tags?: string[] | null
          task?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_quests: {
        Row: {
          completed_at: string | null
          id: string
          progress: Json | null
          quest_id: string
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          progress?: Json | null
          quest_id: string
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          progress?: Json | null
          quest_id?: string
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quests_quest_id_fkey"
            columns: ["quest_id"]
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quests_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: {}
        Returns: {
          id: string
          aud: string
          role: string
          email: string
          encrypted_password: string
          email_confirmed_at: string
          invited_at: string
          confirmation_token: string
          confirmation_sent_at: string
          recovery_token: string
          recovery_sent_at: string
          email_change_token_new: string
          email_change: string
          email_change_sent_at: string
          last_sign_in_at: string
          raw_app_meta_data: Json
          raw_user_meta_data: Json
          is_super_admin: boolean
          created_at: string
          updated_at: string
          phone: string
          phone_confirmed_at: string
          phone_change: string
          phone_change_token: string
          phone_change_sent_at: string
          confirmed_at: string
          email_change_token_current: string
          email_change_confirm_status: number
          banned_until: string
          reauthentication_token: string
          reauthentication_sent_at: string
          is_sso_user: boolean
          deleted_at: string
        }[]
      }
      handle_todo_completion_reward: {
        Args: {}
        Returns: {
          color: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string
          end_time: string | null
          id: string
          is_completed: boolean
          priority: number
          stakes: Json | null
          start_time: string | null
          tags: string[] | null
          task: string
          user_id: string
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
