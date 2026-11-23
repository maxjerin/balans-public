// Theme: light / dark / system, persisted locally and applied as a class on
// <html> (Tailwind darkMode: 'class'). System tracks the OS preference live.
export type Theme = 'light' | 'dark' | 'system'

const KEY = 'evensides:theme'

export function getTheme(): Theme {
  try {
    const t = localStorage.getItem(KEY)
    if (t === 'light' || t === 'dark' || t === 'system') return t
  } catch {
    // ignore
  }
  return 'system'
}

function prefersDark(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
}

/** Resolve to the actual mode and toggle the `dark` class on <html>. */
export function applyTheme(theme: Theme = getTheme()): void {
  const dark = theme === 'dark' || (theme === 'system' && prefersDark())
  document.documentElement.classList.toggle('dark', dark)
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // ignore
  }
  applyTheme(theme)
}

/** Cycle light → dark → system → light. */
export function nextTheme(t: Theme): Theme {
  return t === 'light' ? 'dark' : t === 'dark' ? 'system' : 'light'
}

/** Keep `system` in sync when the OS preference changes at runtime. */
export function watchSystemTheme(): void {
  if (typeof matchMedia === 'undefined') return
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getTheme() === 'system') applyTheme('system')
  })
}
