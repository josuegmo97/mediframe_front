import animate from 'tailwindcss-animate'

/** Color tokens live in src/styles/globals.css as RGB channel triplets. */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Urbanist Variable"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        fg: token('fg'),
        'fg-muted': token('fg-muted'),
        'fg-subtle': token('fg-subtle'),
        border: token('border'),
        'border-strong': token('border-strong'),
        accent: token('accent'),
        'accent-fg': token('accent-fg'),
        primary: token('primary'),
        'primary-fg': token('primary-fg'),
        secondary: token('secondary'),
        'secondary-deep': token('secondary-deep'),
        tertiary: token('tertiary'),
        success: token('success'),
        'success-fg': token('success-fg'),
        info: token('info'),
        'info-fg': token('info-fg'),
        warning: token('warning'),
        'warning-fg': token('warning-fg'),
        danger: token('danger'),
        'danger-fg': token('danger-fg'),
        'danger-text': token('danger-text'),
        ring: token('ring'),
        chart: {
          1: token('chart-1'),
          2: token('chart-2'),
          3: token('chart-3'),
          4: token('chart-4'),
          5: token('chart-5'),
          grid: token('chart-grid'),
        },
      },
      borderRadius: {
        xl: 'var(--radius)',
        lg: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 6px)',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(20 24 22 / 0.04), 0 1px 3px 0 rgb(20 24 22 / 0.06)',
        pop: '0 10px 30px -10px rgb(20 24 22 / 0.25), 0 2px 8px -2px rgb(20 24 22 / 0.1)',
      },
      minHeight: { touch: '44px' },
      minWidth: { touch: '44px' },
      maxWidth: { content: '80rem' },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [animate],
}
