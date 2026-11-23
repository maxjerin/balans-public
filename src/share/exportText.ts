// Plain-text export of a setup for WhatsApp / group chat (brief §6.6, §8).
// Football: mirrors the on-screen pitch (per-team formation, players grouped
// by line, then subs). Positionless sports: a plain name list, matching
// ui/TeamResultList's on-screen shape. Runs outside React, so it takes a
// bound translator `t` (localizes to the SENDER's language at copy time —
// the recipient's app still renders the LINK in their own).
import { deriveShape, type FootballPosition } from '../domain/formation'
import { lineupFor, lineupSlots, styleFor } from '../domain/lineup'
import { type Player, type SavedSetup } from '../domain/types'
import { rankList, withGuestsUnderHosts, type RankedList } from '../domain/signup'
import { getSportProfile } from '../domain/sport'
import { positionLabelKey } from '../i18n'
import type { Dict } from '../i18n'

type T = (key: keyof Dict, params?: Record<string, string | number>) => string

const FOOTBALL_LINES: FootballPosition[] = ['GK', 'DEF', 'MID', 'FWD']

export function formatExport(setup: SavedSetup, t: T, url?: string): string {
  const nameOf = (id: string) => setup.players.find((p) => p.id === id)?.n ?? id
  const lines: string[] = [`⚽ ${t('appName')}`]
  if (setup.title?.trim()) lines.push(setup.title.trim())

  const profile = getSportProfile(setup.sport)

  if (setup.teams?.length) {
    setup.teams.forEach((teamIds, ti) => {
      const name = setup.teamNames?.[ti]?.trim() || t('team.namePlaceholder', { n: ti + 1 })
      const starterIds = new Set(setup.starters?.[ti] ?? [])
      const subs = teamIds.filter((id) => !starterIds.has(id)).map(nameOf)

      if (!profile.positionsEnabled) {
        // No formation concept for this sport — plain list (matches
        // ui/TeamResultList's on-screen shape).
        lines.push('', name)
        for (const id of teamIds.filter((id) => starterIds.has(id))) lines.push(`• ${nameOf(id)}`)
        if (subs.length) lines.push(t('formation.subs', { names: subs.join(', ') }))
        return
      }

      if (setup.sport === 'cricket') {
        // Role-tagged batting-order list — a chat message can't render the
        // on-screen fielding board, so this stays a plain-text list
        // regardless of resultView (which drives the spatial board only).
        const roleOrder = (id: string) => {
          const idx = profile.positions.indexOf(setup.players.find((p) => p.id === id)?.p[0] ?? '')
          return idx === -1 ? 99 : idx
        }
        lines.push('', name)
        for (const id of teamIds.filter((id) => starterIds.has(id)).sort((a, b) => roleOrder(a) - roleOrder(b))) {
          const role = setup.players.find((p) => p.id === id)?.p[0]
          lines.push(role ? `• ${nameOf(id)} (${t(positionLabelKey('cricket', role))})` : `• ${nameOf(id)}`)
        }
        if (subs.length) lines.push(t('formation.subs', { names: subs.join(', ') }))
        return
      }

      const ids = lineupFor(setup, ti)
      const shape = deriveShape(ids.length, styleFor(setup, ti))
      const slots = lineupSlots(ids, shape, (id) => setup.players.find((p) => p.id === id)?.p ?? [])

      lines.push('', `${name} · ${shape.label}`)
      for (const pos of FOOTBALL_LINES) {
        const names = slots.filter((s) => s.position === pos).map((s) => nameOf(s.playerId))
        if (names.length) lines.push(`${t(positionLabelKey('football', pos))}: ${names.join(', ')}`)
      }
      if (subs.length) lines.push(t('formation.subs', { names: subs.join(', ') }))
    })
  } else {
    lines.push('', t('export.poolHeading', { n: setup.players.length }))
    for (const p of setup.players) lines.push(`• ${p.n}`)
  }

  if (url) lines.push('', url)
  return lines.join('\n')
}

/** One-line list status: "14 in" · "11/16 in · need 5 more" · "16/16 · full · 2 on waitlist".
 *  Shared by the chat text and the step-1 header. */
export function listSummary(r: RankedList, setup: SavedSetup, t: T): string {
  const n = r.confirmed.length
  const parts = [
    setup.cap == null
      ? t('list.summaryIn', { n })
      : t(n >= setup.cap ? 'list.summaryFull' : 'list.summaryCap', { n, cap: setup.cap }),
  ]
  if (r.needMore > 0) parts.push(t('list.needMore', { n: r.needMore }))
  if (r.waitlist.length) parts.push(t('list.waitlistCount', { n: r.waitlist.length }))
  return parts.join(' · ')
}

/** "Carl (+1 Ben)" for a guest, the plain name for a member. */
export function listName(p: Player, setup: SavedSetup, t: T): string {
  const host = p.g ? setup.players.find((x) => x.id === p.g) : undefined
  return host ? `${p.n} (${t('list.guestOf', { name: host.n })})` : p.n
}

/** The week's sign-up list for the group chat: numbered confirmed players, the
 *  waitlist continuing the numbering, maybes, then the edit link. */
export function formatList(setup: SavedSetup, t: T, url?: string): string {
  const r = rankList(setup)
  const name = (p: Player) => listName(p, setup, t)
  const heading = setup.title?.trim() || t('appName')
  const lines = [`⚽ ${heading} — ${listSummary(r, setup, t)}`]
  withGuestsUnderHosts(r.confirmed).forEach((p, i) => lines.push(`${i + 1}. ${name(p)}`))
  if (r.waitlist.length) {
    const start = r.confirmed.length + 1
    lines.push(`${t('list.waitlist')}: ${r.waitlist.map((p, i) => `${start + i}. ${name(p)}`).join(', ')}`)
  }
  if (r.maybe.length) lines.push(`${t('list.maybe')}: ${r.maybe.map(name).join(', ')}`)
  if (url) lines.push('', `${t('list.editLink')} ${url}`)
  return lines.join('\n')
}
