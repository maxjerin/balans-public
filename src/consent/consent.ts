// Consent state + gating (Google Consent Mode v2, brief §10). All OFF by default:
// the banner only appears when the feature is flagged on AND the visitor's region
// requires it AND no prior choice is stored. The stored choice lives in
// localStorage only (never in the URL payload).

type Env = Record<string, unknown>
const read = (env: Env, key: string): string => String(env[key] ?? '').trim()

export type Consent = 'granted' | 'denied'

const STORAGE_KEY = 'evensides:consent'

/** Master flag — the whole consent/CMP feature is off unless this is true. */
export function consentEnabled(env: Env = import.meta.env): boolean {
  return read(env, 'VITE_CONSENT_ENABLED') === 'true'
}

/** Optional GA4 id used to wire Consent Mode; '' means no gtag is loaded. */
export function gaMeasurementId(env: Env = import.meta.env): string {
  return read(env, 'VITE_GA_MEASUREMENT_ID')
}

export function loadConsent(): Consent | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

export function saveConsent(c: Consent): void {
  try {
    localStorage.setItem(STORAGE_KEY, c)
  } catch {
    // private mode / quota — ignore.
  }
}

/** Pure decision: should the banner be shown this load? */
export function shouldShowBanner(opts: {
  enabled: boolean
  regionNeedsConsent: boolean
  stored: Consent | null
}): boolean {
  return opts.enabled && opts.regionNeedsConsent && opts.stored === null
}
