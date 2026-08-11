/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#191c1e",
        muted: "#596663",
        surface: {
          DEFAULT: "#f7f9fb",
          low: "#f2f4f6",
          container: "#eceef0",
          high: "#e6e8ea"
        },
        pinglix: {
          50: "#effcf9",
          100: "#d4f5ef",
          200: "#a9e9de",
          300: "#72d5c8",
          400: "#3bb9ac",
          500: "#16998e",
          600: "#087f76",
          700: "#00685f",
          800: "#00544d",
          900: "#003d38"
        }
      },
      boxShadow: {
        card: "0 18px 45px -24px rgba(25, 28, 30, 0.28)",
        panel: "0 8px 26px -18px rgba(25, 28, 30, 0.3)"
      },
      animation: {
        "fade-in": "fadeIn 320ms ease-out both"
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};
