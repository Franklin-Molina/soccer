module.exports = {
  darkMode: 'class', // 👈 importante
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(241, 99, 205, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(99,102,241,0.7)' },
        },
      },
      animation: {
        float: 'float 2.5s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
};
