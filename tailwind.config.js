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
          DEFAULT: "#6366F1",
          hover:   "#4F46E5",
          light:   "#818CF8",
        },
        accent: {
          DEFAULT: "#22D3EE",
          hover:   "#06B6D4",
        },
        "bg-dark":   "#0F0F1A",
        surface:     "#1A1A2E",
        "surface-2": "#252540",
        "surface-3": "#2E2E50",
        success:     "#10B981",
        warning:     "#F59E0B",
        danger:      "#EF4444",
        "text-primary":   "#F1F1F5",
        "text-secondary": "#A0A0C0",
        "text-muted":     "#6B6B8A",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body:    ["var(--font-body)", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm:   "6px",
        md:   "10px",
        lg:   "16px",
        xl:   "24px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
