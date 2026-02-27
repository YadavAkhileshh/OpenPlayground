/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#050505',
        midnight: '#0a0a0f',
        neon: '#4fe3ff',
        magenta: '#ff4fd8',
        amber: '#ffb347',
        graphite: '#1a1a1f',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      dropShadow: {
        glow: '0 0 18px rgba(79, 227, 255, 0.45)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(79, 227, 255, 0.12) 1px, transparent 0)',
      },
      keyframes: {
        'pulse-edge': {
          '0%': { strokeDashoffset: 20 },
          '100%': { strokeDashoffset: 0 },
        },
        'packet-glow': {
          '0%': { opacity: 0, transform: 'scale(0.85)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
          '100%': { opacity: 0, transform: 'scale(0.85)' },
        },
      },
      animation: {
        'edge-pulse': 'pulse-edge 1.2s linear infinite',
        'packet-glow': 'packet-glow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
