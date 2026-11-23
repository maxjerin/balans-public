// Sign-up list (spec 2026-10-16): per-player status, guests (+1s), optional
// cap → waitlist, optional minimum. Pure + immutable like roster.ts. The
// waitlist is never stored — it's derived from status + join time, so it
// travels in the link for free and moves up automatically on a drop-out.
import type { Player, SavedSetup } from './types'
import { titleCaseName } from './roster'

export type Status = 'in' | 'maybe' | 'out' | 'none'

const TO_CODE: Record<Status, Player['st']> = { in: undefined, maybe: 'm', out: 'o', none: 'n' }
const FROM_CODE: Record<NonNullable<Player['st']>, Status> = { m: 'maybe', o: 'out', n: 'none' }

export function statusOf(p: Player): Status {
  return p.st ? FROM_CODE[p.st] : 'in'
}

/** Legacy links carry an `avail` id list instead of statuses: anyone not on it
 *  hadn't confirmed, so they become "no reply". */
export function migrateAvail(setup: SavedSetup): SavedSetup {
  if (!setup.avail) return setup
  const avail = new Set(setup.avail)
  const { avail: _drop, ...rest } = setup
  return {
    ...rest,
    players: setup.players.map((p) => (avail.has(p.id) || p.st ? p : { ...p, st: 'n' })),
  }
}

export interface RankedList {
  confirmed: Player[]
  waitlist: Player[]
  maybe: Player[]
  none: Player[]
  out: Player[]
  /** players still needed to reach `min` (0 when met or no minimum) */
  needMore: number
}

/** Members first, then guests; each by join time, pool order breaking ties.
 *  The first `cap` are confirmed, the rest wait. */
export function rankList(setup: SavedSetup): RankedList {
  const s = migrateAvail(setup)
  const index = new Map(s.players.map((p, i) => [p.id, i]))
  const byJoin = (a: Player, b: Player) => (a.t ?? 0) - (b.t ?? 0) || index.get(a.id)! - index.get(b.id)!
  const of = (st: Status) => s.players.filter((p) => statusOf(p) === st)
  const going = of('in')
  const ranked = [...going.filter((p) => !p.g).sort(byJoin), ...going.filter((p) => p.g).sort(byJoin)]
  const cap = s.cap ?? ranked.length
  const confirmed = ranked.slice(0, cap)
  return {
    confirmed,
    waitlist: ranked.slice(cap),
    maybe: of('maybe'),
    none: of('none'),
    out: of('out'),
    needMore: Math.max(0, (s.min ?? 0) - confirmed.length),
  }
}

/** Display order for a ranked group: each member followed by their own guests
 *  from the same group; guests whose host isn't in the group go last. Ranking
 *  (who gets a spot) is unchanged — this only decides where a guest is shown. */
export function withGuestsUnderHosts(group: Player[]): Player[] {
  const members = group.filter((p) => !p.g)
  const ids = new Set(members.map((p) => p.id))
  const out: Player[] = []
  for (const m of members) out.push(m, ...group.filter((p) => p.g === m.id))
  return [...out, ...group.filter((p) => p.g && !ids.has(p.g))]
}

/** Ids that go to the balancer, in pool order. */
export function confirmedIds(setup: SavedSetup): string[] {
  const ok = new Set(rankList(setup).confirmed.map((p) => p.id))
  return setup.players.filter((p) => ok.has(p.id)).map((p) => p.id)
}

export function setStatus(setup: SavedSetup, id: string, status: Status, now: number): SavedSetup {
  const s = migrateAvail(setup)
  return {
    ...s,
    players: s.players.map((p) => {
      if (p.id !== id) return p
      const { st: _st, ...rest } = p
      const st = TO_CODE[status]
      return st ? { ...rest, st, t: now } : { ...rest, t: now }
    }),
  }
}

function defaultMakeId(): string {
  return crypto.randomUUID().slice(0, 8)
}

/** Add a +1 for `hostId`. Guests join as "in", positions optional. */
export function addGuest(
  setup: SavedSetup,
  hostId: string,
  name: string,
  now: number,
  makeId: () => string = defaultMakeId,
): SavedSetup {
  const n = titleCaseName(name.trim())
  if (!n) return setup
  return { ...setup, players: [...setup.players, { id: makeId(), n, p: [], g: hostId, t: now }] }
}

/** Next week's list: same members (all "no reply"), no guests, same cap/min. */
export function newWeekList(setup: SavedSetup): SavedSetup {
  const { avail: _drop, ...rest } = setup
  return {
    ...rest,
    players: setup.players
      .filter((p) => !p.g)
      .map(({ st: _st, t: _t, ...p }) => ({ ...p, st: 'n' as const })),
  }
}

const key = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase()

/** Organizer fix for two diverged links: union by name; for the same person
 *  the newer status change wins (so an older "in" can't undo a removal). */
export function mergeLists(a: SavedSetup, b: SavedSetup, makeId: () => string = defaultMakeId): SavedSetup {
  const sa = migrateAvail(a)
  const sb = migrateAvail(b)
  const players: Player[] = sa.players.map((p) => ({ ...p }))
  const byKey = new Map(players.map((p) => [key(p.n), p]))
  // b's id → merged id, so guest hosts can be remapped afterwards
  const idMap = new Map<string, string>()
  const fromB = new Map<string, Player>() // merged id → b's winning entry (for host remap)

  for (const pb of sb.players) {
    const hit = byKey.get(key(pb.n))
    if (!hit) {
      const added: Player = { ...pb, id: makeId() }
      players.push(added)
      byKey.set(key(pb.n), added)
      idMap.set(pb.id, added.id)
      fromB.set(added.id, pb)
      continue
    }
    idMap.set(pb.id, hit.id)
    if (!hit.p.length && pb.p.length) hit.p = pb.p
    if ((pb.t ?? 0) > (hit.t ?? 0)) {
      delete hit.st
      delete hit.g
      if (pb.st) hit.st = pb.st
      if (pb.t != null) hit.t = pb.t
      fromB.set(hit.id, pb)
    }
  }
  // Guests whose winning entry came from b point at b's host id → remap.
  for (const p of players) {
    const src = fromB.get(p.id)
    if (src?.g) p.g = idMap.get(src.g) ?? src.g
  }
  return { ...sa, players }
}
