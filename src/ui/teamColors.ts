// Preset team jersey colours. Index 0 = the default token look (white fill,
// dark-green ink) so setups with no colour chosen render exactly as before.
// `ink` is the readable label/name colour on that fill. Hand-picked for
// contrast on the green pitch in both light and dark themes.
import type { SavedSetup } from '../domain/types'

export interface TeamColor {
  fill: string
  ink: string
}

export const PALETTE: TeamColor[] = [
  { fill: '#ffffff', ink: '#0b3d1f' }, // 0 default
  { fill: '#dc2626', ink: '#ffffff' }, // red
  { fill: '#2563eb', ink: '#ffffff' }, // blue
  { fill: '#ea580c', ink: '#ffffff' }, // orange
  { fill: '#0d9488', ink: '#ffffff' }, // teal
  { fill: '#7c3aed', ink: '#ffffff' }, // purple
  { fill: '#1f2937', ink: '#ffffff' }, // charcoal
  { fill: '#db2777', ink: '#ffffff' }, // pink
]

// Per-team default palette indices (used when a team has no explicit colour):
// team 1 → red, team 2 → blue, then the rest of the palette, cycling. Index 0
// (the neutral white token) is intentionally not a default — teams read as
// distinct sides out of the box.
export const DEFAULT_INDICES = [1, 2, 4, 3, 5, 7, 6]

/** Default palette index for team `ti` when it has no explicit colour. */
export function defaultColorIndex(ti: number): number {
  return DEFAULT_INDICES[ti % DEFAULT_INDICES.length]
}

/** Effective colour index for a team: its chosen index, else the per-team default. */
export function colorIndex(setup: SavedSetup, ti: number): number {
  return setup.teamColors?.[ti] ?? defaultColorIndex(ti)
}

/** Effective colour for a team: its chosen index, else the per-team default. */
export function teamColor(setup: SavedSetup, ti: number): TeamColor {
  return PALETTE[colorIndex(setup, ti)] ?? PALETTE[0]
}
