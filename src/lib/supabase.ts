import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== 'placeholder-key'
);

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          updated_at?: string;
        };
      };
      bills: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          utility_type: 'electricity' | 'water' | 'gas' | 'internet';
          amount: number;
          due_date: string;
          is_recurring: boolean;
          recurring_period: 'monthly' | 'quarterly' | 'annually' | null;
          status: 'pending' | 'paid' | 'overdue';
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          utility_type: 'electricity' | 'water' | 'gas' | 'internet';
          amount: number;
          due_date: string;
          is_recurring?: boolean;
          recurring_period?: 'monthly' | 'quarterly' | 'annually' | null;
          status?: 'pending' | 'paid' | 'overdue';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          utility_type?: 'electricity' | 'water' | 'gas' | 'internet';
          amount?: number;
          due_date?: string;
          is_recurring?: boolean;
          recurring_period?: 'monthly' | 'quarterly' | 'annually' | null;
          status?: 'pending' | 'paid' | 'overdue';
          notes?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          bill_id: string;
          user_id: string;
          amount: number;
          payment_date: string;
          payment_method: string;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          bill_id: string;
          user_id: string;
          amount: number;
          payment_date?: string;
          payment_method?: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          amount?: number;
          payment_date?: string;
          payment_method?: string;
          notes?: string;
        };
      };
    };
  };
};