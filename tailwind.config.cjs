/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
      extend: {
        colors: {
          primary: 'var(--primary-blue)',
          'primary-gradient': 'var(--primary-gradient)',
          secondary: 'var(--secondary-yellow)',
          destructive: 'var(--accent-red)',
          success: 'var(--success-green)',
          'cyber-accent': 'var(--cyber-accent)',
          'bg-primary': 'var(--background-primary)',
          'bg-secondary': 'var(--background-secondary)',
          gray: 'var(--text-gray)',
          'border-gray': 'var(--border-gray)',
          'bg-light': 'var(--bg-light)'
        },
        fontFamily: {
          header: ['var(--font-header)'],
          body:   ['var(--font-body)'],
          mono:   ['var(--font-mono)']
        },
        borderRadius: {
          lg: '16px'
        },
        boxShadow: {
          soft: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)'
        }
      }
    },
    plugins: []
  }
  