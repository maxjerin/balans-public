// Inline-SVG half-court with players slotted into a derived shape (multi-
// sport Phase 2). Attacking direction is up: G at the bottom (ball-handler,
// lower-center — gets a halo per the design handoff), then F, C, basket at
// the top. Same interaction pattern as ui/Pitch.tsx (tap-to-swap, selection
// halo) — hardwood fill (fill-court), not grass.
import type { KeyboardEvent } from 'react'
import type { CourtSlot, BasketballPosition } from '../domain/basketball'
import type { TeamColor } from './teamColors'
import { useT } from '../i18n/useT'
import { positionLabelKey } from '../i18n'

const W = 320
const H = 380

const COURT_LINES: BasketballPosition[] = ['G', 'F', 'C']
// Row y-centres by position, bottom → top (G lowest/ball-handler, C nearest basket).
const ROW_Y: Record<BasketballPosition, number> = { G: 320, F: 200, C: 90 }

function firstName(name: string): string {
  return name.split(/\s+/)[0]
}

export function Court({
  slots,
  nameOf,
  selected = null,
  onPickSlot,
  interactive = true,
  color,
}: {
  slots: CourtSlot[]
  nameOf: (id: string) => string
  selected?: number | null
  onPickSlot?: (slotIndex: number) => void
  interactive?: boolean
  color?: TeamColor
}) {
  const t = useT()
  const byLine = new Map<BasketballPosition, number[]>()
  slots.forEach((s, idx) => {
    const arr = byLine.get(s.position) ?? []
    arr.push(idx)
    byLine.set(s.position, arr)
  })

  const hasSel = interactive && selected !== null

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t('pitch.aria')}>
      {/* hardwood */}
      <rect x="0" y="0" width={W} height={H} rx="14" className="fill-court" />
      <rect x="10" y="10" width={W - 20} height={H - 20} rx="8" fill="none" stroke="var(--chalk)" strokeWidth="2" />
      {/* key/paint under the basket */}
      <rect x={W / 2 - 40} y="10" width="80" height="90" fill="none" stroke="var(--chalk)" strokeWidth="2" />
      {/* free-throw circle at the bottom of the key */}
      <circle cx={W / 2} cy="100" r="30" fill="none" stroke="var(--chalk)" strokeWidth="2" />
      {/* 3-point arc */}
      <path d={`M 30 ${H - 10} A 160 160 0 0 1 ${W - 30} ${H - 10}`} fill="none" stroke="var(--chalk)" strokeWidth="2" />
      {/* basket */}
      <circle cx={W / 2} cy="24" r="8" fill="none" stroke="var(--chalk)" strokeWidth="2" />

      {COURT_LINES.map((pos) => {
        const line = byLine.get(pos) ?? []
        const y = ROW_Y[pos]
        return line.map((idx, i) => {
          const s = slots[idx]
          const x = (W * (i + 1)) / (line.length + 1)
          const isSel = interactive && selected === idx
          // Ball-handler emphasis: G's token is drawn slightly larger.
          const r = pos === 'G' ? (isSel ? 23 : 19) : isSel ? 21 : 17
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
            <g key={s.playerId} {...interactiveProps} style={{ opacity: hasSel && !isSel ? 0.4 : 1 }}>
              {pos === 'G' && <circle cx={x} cy={y} r={r + 8} className="fill-primary" opacity="0.35" />}
              {isSel && <circle cx={x} cy={y} r={r + 6} className="fill-primary" opacity="0.35" />}
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
                {t(positionLabelKey('basketball', pos))}
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
