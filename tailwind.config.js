/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#0a0a0a',
        cream: '#f5f0e8',
        red: '#d42b2b',
        yellow: '#f5c518',
        blue: '#1a3a6b',
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'sans-serif'],
        special: ['"Special Elite"', 'cursive'],
        mono: ['"Space Mono"', 'monospace'],
        crimson: ['"Crimson Text"', 'serif'],
      },
    },
  },
  plugins: [],
}

