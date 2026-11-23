import { beforeEach, describe, expect, it } from 'vitest'
import { loadSportPref, saveSportPref } from './sportPref'

// Minimal in-memory localStorage shim for the node test env (matches
// share/local.test.ts's convention).
beforeEach(() => {
  const store = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => void store.set(k, v),
    removeItem: (k) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage
})

describe('sportPref', () => {
  it('returns null when nothing is saved', () => {
    expect(loadSportPref()).toBeNull()
  })

  it('round-trips a saved preference', () => {
    saveSportPref('generic')
    expect(loadSportPref()).toBe('generic')
  })

  it('ignores a corrupt/unknown stored value', () => {
    localStorage.setItem('evensides:sport', 'not-a-sport')
    expect(loadSportPref()).toBeNull()
  })
})
