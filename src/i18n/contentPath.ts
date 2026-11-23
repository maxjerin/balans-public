import type { Lang } from './index'

// Root-relative path to a static content page for the given language. Mirrors the
// build-time scheme in content/render.ts (English at the root, others under a
// locale prefix). Kept here — free of the content data — so the SPA can link to
// the localized pages without bundling all the page prose.
export function contentPath(slug: string, lang: Lang): string {
  return lang === 'en' ? `/${slug}` : `/${lang}/${slug}`
}
