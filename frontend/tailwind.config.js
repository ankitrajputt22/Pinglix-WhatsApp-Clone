/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17352d",
        muted: "#60756f",
        pinglix: {
          50: "#effcf7",
          100: "#d9f7eb",
          200: "#b5edd9",
          300: "#84dcc1",
          400: "#4fc4a3",
          500: "#29a886",
          600: "#1c886e",
          700: "#196d5a",
          800: "#185749",
          900: "#16483e"
        }
      },
      boxShadow: {
        card: "0 28px 80px -34px rgba(22, 72, 62, 0.32)"
      }
    }
  },
  plugins: []
};
