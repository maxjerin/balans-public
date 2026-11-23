// Dev-only fixture: a 14-player squad for fast manual testing (no need to
// re-enter players each session). Loaded via a button shown only when
// import.meta.env.DEV is true — never ships in the production bundle's UI.
import { SCHEMA_VERSION, type Player, type SavedSetup } from '../domain/types'

const SQUAD: Array<[string, Player['p']]> = [
  ['jerin', ['GK', 'DEF', 'MID', 'FWD']],
  ['sherry', ['GK', 'DEF']],
  ['jayesh', ['DEF', 'MID']],
  ['albin', ['DEF', 'MID', 'FWD']],
  ['noble', ['GK', 'DEF', 'MID', 'FWD']],
  ['sibu', ['DEF', 'MID', 'FWD']],
  ['mevin', ['GK', 'DEF', 'MID', 'FWD']],
  ['ray', ['GK', 'FWD']],
  ['rich', ['MID', 'FWD']],
  ['john', ['GK', 'DEF', 'MID', 'FWD']],
  ['jebu', ['GK', 'DEF']],
  ['Levin', ['GK', 'MID', 'FWD']],
  ['motty', ['DEF', 'MID', 'FWD']],
  ['alphin', ['GK', 'DEF', 'MID', 'FWD']],
]

export function sampleSquad(): SavedSetup {
  return {
    v: SCHEMA_VERSION,
    players: SQUAD.map(([n, p], i) => ({ id: `s${i + 1}`, n, p })),
  }
}
