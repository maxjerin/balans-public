// Multi-select position chips (brief §6 step 2 — "Fast path: tap chips").
// Selected chips are coloured by SELECTION order — a green that fades with rank
// (darkest = primary, the player's top position). Deselecting one closes the
// ranks, so colours shift up automatically. Order drives formation slotting +
// starter choice (domain/formation, domain/balance).
import { useT } from '../i18n/useT'
import { positionLabelKey } from '../i18n'
import type { SportId } from '../domain/sport'

// Dark → light green ramp; index = priority rank (0 = primary). Max positions
// per sport is 4, so 4 tiers cover every case (last repeats as a safety net).
const PRIORITY = [
  { bg: '#065f46', ink: '#ffffff' }, // 1st — primary
  { bg: '#10b981', ink: '#ffffff' }, // 2nd
  { bg: '#6ee7b7', ink: '#053d2b' }, // 3rd
  { bg: '#d1fae5', ink: '#053d2b' }, // 4th
]

export function PositionChips({
  selected,
  positions,
  sport,
  onToggle,
}: {
  selected: string[]
  /** the active sport's role vocabulary, in canonical order */
  positions: string[]
  sport: SportId
  onToggle: (pos: string) => void
}) {
  const t = useT()
  return (
    <div className="flex shrink-0 flex-wrap justify-end gap-1">
      {positions.map((pos) => {
        const rank = selected.indexOf(pos)
        const on = rank !== -1
        const color = on ? PRIORITY[Math.min(rank, PRIORITY.length - 1)] : undefined
        return (
          <button
            key={pos}
            type="button"
            aria-pressed={on}
            title={on ? t('players.positionRank', { pos: t(positionLabelKey(sport, pos)), n: rank + 1 }) : undefined}
            onClick={() => onToggle(pos)}
            style={color ? { backgroundColor: color.bg, color: color.ink } : undefined}
            className={
              'rounded-full px-2 py-0.5 text-xs font-semibold transition ' +
              (on ? '' : 'bg-surface-2 text-muted hover:bg-surface-2')
            }
          >
            {t(positionLabelKey(sport, pos))}
          </button>
        )
      })}
    </div>
  )
}
