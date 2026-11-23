import { describe, it, expect } from 'vitest'
import { buildContentFiles, fileNameFor, pagePath, renderPage, renderSitemap } from './render'
import { PAGES } from './pages'
import { CONTENT_LANGS } from './types'

describe('content render', () => {
  it('uses clean (extension-less) public URLs, English at the root', () => {
    expect(pagePath('privacy', 'en')).toBe('/privacy')
    expect(pagePath('privacy', 'fr')).toBe('/fr/privacy')
  })

  it('emits .html files that Cloudflare maps to the clean URLs', () => {
    expect(fileNameFor('privacy', 'en')).toBe('privacy.html')
    expect(fileNameFor('privacy', 'fr')).toBe('fr/privacy.html')
  })

  it('emits every page in every language plus the sitemap', () => {
    const files = buildContentFiles()
    // 5 pages × 4 langs + sitemap.xml
    expect(files).toHaveLength(PAGES.length * CONTENT_LANGS.length + 1)
    expect(files.some((f) => f.fileName === 'about.html')).toBe(true)
    expect(files.some((f) => f.fileName === 'pt/terms.html')).toBe(true)
    expect(files.some((f) => f.fileName === 'sitemap.xml')).toBe(true)
  })

  it('renders a valid document with title, lang, canonical and hreflang alternates', () => {
    const privacy = PAGES.find((p) => p.slug === 'privacy')!
    const html = renderPage(privacy, 'fr')
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('<html lang="fr">')
    expect(html).toContain('Politique de confidentialité')
    expect(html).toContain('<link rel="canonical" href="https://balans.team/fr/privacy" />')
    for (const l of CONTENT_LANGS) {
      expect(html).toContain(`hreflang="${l}"`)
    }
    expect(html).toContain('hreflang="x-default"')
  })

  it('keeps the AdSense advertising + Google opt-out disclosure in every language', () => {
    const privacy = PAGES.find((p) => p.slug === 'privacy')!
    for (const l of CONTENT_LANGS) {
      const html = renderPage(privacy, l)
      expect(html).toContain('AdSense')
      expect(html).toContain('https://www.google.com/settings/ads')
    }
  })

  it('escapes the document title but leaves trusted block markup intact', () => {
    const help = PAGES.find((p) => p.slug === 'help')!
    const html = renderPage(help, 'en')
    // inline <a> inside a paragraph survives
    expect(html).toContain('<a href="/privacy">Privacy Policy</a>')
  })

  it('syncs the dark/light theme before paint via an inline script', () => {
    const html = renderPage(PAGES[0], 'en')
    expect(html).toContain("localStorage.getItem('evensides:theme')")
    expect(html).toContain('html.dark{')
  })

  it('builds a sitemap with clean URLs and xhtml alternates', () => {
    const xml = renderSitemap()
    expect(xml).toContain('<loc>https://balans.team/</loc>')
    expect(xml).toContain('<loc>https://balans.team/es/help</loc>')
    expect(xml).toContain('xhtml:link')
  })
})
