// Step 1 — build the pool (brief §6.1-6.2 combined). Each row holds the name,
// the eligible-position chips (multi-select), and a remove (×) — all together.
import { useState } from 'react'
import { useAppStore } from '../state/store'
import { PositionChips } from '../ui/PositionChips'
import { sampleSquad } from '../dev/sampleSquad'
import { useT } from '../i18n/useT'
import { getSportProfile } from '../domain/sport'
import { rankList, statusOf, withGuestsUnderHosts, type Status } from '../domain/signup'
import type { Player } from '../domain/types'
import { formatList, listSummary } from '../share/exportText'
import { encodeSetup } from '../share/url'
import { CopyButton } from '../ui/CopyButton'

// Skill volume-bar fill — the emerald from the position-priority palette
// (ui/PositionChips), keeping the step's greens consistent.
const SKILL_FILL = '#10b981'

export function PlayersStep() {
  const { setup, addFromText, reset, setSetup, setSkillOn } = useAppStore()
  const t = useT()
  const [draft, setDraft] = useState('')
  const profile = getSportProfile(setup.sport)

  const commit = () => {
    if (!draft.trim()) return
    addFromText(draft)
    setDraft('')
  }

  // The fixture squad is football-tagged (GK/DEF/MID/FWD) and carries no
  // `sport` of its own — loading it wholesale would silently revert the
  // active sport to football (getSportProfile(undefined) defaults there)
  // while showing football tags under whatever sport you're actually
  // testing. Keep the current sport, and drop the tags when it isn't
  // football (they're meaningless outside it) — still a fast way to bulk-add
  // named players for any sport.
  const loadTestSquad = () => {
    const squad = sampleSquad()
    const players = profile.id === 'football' ? squad.players : squad.players.map((p) => ({ ...p, p: [] }))
    setSetup({ ...squad, sport: setup.sport, players })
  }

  const multiline = draft.includes('\n')
  const ranked = rankList(setup)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="add-players" className="mb-1 block text-sm font-medium text-ink">
          {t('players.addLabel')}
        </label>
        <textarea
          id="add-players"
          rows={multiline ? 4 : 1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !multiline) {
              e.preventDefault()
              commit()
            }
          }}
          placeholder={t('players.placeholder')}
          className="w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-primary focus:outline-none"
          aria-describedby="add-players-hint"
        />
        <p id="add-players-hint" className="mt-1 text-xs text-muted">
          {t('players.hint')}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={commit}
            disabled={!draft.trim()}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-ink hover:bg-primary-press disabled:opacity-40"
          >
            {multiline ? t('players.addAll') : t('players.add')}
          </button>
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={loadTestSquad}
              className="rounded-md border border-dashed border-line px-3 py-2 text-xs font-medium text-muted hover:bg-surface-2"
            >
              {t('players.loadTestSquad')}
            </button>
          )}
        </div>
      </div>

      <label className="flex items-center justify-between rounded-md border border-line px-3 py-2">
        <span className="text-sm text-ink">{t('players.skillToggle')}</span>
        <input
          type="checkbox"
          checked={setup.skillOn === true}
          onChange={(e) => setSkillOn(e.target.checked)}
          className="tap-target h-5 w-5 accent-primary"
          aria-label={t('players.skillToggle')}
        />
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm text-muted">
            {t('list.heading')} —{' '}
            <span className="font-semibold text-ink">{listSummary(ranked, setup, t)}</span>
          </p>
          {setup.players.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm(t('players.clearConfirm'))) reset()
              }}
              className="rounded px-2 py-1 text-xs font-medium text-faint hover:bg-warn-soft hover:text-warn"
            >
              {t('players.clear')}
            </button>
          )}
        </div>
        <LimitsRow />
        {setup.players.length === 0 ? (
          <p className="text-sm text-faint">{t('players.empty')}</p>
        ) : (
          <>
            {/* Explain the priority colours once, above the list. */}
            {profile.positionsEnabled && (
              <p className="mb-2 text-xs text-muted">{t('players.positionHint')}</p>
            )}
            <Section
              tone="in"
              title={t('list.confirmed')}
              players={withGuestsUnderHosts(ranked.confirmed)}
              numberFrom={1}
            />
            <Section
              tone="wait"
              title={t('list.waitlist')}
              players={ranked.waitlist}
              numberFrom={ranked.confirmed.length + 1}
            />
            <Section tone="maybe" title={t('list.maybe')} players={ranked.maybe} />
            <Section tone="none" title={t('list.none')} players={ranked.none} />
            {ranked.out.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted">
                  {t('list.out')} ({ranked.out.length})
                </summary>
                <Section tone="out" players={ranked.out} />
              </details>
            )}
          </>
        )}
      </div>

      {setup.players.length > 0 && <ShareListCard />}
    </div>
  )
}

