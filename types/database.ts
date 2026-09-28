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
          discipline: 'gym' | 'running' | 'both' | null;
          injuries: string[] | null;
          limitations: string | null;
          weekly_schedule: Json | null;
          onboarding_completed: boolean;
          health_consent_at: string | null;
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
          discipline?: 'gym' | 'running' | 'both' | null;
          injuries?: string[] | null;
          limitations?: string | null;
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
          discipline?: 'gym' | 'running' | 'both' | null;
          injuries?: string[] | null;
          limitations?: string | null;
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
      // Calendario con fechas reales (Fase 4). Migracion
      // 20260925000000_scheduled_sessions_and_plans.sql.
      scheduled_sessions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string | null;
          scheduled_for: string;
          activity_type: 'strength' | 'run' | 'ride' | 'swim' | 'other' | 'rest' | 'mobility';
          template_id: string | null;
          run_spec: Json | null;
          title: string | null;
          status: 'planned' | 'completed' | 'skipped' | 'moved';
          session_id: string | null;
          sort_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          // TEXT sin DEFAULT: el id lo pone el cliente (`wk-<fecha>`) para que
          // reproyectar la plantilla semanal sea idempotente.
          id: string;
          user_id: string;
          plan_id?: string | null;
          scheduled_for: string;
          activity_type: 'strength' | 'run' | 'ride' | 'swim' | 'other' | 'rest' | 'mobility';
          template_id?: string | null;
          run_spec?: Json | null;
          title?: string | null;
          status?: 'planned' | 'completed' | 'skipped' | 'moved';
          session_id?: string | null;
          sort_order?: number | null;
        };
        Update: {
          plan_id?: string | null;
          scheduled_for?: string;
          activity_type?: 'strength' | 'run' | 'ride' | 'swim' | 'other' | 'rest' | 'mobility';
          template_id?: string | null;
          run_spec?: Json | null;
          title?: string | null;
          status?: 'planned' | 'completed' | 'skipped' | 'moved';
          session_id?: string | null;
          sort_order?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      training_plans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          goal_type: 'strength' | 'hypertrophy' | 'fat_loss' | 'endurance' | 'race';
          race_distance: '5k' | '10k' | 'half' | 'marathon' | 'other' | null;
          race_date: string | null;
          starts_on: string;
          ends_on: string | null;
          weeks: number | null;
          status: 'active' | 'completed' | 'abandoned';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          goal_type: 'strength' | 'hypertrophy' | 'fat_loss' | 'endurance' | 'race';
          race_distance?: '5k' | '10k' | 'half' | 'marathon' | 'other' | null;
          race_date?: string | null;
          starts_on: string;
          ends_on?: string | null;
          weeks?: number | null;
          status?: 'active' | 'completed' | 'abandoned';
        };
        Update: {
          name?: string;
          race_date?: string | null;
          ends_on?: string | null;
          weeks?: number | null;
          status?: 'active' | 'completed' | 'abandoned';
        };
        Relationships: [];
      };
      // Strava (Fase 7). Migracion 20260928000000_strava_integration.sql.
      // access_token/refresh_token/expires_at/scope NO estan aqui a proposito:
      // el cliente no tiene GRANT SELECT sobre esas columnas (RLS de
      // solo-servicio, 06-modelo-datos.md SS F). Row/Insert reflejan solo lo
      // que el cliente puede leer o escribir de verdad.
      strava_connections: {
        Row: {
          user_id: string;
          athlete_id: number;
          connected_at: string;
          last_synced_at: string | null;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      // Gamificacion al servidor (Fase 6). Migracion
      // 20260927000000_weekly_gamification.sql.
      earned_badges: {
        Row: {
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      weekly_challenges: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          type: 'workouts' | 'pr' | 'volume' | 'sets';
          target: number;
          progress: number;
          bonus_xp: number;
          completed: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          type: 'workouts' | 'pr' | 'volume' | 'sets';
          target: number;
          progress?: number;
          bonus_xp?: number;
          completed?: boolean;
        };
        Update: Record<string, never>;
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
      social_challenges: {
        Row: {
          id: string;
          code: string;
          creator_id: string;
          creator_name: string;
          type: 'workouts' | 'volume' | 'streak';
          title: string;
          target: number;
          bonus_xp: number;
          starts_at: string;
          ends_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          creator_id: string;
          creator_name: string;
          type: 'workouts' | 'volume' | 'streak';
          title: string;
          target: number;
          bonus_xp?: number;
          starts_at: string;
          ends_at: string;
        };
        Update: {
          title?: string;
          target?: number;
          bonus_xp?: number;
          ends_at?: string;
        };
        Relationships: [];
      };
      challenge_participants: {
        Row: {
          id: string;
          challenge_id: string;
          user_id: string;
          user_name: string;
          progress: number;
          joined_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          user_id: string;
          user_name: string;
          progress?: number;
        };
        Update: {
          progress?: number;
          user_name?: string;
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
          xp_awarded_at: string | null;
          created_at: string;
          // Carrera (Fase 5). Migracion 20260926000000_running_cardio.sql.
          activity_type: 'strength' | 'run';
          distance_m: number | null;
          moving_time_s: number | null;
          elapsed_time_s: number | null;
          perceived_effort: number | null;
          run_type: 'easy' | 'long' | 'intervals' | 'tempo' | 'recovery' | 'race' | null;
          // Origen y deduplicacion (Fase 7). Migracion 20260928000000_strava_integration.sql.
          source: 'manual' | 'strava' | 'import';
          external_id: string | null;
          external_source: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          duration: string;
          muscle_focus: string[];
          exercises: Json;
          status?: 'pending' | 'active' | 'completed' | 'skipped';
          start_time?: string | null;
          end_time?: string | null;
          activity_type?: 'strength' | 'run';
          distance_m?: number | null;
          moving_time_s?: number | null;
          elapsed_time_s?: number | null;
          perceived_effort?: number | null;
          run_type?: 'easy' | 'long' | 'intervals' | 'tempo' | 'recovery' | 'race' | null;
        };
        Update: {
          name?: string;
          duration?: string;
          muscle_focus?: string[];
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_user_account: {
        Args: Record<never, never>;
        Returns: undefined;
      };
      complete_workout: {
        Args: { p_session_id: string; p_tz?: string };
        Returns: Json;
      };
      create_challenge: {
        Args: { p_type: string; p_title: string; p_target: number; p_duration_days: number; p_bonus_xp?: number };
        Returns: Database['public']['Tables']['social_challenges']['Row'];
      };
      join_challenge: {
        Args: { p_code: string };
        Returns: Database['public']['Tables']['social_challenges']['Row'][];
      };
      refresh_challenge_progress: {
        Args: Record<never, never>;
        Returns: undefined;
      };
      award_badge: {
        Args: { p_badge_id: string; p_tz?: string };
        Returns: boolean;
      };
      claim_weekly_challenge_bonus: {
        Args: { p_type: string; p_target: number; p_bonus_xp: number; p_tz?: string };
        Returns: Json;
      };
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
