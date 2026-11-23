// Pure renderer: turns the content model into standalone HTML documents and a
// sitemap. No Vite/Node/browser dependencies, so it is unit-testable and can be
// driven from a Vite plugin (dev middleware + build emit). See content/types.ts.
import {
  CONTENT_LANGS,
  SITE_ORIGIN,
  type Block,
  type ChromeLabels,
  type ContentLang,
  type ContentPage,
} from './types'
import { CHROME, PAGES } from './pages'

const CSS = `
:root{color-scheme:light dark;--bg:#fffdf7;--ink:#15181a;--muted:#6f756e;--line:#e9e7dd;--brand:#15632f;--primary:#15a34a}
html.dark{color-scheme:dark;--bg:#10140f;--ink:#eef2ea;--muted:#98a096;--line:#2a322a;--brand:#5fd486;--primary:#2fbd5f}
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:var(--bg);color:var(--ink);line-height:1.55;-webkit-font-smoothing:antialiased}
main{max-width:44rem;margin:0 auto;padding:2.5rem 1.25rem 4rem}
.topbar{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.wordmark{font-size:1.75rem;font-weight:800;letter-spacing:-0.02em;color:var(--brand);text-decoration:none}
.langs{font-size:0.85rem;color:var(--muted)}
.langs a{color:var(--brand);text-decoration:none}
.langs a:hover{text-decoration:underline}
.langs .current{color:var(--ink);font-weight:600}
h1{font-size:1.9rem;margin:1.5rem 0 0.5rem}
h2{margin-top:2rem;font-size:1.25rem}
h3{margin-top:1.5rem;font-size:1.02rem}
p,li{color:var(--ink)}
.lead{font-size:1.1rem;color:var(--muted)}
.updated{color:var(--muted);font-size:0.9rem}
ol,ul{padding-left:1.2rem}
a{color:var(--brand)}
a.cta{display:inline-block;margin-top:1.5rem;background:var(--primary);color:#fff;text-decoration:none;font-weight:600;padding:0.7rem 1.3rem;border-radius:11px}
.email{display:inline-block;margin-top:0.5rem;font-size:1.15rem;font-weight:600}
footer{margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--line);color:var(--muted);font-size:0.85rem}
footer nav{margin-bottom:0.6rem}
footer a{color:var(--brand)}
`.trim()

// Pre-paint theme sync: mirror the app's choice (localStorage 'evensides:theme'
// — light/dark/system, default system) so the static pages match the in-app
// dark/light setting with no flash. Runs before the body renders. See ui/theme.ts.
const THEME_SCRIPT = `
(function(){try{var t=localStorage.getItem('evensides:theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();
`.trim()

/** Escape text destined for an HTML attribute or text node. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Public (clean) URL for a content page. Cloudflare Pages serves the emitted
 *  `slug.html` at an extension-less path and 308-redirects the `.html` form, so
 *  the canonical/hreflang/links use the clean URL to avoid a redirect hop.
 *  English lives at the root (`/about`); other languages under a locale prefix
 *  (`/fr/about`). */
export function pagePath(slug: string, lang: ContentLang): string {
  return lang === 'en' ? `/${slug}` : `/${lang}/${slug}`
}

/** Emitted file name (always `.html`) for a content page. Cloudflare maps this to
 *  the clean URL above. */
export function fileNameFor(slug: string, lang: ContentLang): string {
  return lang === 'en' ? `${slug}.html` : `${lang}/${slug}.html`
}

function abs(path: string): string {
  return SITE_ORIGIN + path
}

function renderBlock(b: Block): string {
  switch (b.kind) {
    case 'lead':
      return `<p class="lead">${b.text}</p>`
    case 'updated':
      return `<p class="updated">${esc(b.text)}</p>`
    case 'h2':
      return `<h2>${esc(b.text)}</h2>`
    case 'h3':
      return `<h3>${esc(b.text)}</h3>`
    case 'p':
      return `<p>${b.html}</p>`
    case 'ol':
      return `<ol>${b.items.map((i) => `<li>${i}</li>`).join('')}</ol>`
    case 'ul':
      return `<ul>${b.items.map((i) => `<li>${i}</li>`).join('')}</ul>`
    case 'email':
      return `<p><a class="email" href="mailto:${esc(b.address)}">${esc(b.address)}</a></p>`
    case 'cta':
      return `<a class="cta" href="${esc(b.href)}">${esc(b.label)}</a>`
  }
}

