/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0faf2',
          100: '#dcf3e3',
          200: '#bbe7ca',
          300: '#8dd4a6',
          400: '#58ba7c',
          500: '#339e5d',
          600: '#238049',
          700: '#1d663c',
          800: '#1a5232',
          900: '#16432a',
          950: '#0b2517',
        },
        leaf: '#84cc16',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,42,28,.06), 0 8px 24px -12px rgba(16,42,28,.12)',
        lift: '0 4px 12px rgba(16,42,28,.08), 0 16px 40px -16px rgba(16,42,28,.2)',
      },
      keyframes: {
        scanline: {
          '0%': { top: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
      animation: {
        scanline: 'scanline 2.2s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
        pulseRing: 'pulseRing 1.8s cubic-bezier(.4,0,.6,1) infinite',
      },
    },
  },
  plugins: [],
};
