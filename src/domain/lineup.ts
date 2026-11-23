// Per-team formation lineup: the ordered slot occupants for the pitch (brief
// §9 manual repositioning — "swap within shape"). The order maps 1:1 to the
// derived shape's slots. Without a stored lineup we derive a position-optimal
// one; manual pitch swaps persist an explicit lineup that survives re-render.
import {
  assignFormation,
  deriveShape,
  requiredPositions,
  type Shape,
  type Slot,
} from './formation'
import type { Player, SavedSetup, Style } from './types'

/** Effective style for a team: its override, else the global default. */
export function styleFor(setup: SavedSetup, ti: number): Style {
  return setup.styles?.[ti] ?? setup.style ?? 'bal'
}

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

/** Ordered slot occupants for team `ti`: stored lineup if it still matches the
 *  current starters, otherwise a freshly derived position-optimal order. */
export function lineupFor(setup: SavedSetup, ti: number): string[] {
  const starters = teamStarters(setup, ti)
  const stored = setup.lineup?.[ti]
  if (stored && sameSet(stored, starters.map((p) => p.id))) return stored
  const shape = deriveShape(starters.length, styleFor(setup, ti))
  return assignFormation(starters, shape).map((s) => s.playerId)
}

/** Swap two slot occupants on team `ti`'s pitch; persists every team's lineup
 *  so the manual arrangement is locked in. Immutable. */
export function swapSlots(setup: SavedSetup, ti: number, i: number, j: number): SavedSetup {
  const lineup = (setup.teams ?? []).map((_, t) => [...lineupFor(setup, t)])
  const row = lineup[ti]
  if (row && i >= 0 && j >= 0 && i < row.length && j < row.length) {
    ;[row[i], row[j]] = [row[j], row[i]]
  }
  return { ...setup, lineup }
}

/** Build pitch slots from an ordered id list + shape, flagging off-position. */
export function lineupSlots(
  ids: string[],
  shape: Shape,
  posOf: (id: string) => string[],
): Slot[] {
  const positions = requiredPositions(shape)
  return ids.map((playerId, i) => {
    const position = positions[i]
    return { position, playerId, offPosition: !posOf(playerId).includes(position) }
  })
}
