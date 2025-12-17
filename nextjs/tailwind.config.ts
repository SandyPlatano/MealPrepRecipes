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
  			// MEAL PREP OS - Retro Computing Design System
  			// ═══════════════════════════════════════════════════════════════
  			os: {
  				// Window chrome colors
  				chrome: '#c0c0c0',
  				'chrome-dark': '#2d2d44',
  				titlebar: '#000080',
  				'titlebar-gradient': '#1084d0',
  				'titlebar-inactive': '#808080',
  				desktop: '#008080',
  				'desktop-dark': '#1a1a2e',
  				// Bevel system for 3D effect
  				raised: '#dfdfdf',
  				sunken: '#808080',
  				darkest: '#404040',
  				lightest: '#ffffff',
  				// Content areas
  				content: '#ffffff',
  				'content-dark': '#16213e',
  				// Text
  				text: '#000000',
  				'text-light': '#ffffff',
  				'text-disabled': '#808080',
  				'text-link': '#0000ff'
  			},
  			// Food-themed accent colors for Meal Prep OS
  			food: {
  				tomato: '#ff6347',
  				'tomato-dark': '#cc4f39',
  				avocado: '#568203',
  				'avocado-light': '#7ab317',
  				butter: '#f0c674',
  				'butter-dark': '#d4a84a',
  				eggplant: '#614051',
  				'eggplant-light': '#8a5d73',
  				carrot: '#ed9121',
  				'carrot-dark': '#c77a1a'
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
  			// Meal Prep OS - Retro bevel shadows
  			'os-bevel': 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080',
  			'os-bevel-pressed': 'inset 1px 1px 0 #808080, inset -1px -1px 0 #dfdfdf',
  			'os-window': '2px 2px 0 #000000',
  			'os-inset': 'inset 1px 1px 0 #808080, inset -1px -1px 0 #dfdfdf',
  			'os-outset': 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080, 1px 1px 0 #000000'
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
  			// Meal Prep OS - Retro animations
  			'os-window-open': {
  				'0%': {
  					transform: 'scale(0.1)',
  					opacity: '0'
  				},
  				'50%': {
  					transform: 'scale(1.02)'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			'os-window-close': {
  				'0%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'scale(0.1)',
  					opacity: '0'
  				}
  			},
  			'os-loading-blocks': {
  				'0%': {
  					backgroundPosition: '0 0'
  				},
  				'100%': {
  					backgroundPosition: '16px 0'
  				}
  			},
  			'os-blink': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0'
  				}
  			},
  			'os-bounce': {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-4px)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'shimmer': 'shimmer 1.5s ease-in-out infinite',
  			'checkmark': 'checkmark 0.3s ease-out forwards',
  			'slide-up-fade': 'slide-up-fade 0.3s ease-out forwards',
  			// Meal Prep OS animations
  			'os-window-open': 'os-window-open 0.15s ease-out',
  			'os-window-close': 'os-window-close 0.1s ease-in',
  			'os-loading': 'os-loading-blocks 0.5s steps(2) infinite',
  			'os-blink': 'os-blink 1s step-end infinite',
  			'os-bounce': 'os-bounce 0.5s ease-in-out infinite'
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
