/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Urbanist', 'sans-serif'],
      },
      colors: {
        background: '#F1F4F2',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#9DB582',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#73AFDC',
          foreground: '#FFFFFF',
        },
        tertiary: {
          DEFAULT: '#82947B',
          foreground: '#FFFFFF',
        },
        text: {
          primary: '#2E2E2E',
          secondary: '#5A5A5A',
          accent: '#9DB582',
          'accent-blue': '#A6BC8E',
          disabled: '#9AA3A0',
        },
        input: {
          background: '#FFFFFF',
          text: '#2E2E2E',
          border: '#CBD3D0',
        },
        border: {
          DEFAULT: '#D6DAD7',
          hover: '#A6BC8E',
        },
        disabled: '#E2E5E2',
        error: '#D9534F',
        success: '#9DB582',
        warning: '#F39C12',
        info: '#73AFDC',
      },
    },
  },
  plugins: [],
}