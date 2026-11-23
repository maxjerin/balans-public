// k-way balancer (brief §7.2-7.3). Positional-only in v1 (skill is off by
// default). Two stages: (1) partition the roster into k team-rosters of the
// layout sizes, spreading the sport's scarce role (if any) and balancing
// position coverage via a greedy seed + hill-climb; (2) pick a positionally-
// diverse starting lineup per team, the rest become subs. Fully deterministic
// for a given seed (re-shuffle = new seed).
import type { Player, Warning } from './types'
import type { LayoutResult } from './layout'

export interface Team {
  /** all player ids on the team */
  players: string[]
  /** on-field subset (size = layout field count); rest of `players` = subs */
  starters: string[]
}

export interface BalanceResult {
  teams: Team[]
  warnings: Warning[]
}

export interface BalanceOptions {
  /** every role in play for this sport, used for variance balancing. */
  positions: string[]
  /** the one role a team can't function without, if any. Undefined ⇒ no
   *  scarcity guarantee/warning (e.g. basketball's G/F/C, generic's []). */
  scarceRole?: string
  /** balance total team skill (Player.s, default 3) as a secondary objective. */
  balanceSkill?: boolean
}

const FOOTBALL_DEFAULT: BalanceOptions = { positions: ['GK', 'DEF', 'MID', 'FWD'], scarceRole: 'GK' }

// Small deterministic PRNG so the same seed reproduces a split.
function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Secondary-objective weight: keeps position coverage primary while nudging
// team skill totals together. Tuned so an exact skill split is reachable
// without overriding position spread.
const SKILL_WEIGHT = 0.5

const skillOf = (p: Player): number => p.s ?? 5

/** Cost of a partition: heavily penalize scarce-role-less teams (if the sport
 *  has one), then minimize the spread of each position's coverage across
 *  teams, and (when balanceSkill) the spread of total team skill. Lower is
 *  better. */
function cost(
  groups: Player[][],
  positions: string[],
  scarceRole: string | undefined,
  scarceCount: number,
  k: number,
  balanceSkill: boolean,
): number {
  let c = 0
  if (scarceRole != null && scarceCount >= k) {
    for (const g of groups) {
      if (!g.some((p) => p.p.includes(scarceRole))) c += 1000
    }
  }
  for (const pos of positions) {
    const counts = groups.map((g) => g.filter((p) => p.p.includes(pos)).length)
    const mean = counts.reduce((a, b) => a + b, 0) / k
    c += counts.reduce((a, n) => a + (n - mean) ** 2, 0)
  }
  if (balanceSkill) {
    const totals = groups.map((g) => g.reduce((s, p) => s + skillOf(p), 0))
    const mean = totals.reduce((a, b) => a + b, 0) / k
    c += SKILL_WEIGHT * totals.reduce((a, n) => a + (n - mean) ** 2, 0)
  }
  return c
}

function partition(
  players: Player[],
  sizes: number[],
  positions: string[],
  scarceRole: string | undefined,
  rnd: () => number,
  balanceSkill: boolean,
): Player[][] {
  const k = sizes.length
  const groups: Player[][] = Array.from({ length: k }, () => [])
  const remaining = sizes.slice()

  // Seed the scarce role (if any) round-robin so it spreads across teams.
  const isScarce = (p: Player) => scarceRole != null && p.p.includes(scarceRole)
  const keepers = shuffle(players.filter(isScarce), rnd)
  const others = shuffle(players.filter((p) => !isScarce(p)), rnd)

  let t = 0
  const place = (p: Player) => {
    // advance to the next team with capacity
    let guard = 0
    while (remaining[t] === 0 && guard++ < k) t = (t + 1) % k
    groups[t].push(p)
    remaining[t]--
    t = (t + 1) % k
  }
  keepers.forEach(place)
  others.forEach(place)

  // Hill-climb: swap pairs across teams to reduce cost (sizes are preserved).
  const keeperCount = keepers.length
  let best = cost(groups, positions, scarceRole, keeperCount, k, balanceSkill)
  for (let iter = 0; iter < 400; iter++) {
    const a = Math.floor(rnd() * k)
    const b = Math.floor(rnd() * k)
    if (a === b || groups[a].length === 0 || groups[b].length === 0) continue
    const i = Math.floor(rnd() * groups[a].length)
    const j = Math.floor(rnd() * groups[b].length)
    ;[groups[a][i], groups[b][j]] = [groups[b][j], groups[a][i]]
    const next = cost(groups, positions, scarceRole, keeperCount, k, balanceSkill)
    if (next < best) best = next
    else [groups[a][i], groups[b][j]] = [groups[b][j], groups[a][i]] // revert
  }
  return groups
}

/** Pick `field` starters for a team: the scarce role first (a specialist if
 *  possible, when the sport has one), then fill by cycling the remaining
 *  positions for spread; rest become subs. */
export function pickStarters(
  team: Player[],
  field: number,
  positions: string[],
  scarceRole?: string,
): string[] {
  const used = new Set<string>()
  const starters: string[] = []

  const take = (p: Player | undefined) => {
    if (!p || used.has(p.id) || starters.length >= field) return
    used.add(p.id)
    starters.push(p.id)
  }

  // Scarce role: prefer the narrowest profile (a dedicated specialist) to
  // free others up.
  if (scarceRole != null) {
    const specialists = team
      .filter((p) => p.p.includes(scarceRole))
      .sort((a, b) => a.p.length - b.p.length)
    take(specialists[0])
  }

  // Fill remaining slots cycling the other positions, narrowest profile first.
  const cyclePositions = scarceRole != null ? positions.filter((pos) => pos !== scarceRole) : positions
  if (cyclePositions.length > 0) {
    let guard = 0
    while (starters.length < field && guard < cyclePositions.length * team.length + 1) {
      const pos = cyclePositions[guard % cyclePositions.length]
      const cand = team
        .filter((p) => !used.has(p.id) && p.p.includes(pos))
        // players who rank this position higher (primary first), then narrowest
        .sort((a, b) => a.p.indexOf(pos) - b.p.indexOf(pos) || a.p.length - b.p.length)
      take(cand[0])
      guard++
    }
  }

  // Backfill with anyone left if positions ran out.
  for (const p of team) take(p)

  return starters
}

/**
 * @param players available roster
 * @param layout  result of computeLayout (sizes + field/subs per team)
 * @param seed    PRNG seed; change it to re-shuffle
 * @param options sport's positions + optional scarce role; defaults to
 *   football's { positions: [GK,DEF,MID,FWD], scarceRole: 'GK' } when omitted.
 */
export function generateTeams(
  players: Player[],
  layout: LayoutResult,
  seed: number,
  options: BalanceOptions = FOOTBALL_DEFAULT,
): BalanceResult {
  const { positions, scarceRole, balanceSkill = false } = options
  const warnings: Warning[] = []
  if (!layout.feasible) return { teams: [], warnings: layout.warnings }

  const rnd = mulberry32(seed)
  const sizes = layout.teams.map((t) => t.size)
  const k = sizes.length

  const groups = partition(players, sizes, positions, scarceRole, rnd, balanceSkill)

  if (scarceRole != null) {
    const scarceCount = players.filter((p) => p.p.includes(scarceRole)).length
    if (scarceCount < k) {
      warnings.push({ code: 'keeperShortfall', keepers: scarceCount, k })
    }
  }

  const teams: Team[] = groups.map((g, i) => ({
    players: g.map((p) => p.id),
    starters: pickStarters(g, layout.teams[i].field, positions, scarceRole),
  }))

  return { teams, warnings }
}
