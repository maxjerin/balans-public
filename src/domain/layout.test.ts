import { describe, expect, it } from 'vitest'
import { computeLayout } from './layout'

describe('computeLayout', () => {
  it('even case: 24 players, k=4, field 5 + subs 1 → four teams of 6', () => {
    const r = computeLayout(24, 4, 5, 1)
    expect(r.feasible).toBe(true)
    expect(r.teams).toEqual([
      { size: 6, field: 5, subs: 1 },
      { size: 6, field: 5, subs: 1 },
      { size: 6, field: 5, subs: 1 },
      { size: 6, field: 5, subs: 1 },
    ])
  })

  it('uneven case from the brief: 28 players, k=6, 1 sub each', () => {
    const r = computeLayout(28, 6, 5, 1)
    expect(r.feasible).toBe(true)
    expect(r.teams.map((t) => t.size)).toEqual([5, 5, 5, 5, 4, 4])
    expect(r.teams.map((t) => t.field)).toEqual([4, 4, 4, 4, 3, 3])
    expect(r.teams.map((t) => t.subs)).toEqual([1, 1, 1, 1, 1, 1])
    // must flag that two teams field a player short (lowField 3, highField 4)
    expect(r.warnings).toContainEqual({
      code: 'unevenSides',
      highField: 4,
      highCount: 4,
      lowField: 3,
      lowCount: 2,
    })
  })

  it('distributes the remainder onto the larger teams (base+1 first)', () => {
    const r = computeLayout(10, 3, 3, 0)
    expect(r.teams.map((t) => t.size)).toEqual([4, 3, 3])
  })

  it('keeps subs at target and lets the field absorb the size difference', () => {
    const r = computeLayout(10, 2, 3, 2)
    expect(r.teams).toEqual([
      { size: 5, field: 3, subs: 2 },
      { size: 5, field: 3, subs: 2 },
    ])
  })

  it('clamps subs so every team keeps at least one on-field player', () => {
    const r = computeLayout(4, 2, 1, 5)
    expect(r.teams).toEqual([
      { size: 2, field: 1, subs: 1 },
      { size: 2, field: 1, subs: 1 },
    ])
  })

  it('infeasible when fewer players than teams', () => {
    const r = computeLayout(3, 4, 5, 0)
    expect(r.feasible).toBe(false)
    expect(r.warnings).toEqual([{ code: 'tooFewPlayers', total: 3, k: 4 }])
  })

  it('flags too few teams', () => {
    const r = computeLayout(4, 1, 4, 0)
    expect(r.feasible).toBe(false)
    expect(r.warnings).toEqual([{ code: 'needTeams' }])
  })

  it('infeasible when k < 2', () => {
    expect(computeLayout(10, 1, 5, 0).feasible).toBe(false)
  })
})
