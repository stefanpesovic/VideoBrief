/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        violet: {
          primary: "#7c3aed",
        },
      },
    },
  },
  plugins: [],
};
