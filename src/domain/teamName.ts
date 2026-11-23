// Display name for a team: a user-set name, else "Team N" (1-based).
import type { SavedSetup } from './types'

export function teamName(setup: SavedSetup, ti: number): string {
  const custom = setup.teamNames?.[ti]?.trim()
  return custom || `Team ${ti + 1}`
}
