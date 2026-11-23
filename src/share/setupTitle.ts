// Derive a display name for a setup. Priority: explicit title → default
// ("Team 1 vs Team 2 · 28 Jun 2026" — the matchup of team names + date) →
// caller fallback. Team names are resolved by the caller (they're localized).
import type { SavedSetup } from '../domain/types'

type TeamName = (i: number) => string

/** "Team 1 vs Team 2 · 28 Jun 2026" — team names joined by "vs" + date + year. */
export function defaultTitle(setup: SavedSetup, lang: string, teamName: TeamName): string {
  const matchup = (setup.teams ?? []).map((_, i) => teamName(i)).join(' vs ')
  let date = ''
  if (setup.createdAt) {
    try {
      date = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', year: 'numeric' }).format(
        new Date(setup.createdAt),
      )
    } catch {
      date = ''
    }
  }
  return [matchup, date].filter(Boolean).join(' · ')
}

/** Best display name: explicit title, else the matchup+date default, else fallback. */
export function setupTitle(setup: SavedSetup, lang: string, teamName: TeamName, fallback: string): string {
  return setup.title?.trim() || defaultTitle(setup, lang, teamName) || fallback
}
