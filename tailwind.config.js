/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Poppins", "ui-sans-serif", "system-ui"],
        luxury: ["Cinzel", "Georgia", "serif"]
      },
      colors: {
        midnight: "#0B0B0B",
        ink: "#1A1A1A",
        gold: "#D4AF37",
        champagne: "#f4e8c7",
        pearl: "#FFFFFF",
        accent: "#FFD700",
        jade: "#3f7d72",
        wine: "#7a2e43"
      },
      boxShadow: {
        glow: "0 0 35px rgba(214, 173, 86, 0.26)"
      },
      backgroundImage: {
        "gold-line": "linear-gradient(90deg, transparent, rgba(214,173,86,.85), transparent)"
      }
    }
  },
  plugins: []
};
