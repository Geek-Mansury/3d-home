/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#fff9e3',
        primary: '#081126',
        accent: '#ea7a53',
        success: '#16a34a',
        destructive: '#dc2626',
        muted: '#f6eecf',
      },
    },
  },
  plugins: [],
};
