import { describe, expect, it } from 'vitest'
import { SCHEMA_VERSION, type Player, type SavedSetup } from './types'
import {
  addGuest,
  withGuestsUnderHosts,
  confirmedIds,
  mergeLists,
  migrateAvail,
  newWeekList,
  rankList,
  setStatus,
  statusOf,
} from './signup'

const P = (id: string, extra: Partial<Player> = {}): Player => ({ id, n: id.toUpperCase(), p: [], ...extra })
const S = (players: Player[], extra: Partial<SavedSetup> = {}): SavedSetup => ({ v: SCHEMA_VERSION, players, ...extra })
const names = (ps: Player[]) => ps.map((p) => p.n)
const seqIds = () => {
  let i = 0
  return () => `x${i++}`
}

describe('statusOf', () => {
  it('absent status means in', () => {
    expect(statusOf(P('a'))).toBe('in')
    expect(statusOf(P('a', { st: 'm' }))).toBe('maybe')
    expect(statusOf(P('a', { st: 'o' }))).toBe('out')
    expect(statusOf(P('a', { st: 'n' }))).toBe('none')
  })
})

describe('rankList', () => {
  it('no cap: every in player is confirmed, no waitlist', () => {
    const r = rankList(S([P('a'), P('b'), P('c', { st: 'm' })]))
    expect(names(r.confirmed)).toEqual(['A', 'B'])
    expect(r.waitlist).toEqual([])
    expect(names(r.maybe)).toEqual(['C'])
  })

  it('orders by time of joining, pool order breaking ties', () => {
    const r = rankList(S([P('a', { t: 30 }), P('b', { t: 10 }), P('c'), P('d', { t: 10 })]))
    expect(names(r.confirmed)).toEqual(['C', 'B', 'D', 'A'])
  })

  it('members outrank guests: a late member bumps a guest to the waitlist', () => {
    const r = rankList(
      S([P('a', { t: 1 }), P('g', { t: 2, g: 'a' }), P('b', { t: 3 }), P('c', { t: 4 })], { cap: 3 }),
    )
    expect(names(r.confirmed)).toEqual(['A', 'B', 'C'])
    expect(names(r.waitlist)).toEqual(['G'])
  })

  it('a drop-out moves the first waitlister up', () => {
    let s = S([P('a', { t: 1 }), P('b', { t: 2 }), P('c', { t: 3 }), P('d', { t: 4 })], { cap: 2 })
    expect(names(rankList(s).waitlist)).toEqual(['C', 'D'])
    s = setStatus(s, 'a', 'out', 5)
    expect(names(rankList(s).confirmed)).toEqual(['B', 'C'])
    expect(names(rankList(s).waitlist)).toEqual(['D'])
  })

  it('rejoining goes to the back', () => {
    let s = S([P('a', { t: 1 }), P('b', { t: 2 }), P('c', { t: 3 })], { cap: 2 })
    s = setStatus(s, 'a', 'maybe', 4)
    s = setStatus(s, 'a', 'in', 5)
    expect(names(rankList(s).confirmed)).toEqual(['B', 'C'])
    expect(names(rankList(s).waitlist)).toEqual(['A'])
  })

  it('cap lowered below the confirmed count waitlists the extras', () => {
    const r = rankList(S([P('a'), P('b'), P('c')], { cap: 1 }))
    expect(names(r.confirmed)).toEqual(['A'])
    expect(names(r.waitlist)).toEqual(['B', 'C'])
  })

  it('needMore counts against the minimum', () => {
    const players = Array.from({ length: 11 }, (_, i) => P(`p${i}`))
    expect(rankList(S(players, { min: 16 })).needMore).toBe(5)
    expect(rankList(S(players)).needMore).toBe(0)
  })

  it('a guest whose host was deleted stays a guest', () => {
    const r = rankList(S([P('g', { t: 1, g: 'gone' }), P('a', { t: 2 })], { cap: 1 }))
    expect(names(r.confirmed)).toEqual(['A'])
    expect(names(r.waitlist)).toEqual(['G'])
  })

  it('honours a legacy avail list (unlisted = no reply)', () => {
    const r = rankList(S([P('a'), P('b')], { avail: ['b'] }))
    expect(names(r.confirmed)).toEqual(['B'])
    expect(names(r.none)).toEqual(['A'])
  })
})

describe('confirmedIds', () => {
  it('returns confirmed ids in pool order', () => {
    const s = S([P('a', { t: 9 }), P('b', { t: 1 }), P('c', { st: 'o' })])
    expect(confirmedIds(s)).toEqual(['a', 'b'])
  })
})

