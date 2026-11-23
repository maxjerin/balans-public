// React hook binding the active store language to `translate`. Components that
// call useT() re-render when the language switches (Zustand subscription).
import { useAppStore } from '../state/store'
import { translate, type Dict } from './index'

export function useT() {
  const lang = useAppStore((s) => s.lang)
  return (key: keyof Dict, params?: Record<string, string | number>) =>
    translate(lang, key, params)
}
