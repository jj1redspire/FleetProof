import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#1a3009',
          800: '#2D5016',
          700: '#3a6620',
          600: '#4a8029',
          100: '#e8f5e0',
          50: '#f4faf0',
        },
        charcoal: {
          DEFAULT: '#212529',
          600: '#495057',
          400: '#6c757d',
          200: '#ced4da',
          100: '#f8f9fa',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8f9fa',
          border: '#dee2e6',
        },
        damage: {
          minor: '#ffc107',
          moderate: '#fd7e14',
          major: '#dc3545',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
