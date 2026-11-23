// Content model for the static, crawlable marketing/legal pages (about, help,
// contact, privacy, terms). These are rendered to plain HTML at build time (and
// served by a dev middleware) so Googlebot — and AdSense review — sees real
// content without running the SPA. One source, four languages, with hreflang.

export const CONTENT_LANGS = ['en', 'fr', 'es', 'pt'] as const
export type ContentLang = (typeof CONTENT_LANGS)[number]

export const SITE_ORIGIN = 'https://balans.team'

export type Block =
  | { kind: 'lead'; text: string }
  | { kind: 'updated'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  // `html` and list items may contain trusted inline markup (<a>, <strong>, <em>).
  | { kind: 'p'; html: string }
  | { kind: 'ol'; items: string[] }
  | { kind: 'ul'; items: string[] }
  | { kind: 'email'; address: string }
  | { kind: 'cta'; href: string; label: string }

export interface PageContent {
  title: string
  description: string
  h1: string
  blocks: Block[]
}

export interface ContentPage {
  slug: 'about' | 'help' | 'contact' | 'privacy' | 'terms'
  perLang: Record<ContentLang, PageContent>
}

export interface ChromeLabels {
  home: string
  about: string
  help: string
  contact: string
  privacy: string
  terms: string
  tagline: string
  langName: string
}
