/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0D0B',
        surface: '#121614',
        border: '#222924',
        muted: '#929D96',
        accent: {
          DEFAULT: '#00E599',
          hover: '#10B981',
          glow: 'rgba(0, 229, 153, 0.18)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    }
  },
  plugins: []
};
