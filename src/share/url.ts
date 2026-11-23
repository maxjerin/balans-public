// URL-fragment codec (brief §8). State travels in `location.hash` so it is
// NEVER sent to the server — that is the core privacy guarantee.
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { type SavedSetup } from '../domain/types'
import { toWire, fromWire } from './wire'

/** Serialize → compress → encoded URI component (no leading '#').
 *  Encodes the compact v2 wire form (index refs + short keys) for a shorter link. */
export function encodeSetup(setup: SavedSetup): string {
  return compressToEncodedURIComponent(JSON.stringify(toWire(setup)))
}

/**
 * Decode a fragment back into a SavedSetup. Returns null on corrupt/empty
 * input so callers can fall back to a clean start (brief §8). Handles both the
 * v2 compact wire form and legacy v1 links (full SavedSetup JSON).
 */
export function decodeSetup(fragment: string): SavedSetup | null {
  const raw = fragment.startsWith('#') ? fragment.slice(1) : fragment
  if (!raw) return null
  try {
    const json = decompressFromEncodedURIComponent(raw)
    if (!json) return null
    const parsed = JSON.parse(json) as { v?: unknown }
    if (typeof parsed !== 'object' || parsed === null) return null
    if (typeof parsed.v !== 'number') return null
    // v2+ = compact wire form; v1 = legacy full SavedSetup (still valid as-is).
    if (parsed.v >= 2) return fromWire(parsed as Parameters<typeof fromWire>[0])
    return parsed as SavedSetup
  } catch {
    return null
  }
}

/** Read & decode the current location hash, if any. */
export function readSetupFromLocation(): SavedSetup | null {
  return decodeSetup(window.location.hash)
}

/**
 * Write the setup into the hash without spamming history (brief §8 —
 * uses replaceState).
 */
export function writeSetupToLocation(setup: SavedSetup): void {
  const encoded = encodeSetup(setup)
  history.replaceState(null, '', `#${encoded}`)
}
