import { describe, expect, it } from 'vitest'
import { compareBuild } from './build'

describe('compareBuild', () => {
  it('flags a mismatch as stale (cached client behind the edge)', () => {
    expect(compareBuild('abc1234', 'def5678')).toEqual({
      current: 'abc1234',
      latest: 'def5678',
      stale: true,
    })
  })

  it('matching versions are not stale', () => {
    expect(compareBuild('abc1234', 'abc1234').stale).toBe(false)
  })

  it('never reports stale on empty/unknown versions (avoid false reload nags)', () => {
    expect(compareBuild('', 'def5678').stale).toBe(false)
    expect(compareBuild('abc1234', '').stale).toBe(false)
  })
})
