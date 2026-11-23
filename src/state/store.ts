// Single source of truth for wizard state. Maps 1:1 to the URL payload
// (brief §6, §12). Every mutation re-serializes to the hash.
import { create } from 'zustand'
import { SCHEMA_VERSION, type SavedSetup, type Style, type Warning } from '../domain/types'
import { decodeSetup, readSetupFromLocation, writeSetupToLocation } from '../share/url'
import { loadLocal, saveLocal, clearLocal } from '../share/local'
import { loadSportPref, saveSportPref } from '../share/sportPref'
import { getSportProfile, type SportId } from '../domain/sport'
import {
  addPlayers,
  parseNames,
  removePlayer,
  renamePlayer,
  setAllAvailable,
  toggleAvailability,
  togglePosition,
} from '../domain/roster'
import { computeLayout } from '../domain/layout'
import { addGuest, confirmedIds, mergeLists, newWeekList, setStatus, statusOf, type Status } from '../domain/signup'
import { generateTeams } from '../domain/balance'
import { swapPlayers } from '../domain/swap'
import { swapSlots } from '../domain/lineup'
import { swapCourtSlots } from '../domain/basketballLineup'
import { swapFieldSlots } from '../domain/cricketFieldLineup'
import { detectLang, loadLang, saveLang, type Lang } from '../i18n'
import { sampleSquad } from '../dev/sampleSquad'
import { STEPS } from '../wizard/steps'

// Opt-in demo seed: when VITE_SEED_SAMPLE=true (baked at build time), a fresh
// visit (no shared link, no local cache) opens with the sample squad. Off by
// default — the homelab/demo build turns it on.
const seedSampleEnabled = import.meta.env.VITE_SEED_SAMPLE === 'true'

// Boot priority: shared link (URL hash) → last-used local cache → seed/empty.
function initialSetup(): SavedSetup {
  return (
    readSetupFromLocation() ??
    loadLocal() ??
    (seedSampleEnabled ? sampleSquad() : { v: SCHEMA_VERSION, players: [] })
  )
}

// Persist to BOTH the URL (canonical share) and the local convenience cache.
function persist(setup: SavedSetup): void {
  writeSetupToLocation(setup)
  saveLocal(setup)
}

interface AppState {
  setup: SavedSetup
  /** True when the app booted from a shared link (drives the remix flow, brief §8). */
  fromLink: boolean
  /** Current wizard step index (brief §6). */
  step: number
  /** UI language. Local-only (localStorage) — NEVER in SavedSetup or the URL,
   *  so a shared link renders in the recipient's language (brief §18 / M5). */
  lang: Lang
  /** True once a sport has been chosen (this session's boot, a shared link,
   *  or a remembered localStorage pref) — gates the one-time sport picker. */
  sportChosen: boolean

  // --- generic ---
  setSetup: (next: SavedSetup) => void
  patch: (partial: Partial<SavedSetup>) => void

  // --- sport (multi-sport Phase 1) ---
  /** Record the user's one-time sport choice: persists to localStorage and
   *  stamps the current setup so it travels in the share link. */
  chooseSport: (id: SportId) => void
  /** Return to the sport picker mid-session. Keeps the pool (names/
   *  availability) but clears every player's position tags — a sport's roles
   *  don't carry over to another — and drops any generated split so the next
   *  sport regenerates fresh. */
  switchSport: () => void

  // --- navigation ---
  goTo: (step: number) => void
  /** Switch UI language and persist locally. */
  setLang: (lang: Lang) => void

  // --- roster actions (wrap the pure helpers + persist) ---
  addFromText: (text: string) => void
  removePlayer: (id: string) => void
  renamePlayer: (id: string, name: string) => void
  togglePosition: (id: string, pos: string) => void
  toggleAvailability: (id: string) => void
  setAllAvailable: () => void

