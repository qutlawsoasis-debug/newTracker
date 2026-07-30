/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          bg: '#F5F5F7',
          card: '#FFFFFF',
          subtle: '#FAFAFA',
          hover: '#F0F0F2',
        },
        ink: {
          primary: '#1D1D1F',
          secondary: '#6E6E73',
          tertiary: '#AEAEB2',
          ghost: '#C7C7CC',
          border: '#E5E5EA',
          'border-light': '#F2F2F7',
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'slide-up': 'slide-up 0.4s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
