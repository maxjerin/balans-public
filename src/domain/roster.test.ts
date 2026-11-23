import { describe, expect, it } from 'vitest'
import {
  parseNames,
  titleCaseName,
  addPlayers,
  removePlayer,
  renamePlayer,
  togglePosition,
  isAvailable,
  toggleAvailability,
  availableIds,
  setAllAvailable,
} from './roster'
import { SCHEMA_VERSION, type SavedSetup } from './types'

const base = (): SavedSetup => ({ v: SCHEMA_VERSION, players: [] })

// Deterministic id factory for tests.
const seqIds = () => {
  let i = 0
  return () => `id${++i}`
}

describe('parseNames', () => {
  it('splits one name per line, trims, drops blanks', () => {
    expect(parseNames('  Alex \n\nSam\n  Jordan  \n')).toEqual(['Alex', 'Sam', 'Jordan'])
  })

  it('dedups case-insensitively within the input, keeping first spelling', () => {
    expect(parseNames('Alex\nalex\nSAM\nSam')).toEqual(['Alex', 'SAM'])
  })

  it('returns empty array for empty input', () => {
    expect(parseNames('   \n  ')).toEqual([])
  })

  it('title-cases added names by default', () => {
    expect(parseNames('john doe\nmevin')).toEqual(['John Doe', 'Mevin'])
  })

  it('splits on commas (and semicolons/tabs) as well as newlines', () => {
    expect(parseNames('Alex, Sam ,Jordan')).toEqual(['Alex', 'Sam', 'Jordan'])
    expect(parseNames('Alex;Sam\tJordan')).toEqual(['Alex', 'Sam', 'Jordan'])
  })

  it('handles mixed newline + comma paste, dropping empty segments', () => {
    expect(parseNames('Alex, Sam\nJordan,,\n , Casey')).toEqual(['Alex', 'Sam', 'Jordan', 'Casey'])
  })

  it('keeps spaces inside a name (space is not a separator)', () => {
    expect(parseNames('John Doe, Mary Jane')).toEqual(['John Doe', 'Mary Jane'])
  })
})

describe('titleCaseName', () => {
  it('capitalizes each word, preserving internal casing', () => {
    expect(titleCaseName('jerin')).toBe('Jerin')
    expect(titleCaseName('john doe')).toBe('John Doe')
    expect(titleCaseName('McKay')).toBe('McKay')
    expect(titleCaseName('DJ')).toBe('DJ')
  })
})

describe('addPlayers', () => {
  it('appends players with fresh ids and no positions yet', () => {
    const next = addPlayers(base(), ['Alex', 'Sam'], seqIds())
    expect(next.players).toEqual([
      { id: 'id1', n: 'Alex', p: [] },
      { id: 'id2', n: 'Sam', p: [] },
    ])
  })

  it('skips names already in the pool (case-insensitive)', () => {
    const start = addPlayers(base(), ['Alex'], seqIds())
    const next = addPlayers(start, ['alex', 'Sam'], seqIds())
    expect(next.players.map((p) => p.n)).toEqual(['Alex', 'Sam'])
  })

  it('does not mutate the input setup', () => {
    const start = base()
    addPlayers(start, ['Alex'], seqIds())
    expect(start.players).toEqual([])
  })
})

describe('removePlayer', () => {
  it('removes from the pool', () => {
    const start = addPlayers(base(), ['Alex', 'Sam'], seqIds())
    const next = removePlayer(start, 'id1')
    expect(next.players.map((p) => p.n)).toEqual(['Sam'])
  })

  it('also drops the id from avail/teams/starters', () => {
    let s = addPlayers(base(), ['Alex', 'Sam'], seqIds())
    s = { ...s, avail: ['id1', 'id2'], teams: [['id1'], ['id2']], starters: [['id1'], ['id2']] }
    const next = removePlayer(s, 'id1')
    expect(next.avail).toEqual(['id2'])
    expect(next.teams).toEqual([[], ['id2']])
    expect(next.starters).toEqual([[], ['id2']])
  })
})

describe('renamePlayer', () => {
  it('updates the name, trimmed', () => {
    const start = addPlayers(base(), ['Alex'], seqIds())
    expect(renamePlayer(start, 'id1', '  Alexander ').players[0].n).toBe('Alexander')
  })
})

describe('togglePosition', () => {
  it('keeps positions in selection (click) order — first tapped is primary', () => {
    const start = addPlayers(base(), ['Alex'], seqIds())
    const next = togglePosition(togglePosition(start, 'id1', 'MID'), 'id1', 'GK')
    // MID tapped first → primary; GK second — order is priority, not canonical.
    expect(next.players[0].p).toEqual(['MID', 'GK'])
  })

  it('re-adding a removed position moves it to the end (lowest priority)', () => {
    let s = addPlayers(base(), ['Alex'], seqIds())
    s = togglePosition(s, 'id1', 'GK')
    s = togglePosition(s, 'id1', 'DEF') // ['GK','DEF']
    s = togglePosition(s, 'id1', 'GK') // remove GK → ['DEF']
    s = togglePosition(s, 'id1', 'GK') // re-add GK at end → ['DEF','GK']
    expect(s.players[0].p).toEqual(['DEF', 'GK'])
  })

  it('removes a position when already present', () => {
    let s = addPlayers(base(), ['Alex'], seqIds())
    s = togglePosition(s, 'id1', 'DEF')
    expect(togglePosition(s, 'id1', 'DEF').players[0].p).toEqual([])
  })
})

describe('availability', () => {
  it('treats everyone as available when avail is undefined', () => {
    const start = addPlayers(base(), ['Alex', 'Sam'], seqIds())
    expect(isAvailable(start, 'id1')).toBe(true)
    expect(availableIds(start)).toEqual(['id1', 'id2'])
  })

  it('toggling materializes an explicit avail list', () => {
    const start = addPlayers(base(), ['Alex', 'Sam'], seqIds())
    const next = toggleAvailability(start, 'id1')
    expect(next.avail).toEqual(['id2'])
    expect(isAvailable(next, 'id1')).toBe(false)
    expect(isAvailable(next, 'id2')).toBe(true)
  })

  it('toggling back on restores the id', () => {
    let s = addPlayers(base(), ['Alex', 'Sam'], seqIds())
    s = toggleAvailability(s, 'id1')
    s = toggleAvailability(s, 'id1')
    expect(availableIds(s)).toEqual(['id1', 'id2'])
  })

  it('setAllAvailable clears the avail list', () => {
    let s = addPlayers(base(), ['Alex', 'Sam'], seqIds())
    s = toggleAvailability(s, 'id1')
    expect(setAllAvailable(s).avail).toBeUndefined()
  })
})
