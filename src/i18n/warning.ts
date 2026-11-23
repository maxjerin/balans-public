// Format a language-free domain Warning into a localized string. Keeps the
// domain layer free of display strings (the warning carries codes + data).
import type { Warning } from '../domain/types'
import type { Dict } from './index'

type T = (key: keyof Dict, params?: Record<string, string | number>) => string

export function warningText(t: T, w: Warning): string {
  switch (w.code) {
    case 'needTeams':
      return t('warn.needTeams')
    case 'tooFewPlayers':
      return t('warn.tooFewPlayers', { total: w.total, k: w.k })
    case 'unevenSides':
      return t('warn.unevenSides', {
        highCount: w.highCount,
        highField: w.highField,
        lowCount: w.lowCount,
        lowField: w.lowField,
      })
    case 'fieldExceedsTarget':
      return t('warn.fieldExceedsTarget', { target: w.target })
    case 'keeperShortfall':
      return t('warn.keeperShortfall', { keepers: w.keepers, k: w.k })
  }
}
