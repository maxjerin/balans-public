// Theme control: a single icon button that opens a small menu (System / Light /
// Dark) on tap. One icon normally; pick a mode and it closes. System is the
// default and follows the OS live.
import { useEffect, useRef, useState } from 'react'
import { getTheme, setTheme, type Theme } from './theme'
import { useT } from '../i18n/useT'

const ORDER: Theme[] = ['system', 'light', 'dark']
const ICON: Record<Theme, string> = { system: '◐', light: '☀', dark: '☾' }
const LABEL_KEY: Record<Theme, 'theme.system' | 'theme.light' | 'theme.dark'> = {
  system: 'theme.system',
  light: 'theme.light',
  dark: 'theme.dark',
}

export function ThemeToggle() {
  const t = useT()
  const [theme, set] = useState<Theme>(getTheme())
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (th: Theme) => {
    setTheme(th)
    set(th)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('theme.label')}
        title={t('theme.label')}
        onClick={() => setOpen((o) => !o)}
        className="tap-target rounded-md border border-line px-2 py-1 text-sm text-muted hover:bg-surface-2"
      >
        {ICON[theme]}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-36 overflow-hidden rounded-md border border-line bg-surface shadow-card"
        >
          {ORDER.map((th) => (
            <button
              key={th}
              type="button"
              role="menuitemradio"
              aria-checked={theme === th}
              onClick={() => choose(th)}
              className={
                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm ' +
                (theme === th ? 'bg-primary-soft text-brand' : 'text-ink hover:bg-surface-2')
              }
            >
              <span className="w-4 text-center">{ICON[th]}</span>
              {t(LABEL_KEY[th])}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
