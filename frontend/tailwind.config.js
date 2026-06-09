/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f2f7f4',
          100: '#e0ece5',
          200: '#c3d9cc',
          300: '#9abfaa',
          400: '#6ea083',
          500: '#4d8264',
          600: '#3a6750',
          700: '#2f5341',
          800: '#274336',
          900: '#22382d',
        },
        cream: {
          50: '#fdfcf8',
          100: '#faf7ef',
          200: '#f4edda',
          300: '#ebdfc0',
          400: '#deca9a',
          500: '#d1b578',
        },
        warm: {
          50: '#fdf8f6',
          100: '#faeee8',
          200: '#f4d8cc',
          300: '#eab8a4',
          400: '#de9175',
          500: '#d4704e',
        }
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'serif'],
        body: ['Palatino Linotype', 'Book Antiqua', 'Palatino', 'serif'],
        sans: ['system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'typing': 'typing 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
