// Team-count & size configuration (brief §7.1). Pure: given the headcount and
// the user's targets, compute a feasible distribution and a preview — BEFORE
// any players are assigned. Remainder handling is explicit and matches the
// brief's worked 28/6 example exactly. Warnings are language-free CODES (the UI
// formats them); the summary is derived from `teams` in the UI.
import type { Warning } from './types'

export interface TeamLayout {
  /** total players on the team */
  size: number
  /** on-field players (feeds formation derivation, §9) */
  field: number
  /** bench */
  subs: number
}

export interface LayoutResult {
  teams: TeamLayout[]
  feasible: boolean
  warnings: Warning[]
}

/**
 * @param total       available headcount
 * @param k           number of teams (>= 2)
 * @param fieldTarget desired on-field players per team
 * @param subsTarget  desired substitutes per team
 */
export function computeLayout(
  total: number,
  k: number,
  fieldTarget: number,
  subsTarget: number,
): LayoutResult {
  const warnings: Warning[] = []

  if (k < 2) {
    return { teams: [], feasible: false, warnings: [{ code: 'needTeams' }] }
  }
  if (total < k) {
    return { teams: [], feasible: false, warnings: [{ code: 'tooFewPlayers', total, k }] }
  }

  // Sizes: base = floor(total/k); the first `r` teams get one extra (brief §7.1).
  const base = Math.floor(total / k)
  const r = total % k
  const sizes = Array.from({ length: k }, (_, i) => base + (i < r ? 1 : 0))

  // Within each team: keep subs at target where possible (bench stays even),
  // letting the on-field count absorb the size difference. Always leave >=1
  // on field.
  const teams: TeamLayout[] = sizes.map((size) => {
    const subs = Math.min(subsTarget, size - 1)
    return { size, field: size - subs, subs }
  })

  // Flag uneven on-field counts plainly (brief §7.1: "state plainly that two
  // teams will be a player short on the field").
  const lowField = Math.min(...teams.map((t) => t.field))
  const highField = Math.max(...teams.map((t) => t.field))
  if (highField !== lowField) {
    warnings.push({
      code: 'unevenSides',
      highField,
      highCount: teams.filter((t) => t.field === highField).length,
      lowField,
      lowCount: teams.filter((t) => t.field === lowField).length,
    })
  }

  // Surplus-vs-target note: if the actual field counts exceed the requested
  // target, the headcount didn't divide as asked.
  if (teams.some((t) => t.field > fieldTarget)) {
    warnings.push({ code: 'fieldExceedsTarget', target: fieldTarget })
  }

  return { teams, feasible: true, warnings }
}
