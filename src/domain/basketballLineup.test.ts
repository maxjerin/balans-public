import { describe, expect, it } from 'vitest'
import { courtLineupFor, swapCourtSlots, courtLineupSlots } from './basketballLineup'
import { deriveCourtShape } from './basketball'
import { SCHEMA_VERSION, type SavedSetup } from './types'

const setup = (over: Partial<SavedSetup> = {}): SavedSetup => ({
  v: SCHEMA_VERSION,
  sport: 'basketball',
  players: ['a', 'b', 'c'].map((id) => ({ id, n: id, p: ['G', 'F', 'C'] })),
  teams: [['a', 'b', 'c']],
  starters: [['a', 'b', 'c']],
  ...over,
})

describe('courtLineupFor', () => {
  it('derives an ordered lineup matching the field size when none is stored', () => {
    const ids = courtLineupFor(setup(), 0)
    expect(ids).toHaveLength(3)
    expect(new Set(ids).size).toBe(3)
  })

  it('returns a stored lineup when it matches the current starters', () => {
    const stored = ['c', 'b', 'a']
    expect(courtLineupFor(setup({ lineup: [stored] }), 0)).toEqual(stored)
  })

  it('ignores a stored lineup that no longer matches the starters', () => {
    const stale = ['x', 'y', 'z']
    const ids = courtLineupFor(setup({ lineup: [stale] }), 0)
    expect(ids).not.toEqual(stale)
    expect(new Set(ids)).toEqual(new Set(['a', 'b', 'c']))
  })
})

describe('swapCourtSlots', () => {
  it('swaps two slot occupants and persists a full lineup', () => {
    const next = swapCourtSlots(setup(), 0, 0, 2)
    const ids = next.lineup![0]
    const original = courtLineupFor(setup(), 0)
    expect(ids[0]).toBe(original[2])
    expect(ids[2]).toBe(original[0])
    expect(ids[1]).toBe(original[1])
  })

  it('is immutable', () => {
    const s = setup()
    swapCourtSlots(s, 0, 0, 1)
    expect(s.lineup).toBeUndefined()
  })
})

describe('courtLineupSlots', () => {
  it('maps ids onto positions in shape order and flags off-position', () => {
    const shape = deriveCourtShape(3) // 1-1-1
    const players = [
      { id: 'g', n: 'g', p: ['G'] },
      { id: 'f', n: 'f', p: ['F'] },
      { id: 'x', n: 'x', p: ['F'] }, // only F → off in the C slot
    ]
    const posOf = (id: string) => players.find((p) => p.id === id)!.p
    const slots = courtLineupSlots(['g', 'f', 'x'], shape, posOf)
    expect(slots.map((s) => s.position)).toEqual(['G', 'F', 'C'])
    expect(slots[2].offPosition).toBe(true)
    expect(slots[0].offPosition).toBe(false)
  })
})
