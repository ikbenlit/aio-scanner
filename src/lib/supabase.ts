import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Debug environment variables
console.log('🔧 Supabase Environment Check:', {
  url: PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
  keyLength: PUBLIC_SUPABASE_ANON_KEY?.length || 0,
  hasUrl: !!PUBLIC_SUPABASE_URL,
  hasKey: !!PUBLIC_SUPABASE_ANON_KEY
});

export const supabase = createClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
);


// Supabase Json type definition, as it's not directly exported in some versions.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

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
          id: string;
          user_id: number | null;
          url: string;
          status: string;
          progress: number;
          email: string | null;
          overall_score: number | null;
          result_json: Json | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          user_id?: number | null;
          url: string;
          status?: string;
          progress?: number;
          email?: string | null;
          overall_score?: number | null;
          result_json?: Json | null;
          completed_at?: string | null;
        };
        Update: {
          user_id?: number | null;
          url?: string;
          status?: string;
          progress?: number;
          email?: string | null;
          overall_score?: number | null;
          result_json?: Json | null;
          completed_at?: string | null;
        };
      };
      scan_modules: {
        Row: {
            id: number;
            scan_id: string;
            module_name: string;
            status: string;
            score: number;
            findings: Json | null;
            progress: number;
            created_at: string;
            completed_at: string | null;
        };
        Insert: {
            scan_id: string;
            module_name: string;
            status?: string;
            score?: number;
            findings?: Json | null;
            progress?: number;
        };
        Update: {
            status?: string;
            score?: number;
            findings?: Json | null;
            progress?: number;
            completed_at?: string | null;
        };
      };
    };
  };
}

// Supabase client instantie - lazy geïnitialiseerd
let supabaseClient: ReturnType<typeof createClient>;

export function getSupabaseClient() {
    if (!supabaseClient) {
        supabaseClient = createClient(
            PUBLIC_SUPABASE_URL,
            PUBLIC_SUPABASE_ANON_KEY
        );
    }
    return supabaseClient;
}

// Helper functie voor database operaties
export const db = {
  // Users
  async createUser(email: string, plan_type = 'free') {
    const supabase = getSupabaseClient();
    return await supabase
      .from('users')
      .insert({ email, plan_type })
      .select()
      .single();
  },

  async getUserByEmail(email: string) {
    const supabase = getSupabaseClient();
    return await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
  },

  // Scans
  async createScan(url: string, scanId: string, user_id?: number, tier: string = 'basic') {
    const supabase = getSupabaseClient();
    return await supabase
      .from('scans')
      .insert({ id: scanId, url, user_id, status: 'pending', progress: 0, tier })
      .select()
      .single();
  },

  async updateScanStatus(scanId: string, status: string, result_json?: Json, overall_score?: number) {
    const supabase = getSupabaseClient();
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

  async getScan(scanId: string) {
    const supabase = getSupabaseClient();
    return await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();
  }
}; 