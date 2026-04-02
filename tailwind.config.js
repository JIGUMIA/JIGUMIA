/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        black: '#111111',
        red: '#FF2D2D',
        offwhite: '#FAFAF8',
      },
      fontFamily: {
        sans: ['DM Sans', 'Pretendard', 'System'],
      },
    },
  },
  plugins: [],
};
