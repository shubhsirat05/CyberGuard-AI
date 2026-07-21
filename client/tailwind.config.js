/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#050d1a',
          navy: '#0a1628',
          blue: '#0d2137',
          accent: '#00d4ff',
          green: '#00ff88',
          red: '#ff3366',
          yellow: '#ffd700',
          purple: '#7c3aed',
          glow: '#00d4ff20'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px #00d4ff40' },
          '50%': { boxShadow: '0 0 20px #00d4ff80, 0 0 40px #00d4ff40' }
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    }
  },
  plugins: []
};
