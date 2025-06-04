/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",

    content: [
        "./index.html",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
    	extend: {
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
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
    			dark: {
    				background: '#222831',
    				surface: '#393E46',
    				primary: '#00ADB5',
    				text: '#EEEEEE',
    				"text-secondary": '#B0B0B0',
    				border: '#4A4E5A',
    			},
    			light: {
    				background: '#FFFFFF',
    				surface: '#F9FAFB',
    				primary: '#EF4444',
    				text: '#1F2937',
    				"text-secondary": '#6B7280',
    				border: '#D1D5DB',
    			},
    			accent_theme: {
    				red: '#DC2626',
    				blue: '#3B82F6',
    				teal: '#14B8A6',
    				amber: '#F59E0B',
    			},
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
    			fadeInUp: {
    				'0%': { opacity: '0', transform: 'translateY(10px)' },
    				'100%': { opacity: '1', transform: 'translateY(0)' },
    			},
    			slideInLeft: {
    				'0%': { opacity: '0', transform: 'translateX(-10px)' },
    				'100%': { opacity: '1', transform: 'translateX(0)' },
    			},
    			subtlePulse: {
    				'0%, 100%': { opacity: '1' },
    				'50%': { opacity: '.85' },
    			},
          'pulse-slow': {
            '0%, 100%': { opacity: '0.4' }, 
            '50%': { opacity: '0.6' },
          }
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
    			'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
    			'subtle-pulse': 'subtlePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    		},
    		backgroundImage: {
    			"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
    			"gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
    		}
    	}
    },
    plugins: [require("tailwindcss-animate")],
  }
  