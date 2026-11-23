// Step 4 — share & remix (brief §6.6, §8). The URL already carries the whole
// setup in its fragment (never sent to a server). Name it, copy the link, copy a
// chat-friendly text version, or start a new week.
import { useAppStore } from '../state/store'
import { formatExport } from '../share/exportText'
import { encodeSetup } from '../share/url'
import { setupTitle } from '../share/setupTitle'
import { useT } from '../i18n/useT'
import { ResultBoard } from '../ui/ResultBoard'
import { CopyButton } from '../ui/CopyButton'

// Links longer than this hint the payload is getting heavy (brief §8); we warn
// rather than silently adding a server shortener (that would break no-server).
const LONG_URL = 1800

export function ShareStep() {
  const { setup, newWeek, setTitle, lang, showShared } = useAppStore()
  const t = useT()
  // Build the link from the current setup directly — the location hash is only
  // rewritten on a state change, so reading location.href can miss state when
  // the app was opened fresh from the local cache.
  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}#${encodeSetup(setup)}`
      : ''
  const text = formatExport(setup, t, url)
  const generated = !!setup.teams?.length
  const teamLabel = (i: number) => setup.teamNames?.[i]?.trim() || t('team.namePlaceholder', { n: i + 1 })
  // Pre-fill the field with the matchup+date default so it reads as a real name
  // (not a faint placeholder). Not persisted — stays computed unless edited.
  const titleDefault = setupTitle({ ...setup, title: undefined }, lang, teamLabel, '')

  return (
    <div className="flex flex-col gap-4">
      {/* Lock reassurance up top — the shared link is immutable (recipients
          preview + explore formations, but can't change the teams). This is the
          thing that stops the "screenshot instead of link" workaround. Privacy
          (no account/server) already lives in the page footer, so it's not
          repeated here. */}
      <p className="flex items-start gap-2 rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-muted">
        <svg viewBox="0 0 20 20" aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="4.5" y="9" width="11" height="7.5" rx="1.5" />
          <path d="M7 9V6.5a3 3 0 0 1 6 0V9" strokeLinecap="round" />
        </svg>
        <span>{t('share.intro')}</span>
      </p>

      {/* Setup name */}
      {generated && (
        <div className="flex flex-col gap-1">
          <label htmlFor="setup-title" className="text-sm font-medium text-ink">
            {t('title.label')}
          </label>
          <input
            id="setup-title"
            value={setup.title ?? titleDefault}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('title.placeholder')}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-primary focus:outline-none"
          />
        </div>
      )}

      {/* Nothing is shareable until teams exist — no players, no link, no text.
          Guards a direct hop here (e.g. via the step rail) from emitting an
          empty setup link. */}
      {!generated && <p className="text-sm text-warn">{t('share.noTeams')}</p>}

      {generated && (
        <>
          {/* Copy link */}
          <div className="flex flex-col gap-2 rounded-md border border-line p-3">
            <span className="text-sm font-medium text-ink">{t('share.linkLabel')}</span>
            <p className="truncate text-xs text-faint">{url}</p>
            <div>
              {/* Copying the link drops into the read-only shareable view. */}
              <CopyButton label={t('share.copyLink')} text={url} onCopied={showShared} />
            </div>
            {url.length > LONG_URL && (
              <p className="text-xs text-warn">{t('share.longUrl', { n: url.length })}</p>
            )}
          </div>

          {/* Formation view */}
          <ResultBoard setup={setup} />

          {/* Plain-text export */}
          <div className="flex flex-col gap-2 rounded-md border border-line p-3">
            <span className="text-sm font-medium text-ink">{t('share.textLabel')}</span>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded bg-surface-2 p-2 text-xs text-ink">
              {text}
            </pre>
            <div>
              <CopyButton label={t('share.copyText')} text={text} />
            </div>
          </div>
        </>
      )}

      {/* Remix */}
      <div className="rounded-md border border-dashed border-line p-3">
        <p className="text-sm text-muted">{t('share.remixIntro')}</p>
        <button
          type="button"
          onClick={newWeek}
          className="mt-2 rounded-md border border-primary px-3 py-2 text-sm font-medium text-brand hover:bg-primary-soft"
        >
          {t('share.newWeek')}
        </button>
      </div>
    </div>
  )
}
