/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f3edff",
          100: "#e6d9ff",
          200: "#d0b8ff",
          300: "#b794f6",
          400: "#9d6cf0",
          500: "#7c3fd6",
          600: "#5a2ca0",
          700: "#45207a",
          800: "#2e1552",
          900: "#1a0a30",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      animation: {
        float:   "float 16s ease-in-out infinite",
        rise:    "rise 0.55s cubic-bezier(0.16,1,0.3,1) both",
        breathe: "breathe 5s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%":     { transform: "translate(30px,-40px) scale(1.08)" },
          "66%":     { transform: "translate(-20px,30px) scale(0.95)" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(24px) scale(0.98)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        breathe: {
          "0%,100%": { transform: "scale(1)" },
          "50%":     { transform: "scale(1.06)" },
        },
      },
    },
  },
  plugins: [],
}