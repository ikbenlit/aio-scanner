import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './config';

// Database Types voor TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          email: string;
          plan_type: string;
          credits_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          email: string;
          plan_type?: string;
          credits_balance?: number;
        };
        Update: {
          email?: string;
          plan_type?: string;
          credits_balance?: number;
          updated_at?: string;
        };
      };
      scans: {
        Row: {
          id: number;
          user_id: number | null;
          url: string;
          status: string;
          overall_score: number | null;
          result_json: any | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          user_id?: number | null;
          url: string;
          status?: string;
          overall_score?: number | null;
          result_json?: any | null;
          completed_at?: string | null;
        };
        Update: {
          user_id?: number | null;
          url?: string;
          status?: string;
          overall_score?: number | null;
          result_json?: any | null;
          completed_at?: string | null;
        };
      };
    };
  };
}

// Supabase client instantie
export const supabase = createClient<Database>(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);

// Helper functie voor database operaties
export const db = {
  // Users
  async createUser(email: string, plan_type = 'free') {
    return await supabase
      .from('users')
      .insert({ email, plan_type })
      .select()
      .single();
  },

  async getUserByEmail(email: string) {
    return await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
  },

  // Scans
  async createScan(url: string, user_id?: number) {
    return await supabase
      .from('scans')
      .insert({ url, user_id, status: 'pending' })
      .select()
      .single();
  },

  async updateScanStatus(scanId: number, status: string, result_json?: any, overall_score?: number) {
    const updateData: any = { status };
    if (result_json) updateData.result_json = result_json;
    if (overall_score) updateData.overall_score = overall_score;
    if (status === 'completed') updateData.completed_at = new Date().toISOString();

    return await supabase
      .from('scans')
      .update(updateData)
      .eq('id', scanId)
      .select()
      .single();
  },

  async getScan(scanId: number) {
    return await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();
  }
}; 