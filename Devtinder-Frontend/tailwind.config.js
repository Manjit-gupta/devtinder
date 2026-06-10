/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#111111',
        secondary: '#555555',
        accent: '#2563EB',
        danger: '#DC2626',
        border: '#E5E7EB',
      },
    },
  },
  plugins: [],
}
