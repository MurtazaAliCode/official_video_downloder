/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Dark mode with class strategy
  content: [
    "./index.html", // Relative to client/ directory
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all client source files
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          5: "hsl(var(--primary) / 0.05)", // Added opacity 5%
          10: "hsl(var(--primary) / 0.1)", // Added opacity 10%
          90: "hsl(var(--primary) / 0.9)", // Added for consistency
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        "gradient-bg": "linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 50%, hsl(300, 76%, 62%) 100%)",
        "gradient-bg-dark": "linear-gradient(135deg, hsl(221.2, 83.2%, 33.3%) 0%, hsl(262.1, 83.3%, 37.8%) 50%, hsl(300, 76%, 42%) 100%)",
      },
      transitionProperty: {
        'width': 'width',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
  safelist: [
    { pattern: /^dark:/ }, // Matches dark: prefixed classes
    { pattern: /gradient/ }, // Gradient classes
    { pattern: /btn-gradient/ }, // Custom button gradients
    { pattern: /upload-area/ }, // Custom upload area
    { pattern: /progress-bar/ }, // Custom progress bar
    { pattern: /card-hover/ }, // Custom card hover
    // Added for DownloadForm.tsx
    'max-w-md',
    'mx-auto',
    'p-4',
    'bg-gray-100',
    'rounded-lg',
    'shadow-md',
    'text-2xl',
    'font-bold',
    'mb-4',
    'text-center',
    'space-y-4',
    'w-full',
    'p-2',
    'border',
    'rounded',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'bg-blue-500',
    'text-white',
    'hover:bg-blue-600',
    'mt-4',
    'bg-gray-200',
    'rounded-full',
    'h-2.5',
    'bg-blue-500',
    'mt-2',
    'text-red-500',
    'inline-block',
    'bg-green-500',
    'hover:bg-green-600',
    { pattern: /bg-(blue|green|red|gray)-(100|500|600)/ }, // Dynamic background colors
    { pattern: /text-(lg|sm|2xl)/ }, // Dynamic text sizes
  ],
};