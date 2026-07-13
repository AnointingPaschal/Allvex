/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0F172A",
        midnight2: "#16213A",
        electric: "#2563EB",
        silver: "#B0B8C1",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "-apple-system", "SF Pro Display", "sans-serif"],
      },
      borderRadius: {
        allvex: "20px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 6px 24px -8px rgba(15,23,42,0.14)",
        cardHover: "0 10px 30px -8px rgba(15,23,42,0.2)",
      },
    },
  },
  plugins: [],
};
