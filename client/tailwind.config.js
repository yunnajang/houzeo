import lineClampPlugin from '@tailwindcss/line-clamp';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          white: '#fffffe',
          main: '#272343',
          secondary: '#e3f6f5',
          tertiary: '#bae8e8',
          highlight: '#ffd803',
          paragraph: '#2d334a',
        },
      },
      animation: {
        slideDownFadeIn: 'slideDownFadeIn 0.3s ease-out forwards',
        slideUpFadeOut: 'slideUpFadeOut 0.3s ease-in forwards',
      },
      keyframes: {
        slideDownFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-1rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUpFadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-1rem)' },
        },
      },
    },
    fontFamily: {
      inter: ['Inter', 'sans-serif'],
      bricolage: ['Bricolage Grotesque', 'sans-serif'],
    },
  },
  plugins: [
    lineClampPlugin,
    function ({ addComponents }) {
      addComponents({
        '.nav-link-hover': {
          '@apply transition-all duration-200 opacity-80 hover:font-medium hover:opacity-100 transition-all duration-200':
            {},
        },
        '.button-hover': {
          '@apply text-brand-white bg-brand-main px-5 py-2 rounded-full text-[15px] hover:bg-opacity-80 transition-all duration-200':
            {},
        },
        '.form-input': {
          '@apply w-full border border-slate-300 p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-tertiary':
            {},
        },
        '.primary-btn': {
          '@apply w-full bg-brand-main text-brand-white text-sm font-semibold py-3 rounded-full transition hover:opacity-90 disabled:opacity-70':
            {},
        },
      });
    },
  ],
};
