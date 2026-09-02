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
          950: '#080D1A',
          900: '#0D1527',
          850: '#121E36',
          800: '#182745',
          750: '#1F3256',
          700: '#273E6B',
          600: '#34528C',
        },
        gold: {
          50: '#FDFBF7',
          100: '#FAF2DE',
          200: '#F5E3B5',
          300: '#EDCE80',
          400: '#E6B357',
          500: '#D99824',
          600: '#B87B17',
          700: '#915B12',
          800: '#764612',
          900: '#643912',
          accent: '#ECC272',
          glow: 'rgba(230, 179, 87, 0.45)',
        },
        celestial: {
          400: '#E6B357',
          500: '#D99824',
          600: '#B87B17',
          glow: 'rgba(230, 179, 87, 0.35)',
        },
        emeraldGlow: {
          400: '#E6B357',
          500: '#10B981',
          600: '#059669',
          glow: 'rgba(230, 179, 87, 0.35)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['"Amiri"', '"Scheherazade New"', 'Traditional Arabic', 'serif'],
        quran: ['"Amiri Quran"', '"Amiri"', 'serif'],
      },
      boxShadow: {
        'glass-sm': '0 4px 20px -2px rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-md': '0 10px 30px -5px rgba(0, 0, 0, 0.55), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        'glass-lg': '0 20px 50px -10px rgba(0, 0, 0, 0.65), inset 0 1px 2px 0 rgba(255, 255, 255, 0.18)',
        'gold-glow': '0 0 30px rgba(230, 179, 87, 0.35), inset 0 0 15px rgba(230, 179, 87, 0.1)',
        'emerald-glow': '0 0 30px rgba(16, 185, 129, 0.35), inset 0 0 15px rgba(16, 185, 129, 0.1)',
      },
      backdropBlur: {
        '2xl': '40px',
        '3xl': '64px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'wave-bar': 'wave 1.2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%': { height: '15%' },
          '100%': { height: '100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
