// Compact wire format (schema v2) for the share link — the privacy boundary.
// The in-app SavedSetup is id-based (8-char ids referenced across
// teams/starters/lineup/avail), which dominates the URL. The wire form drops
// ids entirely: players become a positional array, and every reference is the
// player's INDEX. Positions pack into a 4-bit mask, keys are 1 char, defaults
// are omitted. No server involved — this only changes how the setup is encoded.
//
// Decoding regenerates synthetic ids (`p0…pN`); ids are internal, so callers
// never depend on their exact value.
import { SCHEMA_VERSION, type Player, type SavedSetup, type Style } from '../domain/types'
import { getSportProfile, type SportId } from '../domain/sport'
import { defaultColorIndex } from '../ui/teamColors'

const STYLES: Style[] = ['def', 'bal', 'att']
const styleEnc = (s: Style): number => STYLES.indexOf(s)
const styleDec = (n: number): Style => STYLES[n] ?? 'bal'

// Fixed encoding order — index is part of the wire contract, so this array
// only ever grows (new sports append) and never reorders.
const SPORTS: SportId[] = ['football', 'basketball', 'cricket', 'generic']
const sportEnc = (s: SportId): number => SPORTS.indexOf(s)
const sportDec = (n: number): SportId => SPORTS[n] ?? 'generic'

// Positions travel as an ORDERED list of indices into the sport's vocabulary
// (index 0 = the player's primary position). Legacy links encoded a single
// number bitmask instead — `fromWire` still decodes those (in canonical order).
type WirePlayer = [string, number[]] | [string, number[], number] // [name, posIdxs, skill?]

interface WireSetup {
  v: number
  p: WirePlayer[]
  sp?: number
  a?: number[]
  t?: number[][]
  s?: number[][]
  l?: number[][]
  k?: number
  f?: number
  u?: number
  y?: number
  g?: number[]
  m?: string[]
  i?: string
  c?: number
  b?: number
  o?: number[]
  /** v4 sign-up: status codes parallel to `p` (0 in, 1 maybe, 2 out, 3 no reply) */
  r?: number[]
  /** v4 sign-up: join time, seconds after `jb` (-1 = none), parallel to `p` */
  j?: number[]
  /** v4 sign-up: base for `j`, in seconds since epoch */
  jb?: number
  /** v4 sign-up: guest host as player index (-1 = member), parallel to `p` */
  h?: number[]
  /** v4 sign-up: cap / minimum */
  x?: number
  n?: number
}

// Sign-up status codes — index is part of the wire contract (append only).
const STATUS: (Player['st'])[] = [undefined, 'm', 'o', 'n']
const SECOND = 1000

