// Convenience persistence of the *last* setup in localStorage (brief §6 / §94 —
// local-only, allowed). The URL fragment is still the canonical share mechanism;
// this just means a refresh or a fresh tab keeps your work while testing/using.
// Reuses the same lz-string codec as the URL so there is one payload format.
import { encodeSetup, decodeSetup } from './url'
import type { SavedSetup } from '../domain/types'

const STORAGE_KEY = 'evensides:last'

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

export function saveLocal(setup: SavedSetup): void {
  const s = storage()
  if (!s) return
  try {
    s.setItem(STORAGE_KEY, encodeSetup(setup))
  } catch {
    // quota / private-mode — ignore, it's only a convenience cache.
  }
}

export function loadLocal(): SavedSetup | null {
  const s = storage()
  if (!s) return null
  const raw = s.getItem(STORAGE_KEY)
  return raw ? decodeSetup(raw) : null
}

export function clearLocal(): void {
  storage()?.removeItem(STORAGE_KEY)
}
