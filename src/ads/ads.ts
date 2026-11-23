// Ad gating (brief §3.1, §10) — ads ship ONLY when explicitly enabled AND a
// publisher id is configured. The default build sets neither, so nothing loads:
// no script, no layout shift, no third-party request. AdSense forbids disguising
// ads, so the slot itself is a clearly-labelled container (see AdSlot.tsx).
//
// Pure + env-injectable so the gating is unit-testable without a real bundle.

type Env = Record<string, unknown>

const read = (env: Env, key: string): string => String(env[key] ?? '').trim()

/** True only when ads are flagged on AND an AdSense client id is present. */
export function adsEnabled(env: Env = import.meta.env): boolean {
  return read(env, 'VITE_ADS_ENABLED') === 'true' && read(env, 'VITE_ADSENSE_CLIENT') !== ''
}

/** Configured AdSense publisher id (e.g. ca-pub-…), or '' when unset. */
export function adsenseClient(env: Env = import.meta.env): string {
  return read(env, 'VITE_ADSENSE_CLIENT')
}

/** Optional fixed slot id; '' means use an auto/responsive slot. */
export function adsenseSlot(env: Env = import.meta.env): string {
  return read(env, 'VITE_ADSENSE_SLOT')
}

/** Demo mode: render labelled placeholder ads (no AdSense, no network) so the
 *  slot can be previewed without an account. Real ads (adsEnabled) take priority. */
export function adsSampleMode(env: Env = import.meta.env): boolean {
  return read(env, 'VITE_ADS_SAMPLE') === 'true'
}

/** True when something should render in an ad slot — a real ad or a placeholder. */
export function adsActive(env: Env = import.meta.env): boolean {
  return adsEnabled(env) || adsSampleMode(env)
}

const LOADER_ID = 'adsbygoogle-js'

/** Inject the AdSense loader once. No-op off the browser. */
export function ensureAdsenseLoader(client: string): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(LOADER_ID)) return
  const s = document.createElement('script')
  s.id = LOADER_ID
  s.async = true
  s.crossOrigin = 'anonymous'
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`
  document.head.appendChild(s)
}

/** Queue an AdSense slot render. Safe to call after ensureAdsenseLoader. */
export function pushAdsense(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
  } catch {
    // blocked / not ready — leave the labelled container empty.
  }
}
