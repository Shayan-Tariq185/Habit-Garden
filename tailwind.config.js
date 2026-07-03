/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        garden: {
          bg: "#FAF8F1",
          mint: "#EAF2E4",
          sage: "#DCEBD3",
          forest: "#2C4A2B",
          forestDark: "#1F3720",
          leaf: "#4B7A43",
          leafLight: "#7BAA6E",
          card: "#FFFFFF",
          cream: "#FDF6E9",
          amber: "#E8A33D",
          amberLight: "#F6D9A0",
          terracotta: "#D97B4F",
          ink: "#2A2A22",
          muted: "#6B7566",
          faint: "#9AA595",
          border: "#E7E5DA",
        },
      },
      fontFamily: {
        display: ["'Poppins'", "system-ui", "sans-serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(44, 74, 43, 0.06)",
        card: "0 4px 20px rgba(44, 74, 43, 0.08)",
        button: "0 4px 14px rgba(44, 74, 43, 0.25)",
        lift: "0 8px 30px rgba(44, 74, 43, 0.12)",
      },
      backgroundImage: {
        "garden-gradient": "linear-gradient(180deg, #EAF2E4 0%, #F5F1E4 45%, #FAF8F1 100%)",
        "garden-gradient-soft": "linear-gradient(180deg, #E3EEDC 0%, #FAF8F1 100%)",
      },
      keyframes: {
        popIn: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        growUp: {
          "0%": { transform: "scaleY(0.85)", opacity: "0.6" },
          "100%": { transform: "scaleY(1)", opacity: "1" },
        },
      },
      animation: {
        popIn: "popIn 0.35s ease-out",
        sway: "sway 4s ease-in-out infinite",
        growUp: "growUp 0.5s ease-out",
      },
    },
  },
  plugins: [],
};
