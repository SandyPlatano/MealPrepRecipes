/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: "#F56565",      // Reddish-orange - CTAs, primary buttons
        secondary: "#FBBF24",    // Yellow - highlights, accent cards, focus
        tertiary: "#60A5FA",     // Blue - links, secondary actions
        
        // Backgrounds
        "background-light": "#FEF6E4",  // Warm cream (light mode)
        "background-dark": "#1F2937",   // Dark slate (dark mode)
        
        // Surfaces (cards, modals)
        "surface-light": "#FFFFFF",
        "surface-dark": "#374151",
        
        // Text
        "text-main": "#111827",
        "text-muted": "#6B7280",
      },
      
      fontFamily: {
        display: ['"Space Mono"', 'monospace'],  // Headings, labels
        body: ['"Work Sans"', 'sans-serif'],     // Body text
      },
      
      borderRadius: {
        DEFAULT: "0.5rem",   // 8px
        'xl': "1rem",        // 16px
      },
      
      boxShadow: {
        // Neo-brutalist shadows - hard edges, no blur
        'retro': '4px 4px 0px 0px #000000',
        'retro-hover': '2px 2px 0px 0px #000000',
        'retro-active': '0px 0px 0px 0px #000000',
        
        // Small shadow for icons
        'retro-sm': '3px 3px 0px 0px #000000',
        'retro-sm-hover': '1px 1px 0px 0px #000000',
        
        // Subtle input shadow
        'retro-input': '4px 4px 0px 0px rgba(0,0,0,0.1)',
        
        // Colored shadows for alerts
        'retro-success': '4px 4px 0px 0px #064e3b',
        'retro-warning': '4px 4px 0px 0px #78350f',
        'retro-error': '4px 4px 0px 0px #7f1d1d',
      },
    },
  },
  plugins: [],
}
