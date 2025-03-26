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
      manrope: ['Manrope', 'sans-serif'],
      bricolage: ['Bricolage Grotesque', 'sans-serif'],
    },
  },
  plugins: [
    lineClampPlugin,
    function ({ addComponents }) {
      addComponents({
        '.link-opacity-hover': {
          '@apply font-medium opacity-80 hover:opacity-100 hover:font-semibold transition-all duration-300 ease-in-out':
            {},
        },
        '.button-opacity-hover': {
          '@apply inline-block text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition':
            {},
        },
      });
    },
  ],
};
