import type { Config } from 'tailwindcss';

export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'light-bg-main': 'var(--light-bg-main)',
        'light-bg-sub': 'var(--light-bg-sub)',
        'light-card-surface': 'var(--light-card-surface)',
        'light-surface-elevated': 'var(--light-surface-elevated)',
        'light-border': 'var(--light-border)',
        'light-brand-primary': 'var(--light-brand-primary)',
        'light-brand-hover': 'var(--light-brand-hover)',
        'light-brand-accent': 'var(--light-brand-accent)',
        'light-success': 'var(--light-success)',
        'light-warning': 'var(--light-warning)',
        'light-error': 'var(--light-error)',
        'light-text-main': 'var(--light-text-main)',
        'light-text-sub': 'var(--light-text-sub)',
        'light-text-disabled': 'var(--light-text-disabled)',

        'dark-bg-main': 'var(--dark-bg-main)',
        'dark-bg-sub': 'var(--dark-bg-sub)',
        'dark-card-surface': 'var(--dark-card-surface)',
        'dark-surface-elevated': 'var(--dark-surface-elevated)',
        'dark-border': 'var(--dark-border)',
        'dark-brand-primary': 'var(--dark-brand-primary)',
        'dark-brand-hover': 'var(--dark-brand-hover)',
        'dark-brand-accent': 'var(--dark-brand-accent)',
        'dark-success': 'var(--dark-success)',
        'dark-warning': 'var(--dark-warning)',
        'dark-error': 'var(--dark-error)',
        'dark-text-main': 'var(--dark-text-main)',
        'dark-text-sub': 'var(--dark-text-sub)',
        'dark-text-disabled': 'var(--dark-text-disabled)',
      },
      fonts: {
        'text-title': 'var(--font-head)',
        'text-body': 'var(--font-body)',
      },
    },
  },
  plugins: [],
} satisfies Config;