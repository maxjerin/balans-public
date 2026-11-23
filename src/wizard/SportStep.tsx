// Step 0 gate (not a wizard-rail tab) — one-time sport choice shown before
// the wizard opens. Skipped when booted from a shared link, or when a sport
// was chosen before (both fold into store.sportChosen — see state/store.ts).
import { useAppStore } from '../state/store'
import { SPORT_PROFILES, type SportId } from '../domain/sport'
import { SPORT_ICON } from '../ui/sportIcon'
import { useT } from '../i18n/useT'
import type { Dict } from '../i18n'

const SPORT_ORDER: SportId[] = ['football', 'basketball', 'cricket', 'generic']

export function SportStep() {
  const chooseSport = useAppStore((s) => s.chooseSport)
  const t = useT()
  // Only sports actually implemented in this build's registry are offered.
  const available = SPORT_ORDER.filter((id) => SPORT_PROFILES[id])

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col gap-5 p-5">
      <div>
        <p className="text-2xl font-bold text-brand">{t('appName')}</p>
        <p className="text-sm text-muted">{t('tagline')}</p>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
          {t('sport.picker.eyebrow')}
        </p>
        <div className="flex flex-col gap-2">
          {available.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => chooseSport(id)}
              className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface p-3 text-left hover:bg-surface-2"
            >
              <span className="text-sm font-semibold text-ink">
                {SPORT_ICON[id] ?? ''} {t(`sport.${id}.label` as keyof Dict)}
              </span>
              <span className="shrink-0 text-xs text-faint">
                {t(`sport.${id}.caption` as keyof Dict)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
