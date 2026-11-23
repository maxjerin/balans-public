// The `list` result view (multi-sport Phase 1 — see domain/sport.ts
// ResultView). Plain balanced team card: header (name + count), starters in
// pool add-order, subs captioned below. No position/formation concept —
// used for the generic sport, and reusable as-is for any future sport whose
// resultView is 'list'.
export function TeamResultList({
  label,
  starterNames,
  subNames,
  color,
}: {
  label: string
  starterNames: string[]
  subNames: string[]
  color?: string
}) {
  return (
    <div className="rounded-md border border-line">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-ink">
          {color && <span className="h-3 w-3 shrink-0 rounded-full border border-line" style={{ backgroundColor: color }} />}
          <span className="min-w-0 truncate">{label}</span>
        </span>
        <span className="shrink-0 text-xs text-faint">{starterNames.length + subNames.length}</span>
      </div>
      <ul>
        {starterNames.map((name, i) => (
          <li key={i} className="border-b border-line px-3 py-2 text-sm text-ink last:border-b-0">
            {name}
          </li>
        ))}
      </ul>
      {subNames.length > 0 && (
        <p className="border-t border-line px-3 py-2 text-xs text-faint">{subNames.join(', ')}</p>
      )}
    </div>
  )
}
