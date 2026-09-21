/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark padel-court surfaces (glass-walled blue court at night)
        court: {
          950: '#050a12',
          900: '#0a1220',
          850: '#0f1a2c',
          800: '#152338',
          700: '#1d3150',
          600: '#284469',
          500: '#365b8a',
          line: '#e2e8f0',
        },
        // Padel ball accents
        ball: {
          DEFAULT: '#d6f429',
          400: '#e3fb63',
          500: '#d6f429',
          600: '#b4cf17',
          700: '#8da510',
        },
        turf: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(214, 244, 41, 0.25), 0 8px 30px -8px rgba(214, 244, 41, 0.35)',
      },
    },
  },
  plugins: [],
}
