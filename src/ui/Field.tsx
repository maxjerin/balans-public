// Inline-SVG cricket fielding oval (follow-up to Phase 3 — the design
// handoff's optional field board). Reuses the green fill-pitch (a cricket
// field is grass, unlike basketball's hardwood), a tan pitch strip down the
// middle (fill-strip), boundary + 30-yard rings. Placements are fixed
// (x, y) positions per domain/cricketField.ts's FIELD_PLACEMENTS — no
// per-line grouping the way Pitch/Court have, since fielding positions
// aren't eligibility-restricted. Same tap-to-swap/selection-halo
// interaction pattern as Pitch/Court.
import type { KeyboardEvent } from 'react'
import type { FieldSlot, FieldPlacement } from '../domain/cricketField'
import type { TeamColor } from './teamColors'
import { useT } from '../i18n/useT'
import { positionLabelKey } from '../i18n'

const W = 320
const H = 440

// Fixed (x, y) per placement — illustrative field geography (off-side
// placements slip→gully→point→cover→mid-off arc one way from the strip,
// leg-side square-leg→fine-leg→third-man arc the other way), same
// "reasonable v1 default" caveat as the shape tables elsewhere.
const PLACEMENT_XY: Record<FieldPlacement, [number, number]> = {
  BWL: [160, 150],
  WK: [160, 290],
  SLIP: [195, 275],
  GULLY: [225, 255],
  POINT: [255, 210],
  COVER: [240, 145],
  'MID-OFF': [190, 95],
  'MID-ON': [130, 95],
  'SQ-LEG': [70, 165],
  'FINE-LEG': [85, 250],
  'THIRD-MAN': [125, 300],
}

function firstName(name: string): string {
  return name.split(/\s+/)[0]
}

export function Field({
  slots,
  nameOf,
  selected = null,
  onPickSlot,
  interactive = true,
  color,
}: {
  slots: FieldSlot[]
  nameOf: (id: string) => string
  selected?: number | null
  onPickSlot?: (slotIndex: number) => void
  interactive?: boolean
  color?: TeamColor
}) {
  const t = useT()
  const hasSel = interactive && selected !== null

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t('pitch.aria')}>
      {/* outfield */}
      <rect x="0" y="0" width={W} height={H} rx="14" className="fill-pitch" />
      {/* boundary */}
      <ellipse cx={W / 2} cy="220" rx="140" ry="190" fill="none" stroke="var(--chalk)" strokeWidth="2" />
      {/* 30-yard ring */}
      <ellipse cx={W / 2} cy="220" rx="85" ry="115" fill="none" stroke="var(--chalk)" strokeWidth="2" />
      {/* pitch strip */}
      <rect x={W / 2 - 15} y="140" width="30" height="160" className="fill-strip" />

      {slots.map((s, idx) => {
        const [x, y] = PLACEMENT_XY[s.placement]
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
          <g key={s.playerId} {...interactiveProps} style={{ opacity: hasSel && !isSel ? 0.4 : 1 }}>
            {isSel && <circle cx={x} cy={y} r={r + 6} className="fill-primary" opacity="0.35" />}
            {interactive && !isSel && (
              <circle cx={x} cy={y} r={r + 4} fill="none" className="stroke-primary" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
            )}
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={color?.fill ?? '#ffffff'}
              stroke={isSel ? '#0b3d1f' : 'rgba(0,0,0,0.15)'}
              strokeWidth={isSel ? 3 : 1}
            />
            <text x={x} y={y + 4} textAnchor="middle" fill={color?.ink ?? '#0b3d1f'} className="pointer-events-none text-[9px] font-bold">
              {t(positionLabelKey('cricket', s.placement))}
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
      })}
    </svg>
  )
}
