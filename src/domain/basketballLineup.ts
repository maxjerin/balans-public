// Per-team court lineup: the ordered slot occupants for the court (multi-
// sport Phase 2). Structurally parallel to domain/lineup.ts, targeting
// basketball's own shape/assignment (domain/basketball.ts) instead of
// football's — no style axis, so there's no styleFor equivalent here.
// Shares SavedSetup.lineup with football: a lineup array is just ordered ids
// regardless of sport, only the derivation differs.
import {
  assignCourt,
  deriveCourtShape,
  requiredCourtPositions,
  type BasketballShape,
  type CourtSlot,
} from './basketball'
import type { Player, SavedSetup } from './types'

// The starters of team `ti` as Player objects, in team order.
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
 *  the current starters, otherwise a freshly derived position-optimal order. */
export function courtLineupFor(setup: SavedSetup, ti: number): string[] {
  const starters = teamStarters(setup, ti)
  const stored = setup.lineup?.[ti]
  if (stored && sameSet(stored, starters.map((p) => p.id))) return stored
  const shape = deriveCourtShape(starters.length)
  return assignCourt(starters, shape).map((s) => s.playerId)
}

/** Swap two slot occupants on team `ti`'s court; persists every team's
 *  lineup so the manual arrangement is locked in. Immutable. */
export function swapCourtSlots(setup: SavedSetup, ti: number, i: number, j: number): SavedSetup {
  const lineup = (setup.teams ?? []).map((_, t) => [...courtLineupFor(setup, t)])
  const row = lineup[ti]
  if (row && i >= 0 && j >= 0 && i < row.length && j < row.length) {
    ;[row[i], row[j]] = [row[j], row[i]]
  }
  return { ...setup, lineup }
}

/** Build court slots from an ordered id list + shape, flagging off-position. */
export function courtLineupSlots(
  ids: string[],
  shape: BasketballShape,
  posOf: (id: string) => string[],
): CourtSlot[] {
  const positions = requiredCourtPositions(shape)
  return ids.map((playerId, i) => {
    const position = positions[i]
    return { position, playerId, offPosition: !posOf(playerId).includes(position) }
  })
}
