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
        // Custom Mova palette with Fixed #05163F Theme
        mova: {
          bg: '#05163F',
          surface: '#0a1f4a',
          secondary: '#0c265a',
          accent: '#3b82f6',
          'accent-hover': '#2563eb',
          'text-primary': '#ffffff',
          'text-secondary': '#cbd5e1',

          // Dark mode aliases force to the exact same theme to prevent any light mode flashes
          'bg-dark': '#05163F',
          'surface-dark': '#0a1f4a',
          'secondary-dark': '#0c265a',
          'text-primary-dark': '#ffffff',
          'text-secondary-dark': '#cbd5e1',
          'accent-light': '#3b82f6',

          success: '#34C759',
          destructive: '#FF3B30',
          warning: '#FF9500',
          
          // Hand tracking colors
          'hand-primary': '#4ecca3',
          'hand-secondary': '#e94560',
          'thumb-tip': '#ffd369',
        },
      },
      fontFamily: {
        system: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'ios': '14px',
        'ios-lg': '20px',
        'ios-xl': '24px',
      },
      boxShadow: {
        'soft': '0 4px 24px rgba(0, 0, 0, 0.04)',
        'header': '0 1px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.15)',
        'button': '0 4px 12px rgba(0, 122, 255, 0.3)',
      },
      animation: {
        'blink': 'blink 2s infinite',
        'blink-cursor': 'blink-cursor 1s step-end infinite',
        'spin-ios': 'spin-ios 1.2s linear infinite',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'blink-cursor': {
          '50%': { opacity: '0' },
        },
        'spin-ios': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0.2' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
