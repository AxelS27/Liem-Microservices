/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**/*.{js,jsx,ts,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        'liem-bg': '#0a0a0a',
        'liem-sidebar': '#171717',
        'liem-border': '#1e1e1e',
        'liem-text': '#e3e3e3',
        'liem-text-dim': '#585858',
        'liem-accent': 'var(--accent)',
        'liem-hover': '#1a1a1a',
      }
    }
  },
  plugins: []
}
