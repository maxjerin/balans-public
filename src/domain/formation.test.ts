import { describe, expect, it } from 'vitest'
import { deriveShape, assignFormation, type FootballPosition } from './formation'
import type { Player } from './types'

const mk = (specs: Array<[string, string[]]>): Player[] =>
  specs.map(([n, p], i) => ({ id: `p${i}`, n, p }))

describe('deriveShape', () => {
  it('5-a-side balanced is 1-2-1 (brief §5 example)', () => {
    expect(deriveShape(5, 'bal')).toMatchObject({ gk: 1, def: 1, mid: 2, fwd: 1, label: '1-2-1' })
  })

  it('5-a-side shifts with style', () => {
    expect(deriveShape(5, 'def').label).toBe('2-1-1')
    expect(deriveShape(5, 'att').label).toBe('1-1-2')
  })

  it('11-a-side shapes', () => {
    expect(deriveShape(11, 'bal').label).toBe('4-3-3')
    expect(deriveShape(11, 'def').label).toBe('5-3-2')
    expect(deriveShape(11, 'att').label).toBe('3-3-4')
  })

  it('always keeps one keeper and the lines sum to the outfield count', () => {
    for (const field of [4, 6, 7, 8, 9]) {
      for (const style of ['def', 'bal', 'att'] as const) {
        const s = deriveShape(field, style)
        expect(s.gk).toBe(1)
        expect(s.def + s.mid + s.fwd).toBe(field - 1)
      }
    }
  })

  it('a one-player team is keeper-only', () => {
    expect(deriveShape(1, 'bal')).toMatchObject({ gk: 1, def: 0, mid: 0, fwd: 0 })
  })
})

describe('assignFormation', () => {
  it('puts a specialist keeper in goal', () => {
    const players = mk([
      ['keeper', ['GK']],
      ['d', ['DEF']],
      ['m', ['MID']],
      ['f', ['FWD']],
      ['x', ['DEF', 'MID', 'FWD']],
    ])
    const slots = assignFormation(players, deriveShape(5, 'bal'))
    const gk = slots.find((s) => s.position === 'GK')!
    expect(players.find((p) => p.id === gk.playerId)!.n).toBe('keeper')
  })

  it('produces exactly `field` slots, one player each, no repeats', () => {
    const players = mk([
      ['a', ['GK', 'DEF', 'MID', 'FWD']],
      ['b', ['GK', 'DEF', 'MID', 'FWD']],
      ['c', ['GK', 'DEF', 'MID', 'FWD']],
      ['d', ['GK', 'DEF', 'MID', 'FWD']],
      ['e', ['GK', 'DEF', 'MID', 'FWD']],
    ])
    const slots = assignFormation(players, deriveShape(5, 'bal'))
    expect(slots).toHaveLength(5)
    expect(new Set(slots.map((s) => s.playerId)).size).toBe(5)
  })

  it('keeps the real keeper in goal even when an unfillable slot sorts first', () => {
    // 2-player team: a GK and a DEF. Balanced size-2 shape is GK + MID, so the
    // MID slot has zero eligible players. It must NOT steal the keeper: the GK
    // belongs in goal, the defender plays MID off-position.
    const players = mk([
      ['keeper', ['GK']],
      ['def', ['DEF']],
    ])
    const slots = assignFormation(players, deriveShape(2, 'bal'))
    const gk = slots.find((s) => s.position === 'GK')!
    expect(players.find((p) => p.id === gk.playerId)!.n).toBe('keeper')
    expect(gk.offPosition).toBe(false)
    const mid = slots.find((s) => s.position === 'MID')!
    expect(players.find((p) => p.id === mid.playerId)!.n).toBe('def')
    expect(mid.offPosition).toBe(true)
  })

  it('never strands a sole specialist when an unfillable slot competes', () => {
    // attacking size-5 = 1-1-2 (1 DEF, 1 MID, 2 FWD). Nobody can play FWD, so
    // two slots are unfillable. They must not poach the lone GK/DEF/MID
    // specialists — each specialist lands on their own position, the utility
    // players take the FWD slots off-position.
    const players = mk([
      ['keeper', ['GK']],
      ['back', ['DEF']],
      ['mid', ['MID']],
      ['util1', ['DEF', 'MID']],
      ['util2', ['DEF', 'MID']],
    ])
    const slots = assignFormation(players, deriveShape(5, 'att'))
    const at = (pos: FootballPosition) =>
      players.find((p) => p.id === slots.find((s) => s.position === pos)!.playerId)!.n
    expect(at('GK')).toBe('keeper')
    expect(slots.find((s) => s.position === 'GK')!.offPosition).toBe(false)
    // the two FWD slots are filled off-position by whoever is left
    expect(slots.filter((s) => s.position === 'FWD' && s.offPosition)).toHaveLength(2)
    expect(slots).toHaveLength(5)
  })

  it('flags an off-position slot when no eligible player is left', () => {
    // nobody can play FWD → the forward slot is filled off-position
    const players = mk([
      ['k', ['GK']],
      ['d1', ['DEF']],
      ['m1', ['MID']],
      ['d2', ['DEF']],
    ])
    const slots = assignFormation(players, deriveShape(4, 'att')) // 1-1-2 needs 2 fwd
    expect(slots.some((s) => s.offPosition)).toBe(true)
    expect(slots).toHaveLength(4)
  })
})

describe('assignFormation — position priority', () => {
  const shape = { gk: 1, def: 1, mid: 1, fwd: 0, label: '1-1' }

  it('slots each player into their primary position when possible', () => {
    // A prefers MID (primary), B prefers DEF (primary); both can play either.
    // Set-based/specialism alone would be a coin-flip — priority must decide.
    const gk = { id: 'g', n: 'G', p: ['GK'] }
    const a = { id: 'a', n: 'A', p: ['MID', 'DEF'] }
    const b = { id: 'b', n: 'B', p: ['DEF', 'MID'] }
    const slots = assignFormation([gk, a, b], shape)
    const at = (pos: FootballPosition) => slots.find((s) => s.position === pos)?.playerId
    expect(at('MID')).toBe('a')
    expect(at('DEF')).toBe('b')
    expect(slots.every((s) => !s.offPosition)).toBe(true)
  })
})
