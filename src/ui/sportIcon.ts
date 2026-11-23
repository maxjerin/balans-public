// Single source of the sport emoji used both on the sport picker
// (SportStep) and the in-wizard switch-sport button — one vocabulary,
// not two icon sets drifting independently as sports are added.
import type { SportId } from '../domain/sport'

export const SPORT_ICON: Partial<Record<SportId, string>> = {
  football: '⚽',
  basketball: '🏀',
  cricket: '🏏',
  generic: '🎯',
}
