import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted Archivo (weight axis only — no italic/width variants the app never
// uses). Served from our own origin under the immutable /assets cache instead of
// a render-blocking Google Fonts @import. See docs/OPERATIONS.md → performance.
import '@fontsource-variable/archivo/wght.css'
import './index.css'
import { App } from './App'
import { applyTheme, watchSystemTheme } from './ui/theme'
import { initAnalytics } from './analytics/cloudflare'
import { BUILD, checkForUpdate } from './version/build'

// Apply the saved theme before first paint and track OS changes.
applyTheme()
watchSystemTheme()
// Cookieless analytics (no-op unless VITE_ANALYTICS_TOKEN is set).
initAnalytics()

// Announce the running build, then compare against the edge's /version.json so a
// stale service-worker cache is obvious in the console (not just visually).
console.info(`%cBalans%c build ${BUILD.version} · ${BUILD.builtAt}`, 'font-weight:bold;color:#15803d', '')
void checkForUpdate().then((s) => {
  if (s?.stale) {
    console.warn(`[balans] this page is running ${s.current} but the server has ${s.latest} — reload to update`)
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
