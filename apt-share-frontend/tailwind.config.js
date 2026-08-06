/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        'bg-elevated': 'var(--color-surface-sunken)',
        surface: 'var(--color-surface)',
        'surface-sunken': 'var(--color-surface-sunken)',
        'surface-elevated': 'var(--color-surface)',
        border: 'var(--color-border)',
        ink: 'var(--color-ink)',
        'ink-secondary': 'var(--color-ink-secondary)',
        'text-primary': 'var(--color-ink)',
        'text-secondary': 'var(--color-ink-secondary)',
        'accent-amber': 'var(--color-accent-amber)',
        'accent-teal': 'var(--color-accent-teal)',
        amber: 'var(--color-accent-amber)',
        teal: 'var(--color-accent-teal)',
        accent: {
          DEFAULT: 'var(--color-accent-amber)',
          hover: 'var(--color-accent-amber-hover)',
        },
        success: 'var(--color-accent-teal)',
        warning: 'var(--color-accent-amber)',
        danger: 'var(--color-danger)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        display: ['Fraunces', 'serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        ticket: '14px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        ticket: '0 4px 20px rgba(16, 32, 28, 0.08), 0 1px 3px rgba(16, 32, 28, 0.04)',
      }
    },
  },
  plugins: [],
}