// One section of the sign-up list (Playing / Waitlist / Maybe / …). Hidden when
// empty; numbered when it's part of the ranked order.
// Each section has a tone so in / waitlist / maybe / no-reply / out read apart at
// a glance: a dot on the heading, a coloured left edge + tint on every card.
type Tone = 'in' | 'wait' | 'maybe' | 'none' | 'out'

const TONE: Record<Tone, { dot: string; card: string }> = {
  in: { dot: 'bg-primary', card: 'border-l-primary bg-surface' },
  wait: { dot: 'border border-dashed border-muted', card: 'border-dashed border-l-muted bg-surface' },
  maybe: { dot: 'bg-maybe', card: 'border-l-maybe bg-maybe-soft' },
  none: { dot: 'border border-faint', card: 'border-l-line bg-surface' },
  out: { dot: 'bg-faint', card: 'border-l-faint bg-surface-2 opacity-70' },
}

function Section({
  tone,
  title,
  players,
  numberFrom,
}: {
  tone: Tone
  title?: string
  players: Player[]
  numberFrom?: number
}) {
  if (!players.length) return null
  return (
    <section className="mt-4">
      {title && (
        <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
          <span aria-hidden="true" className={'inline-block h-2.5 w-2.5 rounded-full ' + TONE[tone].dot} />
          {title} ({players.length})
        </h3>
      )}
      <ul className="flex flex-col gap-2">
        {players.map((p, i) => (
          <PlayerRow
            key={p.id}
            player={p}
            tone={tone}
            nested={!!p.g && players.some((x) => x.id === p.g)}
            number={numberFrom != null ? numberFrom + i : undefined}
          />
        ))}
      </ul>
    </section>
  )
}

// Selected status = solid fill, so the current choice is obvious at arm's length.
const STATUS_STYLE: Record<Exclude<Status, 'none'>, string> = {
  in: 'bg-primary text-primary-ink',
  maybe: 'bg-maybe text-maybe-ink',
  out: 'bg-muted text-surface',
}

