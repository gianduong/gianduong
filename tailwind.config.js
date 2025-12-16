/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'tokyo-night': {
          'bg': '#1a1b27',
          'bg-alt': '#24283b',
          'fg': '#c0caf5',
          'fg-alt': '#a9b1d6',
          'border': '#2f3549',
          'blue': '#7aa2f7',
          'cyan': '#7dcfff',
          'green': '#9ece6a',
          'yellow': '#e0af68',
          'purple': '#bb9af7',
          'red': '#f7768e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

