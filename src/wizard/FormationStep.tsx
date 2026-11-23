// Step 3 — for football: pick a style, the app derives each team's formation
// and slots players into positions (brief §9). For basketball: fixed shape
// per team size, no style axis (multi-sport Phase 2 — see domain/sport.ts).
// Positionless sports get a plain list (Phase 1). Tap two players on the same
// team to swap spots (exact/custom shapes stay locked in v1 — CTA).
//
// With an even number of teams, pairs share one board facing each other
// (FotMob-style), tabbed. An odd number falls back to one board per team,
// tabbed. Basketball has no style picker (fixed shape only).
import { useState } from 'react'
import { useAppStore } from '../state/store'
import { deriveShape } from '../domain/formation'
import { lineupFor, lineupSlots, styleFor } from '../domain/lineup'
import { deriveCourtShape } from '../domain/basketball'
import { courtLineupFor, courtLineupSlots } from '../domain/basketballLineup'
import type { Player, Style } from '../domain/types'
import { getSportProfile } from '../domain/sport'
import { Pitch } from '../ui/Pitch'
import { MatchPitch, type Side } from '../ui/MatchPitch'
import { Court } from '../ui/Court'
import { MatchCourt, type CourtSide } from '../ui/MatchCourt'
import { TeamNameInput } from '../ui/TeamNameInput'
import { TeamColorPicker } from '../ui/TeamColorPicker'
import { teamColor } from '../ui/teamColors'
import { TeamResultList } from '../ui/TeamResultList'
import { fieldLineupFor, fieldSlotsFor } from '../domain/cricketFieldLineup'
import { Field } from '../ui/Field'
import { useT } from '../i18n/useT'
import { STYLE_KEYS } from '../i18n'

const STYLE_IDS: Style[] = ['def', 'bal', 'att']

const tabCls = (on: boolean) =>
  'min-w-0 flex-1 truncate rounded-md px-3 py-2 text-sm font-medium transition ' +
  (on ? 'bg-primary text-primary-ink' : 'bg-surface-2 text-muted hover:bg-surface-2')

