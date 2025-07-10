// src/hooks.server.ts
import { initializeEventSystem } from '$lib/events';

// Initialize the event system when the server starts
initializeEventSystem();

console.log('🔥 SvelteKit server hooks initialized');