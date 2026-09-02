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
          950: '#070B14',
          900: '#0C1322',
          850: '#101B30',
          800: '#16233E',
          750: '#1D2E50',
          700: '#253B64',
          600: '#324E82',
        },
        gold: {
          50: '#FDFBF7',
          100: '#FAF2DE',
          200: '#F4E2B5',
          300: '#EBCB7F',
          400: '#E1B34B',
          500: '#D59B26',
          600: '#B87B17',
          700: '#915B12',
          800: '#764612',
          900: '#643912',
          accent: '#ECC272',
          glow: 'rgba(236, 194, 114, 0.45)',
        },
        celestial: {
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          glow: 'rgba(56, 189, 248, 0.35)',
        },
        emeraldGlow: {
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          glow: 'rgba(52, 211, 153, 0.35)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['"Amiri"', '"Scheherazade New"', 'Traditional Arabic', 'serif'],
        quran: ['"Amiri Quran"', '"Amiri"', 'serif'],
      },
      boxShadow: {
        'glass-sm': '0 4px 20px -2px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
        'glass-md': '0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.18)',
        'glass-lg': '0 20px 50px -10px rgba(0, 0, 0, 0.6), inset 0 1px 2px 0 rgba(255, 255, 255, 0.22)',
        'gold-glow': '0 0 30px rgba(236, 194, 114, 0.35), inset 0 0 15px rgba(236, 194, 114, 0.12)',
        'cyan-glow': '0 0 30px rgba(56, 189, 248, 0.3), inset 0 0 15px rgba(56, 189, 248, 0.1)',
        'emerald-glow': '0 0 30px rgba(52, 211, 153, 0.35), inset 0 0 15px rgba(52, 211, 153, 0.12)',
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
