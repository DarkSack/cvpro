/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Tokens del mundo Sackito (definidos en src/index.css).
      colors: {
        canvas: "var(--bg)",
        raised: "var(--bg-raised)",
        sunken: "var(--bg-sunken)",
        ink: "var(--fg)",
        muted: "var(--fg-muted)",
        faint: "var(--fg-faint)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        "accent-soft": "var(--accent-soft)",
      },
      fontFamily: {
        mono: ['"Geist Mono Variable"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
