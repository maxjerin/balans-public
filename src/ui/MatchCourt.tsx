// Two basketball teams on one court, facing each other across halfcourt
// (mirrors ui/MatchPitch.tsx's pattern). Each team defends the basket at
// their own end and attacks the far one. Read-only by default; pass a side's
// `onPick` to make that team's tokens tap-to-swap.
import type { KeyboardEvent, ReactElement } from 'react'
import { useT } from '../i18n/useT'
import { positionLabelKey } from '../i18n'
import type { CourtSlot, BasketballPosition } from '../domain/basketball'
import type { TeamColor } from './teamColors'

const W = 320
const H = 460
const MID = 230

const COURT_LINES: BasketballPosition[] = ['G', 'F', 'C']
const HOME_Y: Record<BasketballPosition, number> = { G: 424, F: 356, C: 288 }
const AWAY_Y: Record<BasketballPosition, number> = { G: 36, F: 104, C: 172 }

const first = (name: string) => name.split(/\s+/)[0]

export type CourtSide = {
  label: string
  shape: string
  slots: CourtSlot[]
  nameOf: (id: string) => string
  selected?: number | null
  onPick?: (slotIndex: number) => void
  color?: TeamColor
}

// `dimAll` fades this whole side — used when the OTHER team holds the active
// selection, since swaps only happen within a team (same-team slots are the
// valid targets and stay bright; the opposite team dims).
function tokens(side: CourtSide, yMap: Record<BasketballPosition, number>, home: boolean, t: ReturnType<typeof useT>, dimAll: boolean) {
  const byLine = new Map<BasketballPosition, number[]>()
  side.slots.forEach((s, i) => {
    const arr = byLine.get(s.position) ?? []
    arr.push(i)
    byLine.set(s.position, arr)
  })
  const interactive = !!side.onPick
  const els: ReactElement[] = []
  for (const pos of COURT_LINES) {
    const line = byLine.get(pos) ?? []
    const y = yMap[pos]
    line.forEach((idx, i) => {
      const s = side.slots[idx]
      const x = (W * (i + 1)) / (line.length + 1)
      const isSel = interactive && side.selected === idx
      const r = pos === 'G' ? (isSel ? 19 : 16) : isSel ? 17 : 15
      const nameY = home ? y + 26 : y - 18
      const props = interactive
        ? {
            role: 'button',
            tabIndex: 0,
            'aria-pressed': isSel,
            className: 'cursor-pointer',
            onClick: () => side.onPick?.(idx),
            onKeyDown: (e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                side.onPick?.(idx)
              }
            },
          }
        : {}
      els.push(
        <g key={`${home ? 'h' : 'a'}-${s.playerId}`} {...props} style={{ opacity: dimAll ? 0.45 : 1 }}>
          {pos === 'G' && <circle cx={x} cy={y} r={r + 7} className="fill-primary" opacity="0.35" />}
          {isSel && <circle cx={x} cy={y} r={r + 6} className="fill-primary" opacity="0.35" />}
          {interactive && !isSel && (
            <circle cx={x} cy={y} r={r + 4} fill="none" className="stroke-primary" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
          )}
          {s.offPosition && <circle cx={x} cy={y} r={r + 2.5} fill="none" className="stroke-accent" strokeWidth="2.5" />}
          <circle
            cx={x}
            cy={y}
            r={r}
            fill={side.color?.fill ?? '#ffffff'}
            stroke={isSel ? '#0b3d1f' : 'rgba(0,0,0,0.14)'}
            strokeWidth={isSel ? 3 : 1}
          />
          <text x={x} y={y + 4} textAnchor="middle" fill={side.color?.ink ?? '#0b3d1f'} className="pointer-events-none text-[10px] font-bold">
            {t(positionLabelKey('basketball', pos))}
          </text>
          <text x={x} y={nameY} textAnchor="middle" className="pointer-events-none fill-white text-[11px] font-medium">
            {first(side.nameOf(s.playerId))}
          </text>
        </g>,
      )
    })
  }
  return els
}

export function MatchCourt({ home, away }: { home: CourtSide; away: CourtSide }) {
  const t = useT()
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t('pitch.aria')}>
      <rect x="0" y="0" width={W} height={H} rx="14" className="fill-court" />
      <rect x="10" y="10" width={W - 20} height={H - 20} rx="8" fill="none" stroke="var(--chalk)" strokeWidth="2" />
      <line x1="10" y1={MID} x2={W - 10} y2={MID} stroke="var(--chalk)" strokeWidth="2" />
      <circle cx={W / 2} cy={MID} r="34" fill="none" stroke="var(--chalk)" strokeWidth="2" />
      {/* keys under each basket */}
      <rect x={W / 2 - 40} y="10" width="80" height="70" fill="none" stroke="var(--chalk)" strokeWidth="2" />
      <rect x={W / 2 - 40} y={H - 80} width="80" height="70" fill="none" stroke="var(--chalk)" strokeWidth="2" />
      {/* baskets */}
      <circle cx={W / 2} cy="20" r="7" fill="none" stroke="var(--chalk)" strokeWidth="2" />
      <circle cx={W / 2} cy={H - 20} r="7" fill="none" stroke="var(--chalk)" strokeWidth="2" />
      <text x="16" y="22" textAnchor="start" className="fill-white text-[11px] font-bold" opacity="0.9">
        {away.label} · {away.shape}
      </text>
      <text x="16" y={H - 12} textAnchor="start" className="fill-white text-[11px] font-bold" opacity="0.9">
        {home.label} · {home.shape}
      </text>
      {tokens(away, AWAY_Y, false, t, home.selected != null)}
      {tokens(home, HOME_Y, true, t, away.selected != null)}
    </svg>
  )
}
