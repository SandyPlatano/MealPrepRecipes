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
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			primary: '0 4px 12px hsl(var(--primary) / 0.4)',
  			'primary-lg': '0 8px 16px hsl(var(--primary) / 0.5)'
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
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'shimmer': 'shimmer 1.5s ease-in-out infinite',
  			'checkmark': 'checkmark 0.3s ease-out forwards',
  			'slide-up-fade': 'slide-up-fade 0.3s ease-out forwards'
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
