// Fixed fielding-placement template for cricket (follow-up to Phase 3 —
// the design handoff's optional field board). Unlike football/basketball,
// placements aren't restricted by player eligibility (any player can field
// anywhere) — assignment is a direct 1:1 map onto a fixed ordered template,
// bowler and keeper always first (every over needs both). No scarcity
// matching, no off-position concept.
export type FieldPlacement =
  | 'BWL'
  | 'WK'
  | 'SLIP'
  | 'GULLY'
  | 'POINT'
  | 'COVER'
  | 'MID-OFF'
  | 'MID-ON'
  | 'SQ-LEG'
  | 'FINE-LEG'
  | 'THIRD-MAN'

/** Fixed order — a full XI's worth of placements. Illustrative, not
 *  geographically precise (same "reasonable v1 default" caveat as the
 *  football/basketball shape tables). */
export const FIELD_PLACEMENTS: FieldPlacement[] = [
  'BWL',
  'WK',
  'SLIP',
  'GULLY',
  'POINT',
  'COVER',
  'MID-OFF',
  'MID-ON',
  'SQ-LEG',
  'FINE-LEG',
  'THIRD-MAN',
]

export interface FieldSlot {
  placement: FieldPlacement
  playerId: string
}

/** Map starters, in order, onto the fixed template. Extra starters beyond
 *  the template length (a full XI) are simply left unplaced — not a real
 *  case in practice, but defensive rather than throwing. */
export function assignField(starterIds: string[]): FieldSlot[] {
  const n = Math.min(starterIds.length, FIELD_PLACEMENTS.length)
  return starterIds.slice(0, n).map((playerId, i) => ({ placement: FIELD_PLACEMENTS[i], playerId }))
}
