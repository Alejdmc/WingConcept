/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:           '#ffffff',
        bg2:          '#f5f5f7',
        bg3:          '#1d1d1f',
        ink:          '#1d1d1f',
        ink2:         '#6e6e73',
        brand:        '#c0392b',
        'brand-soft': 'rgba(192,57,43,0.08)',
        borderline:   '#e5e5ea',
      },
      fontFamily: {
       
        sans: ['Montserrat', 'sans-serif'],
        barlow:    ['"Barlow"', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}