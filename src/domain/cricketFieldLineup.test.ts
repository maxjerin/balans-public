import { describe, expect, it } from 'vitest'
import { fieldLineupFor, swapFieldSlots, fieldSlotsFor } from './cricketFieldLineup'
import { SCHEMA_VERSION, type SavedSetup } from './types'

const setup = (over: Partial<SavedSetup> = {}): SavedSetup => ({
  v: SCHEMA_VERSION,
  sport: 'cricket',
  players: ['a', 'b', 'c'].map((id) => ({ id, n: id, p: ['BAT'] })),
  teams: [['a', 'b', 'c']],
  starters: [['a', 'b', 'c']],
  ...over,
})

describe('fieldLineupFor', () => {
  it('defaults to batting order when none is stored', () => {
    expect(fieldLineupFor(setup(), 0)).toEqual(['a', 'b', 'c'])
  })

  it('returns a stored lineup when it matches the current starters', () => {
    const stored = ['c', 'b', 'a']
    expect(fieldLineupFor(setup({ lineup: [stored] }), 0)).toEqual(stored)
  })

  it('ignores a stored lineup that no longer matches the starters', () => {
    const stale = ['x', 'y', 'z']
    const ids = fieldLineupFor(setup({ lineup: [stale] }), 0)
    expect(ids).not.toEqual(stale)
    expect(new Set(ids)).toEqual(new Set(['a', 'b', 'c']))
  })
})

describe('swapFieldSlots', () => {
  it('swaps two slot occupants and persists a full lineup', () => {
    const next = swapFieldSlots(setup(), 0, 0, 2)
    expect(next.lineup![0]).toEqual(['c', 'b', 'a'])
  })

  it('is immutable', () => {
    const s = setup()
    swapFieldSlots(s, 0, 0, 1)
    expect(s.lineup).toBeUndefined()
  })
})

describe('fieldSlotsFor', () => {
  it('maps ordered ids onto placements 1:1', () => {
    const slots = fieldSlotsFor(['a', 'b', 'c'])
    expect(slots.map((s) => s.placement)).toEqual(['BWL', 'WK', 'SLIP'])
    expect(slots.map((s) => s.playerId)).toEqual(['a', 'b', 'c'])
  })
})
