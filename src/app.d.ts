/// <reference types="@sveltejs/kit" />
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
	  interface Platform {}
	  interface Locals {}
	  interface PageData {}
	  interface Error {}
	}
	
	namespace NodeJS {
	  interface ProcessEnv {
		MOLLIE_API_KEY: string;
		MOLLIE_WEBHOOK_SECRET: string;
		MOLLIE_TEST_MODE: string;
	  }
	}
  }

declare module '$env/static/public' {
	export const PUBLIC_SUPABASE_URL: string;
	export const PUBLIC_SUPABASE_ANON_KEY: string;
}


export {};
