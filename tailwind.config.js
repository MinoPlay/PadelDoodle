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
          950: '#020617',
          900: '#07111f',
          850: '#0b1728',
          800: '#10233b',
          700: '#163454',
          600: '#1e4973',
          500: '#256094',
          line: '#dbeafe',
        },
        // Electric blue court accents
        ball: {
          DEFAULT: '#38bdf8',
          400: '#7dd3fc',
          500: '#38bdf8',
          600: '#0284c7',
          700: '#0369a1',
        },
        turf: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56, 189, 248, 0.28), 0 8px 30px -8px rgba(37, 99, 235, 0.5)',
      },
    },
  },
  plugins: [],
}
