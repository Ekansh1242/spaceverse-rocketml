/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        exo: ['"Exo 2"', 'sans-serif'],
      },
      colors: {
        space: {
          black: '#050A14',
          navy: '#080F1E',
          panel: '#0D1526',
          border: '#1A2540',
          orange: '#F4721E',
          blue: '#2196F3',
          cyan: '#00E5FF',
          green: '#00FF88',
          red: '#FF4444',
          muted: '#5A7090',
        }
      }
    }
  },
  plugins: []
}
