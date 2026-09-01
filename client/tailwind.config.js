/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#090A0D',
          secondary: '#0E1015',
          card: '#12141A',
          surface: '#171A21',
          hover: '#1E222B',
          border: '#222631',
          muted: '#151820',
        },
        accent: {
          DEFAULT: '#FAFAFA',
          subtle: '#27272A',
          primary: '#3B82F6', // Crisp subtle electric blue
          indigo: '#6366F1',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          violet: '#8B5CF6',
        },
        zinc: {
          850: '#141417',
          900: '#101114',
          950: '#090A0D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-subtle': '0 0 25px -5px rgba(255, 255, 255, 0.05)',
        'glow-accent': '0 0 30px -8px rgba(59, 130, 246, 0.15)',
        'glow-emerald': '0 0 30px -8px rgba(16, 185, 129, 0.15)',
        'panel': '0 8px 32px -4px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
