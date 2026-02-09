/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './**/*.{ts,tsx}',
    '!./node_modules/**',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#DC2626',
          hover: '#B91C1C',
          glow: 'rgba(220, 38, 38, 0.5)',
        },
        background: {
          DEFAULT: '#0f172a',
          card: '#1e293b',
          lighter: '#334155',
        },
        text: {
          main: '#f8fafc',
          muted: '#94a3b8',
        },
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at top center, var(--tw-gradient-stops))',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
