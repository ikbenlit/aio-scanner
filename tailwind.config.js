module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				'header': ['Orbitron', 'sans-serif'],
				'body': ['Exo 2', 'sans-serif']
			},
			colors: {
				// Je custom kleuren met directe namen
				'primary-blue': '#2E9BDA',
				'secondary-yellow': '#F5B041',
				'cyber-accent': '#00F5FF',
				'success-green': '#10b981',
				'gray': '#64748b',
				'border-gray': '#e2e8f0',
				'bg-light': '#f8fafc',
				
				// Shadcn systeem kleuren (behouden voor components)
				border: "hsl(var(--border) / <alpha-value>)",
				input: "hsl(var(--input) / <alpha-value>)",
				ring: "hsl(var(--ring) / <alpha-value>)",
				background: "hsl(var(--background) / <alpha-value>)",
				foreground: "hsl(var(--foreground) / <alpha-value>)",
				muted: {
					DEFAULT: "hsl(var(--muted) / <alpha-value>)",
					foreground: "hsl(var(--muted-foreground) / <alpha-value>)"
				},
				accent: {
					DEFAULT: "hsl(var(--accent) / <alpha-value>)",
					foreground: "hsl(var(--accent-foreground) / <alpha-value>)"
				}
			}
		}
	},
	plugins: []
};