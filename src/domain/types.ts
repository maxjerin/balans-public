// Domain model — mirrors PROJECT_BRIEF.md §5 & §13.
// Keys in the *serialized* schema (SavedSetup) are deliberately short because
// this object gets compressed into the share URL. Keep them stable & versioned.
import type { SportId } from './sport'

/** User picks a style, not exact numbers; formation is derived (brief §9). */
export type Style = 'def' | 'bal' | 'att'

/** Domain warnings are language-free CODES + data; the UI formats them with
 *  i18n (keeps the domain layer free of display strings). */
export type Warning =
  | { code: 'needTeams' }
  | { code: 'tooFewPlayers'; total: number; k: number }
  | { code: 'unevenSides'; highCount: number; highField: number; lowCount: number; lowField: number }
  | { code: 'fieldExceedsTarget'; target: number }
  | { code: 'keeperShortfall'; keepers: number; k: number }

export interface Player {
  /** short id */
  id: string
  /** name */
  n: string
  /** eligible role labels (>= 1), scoped to the setup's sport
   *  (see domain/sport.ts SportProfile.positions) */
  p: string[]
  /** optional skill 1..10, default 5 when unset (off by default in v1, brief §7.2) */
  s?: number
  /** sign-up status: 'm' maybe, 'o' out, 'n' no reply; absent ⇒ in (keeps the
   *  link lean when everyone's playing) */
  st?: 'm' | 'o' | 'n'
  /** epoch ms of the last STATUS change — ranks the waitlist and resolves
   *  organizer merges (newer wins). Absent ⇒ oldest. */
  t?: number
  /** host player id ⇒ this player is a guest (+1); absent ⇒ member */
  g?: string
}

/** Current schema version for the URL payload. Bump on breaking changes.
 *  v2 = compact wire format (index refs + short keys); v1 links still decode.
 *  v3 = adds optional `sport` (multi-sport Phase 1); v1/v2 links still decode
 *  and default to football.
 *  v4 = sign-up list: per-player status/time/host + optional cap/min. */
export const SCHEMA_VERSION = 4

/** The serializable setup — this is exactly what gets compressed into the link. */
export interface SavedSetup {
  /** schema version */
  v: number
  /** the pool */
  players: Player[]
  /** which sport this setup is for; absent ⇒ football (pre-multi-sport links) */
  sport?: SportId
  /** ids available this week (default: all) */
  avail?: string[]
  /** generated sides (ids) — optional snapshot */
  teams?: string[][]
  /** per-team starting lineup ids; rest of each team = subs */
  starters?: string[][]
  /** per-team ordered slot occupants for the current formation (manual pitch
   *  swaps). Order maps 1:1 to the derived shape's slots (GK, DEF…, MID…, FWD…).
   *  Absent ⇒ derive position-optimally from `starters` + style. */
  lineup?: string[][]
  /** number of teams (>= 2) */
  k?: number
  /** target on-field players per team */
  field?: number
  /** target substitutes per team */
  subs?: number
  /** global/default style (used when a team has no per-team override) */
  style?: Style
  /** per-team style overrides; index matches `teams` (brief §6.5 per-team) */
  styles?: Style[]
  /** per-team custom names; blank/absent ⇒ "Team N" */
  teamNames?: string[]
  /** per-team preset colour index into ui/teamColors PALETTE; 0/absent ⇒ default look */
  teamColors?: number[]
  /** optional setup name shown on the shared view + export; blank ⇒ date default */
  title?: string
  /** epoch ms when this setup was first generated; powers the title default +
   *  "created on" line. Optional — old links omit it. */
  createdAt?: number
  /** balance by player skill (Player.s) when true; absent/false ⇒ positional-only */
  skillOn?: boolean
  /** max confirmed players; extra `in` players form the waitlist. Absent ⇒ no cap */
  cap?: number
  /** players needed for the game to be on ("need N more"). Absent ⇒ none */
  min?: number
}
