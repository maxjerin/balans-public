import { describe, expect, it } from 'vitest'
import { toWire, fromWire } from './wire'
import { SCHEMA_VERSION, type SavedSetup } from '../domain/types'

const base = (over: Partial<SavedSetup> = {}): SavedSetup => ({
  v: SCHEMA_VERSION,
  players: [
    { id: 'p0', n: 'A', p: ['GK'] },
    { id: 'p1', n: 'B', p: ['DEF'] },
  ],
  ...over,
})

describe('wire — position priority order', () => {
  it('preserves selection order round-trip (primary first)', () => {
    const setup = base({ players: [{ id: 'p0', n: 'A', p: ['MID', 'GK', 'FWD'] }] })
    const out = fromWire(toWire(setup))
    expect(out.players[0].p).toEqual(['MID', 'GK', 'FWD'])
  })

  it('encodes positions as an ordered index array (not a bitmask)', () => {
    const wire = toWire(base({ players: [{ id: 'p0', n: 'A', p: ['MID', 'GK'] }] }))
    // football vocab = [GK, DEF, MID, FWD] → MID=2, GK=0, in that order
    expect(wire.p[0][1]).toEqual([2, 0])
  })

  it('still decodes a legacy numeric bitmask link (canonical order)', () => {
    // Old wire: p = [name, mask]. mask for GK(bit0)|MID(bit2) = 1|4 = 5.
    const legacy = { v: SCHEMA_VERSION, p: [['A', 5] as [string, number]] }
    const out = fromWire(legacy as unknown as Parameters<typeof fromWire>[0])
    expect(out.players[0].p).toEqual(['GK', 'MID'])
  })
})

describe('wire — skillOn + teamColors', () => {
  it('round-trips skillOn=true', () => {
    const out = fromWire(toWire(base({ skillOn: true })))
    expect(out.skillOn).toBe(true)
  })

  it('omits skillOn when false/absent', () => {
    expect(toWire(base()).b).toBeUndefined()
    expect(fromWire(toWire(base())).skillOn).toBeUndefined()
  })

  it('round-trips teamColors (any entry differing from its default)', () => {
    const out = fromWire(toWire(base({ teamColors: [0, 3, 1] })))
    expect(out.teamColors).toEqual([0, 3, 1])
  })

  it('omits teamColors when every entry equals its per-team default (red, blue)', () => {
    expect(toWire(base({ teamColors: [1, 2] })).o).toBeUndefined()
  })

  it('keeps colours that override a default (explicit white beats red)', () => {
    // team 0 default is red (1); explicit white (0) must travel, not be dropped.
    expect(toWire(base({ teamColors: [0] })).o).toEqual([0])
  })

  it('decodes an old link with neither key', () => {
    const wire = toWire(base())
    delete (wire as unknown as Record<string, unknown>).b
    delete (wire as unknown as Record<string, unknown>).o
    const out = fromWire(wire)
    expect(out.skillOn).toBeUndefined()
    expect(out.teamColors).toBeUndefined()
  })
})

describe('wire — sign-up list (v4)', () => {
  const SEC = 1000
  const list = (): SavedSetup =>
    base({
      players: [
        { id: 'p0', n: 'Ana', p: ['GK'], t: 1000 * SEC },
        { id: 'p1', n: 'Ben', p: [], st: 'm', t: 1005 * SEC },
        { id: 'p2', n: 'Carl', p: [], g: 'p0', t: 1010 * SEC + 234 },
        { id: 'p3', n: 'Dan', p: [], st: 'n' },
      ],
      cap: 16,
      min: 14,
    })

  it('round-trips status, join time (to the second), guest host, cap and min', () => {
    const out = fromWire(toWire(list()))
    expect(out.players.map((p) => [p.n, p.st, p.t, p.g])).toEqual([
      ['Ana', undefined, 1000 * SEC, undefined],
      ['Ben', 'm', 1005 * SEC, undefined],
      ['Carl', undefined, 1010 * SEC, 'p0'],
      ['Dan', 'n', undefined, undefined],
    ])
    expect(out.cap).toBe(16)
    expect(out.min).toBe(14)
  })

  it('keeps an everyone-in list as lean as before (no status/host arrays)', () => {
    const wire = toWire(base())
    expect(wire).not.toHaveProperty('r')
    expect(wire).not.toHaveProperty('h')
    expect(wire).not.toHaveProperty('j')
    const out = fromWire(wire)
    expect(out.players.every((p) => p.st === undefined && p.g === undefined && p.t === undefined)).toBe(true)
  })
})
