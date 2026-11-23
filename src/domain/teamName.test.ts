import { describe, expect, it } from 'vitest'
import { teamName } from './teamName'
import { SCHEMA_VERSION, type SavedSetup } from './types'

const base: SavedSetup = { v: SCHEMA_VERSION, players: [] }

describe('teamName', () => {
  it('defaults to "Team N" (1-based)', () => {
    expect(teamName(base, 0)).toBe('Team 1')
    expect(teamName(base, 2)).toBe('Team 3')
  })

  it('uses a custom name when set', () => {
    expect(teamName({ ...base, teamNames: ['Reds', 'Blues'] }, 1)).toBe('Blues')
  })

  it('falls back to default for blank names', () => {
    expect(teamName({ ...base, teamNames: ['  ', 'Blues'] }, 0)).toBe('Team 1')
  })
})
