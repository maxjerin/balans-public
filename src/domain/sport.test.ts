import { describe, expect, it } from 'vitest'
import { getSportProfile, SPORT_PROFILES, DEFAULT_SPORT, type SportId } from './sport'

describe('sport registry', () => {
  it('defaults to football when no id is given', () => {
    expect(getSportProfile(undefined)).toBe(SPORT_PROFILES.football)
    expect(DEFAULT_SPORT).toBe('football')
  })

  it('resolves a known id to its profile', () => {
    const p = getSportProfile('generic')
    expect(p.id).toBe('generic')
    expect(p.positionsEnabled).toBe(false)
    expect(p.resultView).toBe('list')
  })

  it('football has positions enabled and the pitch result view', () => {
    const p = getSportProfile('football')
    expect(p.positionsEnabled).toBe(true)
    expect(p.resultView).toBe('pitch')
    expect(p.positions).toEqual(['GK', 'DEF', 'MID', 'FWD'])
  })

  it("falls back to the generic profile for an id outside this build's registry (forward-compat for a future sport)", () => {
    // Every real SportId is registered as of Phase 3 — this simulates a link
    // minted by a later build with a 5th sport this build has never heard of.
    const p = getSportProfile('rugby' as SportId)
    expect(p.id).toBe('generic')
  })

  it("football's scarce role is GK; generic has none", () => {
    expect(getSportProfile('football').scarceRole).toBe('GK')
    expect(getSportProfile('generic').scarceRole).toBeUndefined()
  })

  it('basketball has positions enabled, the court result view, and no scarce role', () => {
    const p = getSportProfile('basketball')
    expect(p.positionsEnabled).toBe(true)
    expect(p.resultView).toBe('court')
    expect(p.positions).toEqual(['G', 'F', 'C'])
    expect(p.scarceRole).toBeUndefined()
  })

  it('cricket has positions enabled, the field result view, and no scarce role', () => {
    const p = getSportProfile('cricket')
    expect(p.positionsEnabled).toBe(true)
    expect(p.resultView).toBe('field')
    expect(p.positions).toEqual(['BAT', 'ALL', 'BOWL', 'WK'])
    expect(p.scarceRole).toBeUndefined()
  })
})