function langSwitcher(slug: string, current: ContentLang): string {
  return CONTENT_LANGS.map((l) => {
    const label = CHROME[l].langName
    if (l === current) return `<span class="current">${esc(label)}</span>`
    return `<a href="${pagePath(slug, l)}" hreflang="${l}">${esc(label)}</a>`
  }).join(' · ')
}

function footerNav(lang: ContentLang): string {
  const c: ChromeLabels = CHROME[lang]
  const items = [
    `<a href="/">${esc(c.home)}</a>`,
    `<a href="${pagePath('about', lang)}">${esc(c.about)}</a>`,
    `<a href="${pagePath('help', lang)}">${esc(c.help)}</a>`,
    `<a href="${pagePath('contact', lang)}">${esc(c.contact)}</a>`,
    `<a href="${pagePath('privacy', lang)}">${esc(c.privacy)}</a>`,
    `<a href="${pagePath('terms', lang)}">${esc(c.terms)}</a>`,
  ]
  return items.join(' · ')
}

function hreflangLinks(slug: string): string {
  const links = CONTENT_LANGS.map(
    (l) => `<link rel="alternate" hreflang="${l}" href="${abs(pagePath(slug, l))}" />`,
  )
  // x-default points at the English (root) variant.
  links.push(`<link rel="alternate" hreflang="x-default" href="${abs(pagePath(slug, 'en'))}" />`)
  return links.join('\n    ')
}

/** Render one content page (slug × language) to a full HTML document. */
export function renderPage(page: ContentPage, lang: ContentLang): string {
  const c = page.perLang[lang]
  const body = c.blocks.map(renderBlock).join('\n      ')
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(c.title)}</title>
    <meta name="description" content="${esc(c.description)}" />
    <meta name="theme-color" content="#15803d" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="canonical" href="${abs(pagePath(page.slug, lang))}" />
    ${hreflangLinks(page.slug)}
    <script>${THEME_SCRIPT}</script>
    <style>${CSS}</style>
  </head>
  <body>
    <main>
      <div class="topbar">
        <a class="wordmark" href="/">Balans</a>
        <nav class="langs" aria-label="Language">${langSwitcher(page.slug, lang)}</nav>
      </div>
      <h1>${esc(c.h1)}</h1>
      ${body}
      <footer>
        <nav>${footerNav(lang)}</nav>
        ${esc(CHROME[lang].tagline)}
      </footer>
    </main>
  </body>
</html>
`
}

/** Build the sitemap covering the app root and every content page in every
 *  language, with hreflang alternates. */
export function renderSitemap(): string {
  const urls: string[] = []
  urls.push(
    `  <url>\n    <loc>${abs('/')}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  )
  for (const page of PAGES) {
    for (const lang of CONTENT_LANGS) {
      const alts = CONTENT_LANGS.map(
        (l) =>
          `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(pagePath(page.slug, l))}" />`,
      ).join('\n')
      urls.push(
        `  <url>\n    <loc>${abs(pagePath(page.slug, lang))}</loc>\n${alts}\n    <changefreq>monthly</changefreq>\n  </url>`,
      )
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`
}

export interface EmittedFile {
  fileName: string
  source: string
  type: 'html' | 'xml'
}

/** Every static file the content system produces: each page × language, plus the
 *  sitemap. English pages at the root, others under their locale prefix. */
export function buildContentFiles(): EmittedFile[] {
  const files: EmittedFile[] = []
  for (const page of PAGES) {
    for (const lang of CONTENT_LANGS) {
      files.push({
        fileName: fileNameFor(page.slug, lang),
        source: renderPage(page, lang),
        type: 'html',
      })
    }
  }
  files.push({ fileName: 'sitemap.xml', source: renderSitemap(), type: 'xml' })
  return files
}