  // --- sign-up list (spec 2026-10-16) ---
  /** Set a player's in / maybe / out / no-reply status (stamps join time). */
  setStatus: (id: string, status: Status) => void
  /** Add a +1 guest for a member. */
  addGuest: (hostId: string, name: string) => void
  /** Max confirmed players (undefined ⇒ no cap, no waitlist). */
  setCap: (cap: number | undefined) => void
  /** Players needed for the game to be on (undefined ⇒ none). */
  setMin: (min: number | undefined) => void
  /** Organizer fix for diverged links: merge a pasted Balans link into this
   *  list. Returns false (list untouched) for a corrupt / other-sport link. */
  mergeLink: (text: string) => boolean

  // --- balancer (brief §7) ---
  /** Warnings from the last generate (keeper shortfall, etc.) — language-free
   *  codes formatted by the UI. */
  genWarnings: Warning[]
  /** Set number of teams; invalidates any existing split. */
  setK: (k: number) => void
  /** Set subs per team; invalidates any existing split. */
  setSubs: (subs: number) => void
  /** Generate teams from the current config + available players. */
  generate: () => void
  /** Re-roll a fresh split with the same config. */
  reshuffle: () => void
  /** Manually swap any two players (across teams or starter↔sub). */
  swap: (idA: string, idB: string) => void

  // --- formation (brief §9) ---
  /** Set the style for ALL teams (clears per-team overrides). */
  setStyle: (style: Style) => void
  /** Set one team's style; the others keep theirs (brief §6.5). */
  setTeamStyle: (teamIndex: number, style: Style) => void
  /** Rename one team (blank ⇒ back to "Team N"). */
  setTeamName: (teamIndex: number, name: string) => void
  /** Toggle skill-weighted balancing (Player.s). Regenerates if teams exist. */
  setSkillOn: (on: boolean) => void
  /** Set one player's skill (1–5). */
  setSkill: (id: string, v: number) => void
  /** Set one team's preset colour index (ui/teamColors PALETTE). */
  setTeamColor: (teamIndex: number, idx: number) => void
  /** Swap two slot occupants on a team's pitch (keeps the shape). */
  swapSlot: (teamIndex: number, i: number, j: number) => void
  /** Swap two slot occupants on a team's court (keeps the shape). Basketball
   *  equivalent of swapSlot. */
  swapCourtSlot: (teamIndex: number, i: number, j: number) => void
  /** Swap two slot occupants on a team's fielding board. Cricket equivalent
   *  of swapSlot/swapCourtSlot. */
  swapFieldSlot: (teamIndex: number, i: number, j: number) => void

  /** Set the setup's display name (blank ⇒ date default). */
  setTitle: (title: string) => void

  /** Start a new week from this setup: keep the pool, positions and config;
   *  drop this week's generated teams so you re-pick and regenerate (brief §6/§8). */
  newWeek: () => void

  /** Edit a copy of a shared setup: leave the read-only view and open the wizard
   *  with this setup, editable (the original link stays canonical). */
  remix: () => void

  /** Switch to the read-only shared view (e.g. after copying the link). */
  showShared: () => void

  /** Wipe the pool and clear the local cache (start fresh). */
  reset: () => void
}

