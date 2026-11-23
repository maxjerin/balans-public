// Copy-to-clipboard button with a transient "Copied ✓" confirmation.
import { useState } from 'react'
import { copyText } from './clipboard'
import { useT } from '../i18n/useT'

export function CopyButton({
  label,
  text,
  className = '',
  onCopied,
}: {
  label: string
  text: string
  className?: string
  /** called after a successful copy */
  onCopied?: () => void
}) {
  const t = useT()
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true)
          setTimeout(() => setDone(false), 1500)
          onCopied?.()
        }
      }}
      className={'rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-ink hover:bg-primary-press ' + className}
    >
      {done ? t('share.copied') : label}
    </button>
  )
}
