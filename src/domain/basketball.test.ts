import { describe, expect, it } from 'vitest'
import { deriveCourtShape, assignCourt, type BasketballPosition } from './basketball'
import type { Player } from './types'

const mk = (specs: Array<[string, string[]]>): Player[] =>
  specs.map(([n, p], i) => ({ id: `p${i}`, n, p }))

describe('deriveCourtShape', () => {
  it('3-on-3 is 1-1-1', () => {
    expect(deriveCourtShape(3)).toMatchObject({ g: 1, f: 1, c: 1, label: '1-1-1' })
  })

  it('5-a-side is 2-2-1', () => {
    expect(deriveCourtShape(5)).toMatchObject({ g: 2, f: 2, c: 1, label: '2-2-1' })
  })

  it('lines sum to the field count for every table entry', () => {
    for (let field = 1; field <= 10; field++) {
      const s = deriveCourtShape(field)
      expect(s.g + s.f + s.c).toBe(field)
    }
  })

  it('a one-player team is a lone guard', () => {
    expect(deriveCourtShape(1)).toMatchObject({ g: 1, f: 0, c: 0 })
  })

  it('a zero-player team is empty', () => {
    expect(deriveCourtShape(0)).toMatchObject({ g: 0, f: 0, c: 0, label: '0-0-0' })
  })
})

describe('assignCourt', () => {
  it('puts a specialist guard in the G slot', () => {
    const players = mk([
      ['guard', ['G']],
      ['fwd', ['F']],
      ['center', ['C']],
    ])
    const slots = assignCourt(players, deriveCourtShape(3))
    const g = slots.find((s) => s.position === 'G')!
    expect(players.find((p) => p.id === g.playerId)!.n).toBe('guard')
  })

  it('produces exactly `field` slots, one player each, no repeats', () => {
    const players = mk([
      ['a', ['G', 'F', 'C']],
      ['b', ['G', 'F', 'C']],
      ['c', ['G', 'F', 'C']],
    ])
    const slots = assignCourt(players, deriveCourtShape(3))
    expect(slots).toHaveLength(3)
    expect(new Set(slots.map((s) => s.playerId)).size).toBe(3)
  })

  it('never strands a sole specialist when an unfillable slot competes', () => {
    // field=4 → 2-1-1. Nobody can play C, so that slot is unfillable. It
    // must not poach the lone G/F specialists.
    const players = mk([
      ['g1', ['G']],
      ['g2', ['G']],
      ['fwd', ['F']],
      ['util', ['G', 'F']],
    ])
    const slots = assignCourt(players, deriveCourtShape(4))
    const at = (pos: BasketballPosition) =>
      players.find((p) => p.id === slots.find((s) => s.position === pos)!.playerId)!.n
    expect(slots.filter((s) => s.position === 'G')).toHaveLength(2)
    expect(slots.find((s) => s.position === 'F')!.offPosition).toBe(false)
    expect(at('F')).toBe('fwd')
    expect(slots.find((s) => s.position === 'C')!.offPosition).toBe(true)
  })

  it('flags an off-position slot when no eligible player is left', () => {
    const players = mk([
      ['g', ['G']],
      ['f1', ['F']],
      ['f2', ['F']],
    ])
    const slots = assignCourt(players, deriveCourtShape(3)) // 1-1-1 needs 1 C
    expect(slots.some((s) => s.offPosition)).toBe(true)
    expect(slots).toHaveLength(3)
  })
})
