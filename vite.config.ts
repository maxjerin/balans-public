import { execSync } from 'node:child_process'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import obfuscator from 'vite-plugin-javascript-obfuscator'
import { VitePWA } from 'vite-plugin-pwa'
import { buildContentFiles } from './src/content/render'

// Build identity so you can tell WHICH commit is live in prod — independent of
// any stale service-worker cache. Cloudflare Pages injects CF_PAGES_COMMIT_SHA;
// locally we fall back to git. Surfaced three ways: baked into the bundle
// (__APP_VERSION__ → footer + console), and emitted as /version.json which is
// NOT precached (json isn't in the workbox globPatterns) so it always reflects
// the EDGE build. Compare the two to detect a stale cache.
function resolveBuild(): { version: string; builtAt: string; branch: string } {
  let version = (process.env.CF_PAGES_COMMIT_SHA ?? '').slice(0, 7)
  if (!version) {
    try {
      version = execSync('git rev-parse --short=7 HEAD').toString().trim()
    } catch {
      version = 'dev'
    }
  }
  return {
    version,
    builtAt: new Date().toISOString(),
    branch: process.env.CF_PAGES_BRANCH ?? '',
  }
}

// Emit /version.json into the build (and serve it in dev for parity). Kept out
// of the precache so a client can always fetch the true edge version.
function versionJson(build: { version: string; builtAt: string; branch: string }): Plugin {
  const body = JSON.stringify(build) + '\n'
  return {
    name: 'balans-version-json',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if ((req.url ?? '').split('?')[0] !== '/version.json') return next()
        res.setHeader('Content-Type', 'application/json')
        res.end(body)
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: body })
    },
  }
}

// Renders the static marketing/legal pages (about/help/contact/privacy/terms ×
// en/fr/es/pt) and sitemap.xml from a single content source. They are plain HTML
// so Googlebot — and AdSense review — see real content without running the SPA.
// Served on the fly in dev; emitted into the build for production.
function contentPages(): Plugin {
  return {
    name: 'balans-content-pages',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0]
        // Match the emitted `.html` name and the clean (extension-less) URL that
        // Cloudflare Pages serves in production, so dev parity holds.
        const file = buildContentFiles().find(
          (f) => `/${f.fileName}` === path || `/${f.fileName.replace(/\.html$/, '')}` === path,
        )
        if (!file) return next()
        res.setHeader('Content-Type', file.type === 'xml' ? 'application/xml' : 'text/html')
        res.end(file.source)
      })
    },
    generateBundle() {
      for (const file of buildContentFiles()) {
        this.emitFile({ type: 'asset', fileName: file.fileName, source: file.source })
      }
    },
  }
}

// Static build, root-relative base so it deploys to any static host / CDN.
//
// Client-side code can never be truly hidden (see CLAUDE.md "Algorithm
// protection"), but a release build can raise the bar against casual
// reverse-engineering. Obfuscation is OFF by default (fast, debuggable dev/CI
// builds) and turned on via OBFUSCATE=1 for release builds. Only our own `src`
// is obfuscated — node_modules (React, etc.) is excluded to keep it cheap.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const obfuscate = env.OBFUSCATE === '1' || env.OBFUSCATE === 'true'
  const build = resolveBuild()

  return {
    base: './',
    define: {
      __APP_VERSION__: JSON.stringify(build.version),
      __BUILD_TIME__: JSON.stringify(build.builtAt),
    },
    plugins: [
      react(),
      contentPages(),
      versionJson(build),
      // PWA: installable + offline. Since there is no backend, precaching the
      // app shell makes the whole app work offline once visited. autoUpdate so a
      // new deploy refreshes the SW without a manual prompt. Disabled in dev to
      // keep HMR clean.
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.svg', 'icon.svg'],
        devOptions: { enabled: false },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,woff2}'],
          navigateFallback: 'index.html',
        },
        manifest: {
          name: 'Balans — Pick. Balance. Play.',
          short_name: 'Balans',
          description:
            'Split a weekly pool of players into balanced football teams and share the setup as a link. No account, no server.',
          theme_color: '#15803d',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: './',
          scope: './',
          icons: [
            { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
            { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
          ],
        },
      }),
      ...(obfuscate
        ? [
            obfuscator({
              exclude: [/node_modules/],
              apply: 'build',
              options: {
                compact: true,
                identifierNamesGenerator: 'mangled',
                stringArray: true,
                stringArrayThreshold: 0.75,
                // Keep perf sane — heavy transforms bloat the bundle & slow it.
                controlFlowFlattening: false,
                deadCodeInjection: false,
              },
            }),
          ]
        : []),
    ],
  }
})
