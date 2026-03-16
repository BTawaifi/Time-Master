/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        app: {
          bg: 'var(--bg-color)',
          surface: 'var(--card-bg)',
          surfaceHover: 'var(--surface-hover)',
          border: 'var(--border-color)',
          borderLight: 'var(--border-light)',
          text: 'var(--text-main)',
          muted: 'var(--text-dim)',
          primary: 'var(--accent-color)', 
          primaryHover: 'var(--primary-hover)', 
          primaryBg: 'var(--primary-bg)',
          primaryContrast: 'var(--accent-contrast)',
          success: 'var(--success-color)', 
          successBg: 'var(--success-bg)',
          danger: 'var(--danger-color)', 
          dangerBg: 'var(--danger-bg)',
          tintLow: 'var(--tint-low)',
          tintMed: 'var(--tint-medium)',
          input: 'var(--input-bg)',
          inputPlaceholder: 'var(--input-placeholder)',
        }
      },
      backgroundImage: {
        'grid-pattern': `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23ffffff' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        'scanline': 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
      },
      boxShadow: {
        'neon-primary': '0 0 20px var(--primary-bg), inset 0 0 10px var(--primary-bg)',
        'neon-success': '0 0 15px var(--success-bg)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    }
  },
  plugins: [],
}
