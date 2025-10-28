/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        gertBlue: "#006991"
      },
      fontFamily: {
        brand: ['"Avenir Next"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif']
      },
      letterSpacing: {
        caption: "0.35em"
      }
    }
  },
  plugins: []
};