export function FormationStep() {
  const { setup, setStyle, setTeamStyle, swapSlot, swapCourtSlot, swapFieldSlot, reshuffle } = useAppStore()
  const t = useT()
  // selection is per-team: { team index, slot index }; switching view clears it.
  const [sel, setSel] = useState<{ ti: number; i: number } | null>(null)
  const [active, setActive] = useState(0)

  if (!setup.teams?.length) {
    return <p className="text-sm text-faint">{t('formation.needTeams')}</p>
  }

  const profile = getSportProfile(setup.sport)
  const byId = (id: string): Player => setup.players.find((p) => p.id === id)!
  const teamLabel = (i: number) =>
    setup.teamNames?.[i]?.trim() || t('team.namePlaceholder', { n: i + 1 })

  // Positionless sport: no formation/board concept — a plain balanced list
  // per team (domain/sport.ts ResultView 'list'), no style picker.
  if (!profile.positionsEnabled) {
    return (
      <div className="flex flex-col gap-3">
        {setup.teams.map((teamIds, ti) => {
          const starterIds = new Set(setup.starters?.[ti] ?? [])
          const starterNames = teamIds.filter((id) => starterIds.has(id)).map((id) => byId(id).n)
          const subNames = teamIds.filter((id) => !starterIds.has(id)).map((id) => byId(id).n)
          return (
            <TeamResultList key={ti} label={teamLabel(ti)} starterNames={starterNames} subNames={subNames} />
          )
        })}
        <button
          type="button"
          onClick={reshuffle}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-ink hover:bg-primary-press"
        >
          {t('teams.reshuffle')}
        </button>
      </div>
    )
  }

  // Cricket: fixed fielding-position board — no eligibility restriction, no
  // style picker, no pairing (always one field per team, tabbed;
  // domain/sport.ts ResultView 'field').
  if (profile.resultView === 'field') {
    const pick = (ti: number, i: number) => {
      if (!sel) setSel({ ti, i })
      else if (sel.ti !== ti) setSel({ ti, i })
      else if (sel.i === i) setSel(null)
      else {
        swapFieldSlot(ti, sel.i, i)
        setSel(null)
      }
    }

    const teamsList = setup.teams
    const ti = Math.min(active, teamsList.length - 1)
    const teamIds = teamsList[ti]
    const starterIds = new Set(setup.starters?.[ti] ?? [])
    const subs = teamIds.filter((id) => !starterIds.has(id)).map(byId)
    const ids = fieldLineupFor(setup, ti)
    const slots = fieldSlotsFor(ids)

    return (
      <div className="flex flex-col gap-3">
        <p className={sel ? 'text-sm font-medium text-ink' : 'text-sm text-muted'}>
          {sel ? t('formation.tapAnother', { name: byId(ids[sel.i]).n }) : t('formation.tapTwo')}
        </p>
        <div role="tablist" aria-label={t('step.formation')} className="flex gap-1 overflow-x-auto">
          {teamsList.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === ti}
              onClick={() => {
                setSel(null)
                setActive(i)
              }}
              className={tabCls(i === ti)}
            >
              {teamLabel(i)}
            </button>
          ))}
        </div>
        <div className="rounded-md border border-line p-3">
          <div className="flex items-center justify-between gap-2">
            <TeamNameInput ti={ti} />
            <TeamColorPicker ti={ti} />
          </div>
          <div className="mt-3">
            <Field
              slots={slots}
              nameOf={(id) => byId(id).n}
              selected={sel?.ti === ti ? sel.i : null}
              onPickSlot={(i) => pick(ti, i)}
              color={teamColor(setup, ti)}
            />
          </div>
          {subs.length > 0 && (
            <p className="mt-2 text-xs text-faint">{t('formation.subs', { names: subs.map((p) => p.n).join(', ') })}</p>
          )}
        </div>
      </div>
    )
  }

  const teams = setup.teams

  const cta = (
    <div className="rounded-md border border-dashed border-line p-3 text-center">
      <p className="text-sm text-muted">{t('formation.ctaQuestion')}</p>
      <a
        href="mailto:hello@balans.team?subject=Custom%20formation%20request"
        className="mt-1 inline-block text-sm font-medium text-brand hover:underline"
      >
        {t('formation.ctaContact')}
      </a>
    </div>
  )

  // Basketball: fixed shape, no style axis — a lighter-weight branch than
  // football's (no styleRow, no setStyle reset button).
  if (profile.resultView === 'court') {
    const pick = (ti: number, i: number) => {
      if (!sel) setSel({ ti, i })
      else if (sel.ti !== ti) setSel({ ti, i })
      else if (sel.i === i) setSel(null)
      else {
        swapCourtSlot(ti, sel.i, i)
        setSel(null)
      }
    }

    const courtShapeOf = (ti: number) => deriveCourtShape(courtLineupFor(setup, ti).length)
    const courtSideOf = (ti: number): CourtSide => {
      const ids = courtLineupFor(setup, ti)
      const shape = deriveCourtShape(ids.length)
      return {
        label: teamLabel(ti),
        shape: shape.label,
        slots: courtLineupSlots(ids, shape, (id) => byId(id).p),
        nameOf: (id) => byId(id).n,
        selected: sel?.ti === ti ? sel.i : null,
        onPick: (i) => pick(ti, i),
        color: teamColor(setup, ti),
      }
    }

    const controls = (
      <p className={sel ? 'text-sm font-medium text-ink' : 'text-sm text-muted'}>
        {sel
          ? t('formation.tapAnother', { name: byId(courtLineupFor(setup, sel.ti)[sel.i]).n })
          : t('formation.tapTwo')}
      </p>
    )

    if (teams.length % 2 === 0) {
      const pairs: Array<[number, number]> = []
      for (let i = 0; i < teams.length; i += 2) pairs.push([i, i + 1])
      const pi = Math.min(active, pairs.length - 1)
      const [a, b] = pairs[pi]
      const offField = [a, b].some((x) => courtSideOf(x).slots.some((s) => s.offPosition))
      return (
        <div className="flex flex-col gap-3">
          {controls}
          {pairs.length > 1 && (
            <div role="tablist" aria-label={t('step.formation')} className="flex gap-1 overflow-x-auto">
              {pairs.map(([x, y], i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === pi}
                  onClick={() => {
                    setSel(null)
                    setActive(i)
                  }}
                  className={tabCls(i === pi)}
                >
                  {teamLabel(x)} v {teamLabel(y)}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3 rounded-md border border-line p-3">
            <MatchCourt home={courtSideOf(b)} away={courtSideOf(a)} />
            {offField && <p className="text-xs text-warn">{t('formation.offPosition')}</p>}
          </div>
          {cta}
        </div>
      )
    }

    const ti = Math.min(active, teams.length - 1)
    const teamIds = teams[ti]
    const starterIds = new Set(setup.starters?.[ti] ?? [])
    const subs = teamIds.filter((id) => !starterIds.has(id)).map(byId)
    const side = courtSideOf(ti)
    return (
      <div className="flex flex-col gap-3">
        {controls}
        <div role="tablist" aria-label={t('step.formation')} className="flex gap-1 overflow-x-auto">
          {teams.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === ti}
              onClick={() => {
                setSel(null)
                setActive(i)
              }}
              className={tabCls(i === ti)}
            >
              {teamLabel(i)}
            </button>
          ))}
        </div>
        <div className="rounded-md border border-line p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <TeamNameInput ti={ti} />
            <div className="flex shrink-0 items-center gap-2">
              <TeamColorPicker ti={ti} />
              <span className="text-xs font-medium text-brand">{courtShapeOf(ti).label}</span>
            </div>
          </div>
          <div className="mt-3">
            <Court slots={side.slots} nameOf={side.nameOf} selected={side.selected} onPickSlot={(i) => pick(ti, i)} color={side.color} />
          </div>
          {subs.length > 0 && (
            <p className="mt-2 text-xs text-faint">{t('formation.subs', { names: subs.map((p) => p.n).join(', ') })}</p>
          )}
          {side.slots.some((s) => s.offPosition) && <p className="mt-1 text-xs text-warn">{t('formation.offPosition')}</p>}
        </div>
        {cta}
      </div>
    )
  }

  // Football: style-driven formation (unchanged from Phase 1).
  // Tap-to-swap within one team (selecting another team re-seeds the selection).
  const pick = (ti: number, i: number) => {
    if (!sel) setSel({ ti, i })
    else if (sel.ti !== ti) setSel({ ti, i })
    else if (sel.i === i) setSel(null)
    else {
      swapSlot(ti, sel.i, i)
      setSel(null)
    }
  }

  const shapeOf = (ti: number) => deriveShape(lineupFor(setup, ti).length, styleFor(setup, ti))
  const sideOf = (ti: number): Side => {
    const ids = lineupFor(setup, ti)
    const shape = deriveShape(ids.length, styleFor(setup, ti))
    return {
      label: teamLabel(ti),
      shape: shape.label,
      slots: lineupSlots(ids, shape, (id) => byId(id).p),
      nameOf: (id) => byId(id).n,
      selected: sel?.ti === ti ? sel.i : null,
      onPick: (i) => pick(ti, i),
      color: teamColor(setup, ti),
    }
  }

  // Per-team style picker (segmented control), labelled with the team name.
  // A plain render function (not a component) so it shares the parent's render.
  const styleRow = (ti: number) => {
    const style = styleFor(setup, ti)
    return (
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <TeamNameInput ti={ti} />
          <div className="flex shrink-0 items-center gap-2">
            <TeamColorPicker ti={ti} />
            <span className="text-xs font-medium text-brand">{shapeOf(ti).label}</span>
          </div>
        </div>
        <div className="flex gap-1 rounded-md bg-surface-2 p-1">
          {STYLE_IDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSel(null)
                setTeamStyle(ti, s)
              }}
              aria-pressed={style === s}
              className={
                'flex-1 rounded py-1 text-xs font-medium transition ' +
                (style === s ? 'bg-primary text-primary-ink' : 'text-muted hover:text-ink')
              }
            >
              {t(STYLE_KEYS[s])}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const controls = (
    <div className="flex items-center justify-between gap-2">
      <p className={sel ? 'text-sm font-medium text-ink' : 'text-sm text-muted'}>
        {sel
          ? t('formation.tapAnother', { name: byId(lineupFor(setup, sel.ti)[sel.i]).n })
          : t('formation.tapTwo')}
      </p>
      <button
        type="button"
        onClick={() => {
          setSel(null)
          setStyle(setup.style ?? 'bal')
        }}
        className="shrink-0 rounded px-2 py-1 text-xs font-medium text-faint hover:bg-surface-2"
        title={t('formation.resetTitle')}
      >
        {t('formation.resetStyles')}
      </button>
    </div>
  )

  // Even team count → combined match boards (two teams per field).
  if (teams.length % 2 === 0) {
    const pairs: Array<[number, number]> = []
    for (let i = 0; i < teams.length; i += 2) pairs.push([i, i + 1])
    const pi = Math.min(active, pairs.length - 1)
    const [a, b] = pairs[pi]
    const offField = [a, b].some((x) => sideOf(x).slots.some((s) => s.offPosition))
    return (
      <div className="flex flex-col gap-3">
        {controls}
        {pairs.length > 1 && (
          <div role="tablist" aria-label={t('step.formation')} className="flex gap-1 overflow-x-auto">
            {pairs.map(([x, y], i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === pi}
                onClick={() => {
                  setSel(null)
                  setActive(i)
                }}
                className={tabCls(i === pi)}
              >
                {teamLabel(x)} v {teamLabel(y)}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-3 rounded-md border border-line p-3">
          {styleRow(a)}
          {/* a (picker above) on top, b (picker below) on the bottom */}
          <MatchPitch home={sideOf(b)} away={sideOf(a)} />
          {styleRow(b)}
          {offField && <p className="text-xs text-warn">{t('formation.offPosition')}</p>}
        </div>
        {cta}
      </div>
    )
  }

  // Odd team count → one pitch per team, tabbed.
  const ti = Math.min(active, teams.length - 1)
  const teamIds = teams[ti]
  const starterIds = new Set(setup.starters?.[ti] ?? [])
  const subs = teamIds.filter((id) => !starterIds.has(id)).map(byId)
  const side = sideOf(ti)
  return (
    <div className="flex flex-col gap-3">
      {controls}
      <div role="tablist" aria-label={t('step.formation')} className="flex gap-1 overflow-x-auto">
        {teams.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === ti}
            onClick={() => {
              setSel(null)
              setActive(i)
            }}
            className={tabCls(i === ti)}
          >
            {teamLabel(i)}
          </button>
        ))}
      </div>
      <div className="rounded-md border border-line p-3">
        {styleRow(ti)}
        <div className="mt-3">
          <Pitch slots={side.slots} nameOf={side.nameOf} selected={side.selected} onPickSlot={(i) => pick(ti, i)} color={side.color} />
        </div>
        {subs.length > 0 && (
          <p className="mt-2 text-xs text-faint">{t('formation.subs', { names: subs.map((p) => p.n).join(', ') })}</p>
        )}
        {side.slots.some((s) => s.offPosition) && <p className="mt-1 text-xs text-warn">{t('formation.offPosition')}</p>}
      </div>
      {cta}
    </div>
  )
}
