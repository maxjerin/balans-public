import { describe, expect, it } from 'vitest'
import { swapPlayers } from './swap'
import { SCHEMA_VERSION, type SavedSetup } from './types'

const withTeams = (teams: string[][], starters: string[][]): SavedSetup => ({
  v: SCHEMA_VERSION,
  players: teams.flat().map((id) => ({ id, n: id, p: ['DEF']})),
  teams,
  starters,
})

describe('swapPlayers', () => {
  it('swaps two players across different teams, preserving starter roles', () => {
    const s = withTeams(
      [
        ['a', 'b'],
        ['c', 'd'],
      ],
      [['a'], ['c']],
    )
    // a is a starter on team0, d is a sub on team1
    const r = swapPlayers(s, 'a', 'd')
    expect(r.teams).toEqual([
      ['d', 'b'],
      ['c', 'a'],
    ])
    // team0's starter slot now holds d; team1's starters unchanged (a is a sub there)
    expect(r.starters).toEqual([['d'], ['c']])
  })

  it('toggles starter/sub when swapping within the same team', () => {
    const s = withTeams([['a', 'b', 'c']], [['a', 'b']])
    // a starter, c sub → swap roles
    const r = swapPlayers(s, 'a', 'c')
    expect(r.teams).toEqual([['a', 'b', 'c']]) // membership unchanged
    expect(r.starters![0].sort()).toEqual(['b', 'c'])
  })

  it('is a no-op when ids are equal', () => {
    const s = withTeams([['a', 'b']], [['a']])
    expect(swapPlayers(s, 'a', 'a')).toEqual(s)
  })

  it('returns the setup unchanged when there are no teams yet', () => {
    const s: SavedSetup = { v: SCHEMA_VERSION, players: [{ id: 'a', n: 'a', p: ['DEF']}] }
    expect(swapPlayers(s, 'a', 'b')).toEqual(s)
  })
})
