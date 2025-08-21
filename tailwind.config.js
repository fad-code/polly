/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors:{ brand:{600:'#0ea5e9',700:'#0284c7'} },
      boxShadow:{ card:'0 10px 25px rgba(0,0,0,0.08)'},
      fontFamily:{ inter:['Inter','system-ui','sans-serif']},
      keyframes: {
        toastIn: { '0%': { transform: 'translateY(-8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        toastOut: { '0%': { transform: 'translateY(0)', opacity: '1' }, '100%': { transform: 'translateY(-8px)', opacity: '0' } }
      },
      animation: {
        toastIn: 'toastIn 180ms ease-out',
        toastOut: 'toastOut 180ms ease-in forwards'
      }
    },
  },
  plugins: [],
}