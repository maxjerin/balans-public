// Labelled AdSense slot, rendered ONLY when ads are enabled + configured.
// Default build: adsEnabled() is false → renders null (no script, no request,
// no layout shift). When enabled, the AdSense loader is injected once and an
// <ins class="adsbygoogle"> slot is pushed. The slot is clearly labelled as an
// ad (AdSense policy forbids disguising ads).
import { useEffect, useRef } from 'react'
import { adsEnabled, adsenseClient, adsenseSlot, adsSampleMode, ensureAdsenseLoader, pushAdsense } from './ads'
import { useT } from '../i18n/useT'

export function AdSlot({ className = '' }: { className?: string }) {
  const t = useT()
  const pushed = useRef(false)
  const enabled = adsEnabled()
  const client = adsenseClient()
  const slot = adsenseSlot()

  useEffect(() => {
    if (!enabled || pushed.current) return
    ensureAdsenseLoader(client)
    pushAdsense()
    pushed.current = true
  }, [enabled, client])

  // Demo mode: a labelled placeholder so the slot can be previewed without an
  // AdSense account (no script, no network). Real ads take priority.
  if (!enabled && adsSampleMode()) {
    return (
      <aside
        aria-label={t('ads.label')}
        className={'overflow-hidden rounded-md border border-line ' + className}
      >
        <p className="px-2 py-1 text-[10px] uppercase tracking-wide text-faint">{t('ads.label')}</p>
        <div className="flex h-24 items-center justify-center bg-surface-2 text-center">
          <div>
            <p className="text-sm font-semibold text-ink">{t('ads.sample')}</p>
            <p className="mt-0.5 text-xs text-faint">300×250 · responsive</p>
          </div>
        </div>
      </aside>
    )
  }

  if (!enabled) return null

  return (
    <aside
      aria-label={t('ads.label')}
      className={'overflow-hidden rounded-md border border-line ' + className}
    >
      <p className="px-2 py-1 text-[10px] uppercase tracking-wide text-faint">
        {t('ads.label')}
      </p>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={client}
        {...(slot ? { 'data-ad-slot': slot } : {})}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}
