/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a8f7',
          500: '#0e8ce9',
          600: '#026ec7',
          700: '#0358a1',
          800: '#074b85',
          900: '#0b3f6f',
          950: '#072849',
        },
        slate: {
          850: '#162032',
          900: '#0f172a',
          950: '#080d1a',
        },
      },
    },
  },
  plugins: [],
};
