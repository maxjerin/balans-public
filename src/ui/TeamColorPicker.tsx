// Swatch row for choosing a team's preset colour. Used in the Teams and
// Formation step headers, beside TeamNameInput. Sets teamColors[ti] in the store.
import { useAppStore } from '../state/store'
import { useT } from '../i18n/useT'
import { PALETTE, colorIndex } from './teamColors'

export function TeamColorPicker({ ti }: { ti: number }) {
  const { setup, setTeamColor } = useAppStore()
  const t = useT()
  const active = colorIndex(setup, ti)
  return (
    <div className="flex shrink-0 items-center gap-1" role="group" aria-label={t('team.colorAria', { n: ti + 1 })}>
      {PALETTE.map((c, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => setTeamColor(ti, idx)}
          aria-label={t('team.colorSwatchAria', { n: idx + 1 })}
          aria-pressed={idx === active}
          className={
            'h-5 w-5 rounded-full border transition ' +
            (idx === active ? 'ring-2 ring-offset-1 ring-primary border-transparent' : 'border-line')
          }
          style={{ backgroundColor: c.fill }}
        />
      ))}
    </div>
  )
}
