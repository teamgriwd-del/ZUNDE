/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zunde-green': '#1b5e20',
        'zunde-teal': '#008080',
      }
    },
  },
  plugins: [],
}
