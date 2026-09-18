/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8ecdff',
          400: '#59b1fc',
          500: '#3392f6',
          600: '#1d74eb',
          700: '#165dd8',
          800: '#194caf',
          900: '#1a428a',
        },
      },
    },
  },
  plugins: [],
};
