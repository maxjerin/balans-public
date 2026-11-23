// Region-aware consent banner (Consent Mode v2). Renders only when the feature
// is enabled, the visitor's region requires consent, and no choice is stored.
// Even when the banner is hidden, if the feature is enabled it still sets the
// Consent Mode defaults (denied) and loads gtag, so analytics/ads honour consent.
import { useEffect, useState } from 'react'
import {
  consentEnabled,
  loadConsent,
  saveConsent,
  shouldShowBanner,
  type Consent,
} from './consent'
import { currentTimezone, needsConsent } from './region'
import { applyConsentUpdate, initConsentDefaults, loadGtag } from './consentMode'
import { useT } from '../i18n/useT'

export function ConsentBanner({ onPrivacy }: { onPrivacy?: () => void }) {
  const t = useT()
  // Compute visibility once from non-React sources (env, timezone, localStorage).
  const [visible, setVisible] = useState(() =>
    shouldShowBanner({
      enabled: consentEnabled(),
      regionNeedsConsent: needsConsent(currentTimezone()),
      stored: loadConsent(),
    }),
  )

  // Side effects only: Consent Mode v2 defaults (denied) before gtag loads, apply
  // any stored choice, then load gtag. Idempotent under StrictMode.
  useEffect(() => {
    if (!consentEnabled()) return
    initConsentDefaults()
    const stored = loadConsent()
    if (stored) applyConsentUpdate(stored === 'granted')
    loadGtag()
  }, [])

  if (!visible) return null

  const choose = (c: Consent) => {
    saveConsent(c)
    applyConsentUpdate(c === 'granted')
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-label={t('consent.title')}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-card"
    >
      <div className="mx-auto flex max-w-md flex-col gap-3">
        <p className="text-sm text-ink">
          {t('consent.body')}{' '}
          {onPrivacy && (
            <button
              type="button"
              onClick={onPrivacy}
              className="font-medium text-brand underline hover:no-underline"
            >
              {t('consent.privacyLink')}
            </button>
          )}
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => choose('denied')}
            className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2"
          >
            {t('consent.decline')}
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-ink hover:bg-primary-press"
          >
            {t('consent.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
