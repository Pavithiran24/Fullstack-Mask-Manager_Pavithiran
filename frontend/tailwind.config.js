/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Corporate SaaS Color Palette Tokens (Lighter Dark Blue + Sky Blue + White)
        navy: {
          950: '#0F172A', // Main Lighter Dark Blue Background (Slate Navy)
          900: '#1E293B', // Surface Card & Panel Dark Blue
          800: '#334155', // Elevated Card & Border Blue
          700: '#475569', // Muted Border & Divider
          600: '#64748B',
        },
        sky: {
          300: '#7DD3FC',
          400: '#38BDF8', // Vivid Sky Blue Accent
          500: '#0EA5E9',
          600: '#0284C7', // Deep Accent Blue
          700: '#0369A1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sky': '0 0 20px -3px rgba(56, 189, 248, 0.35)',
        'glow-navy': '0 10px 30px -10px rgba(15, 23, 42, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
