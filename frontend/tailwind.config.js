/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d9e2ff',
          300: '#b8cbff',
          400: '#8ca6ff',
          500: '#5c78ff',
          600: '#3d52f5',
          700: '#2b3cd4',
          850: '#1e29aa',
          900: '#1b2287',
        }
      }
    },
  },
  plugins: [],
}
