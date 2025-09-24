/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E53E3E', // Red primary color
        'primary-dark': '#C53030',
        'primary-light': '#FC8181',
      }
    },
  },
  plugins: [],
}