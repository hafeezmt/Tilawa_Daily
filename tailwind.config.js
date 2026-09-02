/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#FFFFFF',
          900: '#F8FAFC',
          850: '#F1F5F9',
          800: '#E2E8F0',
          750: '#CBD5E1',
          700: '#94A3B8',
          600: '#64748B',
        },
        gold: {
          50: '#FFFDF5',
          100: '#FEF9E7',
          200: '#FDF0C5',
          300: '#FAE398',
          400: '#F5D065',
          500: '#D97706', // Rich Royal Gold
          600: '#B45309',
          700: '#92400E',
          800: '#78350F',
          900: '#451A03',
          accent: '#D97706',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['"Amiri"', '"Scheherazade New"', 'Traditional Arabic', 'serif'],
        quran: ['"Amiri Quran"', '"Amiri"', 'serif'],
      },
      boxShadow: {
        'glass-sm': '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
        'glass-md': '0 4px 16px -2px rgba(0, 0, 0, 0.06)',
        'glass-lg': '0 10px 30px -4px rgba(0, 0, 0, 0.08)',
        'gold-glow': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
        'emerald-glow': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
      },
      backdropBlur: {
        '2xl': '40px',
        '3xl': '64px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'wave-bar': 'wave 1.2s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}
