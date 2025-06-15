// src/lib/config.ts
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export function getSupabaseConfig() {
    // In SvelteKit API routes gebruik je altijd env uit '$env/static/private'
    const url = PUBLIC_SUPABASE_URL;
    const anonKey = PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        console.log('Available env vars:', { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY }); // Debug hulp
        throw new Error('Supabase omgevingsvariabelen zijn niet geconfigureerd');
    }

    return {
        url,
        anonKey
    };
}