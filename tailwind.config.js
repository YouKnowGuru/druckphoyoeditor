/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bhutan: {
          saffron: '#FF9933',
          gold: '#F4A460',
          orange: '#FF6B35',
          maroon: '#8B4513',
          red: '#DC143C',
          royalRed: '#C41E3A',
          blue: '#4A90E2',
          mountainBlue: '#1E3A8A',
          green: '#2D5016',
          forestGreen: '#228B22',
          white: '#F8F9FA',
          yellow: '#FFD700',
          cream: '#FFF8E7',
          charcoal: '#2D3748',
          darkCharcoal: '#1A202C',
          slate: '#2D3748',
          softWhite: '#F7FAFC',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'Montserrat', 'sans-serif'],
        body: ['Inter', 'Roboto', 'sans-serif'],
        accent: ['Playfair Display', 'serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'dragon-breath': 'dragonBreath 1.5s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 153, 51, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 153, 51, 0.8)' },
        },
        dragonBreath: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
