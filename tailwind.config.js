/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Girl theme colors
        girl: {
          primary: '#FF69B4',
          secondary: '#FFB6C1',
          accent: '#FFC0CB',
          background: '#FFF0F5',
        },
        // Boy theme colors
        boy: {
          primary: '#4169E1',
          secondary: '#87CEEB',
          accent: '#B0E0E6',
          background: '#F0F8FF',
        },
        // Child theme colors
        child: {
          primary: '#FFD700',
          secondary: '#98FB98',
          accent: '#87CEEB',
          background: '#FFFAF0',
        }
      },
    },
  },
  plugins: [],
};