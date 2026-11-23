// Privacy policy as a closeable in-app overlay (no router — the URL hash is
// reserved for shareable state). Content is short because the app is genuinely
// server-less: there is little to disclose. Esc or the backdrop closes it.
import { useEffect } from 'react'
import { useT } from '../i18n/useT'

const SECTIONS = [
  { title: 'privacy.noServer.title', body: 'privacy.noServer.body' },
  { title: 'privacy.localData.title', body: 'privacy.localData.body' },
  { title: 'privacy.sharing.title', body: 'privacy.sharing.body' },
  { title: 'privacy.adsAnalytics.title', body: 'privacy.adsAnalytics.body' },
] as const

export function PrivacyPolicy({ onClose }: { onClose: () => void }) {
  const t = useT()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('privacy.title')}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-md overflow-auto rounded-t-2xl bg-surface p-5 shadow-card sm:rounded-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{t('privacy.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('privacy.close')}
            className="rounded-md px-3 py-1 text-sm font-medium text-muted hover:bg-surface-2"
          >
            {t('privacy.close')}
          </button>
        </div>

        <p className="mb-4 text-sm text-muted">{t('privacy.intro')}</p>

        <div className="flex flex-col gap-4">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h3 className="text-sm font-semibold text-ink">{t(s.title)}</h3>
              <p className="mt-1 text-sm text-muted">{t(s.body)}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
