import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        earth: {
          50:  '#fdf8f0',
          100: '#faefd8',
          200: '#f3d9a8',
          300: '#e9bc72',
          400: '#dc9b3e',
          500: '#c97f22',
          600: '#a8631a',
          700: '#854b18',
          800: '#6b3c19',
          900: '#573318',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-cal)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
