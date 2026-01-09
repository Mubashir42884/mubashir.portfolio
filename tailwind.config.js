/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Crimson Pro"', 'serif'], // Academic look
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        // Pastel Light Mode
        'pastel-bg': '#fffef0', // Cream
        'pastel-card': '#fdfff9',
        'pastel-text': '#2D3748',
        'pastel-accent': '#e48996', // Pastel Rose

        // Pastel Dark Mode
        'dark-bg': '#2d273b', // Soft Charcoal
        'dark-card': '#3c3c55',
        'dark-text': '#E2E8F0',
        'dark-accent': '#A5B4FC', // Muted Lavender
      }
    },
  },
  plugins: [],
}