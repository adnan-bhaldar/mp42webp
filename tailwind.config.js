/** @type {import('tailwindcss').Config} */
export default {
  // Specify all files that should be scanned for Tailwind classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ✅ ADD THIS LINE to enable class-based dark mode switching
  darkMode: 'class', 
  theme: {
    extend: {},
  },
  // Plugins array for v3 configuration
  plugins: [],
}