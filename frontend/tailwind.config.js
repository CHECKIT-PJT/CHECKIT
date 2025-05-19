/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        custom: ['custom-font'],
        tmoney: ['TmoneyRoundWindExtraBold'],
      },
    },
  },
  plugins: [],
};
