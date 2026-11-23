// Inline-SVG pitch with players slotted into a derived formation (brief §9).
// Attacking direction is up: GK at the bottom, then DEF, MID, FWD rows.
// Interactive by default (tap a token to select, tap another to swap spots —
// stays within the team, keeps the shape). Pass interactive={false} for a
// read-only summary view (e.g. the Share step).
import type { KeyboardEvent } from 'react'
import type { Slot, FootballPosition } from '../domain/formation'
import type { TeamColor } from './teamColors'
import { useT } from '../i18n/useT'
import { positionLabelKey } from '../i18n'

const W = 320
const H = 440

const FOOTBALL_LINES: FootballPosition[] = ['GK', 'DEF', 'MID', 'FWD']
// Row y-centres by position, bottom → top.
const ROW_Y: Record<FootballPosition, number> = { GK: 396, DEF: 300, MID: 196, FWD: 84 }

function firstName(name: string): string {
  return name.split(/\s+/)[0]
}

export function Pitch({
  slots,
  nameOf,
  selected = null,
  onPickSlot,
  interactive = true,
  color,
}: {
  slots: Slot[]
  nameOf: (id: string) => string
  /** index of the currently selected slot (for tap-to-swap), or null */
  selected?: number | null
  /** called with a slot index on tap/keyboard (select then swap) */
  onPickSlot?: (slotIndex: number) => void
  /** false → read-only board: tokens aren't focusable/clickable */
  interactive?: boolean
  /** team colour for the tokens; undefined ⇒ default white/dark-green look */
  color?: TeamColor
}) {
  const t = useT()
  // group slot indices by position line, preserving order
  const byLine = new Map<FootballPosition, number[]>()
  slots.forEach((s, idx) => {
    const arr = byLine.get(s.position) ?? []
    arr.push(idx)
    byLine.set(s.position, arr)
  })

  const hasSel = interactive && selected !== null

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t('pitch.aria')}>
      {/* turf */}
      <rect x="0" y="0" width={W} height={H} rx="14" className="fill-pitch" />
      <rect x="10" y="10" width={W - 20} height={H - 20} rx="8" fill="none" stroke="var(--chalk)" strokeWidth="2" />
      <line x1="10" y1={H / 2} x2={W - 10} y2={H / 2} stroke="var(--chalk)" strokeWidth="2" />
      <circle cx={W / 2} cy={H / 2} r="34" fill="none" stroke="var(--chalk)" strokeWidth="2" />
      <rect x={W / 2 - 46} y="10" width="92" height="40" fill="none" stroke="var(--chalk)" strokeWidth="2" />
      <rect x={W / 2 - 46} y={H - 50} width="92" height="40" fill="none" stroke="var(--chalk)" strokeWidth="2" />

      {FOOTBALL_LINES.map((pos) => {
        const line = byLine.get(pos) ?? []
        const y = ROW_Y[pos]
        return line.map((idx, i) => {
          const s = slots[idx]
          const x = (W * (i + 1)) / (line.length + 1)
          const isSel = interactive && selected === idx
          const r = isSel ? 21 : 17
          const interactiveProps = interactive
            ? {
                role: 'button',
                tabIndex: 0,
                'aria-pressed': isSel,
                className: 'cursor-pointer',
                onClick: () => onPickSlot?.(idx),
                onKeyDown: (e: KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onPickSlot?.(idx)
                  }
                },
              }
            : {}
          return (
            <g
              key={s.playerId}
              {...interactiveProps}
              // fade the others so the selected token stands out
              style={{ opacity: hasSel && !isSel ? 0.4 : 1 }}
            >
              {/* selection halo */}
              {isSel && <circle cx={x} cy={y} r={r + 6} className="fill-primary" opacity="0.35" />}
              {/* idle affordance: faint dashed ring signals the token is tappable/swappable */}
              {interactive && !isSel && (
                <circle
                  cx={x}
                  cy={y}
                  r={r + 4}
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />
              )}
              {/* off-position signalled by an accent ring so the fill can carry team colour */}
              {s.offPosition && <circle cx={x} cy={y} r={r + 2.5} fill="none" className="stroke-accent" strokeWidth="2.5" />}
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={color?.fill ?? '#ffffff'}
                stroke={isSel ? '#0b3d1f' : 'rgba(0,0,0,0.15)'}
                strokeWidth={isSel ? 3 : 1}
              />
              <text x={x} y={y + 4} textAnchor="middle" fill={color?.ink ?? '#0b3d1f'} className="pointer-events-none text-[11px] font-bold">
                {t(positionLabelKey('football', pos))}
              </text>
              <text
                x={x}
                y={y + r + 15}
                textAnchor="middle"
                className={'pointer-events-none fill-white ' + (isSel ? 'text-[13px] font-bold' : 'text-[12px] font-medium')}
              >
                {firstName(nameOf(s.playerId))}
              </text>
            </g>
          )
        })
      })}
    </svg>
  )
}
