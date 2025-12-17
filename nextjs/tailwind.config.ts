import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'Inter',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          'var(--font-mono)',
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'Monaco',
          'monospace'
        ],
        handwritten: [
          'var(--font-handwritten)',
          'Caveat',
          'cursive'
        ],
        // Retro OS fonts
        pixel: [
          'var(--font-pixel)',
          'VT323',
          'Press Start 2P',
          'Pixelify Sans',
          'monospace'
        ],
        system: [
          'var(--font-system)',
          'IBM Plex Mono',
          'JetBrains Mono',
          'Consolas',
          'monospace'
        ]
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        // Brand colors
        brand: {
          coral: 'hsl(var(--brand-coral))',
          sage: 'hsl(var(--brand-sage))',
          cream: 'hsl(var(--brand-cream))',
          'warm-gray': 'hsl(var(--brand-warm-gray))'
        },
        // Coral palette for calendar and accents
        coral: {
          50: 'hsl(25 100% 97%)',
          100: 'hsl(25 100% 93%)',
          200: 'hsl(25 100% 85%)',
          300: 'hsl(25 100% 75%)',
          400: 'hsl(25 95% 63%)',
          500: 'hsl(25 95% 53%)',
          600: 'hsl(25 90% 45%)',
          700: 'hsl(25 85% 38%)',
          800: 'hsl(25 80% 30%)',
          900: 'hsl(25 75% 22%)',
          950: 'hsl(25 70% 12%)'
        },
        // Sage palette for secondary accents
        sage: {
          50: 'hsl(142 50% 97%)',
          100: 'hsl(142 45% 92%)',
          200: 'hsl(142 40% 82%)',
          300: 'hsl(142 38% 68%)',
          400: 'hsl(142 36% 55%)',
          500: 'hsl(142 40% 45%)',
          600: 'hsl(142 42% 36%)',
          700: 'hsl(142 40% 28%)',
          800: 'hsl(142 38% 22%)',
          900: 'hsl(142 35% 16%)',
          950: 'hsl(142 30% 10%)'
        },
        // ═══════════════════════════════════════════════════════════════
        // MEAL PREP OS - PostHog-Inspired Design System
        // Dark, bold, playful, personality-driven
        // ═══════════════════════════════════════════════════════════════
        dark: {
          DEFAULT: '#1D1F27',
          lighter: '#2C2E38',
          accent: '#35363F',
          border: '#404350',
        },
        cream: {
          DEFAULT: '#EEEFE9',
          light: '#FDFDF8',
          dark: '#D4D5CF',
        },
        // Bold accent colors (PostHog-style)
        bold: {
          red: '#F54E00',
          'red-dark': '#D94400',
          'red-glow': 'rgba(245, 78, 0, 0.15)',
          orange: '#EB9D2A',
          yellow: '#F7A501',
          blue: '#2F80FA',
          purple: '#A621C8',
          green: '#6AA84F',
          pink: '#E34C6F',
          teal: '#29DBBC',
        },
        // Legacy food colors (keeping for backwards compat)
        food: {
          tomato: '#F54E00',
          'tomato-dark': '#D94400',
          avocado: '#6AA84F',
          'avocado-light': '#7FBF5F',
          butter: '#F7A501',
          'butter-dark': '#D99000',
          eggplant: '#A621C8',
          'eggplant-light': '#B94AD6',
          carrot: '#EB9D2A',
          'carrot-dark': '#D08A20'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        primary: '0 4px 12px hsl(var(--primary) / 0.4)',
        'primary-lg': '0 8px 16px hsl(var(--primary) / 0.5)',
        // Meal Prep OS - PostHog-style shadows
        'glow-red': '0 0 40px rgba(245, 78, 0, 0.15)',
        'glow-red-strong': '0 0 60px rgba(245, 78, 0, 0.25)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.35)',
        'button': '0 2px 0 #B33600',
        'button-hover': '0 3px 0 #B33600'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'shimmer': {
          '0%': {
            backgroundPosition: '200% 0'
          },
          '100%': {
            backgroundPosition: '-200% 0'
          }
        },
        'checkmark': {
          '0%': {
            transform: 'scale(0)',
            opacity: '0'
          },
          '50%': {
            transform: 'scale(1.2)'
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1'
          }
        },
        'slide-up-fade': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        // Meal Prep OS - PostHog-style playful animations
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 78, 0, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(245, 78, 0, 0.4)' }
        },
        'wave': {
          '0%': { transform: 'rotate(0deg)' },
          '10%': { transform: 'rotate(14deg)' },
          '20%': { transform: 'rotate(-8deg)' },
          '30%': { transform: 'rotate(14deg)' },
          '40%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(10deg)' },
          '60%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(0deg)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'checkmark': 'checkmark 0.3s ease-out forwards',
        'slide-up-fade': 'slide-up-fade 0.3s ease-out forwards',
        // Meal Prep OS - PostHog-style animations
        'wiggle': 'wiggle 0.5s ease-in-out',
        'wiggle-infinite': 'wiggle 0.5s ease-in-out infinite',
        'bounce-in': 'bounce-in 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'wave': 'wave 2.5s ease-in-out infinite'
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)'
      }
    }
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
