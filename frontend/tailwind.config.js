/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bgcolor: '#404E82',
        secondbgcolor: '#C4D2EB',
        hovercolor: '#aab2c0',
        graphicsbordercolor: '#D2691E',
      }
    },
  },
  plugins: [],
}

