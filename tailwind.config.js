/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        accent: '#8B5CF6',
        glass: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}
