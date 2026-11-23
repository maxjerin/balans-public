import { beforeEach, describe, expect, it } from 'vitest'
import { loadLocal, saveLocal, clearLocal } from './local'
import { SCHEMA_VERSION, type SavedSetup } from '../domain/types'

// Minimal in-memory localStorage shim for the node test env.
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

const setup: SavedSetup = {
  v: SCHEMA_VERSION,
  // Ids regenerate as p0… through the wire codec, so use that form here.
  players: [{ id: 'p0', n: 'Alex', p: ['GK', 'DEF'] }],
  k: 2,
}

describe('local persistence', () => {
  it('round-trips a setup through localStorage', () => {
    saveLocal(setup)
    expect(loadLocal()).toEqual(setup)
  })

  it('returns null when nothing is stored', () => {
    expect(loadLocal()).toBeNull()
  })

  it('returns null on corrupt stored data', () => {
    localStorage.setItem('evensides:last', 'garbage')
    expect(loadLocal()).toBeNull()
  })

  it('clears stored data', () => {
    saveLocal(setup)
    clearLocal()
    expect(loadLocal()).toBeNull()
  })
})
