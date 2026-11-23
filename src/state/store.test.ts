// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from './store'
import { SCHEMA_VERSION, type SavedSetup } from '../domain/types'

// Minimal in-memory localStorage shim for the node test env (matches
// share/local.test.ts's convention — jsdom's own localStorage isn't wired up
// in this environment). Only affects test-time reads/writes; store.ts's
// module-load-time localStorage calls are already try/catch-wrapped and
// no-op harmlessly before this runs.
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

const squad = (n: number): SavedSetup => ({
  v: SCHEMA_VERSION,
  players: Array.from({ length: n }, (_, i) => ({
    id: `p${i}`,
    n: `P${i}`,
    p: ['GK', 'DEF', 'MID', 'FWD'],
  })),
})

const assigned = (s: SavedSetup) => new Set((s.teams ?? []).flat())

describe('auto-regenerate on roster change', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
  })

  it('does nothing before any teams are generated', () => {
    const st = useAppStore.getState()
    st.setSetup(squad(4))
    st.addFromText('Newbie')
    expect(useAppStore.getState().setup.teams).toBeUndefined()
  })

  it('includes a newly added player without a manual regenerate', () => {
    const st = useAppStore.getState()
    st.setSetup(squad(6))
    st.generate()
    expect(assigned(useAppStore.getState().setup).size).toBe(6)

    useAppStore.getState().addFromText('Newbie')
    const s = useAppStore.getState().setup
    expect(s.players).toHaveLength(7)
    expect(assigned(s).size).toBe(7)
  })

  it('drops a removed player from the split automatically', () => {
    const st = useAppStore.getState()
    st.setSetup(squad(8))
    st.generate()
    const victim = useAppStore.getState().setup.players[0].id
    useAppStore.getState().removePlayer(victim)
    const s = useAppStore.getState().setup
    expect(assigned(s).has(victim)).toBe(false)
    expect(assigned(s).size).toBe(7)
  })

  it('clears the split when a removal makes it infeasible', () => {
    const st = useAppStore.getState()
    st.setSetup(squad(2)) // 2 players, 2 teams = 1 each (feasible)
    st.generate()
    expect(useAppStore.getState().setup.teams?.length).toBeTruthy()

    const victim = useAppStore.getState().setup.players[0].id
    useAppStore.getState().removePlayer(victim) // 1 player < 2 teams → infeasible
    expect(useAppStore.getState().setup.teams).toBeUndefined()
  })
})

describe('reset — recipient "Make your own"', () => {
  it('wipes the pool and leaves the read-only shared view', () => {
    const st = useAppStore.getState()
    // Simulate a recipient viewing a shared link: a loaded roster + fromLink.
    st.setSetup(squad(6))
    useAppStore.setState({ fromLink: true, step: 3 })

    useAppStore.getState().reset()

    const s = useAppStore.getState()
    expect(s.setup.players).toHaveLength(0) // blank squad
    expect(s.fromLink).toBe(false) // drops into the wizard, not SharedView
    expect(s.step).toBe(0) // back at Players
  })
})

describe('sport selection', () => {
  beforeEach(() => {
    localStorage.clear()
    useAppStore.getState().reset()
  })

  it('chooseSport persists the pick to the setup and localStorage, and flips sportChosen', () => {
    useAppStore.getState().chooseSport('generic')
    const st = useAppStore.getState()
    expect(st.setup.sport).toBe('generic')
    expect(st.sportChosen).toBe(true)
    expect(localStorage.getItem('evensides:sport')).toBe('generic')
  })

  it('chooseSport strips any position tags that are not valid for the newly picked sport', () => {
    // Simulates the VITE_SEED_SAMPLE demo build, which boots with
    // football-tagged players before any sport has been picked — chooseSport
    // must not let those football tags survive into a different sport.
    useAppStore.getState().setSetup({
      v: useAppStore.getState().setup.v,
      players: [
        { id: 'p0', n: 'Alex', p: ['GK', 'DEF'] },
        { id: 'p1', n: 'Sam', p: ['MID'] },
      ],
    })
    useAppStore.getState().chooseSport('basketball')
    expect(useAppStore.getState().setup.players.every((p) => p.p.length === 0)).toBe(true)
  })

  it('chooseSport keeps tags that are still valid when picking the same sport again', () => {
    useAppStore.getState().setSetup({
      v: useAppStore.getState().setup.v,
      sport: 'football',
      players: [{ id: 'p0', n: 'Alex', p: ['GK'] }],
    })
    useAppStore.getState().chooseSport('football')
    expect(useAppStore.getState().setup.players[0].p).toEqual(['GK'])
  })

  it('generic sport never produces a keeperShortfall warning after generate', () => {
    useAppStore.getState().chooseSport('generic')
    useAppStore.getState().setSetup({
      v: useAppStore.getState().setup.v,
      players: Array.from({ length: 6 }, (_, i) => ({ id: `p${i}`, n: `P${i}`, p: [] })),
      sport: 'generic',
    })
    useAppStore.getState().generate()
    expect(useAppStore.getState().genWarnings.some((w) => w.code === 'keeperShortfall')).toBe(false)
  })

  it('switchSport flips sportChosen back to false, showing the picker again', () => {
    useAppStore.getState().chooseSport('football')
    useAppStore.getState().switchSport()
    expect(useAppStore.getState().sportChosen).toBe(false)
  })

  it('switchSport keeps the player pool but clears each player\'s position tags', () => {
    useAppStore.getState().chooseSport('football')
    useAppStore.getState().addFromText('Alex, Sam')
    const [id1, id2] = useAppStore.getState().setup.players.map((p) => p.id)
    useAppStore.getState().togglePosition(id1, 'GK')
    useAppStore.getState().togglePosition(id2, 'DEF')

    useAppStore.getState().switchSport()

    const players = useAppStore.getState().setup.players
    expect(players.map((p) => p.n)).toEqual(['Alex', 'Sam'])
    expect(players.every((p) => p.p.length === 0)).toBe(true)
  })

  it('switchSport drops any generated teams so the next sport regenerates fresh', () => {
    useAppStore.getState().chooseSport('football')
    useAppStore.getState().setSetup(squad(6))
    useAppStore.getState().generate()
    expect(useAppStore.getState().setup.teams?.length).toBeTruthy()

    useAppStore.getState().switchSport()

    expect(useAppStore.getState().setup.teams).toBeUndefined()
  })
})
