/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './{App,index}.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        slate: {
          850: '#151e2e',
        },
      },
    },
  },
  plugins: [],
};
