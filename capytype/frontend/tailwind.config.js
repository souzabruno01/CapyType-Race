// CapyType - Tailwind CSS Configuration
// This file configures Tailwind CSS for the CapyType frontend
// Project: Multiplayer Typing Game with Capybara Theme

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom theme extensions for CapyType
      colors: {
        'capy-primary': '#3B82F6', // Blue
        'capy-secondary': '#10B981', // Green
        'capy-accent': '#F59E0B', // Amber
      },
    },
  },
  plugins: [],
} 