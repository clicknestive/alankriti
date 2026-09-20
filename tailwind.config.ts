import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F4F7F2',
          100: '#E6EFE2',
          200: '#D1DFC9',
          300: '#BDCFB1',
          400: '#A8B89A', // Brand Sage Light Green
          500: '#94A785',
          600: '#798E6B',
          700: '#5E7052',
          800: '#43513B',
          900: '#2A3425',
          DEFAULT: '#A8B89A',
        },
        cream: {
          50: '#FCFBF8',
          100: '#FAF6F0',
          200: '#F8F1E7', // Brand Cream
          300: '#EFE3D3',
          400: '#E5D4BD',
          500: '#D9C4A6',
          DEFAULT: '#F8F1E7',
        },
        gold: {
          50: '#FAF6EE',
          100: '#F3E9D5',
          200: '#E7D3AC',
          300: '#DBBD83',
          400: '#CFA75F',
          500: '#C6A15B', // Brand Gold
          600: '#A68443',
          700: '#826530',
          800: '#5E4820',
          DEFAULT: '#C6A15B',
        },
        boutique: {
          charcoal: '#222B23',
          dark: '#1C241D',
          muted: '#6C7A6D',
          border: '#E3DC CF',
        }
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'royal': '0 10px 30px -10px rgba(198, 161, 91, 0.18)',
        'card': '0 4px 20px -2px rgba(42, 52, 37, 0.05)',
      }
    },
  },
  plugins: [],
};
export default config;
