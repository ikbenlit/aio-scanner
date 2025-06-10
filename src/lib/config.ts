import { dev } from '$app/environment';

// Supabase configuratie
export function getSupabaseConfig() {
    const url = dev 
        ? import.meta.env.PUBLIC_SUPABASE_URL 
        : process.env.PUBLIC_SUPABASE_URL;
    const anonKey = dev 
        ? import.meta.env.PUBLIC_SUPABASE_ANON_KEY 
        : process.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        throw new Error('Supabase omgevingsvariabelen zijn niet geconfigureerd');
    }

    return {
        url,
        anonKey
    };
} 