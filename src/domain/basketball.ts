// Fixed shape-per-size + position assignment for basketball (multi-sport
// Phase 2). Unlike football, there's no style axis — one shape per team
// size — and no scarce role (see domain/sport.ts SportProfile.scarceRole).
import type { Player } from './types'

/** Basketball's own position vocabulary. This module (and ui/Court.tsx,
 *  ui/MatchCourt.tsx) is only ever reached when the active sport's
 *  resultView is 'court' — i.e. basketball only. */
export type BasketballPosition = 'G' | 'F' | 'C'

export interface BasketballShape {
  g: number
  f: number
  c: number
  /** e.g. "2-2-1" */
  label: string
}

// Field count → [G, F, C]. Index by field (1..10). No style axis.
const TABLE: Array<[number, number, number]> = [
  [1, 0, 0], // 1
  [1, 1, 0], // 2
  [1, 1, 1], // 3
  [2, 1, 1], // 4
  [2, 2, 1], // 5
  [2, 2, 2], // 6
  [3, 2, 2], // 7
  [3, 3, 2], // 8
  [3, 3, 3], // 9
  [4, 3, 3], // 10
]

// Proportional fallback for field counts beyond the table (rare in rec).
// Roughly equal thirds, remainder to G (ball-handler emphasis).
function derive(field: number): [number, number, number] {
  const f = Math.max(1, Math.round(field / 3))
  const c = Math.max(1, Math.round(field / 3))
  const g = Math.max(1, field - f - c)
  return [g, f, c]
}

export function deriveCourtShape(field: number): BasketballShape {
  if (field <= 0) return { g: 0, f: 0, c: 0, label: '0-0-0' }
  const [g, f, c] = field <= 10 ? TABLE[field - 1] : derive(field)
  return { g, f, c, label: `${g}-${f}-${c}` }
}

export interface CourtSlot {
  position: BasketballPosition
  playerId: string
  /** true when the player isn't actually eligible for this position */
  offPosition: boolean
}

// Expand a shape into an ordered list of required positions (G…, F…, C…).
export function requiredCourtPositions(shape: BasketballShape): BasketballPosition[] {
  const out: BasketballPosition[] = []
  for (let i = 0; i < shape.g; i++) out.push('G')
  for (let i = 0; i < shape.f; i++) out.push('F')
  for (let i = 0; i < shape.c; i++) out.push('C')
  return out
}

/**
 * Slot a team's starters onto the court, honouring each player's eligible
 * positions. Same greedy-by-scarcity two-pass algorithm as
 * domain/formation.ts's assignFormation (proven logic, ported to G/F/C):
 *   1. Repeatedly fill the still-unfilled position with the FEWEST eligible
 *      remaining players (≥1), most specialised available player first.
 *   2. Any positions left with no eligible player are filled off-position.
 */
export function assignCourt(starters: Player[], shape: BasketballShape): CourtSlot[] {
  const positions = requiredCourtPositions(shape)
  const remaining = new Map(starters.map((p) => [p.id, p]))
  const pending = positions.map((pos) => ({ pos, slot: undefined as CourtSlot | undefined }))

  const eligibleFor = (pos: BasketballPosition) =>
    [...remaining.values()]
      .filter((p) => p.p.includes(pos))
      // higher priority for this position first, then most specialised
      .sort((a, b) => a.p.indexOf(pos) - b.p.indexOf(pos) || a.p.length - b.p.length)

  for (;;) {
    let best: { entry: (typeof pending)[number]; cands: Player[] } | undefined
    for (const entry of pending) {
      if (entry.slot) continue
      const cands = eligibleFor(entry.pos)
      if (cands.length === 0) continue
      if (!best || cands.length < best.cands.length) best = { entry, cands }
    }
    if (!best) break
    const pick = best.cands[0]
    remaining.delete(pick.id)
    best.entry.slot = { position: best.entry.pos, playerId: pick.id, offPosition: false }
  }

  for (const entry of pending) {
    if (entry.slot) continue
    const any = remaining.values().next().value as Player | undefined
    if (!any) continue
    remaining.delete(any.id)
    entry.slot = { position: entry.pos, playerId: any.id, offPosition: true }
  }

  return pending.map((e) => e.slot).filter((s): s is CourtSlot => s !== undefined)
}
