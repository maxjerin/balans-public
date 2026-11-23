import { describe, expect, it } from 'vitest'
import { defaultTitle, setupTitle } from './setupTitle'
import { SCHEMA_VERSION, type SavedSetup } from '../domain/types'

// 2026-06-28 (UTC noon to avoid TZ edge flips).
const SUN = Date.UTC(2026, 5, 28, 12, 0, 0)

const base = (over: Partial<SavedSetup> = {}): SavedSetup => ({
  v: SCHEMA_VERSION,
  players: [],
  ...over,
})

// Default team labels "Team {n}" (the real app passes a localized resolver).
const teamName = (i: number) => `Team ${i + 1}`

describe('defaultTitle', () => {
  it('joins team names with "vs" and appends the date + year', () => {
    const s = defaultTitle(base({ teams: [['a'], ['b']], createdAt: SUN }), 'en', teamName)
    expect(s).toContain('Team 1 vs Team 2')
    expect(s).toMatch(/Jun/)
    expect(s).toMatch(/2026/)
  })
  it('handles more than two teams', () => {
    const s = defaultTitle(base({ teams: [['a'], ['b'], ['c']], createdAt: SUN }), 'en', teamName)
    expect(s).toContain('Team 1 vs Team 2 vs Team 3')
  })
  it('is just the matchup when there is no timestamp', () => {
    expect(defaultTitle(base({ teams: [['a'], ['b']] }), 'en', teamName)).toBe('Team 1 vs Team 2')
  })
  it('is empty with no teams and no timestamp', () => {
    expect(defaultTitle(base(), 'en', teamName)).toBe('')
  })
})

describe('setupTitle', () => {
  it('prefers an explicit title', () => {
    expect(setupTitle(base({ title: 'Office league' }), 'en', teamName, 'x')).toBe('Office league')
  })
  it('falls back to the matchup+date default', () => {
    expect(setupTitle(base({ teams: [['a'], ['b']], createdAt: SUN }), 'en', teamName, 'x')).toContain(
      'Team 1 vs Team 2',
    )
  })
  it('uses the caller fallback when nothing is set', () => {
    expect(setupTitle(base(), 'en', teamName, 'Untitled')).toBe('Untitled')
  })
  it('treats a blank title as unset', () => {
    expect(setupTitle(base({ title: '  ', teams: [['a'], ['b']] }), 'en', teamName, 'x')).toContain(
      'Team 1 vs Team 2',
    )
  })
})