/** SavedSetup → compact wire object (schema v2+). */
export function toWire(setup: SavedSetup): WireSetup {
  const positions = getSportProfile(setup.sport).positions
  const posEnc = (role: string): number => positions.indexOf(role)

  const index = new Map(setup.players.map((p, i) => [p.id, i]))
  const toIdx = (ids: string[]): number[] =>
    ids.map((id) => index.get(id)).filter((i): i is number => i !== undefined)

  const wire: WireSetup = {
    v: SCHEMA_VERSION,
    p: setup.players.map((p): WirePlayer => {
      // ordered indices — preserves the player's position priority
      const posIdxs = p.p.map(posEnc).filter((i) => i >= 0)
      return p.s != null ? [p.n, posIdxs, p.s] : [p.n, posIdxs]
    }),
  }

  if (setup.sport && setup.sport !== 'football') wire.sp = sportEnc(setup.sport)
  if (setup.avail) wire.a = toIdx(setup.avail)
  if (setup.teams) wire.t = setup.teams.map(toIdx)
  if (setup.starters) wire.s = setup.starters.map(toIdx)
  if (setup.lineup) wire.l = setup.lineup.map(toIdx)
  if (setup.k != null) wire.k = setup.k
  if (setup.field != null) wire.f = setup.field
  if (setup.subs != null) wire.u = setup.subs
  if (setup.style && setup.style !== 'bal') wire.y = styleEnc(setup.style)
  if (setup.styles) wire.g = setup.styles.map(styleEnc)
  if (setup.teamNames) wire.m = setup.teamNames
  if (setup.title) wire.i = setup.title
  if (setup.createdAt != null) wire.c = setup.createdAt
  if (setup.skillOn) wire.b = 1
  // Only travel colours that differ from the per-team default (red/blue/…),
  // so an untouched setup keeps a lean link and the recipient recomputes the
  // same defaults.
  if (setup.teamColors && setup.teamColors.some((c, i) => c != null && c !== defaultColorIndex(i)))
    wire.o = setup.teamColors

  // Sign-up list: each array only travels when it carries information, so an
  // everyone-in pool encodes exactly as it did before v4.
  const ps = setup.players
  if (ps.some((p) => p.st)) wire.r = ps.map((p) => STATUS.indexOf(p.st))
  const times = ps.filter((p) => p.t != null).map((p) => Math.floor(p.t! / SECOND))
  if (times.length) {
    const jb = Math.min(...times)
    wire.jb = jb
    wire.j = ps.map((p) => (p.t != null ? Math.floor(p.t / SECOND) - jb : -1))
  }
  if (ps.some((p) => p.g)) wire.h = ps.map((p) => (p.g ? (index.get(p.g) ?? -1) : -1))
  if (setup.cap != null) wire.x = setup.cap
  if (setup.min != null) wire.n = setup.min
  return wire
}

/** Compact wire object → SavedSetup (ids regenerated as `p0…pN`). */
export function fromWire(wire: WireSetup): SavedSetup {
  const sport = wire.sp != null ? sportDec(wire.sp) : 'football'
  const positions = getSportProfile(sport).positions

  const players = wire.p.map(([n, posRef, s], i) => {
    // New links: ordered index array (priority preserved). Legacy links: a
    // single number bitmask → decode in canonical vocabulary order.
    const p =
      typeof posRef === 'number'
        ? positions.filter((_, bit) => (posRef as number) & (1 << bit))
        : (posRef as number[]).map((idx) => positions[idx]).filter((r): r is string => r != null)
    const player: Player = s != null ? { id: `p${i}`, n, p, s } : { id: `p${i}`, n, p }
    const st = wire.r ? STATUS[wire.r[i]] : undefined
    if (st) player.st = st
    const j = wire.j?.[i]
    if (j != null && j >= 0 && wire.jb != null) player.t = (wire.jb + j) * SECOND
    const h = wire.h?.[i]
    if (h != null && h >= 0) player.g = `p${h}`
    return player
  })
  const fromIdx = (arr: number[]): string[] =>
    arr.map((i) => players[i]?.id).filter((id): id is string => id !== undefined)

  const setup: SavedSetup = { v: SCHEMA_VERSION, players }
  if (wire.sp != null) setup.sport = sportDec(wire.sp)
  if (wire.a) setup.avail = fromIdx(wire.a)
  if (wire.t) setup.teams = wire.t.map(fromIdx)
  if (wire.s) setup.starters = wire.s.map(fromIdx)
  if (wire.l) setup.lineup = wire.l.map(fromIdx)
  if (wire.k != null) setup.k = wire.k
  if (wire.f != null) setup.field = wire.f
  if (wire.u != null) setup.subs = wire.u
  if (wire.y != null) setup.style = styleDec(wire.y)
  if (wire.g) setup.styles = wire.g.map(styleDec)
  if (wire.m) setup.teamNames = wire.m
  if (wire.i) setup.title = wire.i
  if (wire.c != null) setup.createdAt = wire.c
  if (wire.b) setup.skillOn = true
  if (wire.o) setup.teamColors = wire.o
  if (wire.x != null) setup.cap = wire.x
  if (wire.n != null) setup.min = wire.n
  return setup
}
