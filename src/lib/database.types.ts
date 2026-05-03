export type AppRole = 'patient' | 'clinician';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: AppRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role: AppRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          role?: AppRole;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          date_of_birth: string | null;
          height_cm: number | null;
          starting_weight_kg: number | null;
          current_weight_kg: number | null;
          goal_weight_kg: number | null;
          waist_cm: number | null;
          mobile: string | null;
          email: string;
          clinic_name: string | null;
          review_interval_weeks: number;
          next_review_date: string | null;
          next_prescription_review_date: string | null;
          next_medication_dose_date: string | null;
          safety_answers: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'user_id' | 'created_at'>>;
      };
      check_ins: {
        Row: {
          id: string;
          patient_id: string;
          date: string;
          weight_kg: number;
          waist_cm: number | null;
          appetite_score: number;
          energy_score: number;
          mood_score: number;
          sleep_score: number;
          exercise_level: string;
          alcohol_intake: string;
          protein_focus: boolean;
          water_focus: boolean;
          side_effects: string[];
          notes: string | null;
          red_flag: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['check_ins']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Database['public']['Tables']['check_ins']['Row'], 'id' | 'patient_id' | 'created_at'>>;
      };
      medications: {
        Row: {
          id: string;
          patient_id: string;
          name: string;
          dose: string;
          start_date: string | null;
          frequency: string | null;
          medication_day: string | null;
          next_dose_date: string | null;
          prescription_review_date: string | null;
          gp_review_date: string | null;
          tolerance_notes: string | null;
          estimated_days_remaining: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['medications']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Database['public']['Tables']['medications']['Row'], 'id' | 'patient_id' | 'created_at'>>;
      };
      reminders: {
        Row: {
          id: string;
          patient_id: string;
          type: string;
          due_date: string;
          status: string;
          message: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reminders']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Database['public']['Tables']['reminders']['Row'], 'id' | 'patient_id' | 'created_at'>>;
      };
      clinician_notes: {
        Row: {
          id: string;
          patient_id: string;
          clinician_id: string;
          date: string;
          note: string;
          plan: string | null;
          follow_up_weeks: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clinician_notes']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Database['public']['Tables']['clinician_notes']['Row'], 'id' | 'patient_id' | 'created_at'>>;
      };
      patient_messages: {
        Row: {
          id: string;
          patient_id: string;
          clinician_id: string;
          subject: string;
          body: string;
          priority: 'normal' | 'important' | 'urgent';
          status: 'unread' | 'read' | 'archived';
          created_at: string;
          read_at: string | null;
          archived_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['patient_messages']['Row'], 'id' | 'created_at' | 'read_at' | 'archived_at'> & {
          id?: string;
          created_at?: string;
          read_at?: string | null;
          archived_at?: string | null;
        };
        Update: Partial<Omit<Database['public']['Tables']['patient_messages']['Row'], 'id' | 'patient_id' | 'clinician_id' | 'created_at'>>;
      };
    };
  };
}
