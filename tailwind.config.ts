import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        paper: "#ffffff",
        offwhite: "#fafafa",
        muted: "#767676",
        line: "#ebebeb",
        sale: "#c8102e",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      fontSize: {
        micro: ["10px", { lineHeight: "14px", letterSpacing: "0.08em" }],
        tiny: ["11px", { lineHeight: "16px", letterSpacing: "0.06em" }],
        label: ["12px", { lineHeight: "18px", letterSpacing: "0.04em" }],
      },
      aspectRatio: {
        pdp: "630 / 800",
        "4/5": "4 / 5",
      },
      maxWidth: {
        site: "1920px",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-down": {
          from: { transform: "translateY(-8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-in-right": "slide-in-right 250ms ease-out",
        "slide-down": "slide-down 200ms ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
