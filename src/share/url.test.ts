import { describe, expect, it } from 'vitest'
import { compressToEncodedURIComponent } from 'lz-string'
import { encodeSetup, decodeSetup } from './url'
import { SCHEMA_VERSION, type SavedSetup } from '../domain/types'

describe('url codec', () => {
  it('round-trips a setup (ids regenerate as p0…, structure preserved)', () => {
    const setup: SavedSetup = {
      v: SCHEMA_VERSION,
      players: [
        { id: 'p0', n: 'Alex', p: ['GK', 'DEF'] },
        { id: 'p1', n: 'Sam', p: ['MID', 'FWD'], s: 4 },
      ],
      teams: [['p0'], ['p1']],
      starters: [['p0'], ['p1']],
      k: 2,
      field: 5,
      subs: 1,
      style: 'att',
    }
    expect(decodeSetup(encodeSetup(setup))).toEqual(setup)
  })

  it('round-trips an empty setup', () => {
    const setup: SavedSetup = { v: SCHEMA_VERSION, players: [] }
    expect(decodeSetup(encodeSetup(setup))).toEqual(setup)
  })

  it('decodes legacy v1 links (full SavedSetup) unchanged', () => {
    const v1: SavedSetup = {
      v: 1,
      players: [{ id: 'a', n: 'Alex', p: ['GK', 'DEF'] }],
      teams: [['a']],
      k: 2,
    }
    const legacyLink = compressToEncodedURIComponent(JSON.stringify(v1))
    expect(decodeSetup(legacyLink)).toEqual(v1)
  })

  it('produces a shorter link than raw JSON for an id-heavy setup', () => {
    const setup: SavedSetup = {
      v: SCHEMA_VERSION,
      players: Array.from({ length: 12 }, (_, i) => ({
        id: `abcd${i}xyz`,
        n: `Player${i}`,
        p: ['GK', 'DEF', 'MID', 'FWD'],
      })),
      teams: [
        Array.from({ length: 6 }, (_, i) => `abcd${i}xyz`),
        Array.from({ length: 6 }, (_, i) => `abcd${i + 6}xyz`),
      ],
    }
    const v2 = encodeSetup(setup).length
    const v1Raw = compressToEncodedURIComponent(JSON.stringify(setup)).length
    expect(v2).toBeLessThan(v1Raw)
  })

  it('returns null on corrupt input', () => {
    expect(decodeSetup('not-valid-lz')).toBeNull()
    expect(decodeSetup('')).toBeNull()
    expect(decodeSetup('#')).toBeNull()
  })

  it('strips a leading hash', () => {
    const setup: SavedSetup = { v: SCHEMA_VERSION, players: [] }
    expect(decodeSetup('#' + encodeSetup(setup))).toEqual(setup)
  })

  it('round-trips a non-default sport', () => {
    const setup: SavedSetup = { v: SCHEMA_VERSION, players: [], sport: 'generic' }
    expect(decodeSetup(encodeSetup(setup))).toEqual(setup)
  })

  it('omits sp for football (lean payload, default omitted)', () => {
    const setup: SavedSetup = { v: SCHEMA_VERSION, players: [], sport: 'football' }
    const encoded = encodeSetup(setup)
    // football is the implicit default — encoding it should be identical to
    // not setting `sport` at all.
    expect(encoded).toBe(encodeSetup({ v: SCHEMA_VERSION, players: [] }))
  })

  it('a pre-existing link with no sp decodes with sport left undefined (caller defaults to football)', () => {
    const setup: SavedSetup = { v: SCHEMA_VERSION, players: [{ id: 'p0', n: 'Alex', p: ['GK'] }] }
    const decoded = decodeSetup(encodeSetup(setup))
    expect(decoded?.sport).toBeUndefined()
  })

  it('forward-compat: an out-of-range sp (minted by a future build) decodes as generic, not a crash', () => {
    const futureWire = compressToEncodedURIComponent(JSON.stringify({ v: 3, p: [], sp: 99 }))
    expect(decodeSetup(futureWire)).toEqual({ v: SCHEMA_VERSION, players: [], sport: 'generic' })
  })

  it('round-trips football role strings through the sport-scoped bitmask', () => {
    const setup: SavedSetup = {
      v: SCHEMA_VERSION,
      players: [
        { id: 'p0', n: 'Alex', p: ['GK', 'DEF'] },
        { id: 'p1', n: 'Sam', p: ['MID', 'FWD'], s: 4 },
      ],
    }
    expect(decodeSetup(encodeSetup(setup))).toEqual(setup)
  })

  it('backward-compat: an old-format v3 football link (bitmask 0=GK,1=DEF,2=MID,3=FWD) decodes to the same role strings under the new sport-scoped scheme', () => {
    const oldWire = compressToEncodedURIComponent(JSON.stringify({ v: 3, p: [['Alex', 0b0011]] })) // bits 0+1
    const decoded = decodeSetup(oldWire)
    expect(decoded?.players[0].p).toEqual(['GK', 'DEF'])
  })
})
