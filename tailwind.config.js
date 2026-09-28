/** @type {import('tailwindcss').Config} */

// Unico sitio donde viven los valores de color. Los tokens estan definidos como
// canales RGB en index.css (:root/.dark y .light); aqui solo se les pone nombre.
// Los nombres de la paleta por defecto (gray, red, green...) se reasignan a los
// tokens semanticos para que el codigo existente cambie de tema sin tocarlo.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: [
    './index.html',
    './**/*.{ts,tsx}',
    '!./node_modules/**',
    '!./.worktrees/**',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // --- Semanticos ---
        primary: {
          DEFAULT: token('primary'),
          hover: token('primary-hover'),
          ink: token('primary-ink'),
        },
        background: {
          DEFAULT: token('bg'),
          card: token('surface'),
          lighter: token('surface-raised'),
        },
        surface: {
          DEFAULT: token('surface'),
          raised: token('surface-raised'),
        },
        text: {
          main: token('text-primary'),
          secondary: token('text-secondary'),
          muted: token('text-muted'),
        },
        divider: token('border-divider'),
        // Texto sobre un scrim oscuro (badge de nivel, overlay sobre imagen):
        // el mismo valor en los dos modos, porque el fondo tambien lo es.
        'ink-on-dark': token('ink-on-dark'),
        'border-input': token('border-input'),

        success: { DEFAULT: token('success'), fill: token('success-fill'), ink: token('success-ink') },
        warning: { DEFAULT: token('warning'), fill: token('warning-fill'), ink: token('warning-ink') },
        danger: { DEFAULT: token('danger'), fill: token('danger-fill'), ink: token('danger-ink') },
        info: { DEFAULT: token('info'), fill: token('info-fill'), ink: token('info-ink') },
        celebration: token('celebration'),

        // --- Tipos de entrenamiento (calendario) ---
        strength: token('strength'),
        cardio: { DEFAULT: token('cardio'), fill: token('cardio-fill'), ink: token('cardio-ink') },
        mobility: token('mobility'),
        rest: token('rest'),

        // --- Reasignacion de la paleta por defecto ---
        // white/black dejan de ser literales: en modo claro, text-white tiene que
        // ser tinta oscura. Para texto sobre un relleno de color existe *-ink.
        white: token('text-primary'),
        black: 'rgb(0 0 0 / <alpha-value>)',
        gray: {
          200: token('surface-raised'),
          300: token('text-secondary'),
          400: token('text-muted'),
          500: token('text-muted'),
          600: token('border-input'),
          700: token('surface-raised'),
          800: token('surface'),
          900: token('bg'),
        },
        slate: {
          400: token('text-muted'),
          500: token('text-muted'),
          700: token('surface-raised'),
        },
        red: {
          300: token('danger'), 400: token('danger'), 500: token('danger'),
          600: token('danger-fill'), 700: token('danger-fill'),
          800: token('danger-fill'), 900: token('danger-fill'),
        },
        green: {
          300: token('success'), 400: token('success'), 500: token('success'),
          600: token('success-fill'), 700: token('success-fill'), 900: token('success-fill'),
        },
        emerald: { 400: token('success'), 500: token('success') },
        yellow: {
          200: token('warning'), 300: token('warning'), 400: token('warning'), 500: token('warning'),
          600: token('warning-fill'), 700: token('warning-fill'), 900: token('warning-fill'),
        },
        amber: {
          300: token('celebration'), 400: token('celebration'), 500: token('celebration'),
        },
        blue: {
          300: token('info'), 400: token('info'), 500: token('info'), 600: token('info-fill'),
        },
        orange: {
          400: token('strength'), 500: token('strength'), 600: token('strength'),
          700: token('strength'), 900: token('strength'),
        },
        cyan: { 400: token('cardio'), 500: token('cardio') },
        teal: { 400: token('cardio'), 500: token('cardio'), 600: token('cardio') },
        violet: {
          400: token('mobility'), 500: token('mobility'), 600: token('mobility'),
          700: token('mobility'), 900: token('mobility'),
        },
        purple: { 400: token('mobility'), 500: token('mobility'), 900: token('mobility') },
        indigo: { 400: token('mobility'), 500: token('mobility'), 600: token('mobility') },
        pink: { 400: token('celebration'), 500: token('celebration') },
      },
      // Escala modular base 16 / razon 1.25. Interlineado 1.2 en titulos,
      // 1.5 en cuerpo y 1.0 en cifras grandes.
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.3' }],  // 11px
        xs: ['0.75rem', { lineHeight: '1.4' }],       // 12px
        sm: ['0.875rem', { lineHeight: '1.5' }],      // 14px
        base: ['1rem', { lineHeight: '1.5' }],        // 16px
        lg: ['1.25rem', { lineHeight: '1.3' }],       // 20px
        xl: ['1.5625rem', { lineHeight: '1.2' }],     // 25px
        '2xl': ['1.9375rem', { lineHeight: '1.1' }],  // 31px
        '3xl': ['2.4375rem', { lineHeight: '1' }],    // 39px
        '4xl': ['3.0625rem', { lineHeight: '1' }],    // 49px
        '5xl': ['3.8125rem', { lineHeight: '1' }],    // 61px
      },
      borderRadius: {
        sm: '0.5rem',    // 8
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',   // 12
        xl: '0.75rem',   // 12
        '2xl': '1rem',   // 16
        '3xl': '1.5rem', // 24
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        raised: 'var(--shadow-raised)',
        sheet: 'var(--shadow-sheet)',
        'glow-primary': 'var(--glow-primary)',
        'glow-celebration': 'var(--glow-celebration)',
      },
      transitionDuration: {
        instant: '100ms',
        fast: '150ms',
        base: '250ms',
        sheet: '300ms',
        celebrate: '600ms',
      },
      transitionTimingFunction: {
        // Sale rapido y frena largo: hace que un sheet se sienta fisico.
        physical: 'cubic-bezier(.32,.72,0,1)',
        celebrate: 'cubic-bezier(.34,1.56,.64,1)',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at top center, var(--tw-gradient-stops))',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'xp-fly': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '50%': { opacity: '1', transform: 'translateY(-20px) scale(1.2)' },
          '100%': { opacity: '0', transform: 'translateY(-40px) scale(0.8)' },
        },
        'check-pop': {
          '0%': { transform: 'scale(0)' },
          '60%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s cubic-bezier(.32,.72,0,1)',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.25s cubic-bezier(.32,.72,0,1)',
        'scale-in': 'scale-in 0.2s ease-out',
        'xp-fly': 'xp-fly 1s ease-out forwards',
        'check-pop': 'check-pop 0.6s cubic-bezier(.34,1.56,.64,1)',
      },
    },
  },
  plugins: [],
};
