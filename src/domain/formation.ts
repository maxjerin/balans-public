// Style → formation derivation + position assignment (brief §9). The user picks
// a STYLE and the app derives the shape from style + on-field count — a teaching
// aid, so casual players see what defensive/balanced/attacking looks like.
//
// Shape tables are keyed by OUTFIELD count (= field − 1 keeper) and are
// illustrative defaults — confirm the exact shapes with the owner (§19.3).
// Formation labels follow football convention DEF-MID-FWD with the GK implied.
import type { Player, Style } from './types'

/** Football's own position vocabulary. This module (and ui/Pitch.tsx,
 *  ui/MatchPitch.tsx) is only ever reached when the active sport's
 *  resultView is 'pitch' — i.e. football only — so it hardcodes these four
 *  roles rather than reading them from SportProfile. */
export type FootballPosition = 'GK' | 'DEF' | 'MID' | 'FWD'

export interface Shape {
  gk: number // 0 or 1
  def: number
  mid: number
  fwd: number
  /** e.g. "1-2-1" (GK implied) */
  label: string
}

// Outfield count → [DEF, MID, FWD] per style. Index by outfield (1..10).
const TABLE: Record<Style, Array<[number, number, number]>> = {
  // defensive: load the back, keep at least one forward from 3 outfield up
  def: [
    [1, 0, 0], // 1
    [1, 1, 0], // 2
    [2, 1, 0], // 3
    [2, 1, 1], // 4
    [3, 1, 1], // 5
    [3, 2, 1], // 6
    [4, 2, 1], // 7
    [4, 3, 1], // 8
    [4, 3, 2], // 9
    [5, 3, 2], // 10
  ],
  // balanced: even shape
  bal: [
    [0, 1, 0], // 1
    [1, 1, 0], // 2
    [1, 1, 1], // 3
    [1, 2, 1], // 4
    [2, 2, 1], // 5
    [2, 2, 2], // 6
    [2, 3, 2], // 7
    [3, 3, 2], // 8
    [3, 4, 2], // 9
    [4, 3, 3], // 10
  ],
  // attacking: load the front, keep at least one defender from 3 outfield up
  att: [
    [0, 0, 1], // 1
    [0, 1, 1], // 2
    [1, 1, 1], // 3
    [1, 1, 2], // 4
    [1, 2, 2], // 5
    [1, 2, 3], // 6
    [2, 2, 3], // 7
    [2, 3, 3], // 8
    [2, 3, 4], // 9
    [3, 3, 4], // 10
  ],
}

// Proportional fallback for outfield counts beyond the table (rare in rec).
function derive(outfield: number, style: Style): [number, number, number] {
  const shares: Record<Style, [number, number, number]> = {
    def: [0.45, 0.35, 0.2],
    bal: [0.34, 0.33, 0.33],
    att: [0.2, 0.35, 0.45],
  }
  const [sd, , sf] = shares[style]
  const def = Math.max(1, Math.round(outfield * sd))
  let fwd = Math.max(1, Math.round(outfield * sf))
  if (def + fwd > outfield) fwd = outfield - def
  const mid = outfield - def - fwd
  return [def, mid, Math.max(0, fwd)]
}

export function deriveShape(field: number, style: Style): Shape {
  const gk = field >= 1 ? 1 : 0
  const outfield = Math.max(0, field - gk)
  if (outfield === 0) return { gk, def: 0, mid: 0, fwd: 0, label: '0-0-0' }
  const [def, mid, fwd] =
    outfield <= 10 ? TABLE[style][outfield - 1] : derive(outfield, style)
  return { gk, def, mid, fwd, label: `${def}-${mid}-${fwd}` }
}

export interface Slot {
  position: FootballPosition
  playerId: string
  /** true when the player isn't actually eligible for this position */
  offPosition: boolean
}

// Expand a shape into an ordered list of required positions (GK, DEF…, MID…, FWD…).
export function requiredPositions(shape: Shape): FootballPosition[] {
  const out: FootballPosition[] = []
  for (let i = 0; i < shape.gk; i++) out.push('GK')
  for (let i = 0; i < shape.def; i++) out.push('DEF')
  for (let i = 0; i < shape.mid; i++) out.push('MID')
  for (let i = 0; i < shape.fwd; i++) out.push('FWD')
  return out
}

/**
 * Slot a team's starters into a formation, honouring each player's eligible
 * positions. Greedy by scarcity, in two passes:
 *   1. Repeatedly fill the still-unfilled position with the FEWEST eligible
 *      remaining players (≥1), choosing the most specialised available player.
 *      Recomputed each step, so taking a player never strands a position that
 *      only that player could fill.
 *   2. Any positions left with no eligible player are filled off-position
 *      (flagged) from whoever remains.
 *
 * The two passes matter: a position nobody can play (e.g. a MID slot on a team
 * with only a keeper and a defender) must not grab a leftover before the slots
 * that DO have an eligible player are satisfied — otherwise it could steal the
 * keeper out of goal.
 */
export function assignFormation(starters: Player[], shape: Shape): Slot[] {
  const positions = requiredPositions(shape)
  const remaining = new Map(starters.map((p) => [p.id, p]))
  // One pending entry per required slot, in formation order; resolved in place.
  const pending = positions.map((pos) => ({ pos, slot: undefined as Slot | undefined }))

  const eligibleFor = (pos: FootballPosition) =>
    [...remaining.values()]
      .filter((p) => p.p.includes(pos))
      // players who rank this position higher (primary before secondary) first,
      // then the most specialised (fewest options)
      .sort((a, b) => a.p.indexOf(pos) - b.p.indexOf(pos) || a.p.length - b.p.length)

  // Pass 1: fill slots that have an eligible player, scarcest position first.
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

  // Pass 2: fill the leftover (unfillable) slots off-position.
  for (const entry of pending) {
    if (entry.slot) continue
    const any = remaining.values().next().value as Player | undefined
    if (!any) continue
    remaining.delete(any.id)
    entry.slot = { position: entry.pos, playerId: any.id, offPosition: true }
  }

  return pending.map((e) => e.slot).filter((s): s is Slot => s !== undefined)
}
