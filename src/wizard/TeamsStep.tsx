// Step 2 — generate balanced teams (brief §7). Config (teams + subs) with a
// live layout preview, then generate, reshuffle, and manual tap-to-swap.
import { useEffect, useState } from 'react'
import { useAppStore } from '../state/store'
import { confirmedIds } from '../domain/signup'
import { computeLayout } from '../domain/layout'
import { type Player } from '../domain/types'
import { getSportProfile } from '../domain/sport'
import { TeamNameInput } from '../ui/TeamNameInput'
import { TeamColorPicker } from '../ui/TeamColorPicker'
import { teamColor } from '../ui/teamColors'
import { useT } from '../i18n/useT'
import { positionLabelKey } from '../i18n'
import { warningText } from '../i18n/warning'

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  const t = useT()
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={t('teams.decreaseAria', { label })}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-8 w-8 rounded-md border border-line text-muted hover:bg-surface-2 disabled:opacity-30"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          aria-label={t('teams.increaseAria', { label })}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-8 w-8 rounded-md border border-line text-muted hover:bg-surface-2 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  )
}

export function TeamsStep() {
  const { setup, genWarnings, setK, setSubs, generate, swap } = useAppStore()
  const t = useT()
  const profile = getSportProfile(setup.sport)
  const posTags = (p: Player) =>
    p.p.length ? p.p.map((role) => t(positionLabelKey(profile.id, role))).join(' · ') : '—'
  const [selected, setSelected] = useState<string | null>(null)

  const ids = confirmedIds(setup)
  const total = ids.length
  // Cap team count so every team keeps at least 3 players — below that a
  // "team" is 1-2 people, the formation shapes are degenerate, and nobody
  // needs a balancer anyway (same reasoning as MIN_PLAYERS, applied per-team).
  const maxTeams = Math.max(2, Math.floor(total / 3))
  const k = Math.min(setup.k ?? 2, maxTeams)
  const subs = setup.subs ?? 0
  const byId = (id: string) => setup.players.find((p) => p.id === id)!

  const layout = computeLayout(total, k, total, subs)
  const generated = !!setup.teams?.length

  // On entering the Teams step, generate a default split (2 teams) if none yet,
  // so the user lands on teams. Changing the team count clears teams → they
  // regenerate manually (the Next gate enforces it).
  useEffect(() => {
    if (!setup.teams?.length && layout.feasible) generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPick = (id: string) => {
    if (selected === null) {
      setSelected(id)
    } else if (selected === id) {
      setSelected(null)
    } else {
      swap(selected, id)
      setSelected(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Config */}
      <div className="flex flex-col gap-3 rounded-md border border-line p-3">
        <Stepper label={t('teams.numberOfTeams')} value={k} min={2} max={maxTeams} onChange={setK} />
        <Stepper label={t('teams.subsPerTeam')} value={subs} min={0} max={Math.max(0, total - k)} onChange={setSubs} />

        <div className="rounded bg-surface-2 px-2.5 py-2 text-xs text-muted">
          {layout.feasible
            ? t('layout.summary', {
                k: layout.teams.length,
                sizes: layout.teams.map((x) => x.size).join(','),
                field: layout.teams.map((x) => x.field).join(','),
                subs: layout.teams.map((x) => x.subs).join(','),
              })
            : layout.warnings.map((w) => warningText(t, w)).join(' ')}
        </div>
        {layout.warnings.map((w, i) => (
          <p key={i} className="text-xs text-warn">
            {warningText(t, w)}
          </p>
        ))}

        <button
          type="button"
          onClick={generate}
          disabled={!layout.feasible}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-ink hover:bg-primary-press disabled:opacity-40"
        >
          {generated ? t('teams.regenerate') : t('teams.generate')}
        </button>
      </div>

      {/* Results */}
      {generated && (
        <>
          <p className={selected ? 'text-sm font-medium text-ink' : 'text-sm text-muted'}>
            {selected ? t('teams.tapAnother', { name: byId(selected).n }) : t('teams.tapTwo')}
          </p>

          {genWarnings.map((w, i) => (
            <p key={i} className="text-xs text-warn">
              {warningText(t, w)}
            </p>
          ))}

          <div className="flex flex-col gap-3">
            {setup.teams!.map((teamIds, ti) => {
              const starters = new Set(setup.starters?.[ti] ?? [])
              // starters above subs; within each group, tiebreak by position
              // GK→DEF→MID→FWD when positions exist, else by pool add-order.
              const poolIndex = (id: string) => setup.players.findIndex((p) => p.id === id)
              const posKey = (id: string) => {
                const idx = profile.positions.indexOf(byId(id).p[0] ?? '')
                return idx === -1 ? 99 : idx
              }
              const tiebreak = profile.positionsEnabled ? posKey : poolIndex
              const ordered = [...teamIds].sort(
                (a, b) =>
                  Number(starters.has(b)) - Number(starters.has(a)) ||
                  tiebreak(a) - tiebreak(b),
              )
              return (
                <div key={ti} className="rounded-md border border-line">
                  <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full border border-line"
                        style={{ backgroundColor: teamColor(setup, ti).fill }}
                      />
                      <TeamNameInput ti={ti} />
                    </div>
                    <span className="shrink-0 text-xs text-faint">
                      {teamIds.length} · {starters.size} {t('teams.onField')}
                    </span>
                  </div>
                  <div className="flex justify-end border-b border-line px-3 py-1.5">
                    <TeamColorPicker ti={ti} />
                  </div>
                  <ul>
                    {ordered.map((id) => {
                      const p = byId(id)
                      const isStarter = starters.has(id)
                      const isSel = selected === id
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            onClick={() => onPick(id)}
                            className={
                              'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ' +
                              (isSel
                                ? 'bg-primary-soft ring-1 ring-inset ring-primary'
                                : selected
                                  ? 'hover:bg-primary-soft'
                                  : 'hover:bg-surface-2')
                            }
                          >
                            <span
                              className={
                                'h-1.5 w-1.5 shrink-0 rounded-full ' +
                                (isStarter ? 'bg-primary' : 'bg-faint')
                              }
                              title={isStarter ? t('teams.starter') : t('teams.sub')}
                            />
                            <span
                              className={
                                'min-w-0 flex-1 truncate ' +
                                (isStarter
                                  ? 'text-ink'
                                  : 'text-faint')
                              }
                            >
                              {p.n}
                            </span>
                            {profile.positionsEnabled && (
                              <span className="shrink-0 text-xs text-faint">{posTags(p)}</span>
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
