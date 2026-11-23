import { describe, expect, it } from 'vitest'
import { lineupFor, swapSlots, lineupSlots, styleFor } from './lineup'
import { deriveShape } from './formation'
import { SCHEMA_VERSION, type SavedSetup } from './types'

// A 2-team setup: team0 = 5 all-round starters (field 5), no subs.
const setup = (over: Partial<SavedSetup> = {}): SavedSetup => ({
  v: SCHEMA_VERSION,
  players: ['a', 'b', 'c', 'd', 'e'].map((id) => ({
    id,
    n: id,
    p: ['GK', 'DEF', 'MID', 'FWD'],
  })),
  teams: [['a', 'b', 'c', 'd', 'e']],
  starters: [['a', 'b', 'c', 'd', 'e']],
  style: 'bal',
  ...over,
})

describe('lineupFor', () => {
  it('derives an ordered lineup matching the field size when none is stored', () => {
    const ids = lineupFor(setup(), 0)
    expect(ids).toHaveLength(5)
    expect(new Set(ids).size).toBe(5)
  })

  it('returns a stored lineup when it matches the current starters', () => {
    const stored = ['e', 'd', 'c', 'b', 'a']
    expect(lineupFor(setup({ lineup: [stored] }), 0)).toEqual(stored)
  })

  it('ignores a stored lineup that no longer matches the starters', () => {
    const stale = ['x', 'y', 'z', 'b', 'a']
    const ids = lineupFor(setup({ lineup: [stale] }), 0)
    expect(ids).not.toEqual(stale)
    expect(new Set(ids)).toEqual(new Set(['a', 'b', 'c', 'd', 'e']))
  })
})

describe('styleFor', () => {
  it('prefers the per-team override, falls back to the global style', () => {
    const s = setup({ style: 'bal', styles: ['att'] })
    expect(styleFor(s, 0)).toBe('att')
    expect(styleFor(s, 1)).toBe('bal') // no override → global
  })

  it('defaults to balanced when nothing is set', () => {
    expect(styleFor(setup({ style: undefined }), 0)).toBe('bal')
  })
})

describe('swapSlots', () => {
  it('swaps two slot occupants and persists a full lineup', () => {
    const next = swapSlots(setup(), 0, 0, 4)
    const ids = next.lineup![0]
    const original = lineupFor(setup(), 0)
    expect(ids[0]).toBe(original[4])
    expect(ids[4]).toBe(original[0])
    // other slots unchanged
    expect(ids[1]).toBe(original[1])
  })

  it('is immutable', () => {
    const s = setup()
    swapSlots(s, 0, 0, 1)
    expect(s.lineup).toBeUndefined()
  })
})

describe('lineupSlots', () => {
  it('maps ids onto positions in formation order and flags off-position', () => {
    const shape = deriveShape(5, 'bal') // 1-2-1 → [GK, DEF, MID, MID, FWD]
    const players = [
      { id: 'k', n: 'k', p: ['GK'] },
      { id: 'd', n: 'd', p: ['DEF'] },
      { id: 'm', n: 'm', p: ['MID'] },
      { id: 'x', n: 'x', p: ['DEF'] }, // only DEF → off in a MID slot
      { id: 'f', n: 'f', p: ['FWD'] },
    ]
    const posOf = (id: string) => players.find((p) => p.id === id)!.p
    const slots = lineupSlots(['k', 'd', 'm', 'x', 'f'], shape, posOf)
    expect(slots.map((s) => s.position)).toEqual(['GK', 'DEF', 'MID', 'MID', 'FWD'])
    expect(slots[3].offPosition).toBe(true)
    expect(slots[0].offPosition).toBe(false)
  })
})
