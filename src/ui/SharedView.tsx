// Read-only view shown when the app is opened from a shared link. A single clean
// page — title, formation board, copy/share — with no wizard editing. "Edit a
// copy" forks into the wizard so the original link stays canonical.
import { useAppStore } from '../state/store'
import { useT } from '../i18n/useT'
import { LanguagePicker } from './LanguagePicker'
import { ThemeToggle } from './ThemeToggle'
import { ResultBoard } from './ResultBoard'
import { CopyButton } from './CopyButton'
import { formatExport } from '../share/exportText'
import { encodeSetup } from '../share/url'
import { setupTitle } from '../share/setupTitle'
import { contentPath } from '../i18n/contentPath'
import { BuildTag } from './BuildTag'

export function SharedView({ onPrivacy }: { onPrivacy?: () => void }) {
  const setup = useAppStore((s) => s.setup)
  const remix = useAppStore((s) => s.remix)
  const reset = useAppStore((s) => s.reset)
  const lang = useAppStore((s) => s.lang)
  const t = useT()

  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}#${encodeSetup(setup)}`
      : ''
  const text = formatExport(setup, t, url)
  const teamLabel = (i: number) => setup.teamNames?.[i]?.trim() || t('team.namePlaceholder', { n: i + 1 })
  // Title already carries the date+year, so no separate "created on" line.
  const title = setupTitle(setup, lang, teamLabel, t('view.untitled'))

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col gap-5 p-5">
      <header className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand">{t('appName')}</h1>
        <div className="flex shrink-0 items-center gap-2">
          <LanguagePicker />
          <ThemeToggle />
        </div>
      </header>

      <div>
        <span className="inline-block rounded-pill bg-accent-soft px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-accent-ink">
          {t('view.sharedBadge')}
        </span>
        <h2 className="mt-2 text-xl font-bold text-ink">{title}</h2>
      </div>

      {/* Make it unmistakable that the preview is view-only: recipients can
          explore formations but not change the teams — to make a different
          version they "Edit these teams" into their own link (below). */}
      <p className="rounded-md border border-line bg-surface-2 px-3 py-2 text-xs text-muted">
        {t('view.previewNotice')}
      </p>

      <ResultBoard setup={setup} allowStyle />

      {/* Share link */}
      <div className="flex flex-col gap-2 rounded-md border border-line p-3">
        <span className="text-sm font-medium text-ink">{t('share.linkLabel')}</span>
        <p className="truncate text-xs text-faint">{url}</p>
        <div>
          <CopyButton label={t('share.copyLink')} text={url} />
        </div>
      </div>

      {/* Text for WhatsApp / group chat */}
      <div className="flex flex-col gap-2 rounded-md border border-line p-3">
        <span className="text-sm font-medium text-ink">{t('share.textLabel')}</span>
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded bg-surface-2 p-2 text-xs text-ink">
          {text}
        </pre>
        <div>
          <CopyButton label={t('share.copyText')} text={text} />
        </div>
      </div>

      {/* Two clearly-separated recipient actions so nobody has to guess:
          "Edit these teams" keeps the sender's roster (for the group);
          "Make your own" wipes to a blank squad (for a new user / growth loop). */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-dashed border-line p-3">
          <button
            type="button"
            onClick={remix}
            className="tap-target rounded-md border border-primary px-3 py-2 text-sm font-medium text-brand hover:bg-primary-soft"
          >
            {t('view.remix')}
          </button>
          <p className="mt-2 text-xs text-faint">{t('view.remixHint')}</p>
        </div>
        <div className="rounded-md border border-dashed border-line p-3">
          <button
            type="button"
            onClick={reset}
            className="tap-target rounded-md border border-line px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2"
          >
            {t('view.makeOwn')}
          </button>
          <p className="mt-2 text-xs text-faint">{t('view.makeOwnHint')}</p>
        </div>
      </div>

      <p className="text-center text-xs text-faint">
        {t('footerPrivacy')}
        {onPrivacy && (
          <>
            {' · '}
            <button type="button" onClick={onPrivacy} className="underline hover:text-muted hover:no-underline">
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
