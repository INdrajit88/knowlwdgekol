import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        surface: "#f8fafc",
        "surface-border": "#e2e8f0",
        "text-primary": "#0f172a",
        "text-secondary": "#475569",
        "text-muted": "#94a3b8",
        stellar: {
          primary: "#2563eb",
          accent: "#7c3aed",
          gold: "#d97706",
          green: "#059669",
          purple: "#9333ea",
          dark: "#0f172a",
        },
      },
      backgroundImage: {
        "grid-pattern": "radial-gradient(#cbd5e1 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
export default config;
