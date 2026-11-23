import { describe, expect, it } from 'vitest'
import { assignField } from './cricketField'

describe('assignField', () => {
  it('maps starters onto placements in order, bowler and keeper first', () => {
    const slots = assignField(['a', 'b', 'c'])
    expect(slots).toEqual([
      { placement: 'BWL', playerId: 'a' },
      { placement: 'WK', playerId: 'b' },
      { placement: 'SLIP', playerId: 'c' },
    ])
  })

  it('fills all 11 placements for a full XI', () => {
    const ids = Array.from({ length: 11 }, (_, i) => `p${i}`)
    const slots = assignField(ids)
    expect(slots).toHaveLength(11)
    expect(slots[10].placement).toBe('THIRD-MAN')
  })

  it('leaves extra starters beyond 11 unplaced (template caps at a full XI)', () => {
    const ids = Array.from({ length: 13 }, (_, i) => `p${i}`)
    expect(assignField(ids)).toHaveLength(11)
  })

  it('handles an empty roster', () => {
    expect(assignField([])).toEqual([])
  })
})