// Compact in / maybe / out segmented control. "No reply" is the absence of a
// choice (set by "start a new week"), so it has no button of its own.
function StatusControl({ player }: { player: Player }) {
  const setStatus = useAppStore((s) => s.setStatus)
  const t = useT()
  const current = statusOf(player)
  const options: [Exclude<Status, 'none'>, string][] = [
    ['in', t('list.statusIn')],
    ['maybe', t('list.statusMaybe')],
    ['out', t('list.statusOut')],
  ]
  return (
    <div role="group" className="flex shrink-0 overflow-hidden rounded-md border border-line text-xs">
      {options.map(([st, label]) => (
        <button
          key={st}
          type="button"
          aria-pressed={current === st}
          aria-label={t('list.statusAria', { name: player.n, status: label })}
          onClick={() => setStatus(player.id, st)}
          className={
            'tap-target border-l border-line px-2 py-1 font-medium first:border-l-0 ' +
            (current === st ? STATUS_STYLE[st] : 'text-faint hover:bg-surface-2')
          }
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function PlayerRow({
  player: p,
  number,
  tone,
  nested,
}: {
  player: Player
  number?: number
  tone: Tone
  /** shown directly under their host (same section) → indent + violet edge */
  nested: boolean
}) {
  const { setup, removePlayer, renamePlayer, togglePosition, setSkill, addGuest } = useAppStore()
  const t = useT()
  const profile = getSportProfile(setup.sport)
  const [guestDraft, setGuestDraft] = useState<string | null>(null)
  const hostName = p.g ? setup.players.find((x) => x.id === p.g)?.n : undefined

  const commitGuest = () => {
    if (guestDraft?.trim()) addGuest(p.id, guestDraft)
    setGuestDraft(null)
  }

  return (
    // A guest listed under their host sits indented with a violet edge; elsewhere
    // (maybe / out / waitlist) they take the section's look plus the guest tag.
    <li
      className={
        'rounded-md border border-l-4 border-line p-2.5 ' +
        TONE[tone].card +
        (nested ? ' ml-6 !border-l-guest' : '')
      }
    >
      <div className="flex items-center gap-2">
        {number != null && <span className="w-5 shrink-0 text-right text-xs tabular-nums text-faint">{number}.</span>}
        <input
          value={p.n}
          onChange={(e) => renamePlayer(p.id, e.target.value)}
          aria-label={t('players.nameAria', { name: p.n })}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink focus:outline-none"
        />
        {p.g && (
          <span className="shrink-0 rounded-pill bg-guest-soft px-2 py-0.5 text-xs font-semibold text-guest">
            {hostName ? t('list.guestWith', { name: hostName }) : t('list.guestLabel')}
          </span>
        )}
        {!p.g && (
          <button
            type="button"
            onClick={() => setGuestDraft(guestDraft == null ? '' : null)}
            aria-label={t('list.addGuestAria', { name: p.n })}
            title={t('list.addGuestAria', { name: p.n })}
            className="shrink-0 rounded-pill border border-dashed border-muted px-2 py-0.5 text-xs font-medium text-muted hover:border-guest hover:text-guest"
          >
            {t('list.addGuest')}
          </button>
        )}
        <button
          type="button"
          onClick={() => removePlayer(p.id)}
          aria-label={t('players.removeAria', { name: p.n })}
          title={t('players.removeAria', { name: p.n })}
          className="shrink-0 rounded p-1 text-faint hover:bg-warn-soft hover:text-warn"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <StatusControl player={p} />
        {profile.positionsEnabled && (
          <PositionChips
            selected={p.p}
            positions={profile.positions}
            sport={profile.id}
            onToggle={(pos) => togglePosition(p.id, pos)}
          />
        )}
      </div>
      {guestDraft != null && (
        <div className="mt-2 flex gap-2">
          <input
            autoFocus
            value={guestDraft}
            onChange={(e) => setGuestDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitGuest()
              if (e.key === 'Escape') setGuestDraft(null)
            }}
            placeholder={t('list.guestPlaceholder')}
            aria-label={t('list.addGuestAria', { name: p.n })}
            className="min-w-0 flex-1 rounded-md border border-line bg-surface px-2 py-1 text-sm text-ink placeholder:text-faint focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={commitGuest}
            disabled={!guestDraft.trim()}
            className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-ink hover:bg-primary-press disabled:opacity-40"
          >
            {t('players.add')}
          </button>
        </div>
      )}
      {setup.skillOn &&
        (() => {
          const v = p.s ?? 5
          return (
            <div className="mt-2 border-t border-line pt-2">
              {/* value rides on the label so the 1–10 range is obvious */}
              <span className="text-xs text-muted">
                {t('players.skillLabel')} · <span className="font-semibold text-ink tabular-nums">{v}</span> / 10
              </span>
              {/* − and + flank a compact volume bar. Filled segments use
                  a palette blue; empty outlines up to 10 show the max.
                  Each segment is tappable to set the value directly. */}
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  aria-label={t('players.skillDown', { name: p.n })}
                  onClick={() => setSkill(p.id, v - 1)}
                  disabled={v <= 1}
                  className="h-5 w-5 shrink-0 rounded border border-line text-xs text-muted hover:bg-surface-2 disabled:opacity-30"
                >
                  −
                </button>
                <div className="flex flex-1 gap-0.5">
                  {Array.from({ length: 10 }, (_, i) => {
                    const n = i + 1
                    const filled = n <= v
                    return (
                      <button
                        key={n}
                        type="button"
                        aria-label={t('players.skillSet', { name: p.n, n })}
                        onClick={() => setSkill(p.id, n)}
                        style={filled ? { backgroundColor: SKILL_FILL } : undefined}
                        className={'h-1.5 flex-1 rounded-sm transition ' + (filled ? '' : 'border border-line hover:bg-surface-2')}
                      />
                    )
                  })}
                </div>
                <button
                  type="button"
                  aria-label={t('players.skillUp', { name: p.n })}
                  onClick={() => setSkill(p.id, v + 1)}
                  disabled={v >= 10}
                  className="h-5 w-5 shrink-0 rounded border border-line text-xs text-muted hover:bg-surface-2 disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          )
        })()}
      {profile.positionsEnabled && p.p.length === 0 && !p.g && statusOf(p) === 'in' && (
        <p className="mt-1.5 pl-0.5 text-xs text-warn">{t('players.pickPosition')}</p>
      )}
    </li>
  )
}

// Optional max / min players. Off by default (no waitlist, no "need N more");
// switching one on pre-fills 16, which the organizer can raise or lower.
const LIMIT_DEFAULT = 16

function LimitsRow() {
  const { setup, setCap, setMin } = useAppStore()
  const t = useT()
  const limits: [string, number | undefined, (n: number | undefined) => void][] = [
    [t('list.cap'), setup.cap, setCap],
    [t('list.min'), setup.min, setMin],
  ]
  return (
    <div className="mb-1 flex flex-wrap gap-x-4 gap-y-2">
      {limits.map(([label, value, set]) => (
        <label key={label} className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={value != null}
            onChange={(e) => set(e.target.checked ? LIMIT_DEFAULT : undefined)}
            className="h-4 w-4 accent-primary"
          />
          {label}
          {value != null && (
            <input
              type="number"
              inputMode="numeric"
              min={2}
              max={99}
              value={value}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                if (n >= 1 && n <= 99) set(n)
              }}
              aria-label={label}
              className="w-14 rounded-md border border-line bg-surface px-2 py-0.5 text-sm tabular-nums text-ink focus:border-primary focus:outline-none"
            />
          )}
        </label>
      ))}
    </div>
  )
}

// Links longer than this hint the payload is getting heavy (mirrors ShareStep).
const LONG_URL = 1800

// Share the list from step 1 — the group-chat loop: post text + link, someone
// edits, shares back. Plus the organizer's fix for two diverged links.
function ShareListCard() {
  const { setup, mergeLink } = useAppStore()
  const t = useT()
  const [paste, setPaste] = useState('')
  const [mergeState, setMergeState] = useState<'idle' | 'ok' | 'error'>('idle')
  // Built from the current setup (not location.href, which can be stale when
  // the app opened from the local cache).
  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}#${encodeSetup(setup)}`
      : ''
  const text = formatList(setup, t, url)

  return (
    <div className="flex flex-col gap-2 rounded-md border border-line p-3">
      <span className="text-sm font-medium text-ink">{t('list.shareHeading')}</span>
      <p className="text-xs text-muted">{t('list.shareHint')}</p>
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded bg-surface-2 p-2 text-xs text-ink">{text}</pre>
      <div className="flex flex-wrap gap-2">
        <CopyButton label={t('list.copyText')} text={text} />
        <CopyButton
          label={t('list.copyLink')}
          text={url}
          className="!bg-transparent border border-primary !text-brand hover:!bg-primary-soft"
        />
      </div>
      {url.length > LONG_URL && <p className="text-xs text-warn">{t('share.longUrl', { n: url.length })}</p>}

      <details className="mt-1">
        <summary className="cursor-pointer text-xs text-muted">{t('list.mergeHeading')}</summary>
        <div className="mt-2 flex gap-2">
          <input
            value={paste}
            onChange={(e) => {
              setPaste(e.target.value)
              setMergeState('idle')
            }}
            placeholder={t('list.mergePlaceholder')}
            aria-label={t('list.mergePlaceholder')}
            className="min-w-0 flex-1 rounded-md border border-line bg-surface px-2 py-1 text-sm text-ink placeholder:text-faint focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            disabled={!paste.trim()}
            onClick={() => {
              const ok = mergeLink(paste)
              setMergeState(ok ? 'ok' : 'error')
              if (ok) setPaste('')
            }}
            className="rounded-md border border-primary px-3 py-1 text-sm font-medium text-brand hover:bg-primary-soft disabled:opacity-40"
          >
            {mergeState === 'ok' ? t('list.merged') : t('list.merge')}
          </button>
        </div>
        {mergeState === 'error' && <p className="mt-1 text-xs text-warn">{t('list.mergeError')}</p>}
      </details>
    </div>
  )
}
