// Sport data layer (multi-sport handoff, Phase 1). A SportProfile drives
// three things per sport: the role-tag vocabulary, whether positions exist
// at all, and which result view renders the outcome. The balancer itself
// never changes — domain/layout.ts and domain/swap.ts already operate on
// counts; domain/balance.ts only branches on `positionsEnabled` (Task 4).

export type SportId = 'football' | 'basketball' | 'cricket' | 'generic'

export type ResultView = 'pitch' | 'court' | 'field' | 'scorecard' | 'list'

export interface SportProfile {
  id: SportId
  label: string
  badge: string
  /** role-tag vocabulary; [] means positionless. */
  positions: string[]
  positionsEnabled: boolean
  resultView: ResultView
  /** the one role a team can't function without, if any — drives
   *  domain/balance.ts's shortfall warning. 'GK' for football; absent for
   *  every other sport (no natural single-specialist bottleneck). */
  scarceRole?: string
}

export const DEFAULT_SPORT: SportId = 'football'

/** v1 registry: football, basketball, cricket, generic — all four sports
 *  from the design handoff. A link referencing a sport this build doesn't
 *  recognize (e.g. minted by a future build with a 5th sport) still decodes
 *  (see share/wire.ts) but resolves to the generic profile here (see
 *  getSportProfile). */
export const SPORT_PROFILES: Partial<Record<SportId, SportProfile>> = {
  football: {
    id: 'football',
    label: 'Football',
    badge: '5-a-side',
    positions: ['GK', 'DEF', 'MID', 'FWD'],
    positionsEnabled: true,
    resultView: 'pitch',
    scarceRole: 'GK',
  },
  basketball: {
    id: 'basketball',
    label: 'Basketball',
    badge: '3-on-3',
    positions: ['G', 'F', 'C'],
    positionsEnabled: true,
    resultView: 'court',
  },
  cricket: {
    id: 'cricket',
    label: 'Cricket',
    badge: '11-a-side',
    positions: ['BAT', 'ALL', 'BOWL', 'WK'],
    positionsEnabled: true,
    resultView: 'field',
  },
  generic: {
    id: 'generic',
    label: 'Other',
    badge: 'any size',
    positions: [],
    positionsEnabled: false,
    resultView: 'list',
  },
}

const GENERIC_PROFILE = SPORT_PROFILES.generic!

/** Resolve a sport id to its profile. Missing id -> football (old links,
 *  brief-equivalent default). An id not present in SPORT_PROFILES (e.g. a
 *  future sport this build has never heard of) falls back to the generic
 *  profile rather than throwing — forward-compat for links minted by a
 *  later build and opened in this one. */
export function getSportProfile(id: SportId | undefined): SportProfile {
  const resolved = id ?? DEFAULT_SPORT
  return SPORT_PROFILES[resolved] ?? GENERIC_PROFILE
}
