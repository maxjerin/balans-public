// Pure roster operations (brief §6 steps 1-3). Every function is immutable —
// returns a new SavedSetup, never mutates the input — so the store can swap
// state and re-serialize to the URL cleanly.
import type { Player, SavedSetup } from './types'

function defaultMakeId(): string {
  return crypto.randomUUID().slice(0, 8)
}

/** Capitalize the first letter of each whitespace-separated word, leaving the
 *  rest of each word as typed (so "McKay" / "DJ" keep their internal casing).
 *  Applied to names on add so a lowercase paste comes out tidy by default;
 *  manual edits via renamePlayer are left exactly as the user types them. */
export function titleCaseName(name: string): string {
  return name.replace(/(^|\s)(\S)/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase())
}

/** Parse a bulk-paste blob: one name per line, trimmed + title-cased, blanks
 *  dropped, case-insensitively deduped within the input (first spelling wins). */
export function parseNames(text: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  // Split on newlines, commas, semicolons or tabs so you can paste a whole list
  // however it's formatted (one-per-line, "a, b, c", or spreadsheet cells).
  // Spaces are NOT separators — names keep their internal spaces ("John Doe").
  for (const line of text.split(/[\n,;\t]+/)) {
    const name = titleCaseName(line.trim())
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(name)
  }
  return out
}

/** Append players for the given names, skipping any already in the pool
 *  (case-insensitive). New players start with no positions, signed in; pass
 *  `now` to stamp their join time (ranks the sign-up waitlist). */
export function addPlayers(
  setup: SavedSetup,
  names: string[],
  makeId: () => string = defaultMakeId,
  now?: number,
): SavedSetup {
  const existing = new Set(setup.players.map((p) => p.n.toLowerCase()))
  const additions: Player[] = []
  for (const name of names) {
    const key = name.toLowerCase()
    if (existing.has(key)) continue
    existing.add(key)
    additions.push(now != null ? { id: makeId(), n: name, p: [], t: now } : { id: makeId(), n: name, p: [] })
  }
  return { ...setup, players: [...setup.players, ...additions] }
}

const withoutId = (ids: string[] | undefined, id: string) =>
  ids?.filter((x) => x !== id)

const purgeFromGroups = (groups: string[][] | undefined, id: string) =>
  groups?.map((g) => g.filter((x) => x !== id))

/** Remove a player from the pool and from every derived id list. */
export function removePlayer(setup: SavedSetup, id: string): SavedSetup {
  return {
    ...setup,
    players: setup.players.filter((p) => p.id !== id),
    avail: withoutId(setup.avail, id),
    teams: purgeFromGroups(setup.teams, id),
    starters: purgeFromGroups(setup.starters, id),
  }
}

export function renamePlayer(setup: SavedSetup, id: string, name: string): SavedSetup {
  return {
    ...setup,
    players: setup.players.map((p) => (p.id === id ? { ...p, n: name.trim() } : p)),
  }
}

/** Toggle a role on a player; result stays sorted in the active sport's
 *  canonical position order (SportProfile.positions), not lexicographically. */
// Positions are kept in SELECTION (click) order — p[0] is the player's primary
// position, p[1] secondary, etc. That order drives formation slotting and starter
// choice (domain/formation, domain/balance) and the priority colours in the UI.
// Toggling on appends (lowest priority); toggling off removes and the rest keep
// their relative order, so ranks close up automatically.
export function togglePosition(setup: SavedSetup, id: string, pos: string): SavedSetup {
  return {
    ...setup,
    players: setup.players.map((p) => {
      if (p.id !== id) return p
      const has = p.p.includes(pos)
      const next = has ? p.p.filter((x) => x !== pos) : [...p.p, pos]
      return { ...p, p: next }
    }),
  }
}

/** When `avail` is undefined, everyone in the pool is available (the default). */
export function isAvailable(setup: SavedSetup, id: string): boolean {
  return setup.avail ? setup.avail.includes(id) : true
}

/** Ids available this week, in pool order. */
export function availableIds(setup: SavedSetup): string[] {
  return setup.players.filter((p) => isAvailable(setup, p.id)).map((p) => p.id)
}

/** Toggle one player's availability. Materializes an explicit `avail` list
 *  (seeded from the current effective availability) on first toggle. */
export function toggleAvailability(setup: SavedSetup, id: string): SavedSetup {
  const current = new Set(availableIds(setup))
  if (current.has(id)) current.delete(id)
  else current.add(id)
  // Preserve pool order in the materialized list.
  const avail = setup.players.filter((p) => current.has(p.id)).map((p) => p.id)
  return { ...setup, avail }
}

/** Reset to "everyone available" by clearing the explicit list. */
export function setAllAvailable(setup: SavedSetup): SavedSetup {
  const { avail: _drop, ...rest } = setup
  return rest
}
