// Wizard step registry (brief §6). M1 implements the combined Players step
// (name + positions). Later steps are placeholders, built in M2+.
import type { Dict } from '../i18n'

export interface StepDef {
  /** dictionary key for the step's display label */
  labelKey: keyof Dict
  /** false → shows a "coming soon" placeholder (built in M2+). */
  implemented: boolean
}

/** Minimum pool size before leaving the Players step. 3-a-side (two teams of
 *  three) is the smallest game worth balancing — below that a "team" is one or
 *  two players, so the formation shapes are degenerate and nobody needs a
 *  balancer anyway. */
export const MIN_PLAYERS = 6

export const STEPS: StepDef[] = [
  { labelKey: 'step.players', implemented: true },
  { labelKey: 'step.teams', implemented: true },
  { labelKey: 'step.formation', implemented: true },
  { labelKey: 'step.share', implemented: true },
]
