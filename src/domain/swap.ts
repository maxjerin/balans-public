// Manual swap of any two players (brief §7.3) — across teams or starter↔sub
// within a team. Pure & immutable. Starter roles are preserved per slot: when
// two players trade teams, each takes over the other's role on the team they
// join.
import type { SavedSetup } from './types'

function teamIndexOf(teams: string[][], id: string): number {
  return teams.findIndex((t) => t.includes(id))
}

export function swapPlayers(setup: SavedSetup, idA: string, idB: string): SavedSetup {
  if (idA === idB || !setup.teams) return setup

  const ta = teamIndexOf(setup.teams, idA)
  const tb = teamIndexOf(setup.teams, idB)
  if (ta === -1 || tb === -1) return setup

  const starters = setup.starters ?? setup.teams.map(() => [])

  if (ta === tb) {
    // Same team: just trade starter/sub membership.
    const set = new Set(starters[ta])
    const aStart = set.has(idA)
    const bStart = set.has(idB)
    if (aStart === bStart) return setup // both same role → nothing to do
    if (aStart) {
      set.delete(idA)
      set.add(idB)
    } else {
      set.delete(idB)
      set.add(idA)
    }
    const nextStarters = starters.map((s, i) => (i === ta ? [...set] : s))
    return { ...setup, starters: nextStarters }
  }

  // Cross-team: replace the id in each team's roster, and in that team's
  // starter list if it was a starter there.
  const swapIn = (arr: string[], from: string, to: string) =>
    arr.map((x) => (x === from ? to : x))

  const nextTeams = setup.teams.map((t, i) => {
    if (i === ta) return swapIn(t, idA, idB)
    if (i === tb) return swapIn(t, idB, idA)
    return t
  })
  const nextStarters = starters.map((s, i) => {
    if (i === ta) return swapIn(s, idA, idB)
    if (i === tb) return swapIn(s, idB, idA)
    return s
  })

  return { ...setup, teams: nextTeams, starters: nextStarters }
}
