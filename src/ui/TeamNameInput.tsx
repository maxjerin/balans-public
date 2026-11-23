// Editable team name. The default "Team N" is shown as real, selectable text
// (not a greyed placeholder) so tapping the field highlights it for easy
// replacement. While the field is focused a local buffer holds the raw text —
// including empty — so backspacing to nothing doesn't snap back to the default
// mid-edit. Storage stays lean: a value equal to the default (or empty) is
// stored as blank, which renders back as "Team N" once the field blurs.
import { useState } from 'react'
import { useAppStore } from '../state/store'
import { useT } from '../i18n/useT'

export function TeamNameInput({ ti }: { ti: number }) {
  const { setup, setTeamName } = useAppStore()
  const t = useT()
  const custom = setup.teamNames?.[ti] ?? ''
  const defaultLabel = t('team.namePlaceholder', { n: ti + 1 })
  // Non-null only while editing; lets the field hold an empty string without
  // the default label snapping back in.
  const [buffer, setBuffer] = useState<string | null>(null)
  const value = buffer !== null ? buffer : custom || defaultLabel

  return (
    <span className="group flex min-w-0 flex-1 items-center gap-1.5 border-b border-line focus-within:border-primary">
      <input
        value={value}
        onFocus={(e) => {
          // Seed the buffer with the current effective name and select it, so
          // the first keystroke replaces it and deletions can empty the field.
          setBuffer(custom || defaultLabel)
          e.currentTarget.select()
        }}
        onChange={(e) => {
          const next = e.target.value
          setBuffer(next)
          setTeamName(ti, next === defaultLabel ? '' : next)
        }}
        onBlur={() => setBuffer(null)}
        aria-label={t('team.nameAria', { n: ti + 1 })}
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink focus:outline-none"
      />
      <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-faint transition group-focus-within:text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.5 4.5l2 2M4 16l1-3.5 8-8 2.5 2.5-8 8L4 16z" />
      </svg>
    </span>
  )
}
