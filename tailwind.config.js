/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind quét các file này để biết class nào đang dùng
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C3AED",
          hover: "#6D28D9",
          light: "#A78BFA",
        },
        accent: {
          DEFAULT: "#F43F5E",
          hover: "#E11D48",
        },
        "bg-dark": "#F8F7FF",   /* alias backwards-compat */
        "bg-base": "#F8F7FF",
        surface: "#FFFFFF",
        "surface-2": "#F1F0FA",
        "surface-3": "#E8E6F8",
        success: "#059669",
        warning: "#D97706",
        danger: "#DC2626",
        "text-primary": "#1E1B4B",
        "text-secondary": "#4C4A6B",
        "text-muted": "#9896B8",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
