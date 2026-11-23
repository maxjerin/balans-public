// Read-only result board — dispatches on the active sport's resultView
// (domain/sport.ts), the same way wizard/FormationStep.tsx does for the
// editable version. Football/basketball even team counts pair onto one
// shared board (FotMob-style); odd counts, cricket's field, and every
// generic/list team get one board per team. Tabbed, non-interactive. Used
// on the Share step and the shared read-only view.
//
// This replaces the old ui/PitchBoard.tsx, which always rendered football's
// board regardless of sport — a bug affecting generic, basketball, and
// cricket setups on both call sites.
import { useState } from 'react'
import { useT } from '../i18n/useT'
import { getSportProfile } from '../domain/sport'
import { Pitch } from './Pitch'
import { MatchPitch } from './MatchPitch'
import { Court } from './Court'
import { MatchCourt } from './MatchCourt'
import { Field } from './Field'
import { TeamResultList } from './TeamResultList'
import { deriveShape } from '../domain/formation'
import { lineupFor, lineupSlots, styleFor } from '../domain/lineup'
import { deriveCourtShape } from '../domain/basketball'
import { courtLineupFor, courtLineupSlots } from '../domain/basketballLineup'
import { fieldLineupFor, fieldSlotsFor } from '../domain/cricketFieldLineup'
import { teamColor } from './teamColors'
import { STYLE_KEYS } from '../i18n'
import type { SavedSetup, Style } from '../domain/types'

const tabCls = (on: boolean) =>
  'min-w-0 flex-1 truncate rounded-md px-3 py-1.5 text-sm font-medium transition ' +
  (on ? 'bg-primary text-primary-ink' : 'bg-surface-2 text-muted hover:bg-surface-2')

const STYLE_IDS: Style[] = ['def', 'bal', 'att']

