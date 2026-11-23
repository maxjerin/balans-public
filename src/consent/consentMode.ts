// Google Consent Mode v2 bridge. Thin wrappers over the gtag dataLayer so the
// rest of the app deals in booleans, not gtag plumbing. Loaded only when the
// consent feature is enabled (see ConsentBanner). No-ops safely off the browser.
import { gaMeasurementId } from './consent'

type GtagArgs = unknown[]

declare global {
  interface Window {
    dataLayer?: GtagArgs[]
  }
}

function pushGtag(...args: GtagArgs): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(args)
}

let defaultsSet = false

/** Consent Mode v2: default everything to denied until the user chooses. Call
 *  this as early as possible (before gtag.js loads). Idempotent — safe under
 *  React StrictMode's double-invoked effects. */
export function initConsentDefaults(): void {
  if (defaultsSet) return
  defaultsSet = true
  pushGtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  })
}

/** Apply the user's choice across all v2 consent signals. */
export function applyConsentUpdate(granted: boolean): void {
  const v: 'granted' | 'denied' = granted ? 'granted' : 'denied'
  pushGtag('consent', 'update', {
    ad_storage: v,
    ad_user_data: v,
    ad_personalization: v,
    analytics_storage: v,
  })
}

const GTAG_ID = 'gtag-js'

/** Inject gtag.js once and run the standard init, if a GA id is configured. */
export function loadGtag(): void {
  if (typeof document === 'undefined') return
  const id = gaMeasurementId()
  if (!id || document.getElementById(GTAG_ID)) return

  const s = document.createElement('script')
  s.id = GTAG_ID
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(s)

  pushGtag('js', new Date())
  pushGtag('config', id)
}
