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
        'pastel-bg': '#FDFBF7', // Cream
        'pastel-card': '#FFFFFF',
        'pastel-text': '#2D3748',
        'pastel-accent': '#9FBFA8', // Sage Green

        // Pastel Dark Mode
        'dark-bg': '#2D2D35', // Soft Charcoal
        'dark-card': '#363640',
        'dark-text': '#E2E8F0',
        'dark-accent': '#A5B4FC', // Muted Lavender
      }
    },
  },
  plugins: [],
}