export function ResultBoard({ setup, allowStyle = false }: { setup: SavedSetup; allowStyle?: boolean }) {
  const t = useT()
  const [active, setActive] = useState(0)
  // Recipient-only, ephemeral formation override (shared read-only view): flips a
  // team's formation for viewing, never written to the store/URL so the original
  // shared link stays canonical. Players/positions are NOT editable in the
  // preview — recipients "Edit these teams" to make their own shareable link.
  const [styleOverride, setStyleOverride] = useState<Record<number, Style>>({})
  if (!setup.teams?.length) return null

  const goTab = (i: number) => setActive(i)

  const profile = getSportProfile(setup.sport)
  const teams = setup.teams
  const byId = (id: string) => setup.players.find((p) => p.id === id)
  const teamLabel = (i: number) =>
    setup.teamNames?.[i]?.trim() || t('team.namePlaceholder', { n: i + 1 })

  // Positionless sport — plain list per team, no tabs (matches
  // FormationStep's generic branch, which also doesn't tab).
  if (!profile.positionsEnabled) {
    return (
      <div className="flex flex-col gap-3">
        {teams.map((teamIds, ti) => {
          const starterIds = new Set(setup.starters?.[ti] ?? [])
          const starterNames = teamIds.filter((id) => starterIds.has(id)).map((id) => byId(id)?.n ?? id)
          const subNames = teamIds.filter((id) => !starterIds.has(id)).map((id) => byId(id)?.n ?? id)
          return <TeamResultList key={ti} label={teamLabel(ti)} starterNames={starterNames} subNames={subNames} color={teamColor(setup, ti).fill} />
        })}
      </div>
    )
  }

  // Cricket — fielding board, tabbed, no pairing.
  if (profile.resultView === 'field') {
    const ti = Math.min(active, teams.length - 1)
    const ids = fieldLineupFor(setup, ti)
    const slots = fieldSlotsFor(ids)
    return (
      <div className="flex flex-col gap-2 rounded-md border border-line p-3">
        <div role="tablist" aria-label={t('step.formation')} className="flex gap-1 overflow-x-auto">
          {teams.map((_, i) => (
            <button key={i} type="button" role="tab" aria-selected={i === ti} onClick={() => goTab(i)} className={tabCls(i === ti)}>
              {teamLabel(i)}
            </button>
          ))}
        </div>
        <span className="text-sm font-semibold text-ink">{teamLabel(ti)}</span>
        <Field slots={slots} nameOf={(id) => byId(id)?.n ?? id} interactive={false} color={teamColor(setup, ti)} />
      </div>
    )
  }

  // Basketball — court board, paired on even counts (mirrors football's pairing).
  if (profile.resultView === 'court') {
    const courtSideOf = (i: number) => {
      const ids = courtLineupFor(setup, i)
      const shape = deriveCourtShape(ids.length)
      return {
        label: teamLabel(i),
        shape: shape.label,
        slots: courtLineupSlots(ids, shape, (id) => byId(id)?.p ?? []),
        nameOf: (id: string) => byId(id)?.n ?? id,
        color: teamColor(setup, i),
      }
    }
    if (teams.length % 2 === 0) {
      const pairs: Array<[number, number]> = []
      for (let i = 0; i < teams.length; i += 2) pairs.push([i, i + 1])
      const pi = Math.min(active, pairs.length - 1)
      const [hi, ai] = pairs[pi]
      return (
        <div className="flex flex-col gap-2 rounded-md border border-line p-3">
          {pairs.length > 1 && (
            <div role="tablist" aria-label={t('step.formation')} className="flex gap-1 overflow-x-auto">
              {pairs.map(([a, b], i) => (
                <button key={i} type="button" role="tab" aria-selected={i === pi} onClick={() => goTab(i)} className={tabCls(i === pi)}>
                  {teamLabel(a)} v {teamLabel(b)}
                </button>
              ))}
            </div>
          )}
          <MatchCourt home={courtSideOf(ai)} away={courtSideOf(hi)} />
        </div>
      )
    }
    const ti = Math.min(active, teams.length - 1)
    const side = courtSideOf(ti)
    return (
      <div className="flex flex-col gap-2 rounded-md border border-line p-3">
        <div role="tablist" aria-label={t('step.formation')} className="flex gap-1 overflow-x-auto">
          {teams.map((_, i) => (
            <button key={i} type="button" role="tab" aria-selected={i === ti} onClick={() => goTab(i)} className={tabCls(i === ti)}>
              {teamLabel(i)}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">{side.label}</span>
          <span className="text-xs font-medium text-brand">{side.shape}</span>
        </div>
        <Court slots={side.slots} nameOf={side.nameOf} interactive={false} color={side.color} />
      </div>
    )
  }

  // Football (resultView 'pitch'). In the shared read-only view (allowStyle),
  // the recipient can flip a team's style ephemerally via styleOverride.
  const styleOf = (i: number) => styleOverride[i] ?? styleFor(setup, i)
  const sideOf = (i: number) => {
    const ids = lineupFor(setup, i)
    const shape = deriveShape(ids.length, styleOf(i))
    const slots = lineupSlots(ids, shape, (id) => byId(id)?.p ?? [])
    return {
      label: teamLabel(i),
      shape: shape.label,
      slots,
      nameOf: (id: string) => byId(id)?.n ?? id,
      color: teamColor(setup, i),
    }
  }

  // Ephemeral def/bal/att picker — same segmented control + labelled header as
  // the Formation step (wizard/FormationStep styleRow), but the name is static
  // (read-only view) and it writes only local state (no store/URL write).
  const styleRow = (i: number) => (
    <div role="group" aria-label={t('view.formationFor', { name: teamLabel(i) })}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{teamLabel(i)}</span>
        <span className="shrink-0 text-xs font-medium text-brand">{sideOf(i).shape}</span>
      </div>
      <div className="flex gap-1 rounded-md bg-surface-2 p-1">
        {STYLE_IDS.map((sid) => (
          <button
            key={sid}
            type="button"
            aria-pressed={styleOf(i) === sid}
            onClick={() => setStyleOverride((o) => ({ ...o, [i]: sid }))}
            className={
              'flex-1 rounded py-1 text-xs font-medium transition ' +
              (styleOf(i) === sid ? 'bg-primary text-primary-ink' : 'text-muted hover:text-ink')
            }
          >
            {t(STYLE_KEYS[sid])}
          </button>
        ))}
      </div>
    </div>
  )

  if (teams.length % 2 === 0) {
    const pairs: Array<[number, number]> = []
    for (let i = 0; i < teams.length; i += 2) pairs.push([i, i + 1])
    const pi = Math.min(active, pairs.length - 1)
    const [hi, ai] = pairs[pi]
    return (
      <div className="flex flex-col gap-2 rounded-md border border-line p-3">
        {pairs.length > 1 && (
          <div role="tablist" aria-label={t('step.formation')} className="flex gap-1 overflow-x-auto">
            {pairs.map(([a, b], i) => (
              <button key={i} type="button" role="tab" aria-selected={i === pi} onClick={() => goTab(i)} className={tabCls(i === pi)}>
                {teamLabel(a)} v {teamLabel(b)}
              </button>
            ))}
          </div>
        )}
        {/* away (hi) is the top half of the board, home (ai) the bottom —
            place each team's picker on its side, matching the Formation step. */}
        {allowStyle && styleRow(hi)}
        <MatchPitch home={sideOf(ai)} away={sideOf(hi)} />
        {allowStyle && styleRow(ai)}
      </div>
    )
  }

  const ti = Math.min(active, teams.length - 1)
  const side = sideOf(ti)
  return (
    <div className="flex flex-col gap-2 rounded-md border border-line p-3">
      <div role="tablist" aria-label={t('step.formation')} className="flex gap-1 overflow-x-auto">
        {teams.map((_, i) => (
          <button key={i} type="button" role="tab" aria-selected={i === ti} onClick={() => goTab(i)} className={tabCls(i === ti)}>
            {teamLabel(i)}
          </button>
        ))}
      </div>
      {allowStyle ? (
        styleRow(ti)
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">{side.label}</span>
          <span className="text-xs font-medium text-brand">{side.shape}</span>
        </div>
      )}
      <Pitch slots={side.slots} nameOf={side.nameOf} interactive={false} color={side.color} />
    </div>
  )
}
