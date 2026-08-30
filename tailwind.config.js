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
          950: '#04070F',
          900: '#080E1D',
          800: '#0E172E',
          700: '#152243',
          600: '#1D2F5B',
        },
        gold: {
          50: '#FDF9EE',
          100: '#FAF0D4',
          200: '#F4DE9F',
          300: '#ECC469',
          400: '#E4A838',
          500: '#D4921E',
          600: '#B57315',
          700: '#8E5213',
          800: '#754016',
          900: '#633516',
          accent: '#E5B25D',
          glow: 'rgba(229, 178, 93, 0.4)',
        },
        celestial: {
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          glow: 'rgba(56, 189, 248, 0.35)',
        },
        emeraldGlow: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          glow: 'rgba(52, 211, 153, 0.35)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        arabic: ['"Amiri"', '"Scheherazade New"', 'Traditional Arabic', 'serif'],
        quran: ['"Amiri Quran"', '"Amiri"', 'serif'],
      },
      boxShadow: {
        'glass-sm': '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        'glass-lg': '0 12px 48px 0 rgba(0, 0, 0, 0.7), inset 0 1px 2px 0 rgba(255, 255, 255, 0.2)',
        'gold-glow': '0 0 25px rgba(229, 178, 93, 0.35), inset 0 0 15px rgba(229, 178, 93, 0.1)',
        'cyan-glow': '0 0 25px rgba(56, 189, 248, 0.3), inset 0 0 15px rgba(56, 189, 248, 0.08)',
        'emerald-glow': '0 0 25px rgba(52, 211, 153, 0.3), inset 0 0 15px rgba(52, 211, 153, 0.08)',
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
