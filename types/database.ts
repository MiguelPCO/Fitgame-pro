export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          level: number;
          xp: number;
          xp_to_next_level: number;
          streak: number;
          tier: 'Novice' | 'Intermediate' | 'Advanced' | 'Elite';
          goal: 'Strength' | 'Hypertrophy' | 'Fat Loss' | 'Endurance' | null;
          days_per_week: number | null;
          minutes_per_session: number | null;
          equipment: string[] | null;
          experience_level: 'Beginner' | 'Intermediate' | 'Advanced' | null;
          weekly_schedule: Json | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string;
          level?: number;
          xp?: number;
          xp_to_next_level?: number;
          streak?: number;
          tier?: 'Novice' | 'Intermediate' | 'Advanced' | 'Elite';
          goal?: 'Strength' | 'Hypertrophy' | 'Fat Loss' | 'Endurance' | null;
          days_per_week?: number | null;
          minutes_per_session?: number | null;
          equipment?: string[] | null;
          experience_level?: 'Beginner' | 'Intermediate' | 'Advanced' | null;
          weekly_schedule?: Json | null;
          onboarding_completed?: boolean;
        };
        Update: {
          name?: string;
          level?: number;
          xp?: number;
          xp_to_next_level?: number;
          streak?: number;
          tier?: 'Novice' | 'Intermediate' | 'Advanced' | 'Elite';
          goal?: 'Strength' | 'Hypertrophy' | 'Fat Loss' | 'Endurance' | null;
          days_per_week?: number | null;
          minutes_per_session?: number | null;
          equipment?: string[] | null;
          experience_level?: 'Beginner' | 'Intermediate' | 'Advanced' | null;
          weekly_schedule?: Json | null;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          muscle_focus: string[];
          exercises: Json;
          duration: string;
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
          last_performed: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          muscle_focus: string[];
          exercises: Json;
          duration: string;
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
          last_performed?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          muscle_focus?: string[];
          exercises?: Json;
          duration?: string;
          difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
          last_performed?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      personal_records: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          weight: number;
          reps: number;
          achieved_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_id: string;
          weight: number;
          reps: number;
          achieved_at?: string;
        };
        Update: {
          weight?: number;
          reps?: number;
          achieved_at?: string;
        };
        Relationships: [];
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          duration: string;
          muscle_focus: string[];
          exercises: Json;
          status: 'pending' | 'active' | 'completed' | 'skipped';
          xp_reward: number;
          start_time: string | null;
          end_time: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          duration: string;
          muscle_focus: string[];
          exercises: Json;
          status?: 'pending' | 'active' | 'completed' | 'skipped';
          xp_reward?: number;
          start_time?: string | null;
          end_time?: string | null;
        };
        Update: {
          name?: string;
          duration?: string;
          muscle_focus?: string[];
          exercises?: Json;
          status?: 'pending' | 'active' | 'completed' | 'skipped';
          xp_reward?: number;
          start_time?: string | null;
          end_time?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier use
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Template = Database['public']['Tables']['templates']['Row'];
export type TemplateInsert = Database['public']['Tables']['templates']['Insert'];
export type TemplateUpdate = Database['public']['Tables']['templates']['Update'];

export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row'];
export type WorkoutSessionInsert = Database['public']['Tables']['workout_sessions']['Insert'];
export type WorkoutSessionUpdate = Database['public']['Tables']['workout_sessions']['Update'];

export type PersonalRecord = Database['public']['Tables']['personal_records']['Row'];
export type PersonalRecordInsert = Database['public']['Tables']['personal_records']['Insert'];