describe('setStatus', () => {
  it('stamps the time and stores in as absent', () => {
    let s = setStatus(S([P('a')]), 'a', 'maybe', 7)
    expect(s.players[0]).toMatchObject({ st: 'm', t: 7 })
    s = setStatus(s, 'a', 'in', 8)
    expect(s.players[0].st).toBeUndefined()
    expect(s.players[0].t).toBe(8)
  })

  it('materializes a legacy avail list first', () => {
    const s = setStatus(S([P('a'), P('b')], { avail: ['a'] }), 'a', 'maybe', 1)
    expect(s.avail).toBeUndefined()
    expect(s.players.map((p) => p.st)).toEqual(['m', 'n'])
  })
})

describe('addGuest', () => {
  it('adds an in guest linked to the host', () => {
    const s = addGuest(S([P('a')]), 'a', ' carl ', 5, seqIds())
    expect(s.players[1]).toEqual({ id: 'x0', n: 'Carl', p: [], g: 'a', t: 5 })
  })

  it('ignores a blank name', () => {
    const s = S([P('a')])
    expect(addGuest(s, 'a', '  ', 5)).toBe(s)
  })
})

describe('newWeekList', () => {
  it('resets members to no reply and drops guests', () => {
    const s = newWeekList(S([P('a', { t: 3 }), P('b', { st: 'o', t: 4 }), P('g', { g: 'a' })], { cap: 16 }))
    expect(s.players).toEqual([P('a', { st: 'n' }), P('b', { st: 'n' })])
    expect(s.cap).toBe(16)
  })
})

describe('migrateAvail', () => {
  it('turns avail into statuses', () => {
    const s = migrateAvail(S([P('a'), P('b')], { avail: ['a'] }))
    expect(s.avail).toBeUndefined()
    expect(s.players.map((p) => p.st)).toEqual([undefined, 'n'])
  })
  it('is a no-op without avail', () => {
    const s = S([P('a')])
    expect(migrateAvail(s)).toBe(s)
  })
})

describe('mergeLists', () => {
  it('unions players matched by normalized name', () => {
    const a = S([P('a', { n: 'Ana' }), P('b', { n: 'Ben' })])
    const b = S([P('x', { n: '  ana ' }), P('y', { n: 'Dan' })])
    expect(names(mergeLists(a, b, seqIds()).players)).toEqual(['Ana', 'Ben', 'Dan'])
  })

  it('the newer status wins', () => {
    const a = S([P('a', { n: 'Ana', t: 1 }), P('b', { n: 'Ben', st: 'm', t: 9 })])
    const b = S([P('x', { n: 'Ana', st: 'o', t: 5 }), P('y', { n: 'Ben', t: 2 })])
    const m = mergeLists(a, b, seqIds())
    expect(m.players.map((p) => [p.n, p.st, p.t])).toEqual([
      ['Ana', 'o', 5],
      ['Ben', 'm', 9],
    ])
  })

  it('an older "in" does not resurrect a removal', () => {
    const a = S([P('a', { n: 'Ana', st: 'o', t: 9 })])
    const b = S([P('x', { n: 'Ana', t: 1 })])
    expect(mergeLists(a, b).players[0].st).toBe('o')
  })

  it('remaps a guest host by name', () => {
    const a = S([P('a', { n: 'Ana' })])
    const b = S([P('x', { n: 'Ana' }), P('y', { n: 'Carl', g: 'x', t: 3 })])
    const m = mergeLists(a, b, seqIds())
    expect(m.players[1]).toMatchObject({ n: 'Carl', g: 'a' })
  })

  it('keeps positions from a, falling back to b', () => {
    const a = S([P('a', { n: 'Ana', p: [] }), P('b', { n: 'Ben', p: ['GK'] })])
    const b = S([P('x', { n: 'Ana', p: ['DEF'] }), P('y', { n: 'Ben', p: ['FWD'] })])
    expect(mergeLists(a, b).players.map((p) => p.p)).toEqual([['DEF'], ['GK']])
  })
})

describe('withGuestsUnderHosts', () => {
  it('places each confirmed guest right after their host', () => {
    const s = S([P('a', { t: 1 }), P('b', { t: 2 }), P('c', { t: 3 }), P('g', { g: 'a', t: 4 }), P('h', { g: 'b', t: 5 })])
    expect(names(withGuestsUnderHosts(rankList(s).confirmed))).toEqual(['A', 'G', 'B', 'H', 'C'])
  })

  it('keeps a guest whose host is not in the list at the end', () => {
    const s = S([P('a', { t: 1 }), P('b', { st: 'm', t: 2 }), P('g', { g: 'b', t: 3 })])
    expect(names(withGuestsUnderHosts(rankList(s).confirmed))).toEqual(['A', 'G'])
  })
})
