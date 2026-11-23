// Cloudflare Web Analytics — cookieless, no fingerprinting, no consent banner
// needed (privacy-first, on-brand). Off unless VITE_ANALYTICS_TOKEN is set at
// build time. Injects the beacon once; no-op off the browser.
//
// Note: if you host on Cloudflare Pages you can instead enable Web Analytics in
// the Pages project (auto-injects the beacon) and leave the token unset.
export function initAnalytics(): void {
  if (typeof document === 'undefined') return
  const token = String(import.meta.env.VITE_ANALYTICS_TOKEN ?? '').trim()
  if (!token || document.getElementById('cf-beacon')) return

  const s = document.createElement('script')
  s.id = 'cf-beacon'
  s.defer = true
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  s.setAttribute('data-cf-beacon', JSON.stringify({ token }))
  document.head.appendChild(s)
}
