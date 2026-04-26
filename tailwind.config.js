/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cems-bg': '#0d1117',
        'cems-sidebar': '#161b22',
        'cems-card': '#1c2128',
        'cems-purple': '#8b5cf6',
        'cems-blue': '#3b82f6',
      }
    },
  },
  plugins: [],
}
