// Wizard shell (brief §6): step rail + body + back/next nav. Free movement back;
// forward is gated per step. State persists to the URL on every change.
import { useAppStore } from '../state/store'
import { STEPS, MIN_PLAYERS } from './steps'
import { confirmedIds } from '../domain/signup'
import { PlayersStep } from './PlayersStep'
import { TeamsStep } from './TeamsStep'
import { FormationStep } from './FormationStep'
import { ShareStep } from './ShareStep'
import { ThemeToggle } from '../ui/ThemeToggle'
import { LanguagePicker } from '../ui/LanguagePicker'
import { SPORT_ICON } from '../ui/sportIcon'
import { useT } from '../i18n/useT'
import { contentPath } from '../i18n/contentPath'
import { BuildTag } from '../ui/BuildTag'

function StepBody({ step }: { step: number }) {
  const t = useT()
  switch (step) {
    case 0:
      return <PlayersStep />
    case 1:
      return <TeamsStep />
    case 2:
      return <FormationStep />
    case 3:
      return <ShareStep />
    default:
      return (
        <p className="text-sm text-faint">
          {t('comingSoon', { label: t(STEPS[step].labelKey) })}
        </p>
      )
  }
}

export function Wizard({ onPrivacy, bottomInset }: { onPrivacy?: () => void; bottomInset?: boolean }) {
  const { setup, step, goTo, fromLink, switchSport } = useAppStore()
  const lang = useAppStore((s) => s.lang)
  const t = useT()
  const atFirst = step === 0
  const atLast = step === STEPS.length - 1

  // Forward gates. Step 0 (Players) needs a minimum-size pool; step 1 (Teams)
  // needs teams generated before moving on to Formation.
  // Only confirmed players (not maybes / waitlist) make the teams.
  const shortBy = MIN_PLAYERS - confirmedIds(setup).length
  const hasPlayers = shortBy <= 0
  const hasTeams = !!setup.teams?.length
  const blockedPlayers = step === 0 && !hasPlayers
  const blockedTeams = step === 1 && !hasTeams
  const blocked = blockedPlayers || blockedTeams
  // Furthest step the rail may jump to: Teams needs a full pool, Formation +
  // Share need teams generated. Stops anyone tab-hopping to Share with no
  // players and generating an empty link.
  const maxReachable = !hasPlayers ? 0 : !hasTeams ? 1 : STEPS.length - 1
  const blockHint = blockedPlayers
    ? t('addToContinue', {
        n: shortBy,
        unit: shortBy === 1 ? t('player') : t('players'),
        min: MIN_PLAYERS,
      })
    : blockedTeams
      ? t('teams.needGenerate')
      : false

  return (
    <main className={'mx-auto flex min-h-full max-w-md flex-col gap-5 p-5' + (bottomInset ? ' pb-28' : '')}>
      <header className="flex items-start justify-between gap-3">
        <div>
          {/* Wordmark = home: jump to the first step. Non-destructive — keeps the
              roster; it's navigation, not a reset. (SharedView keeps this inert
              so recipients aren't nudged into building their own roster.) */}
          <button
            type="button"
            onClick={() => goTo(0)}
            aria-label={`${t('appName')} — ${t('home.aria')}`}
            className="rounded text-left text-2xl font-bold text-brand hover:opacity-80"
          >
            {t('appName')}
          </button>
          <p className="text-sm text-muted">{t('tagline')}</p>
          {fromLink && (
            <p className="mt-1 text-xs text-brand">{t('fromLink')}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={switchSport}
            aria-label={t('sport.switch.aria')}
            title={t('sport.switch.aria')}
            className="tap-target flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs font-medium text-muted hover:border-primary hover:text-ink hover:bg-surface-2"
          >
            <span aria-hidden="true">{SPORT_ICON[setup.sport ?? 'football']}</span>
            {t('sport.switch')}
          </button>
          <LanguagePicker />
          <ThemeToggle />
        </div>
      </header>

      {/* Step rail */}
      <nav aria-label={t('wizard.stepsAria')} className="flex gap-1">
        {STEPS.map((s, i) => {
          const locked = i > maxReachable
          return (
            <button
              key={s.labelKey}
              type="button"
              onClick={() => goTo(i)}
              disabled={locked}
              aria-current={i === step ? 'step' : undefined}
              className={
                'flex-1 rounded py-1 text-[11px] font-medium transition ' +
                (i === step
                  ? 'bg-primary text-primary-ink'
                  : 'bg-surface-2 text-muted hover:bg-surface-2') +
                (locked ? ' cursor-not-allowed opacity-40 hover:bg-surface-2' : '')
              }
            >
              {t(s.labelKey)}
            </button>
          )
        })}
      </nav>

      <section className="flex-1">
        <h2 className="mb-3 text-lg font-semibold text-ink">
          {step + 1}. {t(STEPS[step].labelKey)}
        </h2>
        <StepBody step={step} />
      </section>

      <footer className="flex flex-col gap-2 border-t border-line pt-4">
        {blockHint && <p className="text-center text-xs text-warn">{blockHint}</p>}
        <div className="flex items-center justify-between gap-3">
          {/* No Back on the first step. */}
          {!atFirst && (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              className="tap-target rounded-md px-4 py-2 text-sm font-medium text-muted hover:bg-surface-2"
            >
              {t('back')}
            </button>
          )}
          {/* No Next on the last step — Share is the end of the flow. */}
          {!atLast && (
            <button
              type="button"
              onClick={() => goTo(step + 1)}
              disabled={blocked}
              className="tap-target ml-auto rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-ink hover:bg-primary-press disabled:opacity-40"
            >
              {t('next')}
            </button>
          )}
        </div>
      </footer>

      <p className="text-center text-xs text-faint">
        {t('footerPrivacy')}
        {onPrivacy && (
          <>
            {' · '}
            <button
              type="button"
              onClick={onPrivacy}
              className="underline hover:text-muted hover:no-underline"
            >
              {t('privacy.footerLink')}
            </button>
          </>
        )}
        {' · '}
        <a href={contentPath('about', lang)} className="underline hover:text-muted hover:no-underline">
          {t('about.link')}
        </a>
        {' · '}
        <a href={contentPath('help', lang)} className="underline hover:text-muted hover:no-underline">
          {t('help.link')}
        </a>
        {' · '}
        <BuildTag />
      </p>
    </main>
  )
}
