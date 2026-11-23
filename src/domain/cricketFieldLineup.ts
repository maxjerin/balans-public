// Per-team fielding lineup: the ordered slot occupants for the field board
// (follow-up to Phase 3). Fielding placements aren't eligibility-restricted
// — any player can field anywhere — so unlike domain/lineup.ts /
// domain/basketballLineup.ts there's no shape/assignment derivation beyond
// the fixed FIELD_PLACEMENTS template: the default order is just the
// starters in batting order. Shares SavedSetup.lineup with football/
// basketball — a lineup array is just ordered ids regardless of sport.
import { assignField, type FieldSlot } from './cricketField'
import type { Player, SavedSetup } from './types'

function teamStarters(setup: SavedSetup, ti: number): Player[] {
  const ids = new Set(setup.starters?.[ti] ?? [])
  const team = setup.teams?.[ti] ?? []
  return team
    .filter((id) => ids.has(id))
    .map((id) => setup.players.find((p) => p.id === id))
    .filter((p): p is Player => !!p)
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const s = new Set(a)
  return b.every((x) => s.has(x))
}

/** Ordered slot occupants for team `ti`: stored lineup if it still matches
 *  the current starters, otherwise batting order (the default fielding
 *  order — no position-optimal derivation needed, since placements aren't
 *  eligibility-restricted). */
export function fieldLineupFor(setup: SavedSetup, ti: number): string[] {
  const starters = teamStarters(setup, ti)
  const stored = setup.lineup?.[ti]
  if (stored && sameSet(stored, starters.map((p) => p.id))) return stored
  return starters.map((p) => p.id)
}

/** Swap two slot occupants on team `ti`'s field; persists every team's
 *  lineup so the manual arrangement is locked in. Immutable. */
export function swapFieldSlots(setup: SavedSetup, ti: number, i: number, j: number): SavedSetup {
  const lineup = (setup.teams ?? []).map((_, t) => [...fieldLineupFor(setup, t)])
  const row = lineup[ti]
  if (row && i >= 0 && j >= 0 && i < row.length && j < row.length) {
    ;[row[i], row[j]] = [row[j], row[i]]
  }
  return { ...setup, lineup }
}

/** Build field slots from an ordered id list (batting order or manually
 *  rearranged) — direct 1:1 mapping onto FIELD_PLACEMENTS, no eligibility. */
export function fieldSlotsFor(ids: string[]): FieldSlot[] {
  return assignField(ids)
}
