/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E63946',
        dark: '#1A1A1A',
        darker: '#0F0F0F',
        lightGray: '#2A2A2A',
        textWhite: '#FFFFFF',
        textGray: '#B0B0B0',
      }
    },
  },
  plugins: [],
}
