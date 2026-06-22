/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Le Feuillet — warm letterpress paper. Cream/sepia stock, walnut ink,
        // a single madder-red accent. Quiet, writerly, confident.
        paper: {
          DEFAULT: "#f6efe1", // the writing surface
          deep: "#efe6d3", // panels, sunk areas
          rim: "#e6dabf", // hairline borders
          card: "#fbf6ec", // raised cards / palette
        },
        ink: {
          DEFAULT: "#2a231b", // body ink
          soft: "#5b4f40", // secondary text
          faint: "#897b66", // tertiary / meta
        },
        madder: {
          DEFAULT: "#9c3b2e", // the single accent — madder red
          deep: "#7c2b22",
          soft: "#c66a59",
        },
        sage: "#5e6b4f", // rare second hue (publish/ok)
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        body: ['"Newsreader"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        leaf: "0 1px 2px rgba(42,35,27,0.06), 0 12px 32px rgba(42,35,27,0.12)",
        sink: "inset 0 1px 3px rgba(42,35,27,0.10)",
        palette: "0 24px 64px -12px rgba(42,35,27,0.32)",
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        riseIn: "riseIn 0.34s cubic-bezier(0.2,0.8,0.2,1) both",
        fadeIn: "fadeIn 0.25s ease-out both",
        pulseDot: "pulseDot 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
