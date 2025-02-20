import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B0F19',
          card: '#151823',
        },
        purple: {
          light: '#B388FF',
          DEFAULT: '#9B6AFF',
          dark: '#7C3AFF',
        },
        accent: {
          blue: '#4CC9F0',
          purple: '#B388FF',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(179, 136, 255, 0.15)',
        'card': '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, #1a1f2e 1px, transparent 1px), linear-gradient(to bottom, #1a1f2e 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};

export default config; 