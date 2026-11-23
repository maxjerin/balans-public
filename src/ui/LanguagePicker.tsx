// Header control to switch UI language. Native <select> for zero-dep a11y +
// mobile-friendliness. Language NAMES are shown in their own language.
import { useAppStore } from '../state/store'
import { SUPPORTED, type Lang } from '../i18n'
import { useT } from '../i18n/useT'

const NAME_KEY: Record<Lang, 'lang.en' | 'lang.fr' | 'lang.es' | 'lang.pt'> = {
  en: 'lang.en',
  fr: 'lang.fr',
  es: 'lang.es',
  pt: 'lang.pt',
}

export function LanguagePicker() {
  const lang = useAppStore((s) => s.lang)
  const setLang = useAppStore((s) => s.setLang)
  const t = useT()
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      aria-label={t('lang.aria')}
      title={t('lang.aria')}
      className="tap-target rounded-md border border-line bg-surface px-2 py-1 text-sm text-muted hover:bg-surface-2"
    >
      {SUPPORTED.map((l) => (
        <option key={l} value={l}>
          {t(NAME_KEY[l])}
        </option>
      ))}
    </select>
  )
}
