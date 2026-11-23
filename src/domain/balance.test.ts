import { describe, expect, it } from 'vitest'
import { generateTeams, pickStarters } from './balance'
import { computeLayout } from './layout'
import type { Player } from './types'

// Build n players; positions assigned by a per-index list (default: all-round).
const mkPlayers = (specs: Array<[string, string[]]>): Player[] =>
  specs.map(([n, p], i) => ({ id: `p${i}`, n, p }))

const allRound = (n: number): Player[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i}`, n: `P${i}`, p: ['GK', 'DEF', 'MID', 'FWD'] }))

describe('generateTeams — football defaults (no options arg)', () => {
  it('assigns every available player exactly once', () => {
    const players = allRound(10)
    const layout = computeLayout(10, 2, 4, 1)
    const { teams } = generateTeams(players, layout, 1)
    const assigned = teams.flatMap((t) => t.players).sort()
    expect(assigned).toEqual(players.map((p) => p.id).sort())
  })

  it('matches the layout sizes, field counts and bench', () => {
    const players = allRound(28)
    const layout = computeLayout(28, 6, 5, 1)
    const { teams } = generateTeams(players, layout, 7)
    expect(teams.map((t) => t.players.length)).toEqual(layout.teams.map((t) => t.size))
    teams.forEach((t, i) => {
      expect(t.starters.length).toBe(layout.teams[i].field)
      expect(t.starters.every((id) => t.players.includes(id))).toBe(true)
    })
  })

  it('spreads keepers: every team gets a GK-capable player when there are >= k of them', () => {
    const players = mkPlayers([
      ['gkA', ['GK']],
      ['gkB', ['GK']],
      ['gkC', ['GK', 'DEF']],
      ['gkD', ['GK', 'MID']],
      ['out1', ['DEF', 'MID', 'FWD']],
      ['out2', ['DEF', 'MID', 'FWD']],
      ['out3', ['DEF', 'MID', 'FWD']],
      ['out4', ['DEF', 'MID', 'FWD']],
    ])
    const layout = computeLayout(8, 2, 3, 1)
    const { teams } = generateTeams(players, layout, 3)
    teams.forEach((t) => {
      const hasKeeper = t.players.some((id) => players.find((p) => p.id === id)!.p.includes('GK'))
      expect(hasKeeper).toBe(true)
    })
  })

  it('warns when there are fewer keepers than teams', () => {
    const players = mkPlayers([
      ['gkA', ['GK']],
      ['out1', ['DEF', 'MID', 'FWD']],
      ['out2', ['DEF', 'MID', 'FWD']],
      ['out3', ['DEF', 'MID', 'FWD']],
    ])
    const layout = computeLayout(4, 2, 1, 1)
    const { warnings } = generateTeams(players, layout, 1)
    expect(warnings).toContainEqual({ code: 'keeperShortfall', keepers: 1, k: 2 })
  })

  it('is deterministic for a given seed', () => {
    const players = allRound(14)
    const layout = computeLayout(14, 3, 4, 0)
    const a = generateTeams(players, layout, 42)
    const b = generateTeams(players, layout, 42)
    expect(a.teams).toEqual(b.teams)
  })

  it('different seeds can produce different splits (re-shuffle)', () => {
    const players = allRound(16)
    const layout = computeLayout(16, 4, 4, 0)
    const a = generateTeams(players, layout, 1)
    const b = generateTeams(players, layout, 2)
    expect(JSON.stringify(a.teams)).not.toBe(JSON.stringify(b.teams))
  })
})

describe('generateTeams — no scarce role (generic sport)', () => {
  it('splits evenly by size with zero position data and no keeperShortfall warning', () => {
    const players = Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, n: `P${i}`, p: [] as string[] }))
    const layout = computeLayout(8, 2, 4, 0)
    const { teams, warnings } = generateTeams(players, layout, 1, { positions: [] })
    expect(teams.map((t) => t.players.length)).toEqual([4, 4])
    expect(teams.flatMap((t) => t.players).sort()).toEqual(players.map((p) => p.id).sort())
    expect(warnings.some((w) => w.code === 'keeperShortfall')).toBe(false)
  })

  it('never warns regardless of role distribution when scarceRole is undefined (the bug this task fixes)', () => {
    // Every player shares one role ('G') — if this were mistakenly treated as
    // a scarce role the way football's GK is, it would still pass (there's
    // one G-capable player per team here); the real assertion is that NO
    // warning fires even for a heavily skewed distribution, because no
    // scarceRole was supplied at all.
    const players = mkPlayers([
      ['a', ['G']],
      ['b', ['F']],
      ['c', ['F']],
      ['d', ['F']],
    ])
    const layout = computeLayout(4, 2, 2, 0)
    const { warnings } = generateTeams(players, layout, 1, { positions: ['G', 'F'] })
    expect(warnings.some((w) => w.code === 'keeperShortfall')).toBe(false)
  })
})

describe('generateTeams — skill balancing', () => {
  // 8 all-round players, skills skewed: four 5s and four 1s.
  const skewed = (): Player[] =>
    Array.from({ length: 8 }, (_, i) => ({
      id: `p${i}`,
      n: `P${i}`,
      p: ['GK', 'DEF', 'MID', 'FWD'],
      s: i < 4 ? 5 : 1,
    }))

  const teamSkill = (players: Player[], ids: string[]) =>
    ids.reduce((sum, id) => sum + (players.find((p) => p.id === id)!.s ?? 3), 0)

  const spread = (players: Player[], teams: { players: string[] }[]) => {
    const totals = teams.map((t) => teamSkill(players, t.players))
    return Math.max(...totals) - Math.min(...totals)
  }

  it('brings team skill totals closer than positional-only across seeds', () => {
    // All-round players → positional cost is 0 for every split, so positional-
    // only balancing is blind to skill and lands wherever the shuffle drops it
    // (nonzero spread on many seeds). Skill balancing must reach the perfect
    // split (four 5s + four 1s → 12 each → spread 0) on EVERY seed.
    const players = skewed()
    const layout = computeLayout(8, 2, 4, 0)
    const opts = { positions: ['GK', 'DEF', 'MID', 'FWD'], scarceRole: 'GK' }

    let positionalHadImbalance = false
    for (let seed = 1; seed <= 25; seed++) {
      const withSkill = generateTeams(players, layout, seed, { ...opts, balanceSkill: true })
      const without = generateTeams(players, layout, seed, { ...opts, balanceSkill: false })
      // skill balancing is never worse, and always reaches the perfect split
      expect(spread(players, withSkill.teams)).toBeLessThanOrEqual(spread(players, without.teams))
      expect(spread(players, withSkill.teams)).toBe(0)
      if (spread(players, without.teams) > 0) positionalHadImbalance = true
    }
    // sanity: positional-only really is blind to skill (some seeds imbalanced),
    // so the assertions above genuinely exercise the skill term.
    expect(positionalHadImbalance).toBe(true)
  })

  it('is a no-op when every player has equal skill', () => {
    const players = allRound(8).map((p) => ({ ...p, s: 3 }))
    const layout = computeLayout(8, 2, 4, 0)
    const a = generateTeams(players, layout, 42, { positions: ['GK', 'DEF', 'MID', 'FWD'], scarceRole: 'GK', balanceSkill: true })
    const b = generateTeams(players, layout, 42, { positions: ['GK', 'DEF', 'MID', 'FWD'], scarceRole: 'GK', balanceSkill: false })
    expect(a.teams.map((t) => t.players.sort())).toEqual(b.teams.map((t) => t.players.sort()))
  })
})

describe('pickStarters — position priority', () => {
  it('starts the player whose primary matches the position being filled', () => {
    const team: Player[] = [
      { id: 'x', n: 'X', p: ['MID', 'DEF'] },
      { id: 'y', n: 'Y', p: ['DEF', 'MID'] },
    ]
    // 1 starter, DEF slot filled first; Y prioritises DEF → Y starts.
    expect(pickStarters(team, 1, ['DEF', 'MID'])).toEqual(['y'])
  })
})
