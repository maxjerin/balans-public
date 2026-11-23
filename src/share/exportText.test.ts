import { describe, expect, it } from 'vitest'
import { formatExport, formatList, listSummary } from './exportText'
import { rankList } from '../domain/signup'
import { translate, type Dict } from '../i18n'
import { SCHEMA_VERSION, type SavedSetup } from '../domain/types'

const t = (key: keyof Dict, params?: Record<string, string | number>) => translate('en', key, params)

const setup: SavedSetup = {
  v: SCHEMA_VERSION,
  players: [
    { id: 'k', n: 'Keith', p: ['GK'] },
    { id: 'd', n: 'Dan', p: ['DEF'] },
    { id: 'm', n: 'Mia', p: ['MID'] },
    { id: 'f', n: 'Fay', p: ['FWD'] },
    { id: 's', n: 'Sub Sam', p: ['DEF', 'MID'] },
  ],
  teams: [['k', 'd', 'm', 'f', 's']],
  starters: [['k', 'd', 'm', 'f']],
  style: 'bal',
}

describe('formatExport — football (positions enabled)', () => {
  it('lists each team with its formation and lines', () => {
    const text = formatExport(setup, t)
    expect(text).toContain('Team 1')
    expect(text).toContain('1-1-1') // 4 starters → 3 outfield, balanced
    expect(text).toMatch(/GK:\s*Keith/)
    expect(text).toMatch(/DEF:\s*Dan/)
    expect(text).toMatch(/FWD:\s*Fay/)
  })

  it('lists subs', () => {
    expect(formatExport(setup, t)).toMatch(/Subs:\s*Sub Sam/)
  })

  it('appends the share link when given a url', () => {
    expect(formatExport(setup, t, 'https://x/#abc')).toContain('https://x/#abc')
  })

  it('falls back to the pool when no teams are generated', () => {
    const text = formatExport({ v: SCHEMA_VERSION, players: setup.players }, t)
    expect(text).toContain('Keith')
    expect(text).not.toContain('Team 1')
  })
})

describe('formatExport — generic (positionless)', () => {
  const genericSetup: SavedSetup = {
    v: SCHEMA_VERSION,
    sport: 'generic',
    players: [
      { id: 'a', n: 'Ann', p: [] },
      { id: 'b', n: 'Bo', p: [] },
      { id: 'c', n: 'Cy', p: [] },
    ],
    teams: [['a', 'b', 'c']],
    starters: [['a', 'b']],
  }

  it('lists plain names with no shape label or position grouping', () => {
    const text = formatExport(genericSetup, t)
    expect(text).toContain('Ann')
    expect(text).toContain('Bo')
    expect(text).not.toMatch(/\d-\d-\d/) // no formation label
    expect(text).not.toMatch(/GK:|DEF:|MID:|FWD:/)
  })

  it('lists the sub separately', () => {
    expect(formatExport(genericSetup, t)).toMatch(/Subs:\s*Cy/)
  })
})

describe('formatExport — cricket (scorecard)', () => {
  const cricketSetup: SavedSetup = {
    v: SCHEMA_VERSION,
    sport: 'cricket',
    players: [
      { id: 'k', n: 'Keith', p: ['WK'] },
      { id: 'd', n: 'Dan', p: ['BAT'] },
      { id: 'm', n: 'Mia', p: ['ALL'] },
      { id: 'f', n: 'Fay', p: ['BOWL'] },
      { id: 's', n: 'Sub Sam', p: ['BAT'] },
    ],
    teams: [['k', 'd', 'm', 'f', 's']],
    starters: [['k', 'd', 'm', 'f']],
  }

  it('lists starters with role tags in role-priority order, no shape label', () => {
    const text = formatExport(cricketSetup, t)
    expect(text).not.toMatch(/\d-\d-\d/) // no formation label
    expect(text).toMatch(/Dan \(BAT\)/)
    expect(text).toMatch(/Mia \(ALL\)/)
    expect(text).toMatch(/Fay \(BOWL\)/)
    expect(text).toMatch(/Keith \(WK\)/)
    // BAT appears before WK in the text (role-priority order)
    expect(text.indexOf('Dan')).toBeLessThan(text.indexOf('Keith'))
  })

  it('lists the sub separately', () => {
    expect(formatExport(cricketSetup, t)).toMatch(/Subs:\s*Sub Sam/)
  })
})

describe('formatList — sign-up list for the group chat', () => {
  const list: SavedSetup = {
    v: SCHEMA_VERSION,
    title: 'Sat 9am',
    cap: 3,
    min: 3,
    players: [
      { id: 'a', n: 'Ana', p: [], t: 1 },
      { id: 'b', n: 'Ben', p: [], t: 2 },
      { id: 'c', n: 'Carl', p: [], g: 'b', t: 3 },
      { id: 'd', n: 'Dan', p: [], st: 'm', t: 4 },
      { id: 'e', n: 'Eli', p: [], t: 5 },
      { id: 'o', n: 'Omar', p: [], t: 6 },
      { id: 'x', n: 'Xan', p: [], st: 'o', t: 7 },
    ],
  }

  it('numbers confirmed players, continues numbering on the waitlist, labels guests', () => {
    const text = formatList(list, t, 'https://balans.team/#abc')
    expect(text.split('\n')).toEqual([
      '⚽ Sat 9am — 3/3 · full · 2 on waitlist',
      '1. Ana',
      '2. Ben',
      '3. Eli',
      'Waitlist: 4. Omar, 5. Carl (+1 Ben)',
      'Maybe: Dan',
      '',
      '✏️ Add yourself / edit: https://balans.team/#abc',
    ])
  })

  it('summarizes without a cap, and with a shortfall', () => {
    const open = { ...list, cap: undefined, min: undefined }
    expect(listSummary(rankList(open), open, t)).toBe('5 in')
    const short = { ...list, cap: 16, min: 8 }
    expect(listSummary(rankList(short), short, t)).toBe('5/16 in · need 3 more')
  })
})
