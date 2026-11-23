// Sticky bottom-anchored ad: floats at the bottom of the viewport while you
// scroll. Dismissible (so it never permanently obscures content — keeps it
// AdSense-policy-clean) and safe-area aware. Renders only when ads are enabled
// or in sample mode; otherwise nothing. Sits below the consent banner's z-index
// so consent always takes precedence.
import { useEffect, useRef } from 'react'
import {
  adsEnabled,
  adsenseClient,
  adsenseSlot,
  adsSampleMode,
  ensureAdsenseLoader,
  pushAdsense,
} from './ads'
import { useT } from '../i18n/useT'

export function StickyAd({ onDismiss }: { onDismiss: () => void }) {
  const t = useT()
  const pushed = useRef(false)
  const enabled = adsEnabled()
  const sample = !enabled && adsSampleMode()
  const client = adsenseClient()
  const slot = adsenseSlot()

  useEffect(() => {
    if (!enabled || pushed.current) return
    ensureAdsenseLoader(client)
    pushAdsense()
    pushed.current = true
  }, [enabled, client])

  if (!enabled && !sample) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-card">
      <div className="mx-auto flex max-w-md items-center gap-2">
        <span className="shrink-0 -rotate-90 text-[9px] uppercase tracking-wide text-faint">{t('ads.label')}</span>
        <div className="min-w-0 flex-1">
          {sample ? (
            <div className="flex h-14 items-center justify-center rounded bg-surface-2 text-center">
              <p className="text-sm font-semibold text-ink">{t('ads.sample')}</p>
            </div>
          ) : (
            <ins
              className="adsbygoogle block"
              style={{ display: 'block', height: 56 }}
              data-ad-client={client}
              {...(slot ? { 'data-ad-slot': slot } : {})}
              data-ad-format="horizontal"
              data-full-width-responsive="true"
            />
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t('privacy.close')}
          className="tap-target shrink-0 rounded-md px-2 py-1 text-sm text-faint hover:bg-surface-2 hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