export const useAppStore = create<AppState>((set, get) => {
  // Apply a pure transform to the current setup and persist it.
  const apply = (fn: (s: SavedSetup) => SavedSetup) => {
    const next = fn(get().setup)
    persist(next)
    set({ setup: next })
  }

  // Transient PRNG seed (not part of the shareable payload); bumped on reshuffle.
  let seed = 1

  const runGenerate = () => {
    const s = get().setup
    const ids = new Set(confirmedIds(s))
    const players = s.players.filter((p) => ids.has(p.id))
    const k = s.k ?? 2
    const subs = s.subs ?? 0
    // field is derived from size & subs; pass a high target so the layout's
    // "exceeds target" note never fires (we don't expose an explicit field target).
    const layout = computeLayout(players.length, k, players.length, subs)
    if (!layout.feasible) {
      // No valid split (e.g. too few players after a removal) — drop any stale
      // teams so the UI never references a removed player, and surface why.
      apply((cur) =>
        cur.teams ? { ...cur, teams: undefined, starters: undefined, lineup: undefined } : cur,
      )
      set({ genWarnings: layout.warnings })
      return
    }
    const profile = getSportProfile(s.sport)
    const res = generateTeams(players, layout, seed, {
      positions: profile.positions,
      scarceRole: profile.scarceRole,
      balanceSkill: s.skillOn === true,
    })
    const teams = res.teams.map((t) => t.players)
    const starters = res.teams.map((t) => t.starters)
    apply((cur) => ({
      ...cur,
      teams,
      starters,
      field: layout.teams[0].field,
      lineup: undefined,
      createdAt: cur.createdAt ?? Date.now(),
    }))
    set({ genWarnings: [...layout.warnings, ...res.warnings] })
  }

  // After a roster change that alters who's available, keep an existing split in
  // sync so Teams/Formation/Share never go stale — regenerate automatically.
  // Does nothing until the user has generated teams at least once.
  const regenIfGenerated = () => {
    if (get().setup.teams?.length) runGenerate()
  }

  // Opening a shared link with TEAMS lands the recipient on the read-only
  // summary (pitch board + copy/remix). A link without teams is a sign-up list
  // being passed around the group chat — open it editable on step 1.
  const linked = readSetupFromLocation()
  const bootedFromLink = linked !== null
  const bootedShared = !!linked?.teams?.length

  return {
    genWarnings: [],
    setup: initialSetup(),
    fromLink: bootedShared,
    step: bootedShared ? STEPS.length - 1 : 0,
    lang: loadLang() ?? detectLang(typeof navigator !== 'undefined' ? navigator.language : undefined),
    sportChosen: bootedFromLink || loadSportPref() !== null,

    setSetup: (next) => {
      persist(next)
      set({ setup: next })
    },
    patch: (partial) => apply((s) => ({ ...s, ...partial })),

    chooseSport: (id) => {
      saveSportPref(id)
      // Defensively strip any position tag that isn't valid for the newly
      // picked sport — guards against a role carrying over from wherever
      // the players came from (a demo-seeded squad, a stale setup, a future
      // bug) rather than trusting every caller to have already cleared them.
      const validRoles = new Set(getSportProfile(id).positions)
      apply((s) => ({
        ...s,
        sport: id,
        players: s.players.map((p) => ({ ...p, p: p.p.filter((role) => validRoles.has(role)) })),
      }))
      set({ sportChosen: true })
    },
    switchSport: () => {
      apply((s) => ({
        ...s,
        players: s.players.map((p) => ({ ...p, p: [] })),
        teams: undefined,
        starters: undefined,
        styles: undefined,
        lineup: undefined,
      }))
      set({ sportChosen: false, step: 0 })
    },

    goTo: (step) => set({ step }),

    setLang: (lang) => {
      saveLang(lang)
      set({ lang })
    },

    // Roster changes that alter the available-player set auto-regenerate an
    // existing split (brief: Formation must reflect the current pool).
    // Typing a name that's already on the list (e.g. someone marked out or
    // no-reply) signs them back in rather than silently doing nothing.
    addFromText: (text) => {
      const names = parseNames(text)
      const now = Date.now()
      apply((s) => {
        let next = addPlayers(s, names, undefined, now)
        const typed = new Set(names.map((n) => n.toLowerCase()))
        for (const p of next.players)
          if (typed.has(p.n.toLowerCase()) && statusOf(p) !== 'in') next = setStatus(next, p.id, 'in', now)
        return next
      })
      regenIfGenerated()
    },
    removePlayer: (id) => {
      apply((s) => removePlayer(s, id))
      regenIfGenerated()
    },
    renamePlayer: (id, name) => apply((s) => renamePlayer(s, id, name)),
    togglePosition: (id, pos) => apply((s) => togglePosition(s, id, pos)),
    toggleAvailability: (id) => {
      apply((s) => toggleAvailability(s, id))
      regenIfGenerated()
    },
    setAllAvailable: () => {
      apply((s) => setAllAvailable(s))
      regenIfGenerated()
    },

    setStatus: (id, status) => {
      apply((s) => setStatus(s, id, status, Date.now()))
      regenIfGenerated()
    },
    addGuest: (hostId, name) => {
      apply((s) => addGuest(s, hostId, name, Date.now()))
      regenIfGenerated()
    },
    setCap: (cap) => {
      apply((s) => ({ ...s, cap }))
      regenIfGenerated()
    },
    setMin: (min) => apply((s) => ({ ...s, min })),
    mergeLink: (text) => {
      const other = decodeSetup(text.trim().split('#').pop() ?? '')
      const cur = get().setup
      if (!other || (other.sport ?? 'football') !== (cur.sport ?? 'football')) return false
      apply((s) => mergeLists(s, other))
      regenIfGenerated()
      return true
    },

    // Team count/sizes change → drop the old split (per-team styles/names shift
    // with the indices), then immediately regenerate with the new config.
    setK: (k) => {
      apply((s) => ({
        ...s, k, teams: undefined, starters: undefined, styles: undefined, teamNames: undefined, lineup: undefined,
      }))
      runGenerate()
    },
    setSubs: (subs) => {
      apply((s) => ({
        ...s, subs, teams: undefined, starters: undefined, styles: undefined, teamNames: undefined, lineup: undefined,
      }))
      runGenerate()
    },
    generate: () => {
      seed = (seed % 1_000_000) + 1
      runGenerate()
    },
    reshuffle: () => {
      seed = (seed % 1_000_000) + 1
      runGenerate()
    },
    // Cross-team swap changes who's on each side → drop the manual pitch arrangement.
    swap: (idA, idB) => apply((s) => ({ ...swapPlayers(s, idA, idB), lineup: undefined })),

    // Changing style re-derives the shape, so any manual pitch arrangement
    // is dropped (it was for a different shape).
    newWeek: () => {
      apply((s) => ({
        ...newWeekList(s),
        teams: undefined,
        starters: undefined,
        styles: undefined,
        lineup: undefined,
        createdAt: undefined,
      }))
      set({ step: 0, fromLink: false })
    },

    setTitle: (title) => apply((s) => ({ ...s, title })),

    // Leave the read-only shared view and edit this setup as a copy in the wizard.
    remix: () => set({ fromLink: false, step: 0 }),

    // Enter the read-only shared view (what recipients see). Push a history
    // entry so the browser Back button returns to the editable wizard instead
    // of leaving the app; a one-shot popstate listener flips back on Back.
    showShared: () => {
      if (typeof window !== 'undefined') {
        window.history.pushState({ es: 'shared' }, '')
        const onPop = () => {
          window.removeEventListener('popstate', onPop)
          set({ fromLink: false })
        }
        window.addEventListener('popstate', onPop)
      }
      set({ fromLink: true })
    },

    setStyle: (style) => apply((s) => ({ ...s, style, styles: undefined, lineup: undefined })),
    setTeamStyle: (ti, style) =>
      apply((s) => {
        const styles = [...(s.styles ?? [])]
        styles[ti] = style
        return { ...s, styles, lineup: undefined }
      }),
    setTeamName: (ti, name) =>
      apply((s) => {
        const teamNames = [...(s.teamNames ?? [])]
        teamNames[ti] = name
        return { ...s, teamNames }
      }),
    setSkillOn: (on) => {
      apply((s) => ({ ...s, skillOn: on }))
      regenIfGenerated()
    },
    setSkill: (id, v) =>
      apply((s) => ({
        ...s,
        players: s.players.map((p) => (p.id === id ? { ...p, s: Math.max(1, Math.min(10, v)) } : p)),
      })),
    setTeamColor: (ti, idx) =>
      apply((s) => {
        const teamColors = [...(s.teamColors ?? [])]
        teamColors[ti] = idx
        return { ...s, teamColors }
      }),
    swapSlot: (ti, i, j) => apply((s) => swapSlots(s, ti, i, j)),
    swapCourtSlot: (ti, i, j) => apply((s) => swapCourtSlots(s, ti, i, j)),
    swapFieldSlot: (ti, i, j) => apply((s) => swapFieldSlots(s, ti, i, j)),

    reset: () => {
      const empty: SavedSetup = { v: SCHEMA_VERSION, players: [] }
      clearLocal()
      writeSetupToLocation(empty)
      // fromLink:false drops out of the read-only shared view into the fresh
      // wizard — this is the recipient's "Make your own" (blank) start.
      set({ setup: empty, step: 0, genWarnings: [], fromLink: false })
    },
  }
})
