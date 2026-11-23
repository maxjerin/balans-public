// Roll-your-own typed i18n. `en` is the source of truth; fr/es/pt are typed
// against `Dict`. No store import here — keeps this module a leaf so the store
// can import `loadLang`/`detectLang` without a cycle.
import type { Style } from '../domain/types'
import type { SportId } from '../domain/sport'
import { en, type Dict } from './en'
import { fr } from './fr'
import { es } from './es'
import { pt } from './pt'

export type Lang = 'en' | 'fr' | 'es' | 'pt'
export type { Dict }

export const SUPPORTED: Lang[] = ['en', 'fr', 'es', 'pt']
export const dicts: Record<Lang, Dict> = { en, fr, es, pt }

const STORAGE_KEY = 'evensides:lang'

/** Build a position label's dict key: `pos.<sport>.<role>`. A function
 *  instead of a static lookup table — adding a sport never means editing a
 *  central map, only adding that sport's `pos.<sport>.*` keys to the dicts. */
export function positionLabelKey(sport: SportId, role: string): keyof Dict {
  return `pos.${sport}.${role.toLowerCase()}` as keyof Dict
}

export const STYLE_KEYS: Record<Style, keyof Dict> = {
  def: 'style.def',
  bal: 'style.bal',
  att: 'style.att',
}

/** Map a BCP-47-ish tag to a supported language; fall back to English. */
export function detectLang(input: string | undefined): Lang {
  const primary = (input ?? '').toLowerCase().split('-')[0]
  return (SUPPORTED as string[]).includes(primary) ? (primary as Lang) : 'en'
}

/** Resolve a key in the given language, substituting {name} placeholders. */
export function translate(
  lang: Lang,
  key: keyof Dict,
  params?: Record<string, string | number>,
): string {
  const raw = dicts[lang][key]
  if (!params) return raw
  return raw.replace(/\{(\w+)\}/g, (whole, name) =>
    name in params ? String(params[name]) : whole,
  )
}

export function loadLang(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v && (SUPPORTED as string[]).includes(v) ? (v as Lang) : null
  } catch {
    return null
  }
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // private mode / quota — ignore (picker still works in-memory).
  }
}
