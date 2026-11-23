// Last-used sport, cached locally so a returning visitor skips the picker —
// same pattern as evensides:lang/:theme. Local-only: never part of
// SavedSetup or the URL as a *viewer* preference (the sport OF a setup
// travels in the link itself, via the `sp` wire key — see share/wire.ts).
import type { SportId } from '../domain/sport'

const STORAGE_KEY = 'evensides:sport'
const KNOWN: SportId[] = ['football', 'basketball', 'cricket', 'generic']

export function loadSportPref(): SportId | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v && (KNOWN as string[]).includes(v) ? (v as SportId) : null
  } catch {
    return null
  }
}

export function saveSportPref(id: SportId): void {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // private mode / quota — ignore, it's only a convenience cache.
  }
}
