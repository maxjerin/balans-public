/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Semantic colors wired to the Matchday design tokens (CSS vars in
      // index.css). Dark mode is handled by the vars, so components don't need
      // dark: color variants.
      colors: {
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
        },
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        line: 'var(--line)',
        primary: {
          DEFAULT: 'var(--primary)',
          press: 'var(--primary-press)',
          soft: 'var(--primary-soft)',
          ink: 'var(--primary-ink)',
        },
        brand: 'var(--brand-ink)',
        pitch: 'var(--pitch)',
        court: 'var(--court)',
        strip: 'var(--strip)',
        chalk: 'var(--chalk)',
        accent: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-soft)',
          ink: 'var(--accent-ink)',
        },
        warn: {
          DEFAULT: 'var(--warn)',
          soft: 'var(--warn-soft)',
        },
        maybe: {
          DEFAULT: 'var(--maybe)',
          soft: 'var(--maybe-soft)',
          ink: 'var(--maybe-ink)',
        },
        guest: {
          DEFAULT: 'var(--guest)',
          soft: 'var(--guest-soft)',
        },
      },
      borderRadius: {
        sm: '7px',
        md: '11px',
        lg: '16px',
        pill: '999px',
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow)',
      },
    },
  },
  plugins: [],
}
