import { describe, expect, it } from 'vitest'
import { detectLang, translate } from './index'
import { en } from './en'
import { fr } from './fr'
import { es } from './es'
import { pt } from './pt'

describe('detectLang', () => {
  it('maps regional tags to the primary language', () => {
    expect(detectLang('fr-FR')).toBe('fr')
    expect(detectLang('pt-BR')).toBe('pt')
    expect(detectLang('es-419')).toBe('es')
    expect(detectLang('en-US')).toBe('en')
  })
  it('falls back to en for unknown or empty input', () => {
    expect(detectLang('de')).toBe('en')
    expect(detectLang('')).toBe('en')
    expect(detectLang(undefined)).toBe('en')
  })
})

describe('translate', () => {
  it('returns the string for a key', () => {
    expect(translate('en', 'back')).toBe('Back')
  })
  it('interpolates {name} placeholders', () => {
    expect(translate('en', 'team.namePlaceholder', { n: 3 })).toBe('Team 3')
  })
  it('leaves an unmatched placeholder literal when its param is absent', () => {
    expect(translate('en', 'team.namePlaceholder')).toBe('Team {n}')
  })
})

describe('dictionary completeness', () => {
  const expected = Object.keys(en).sort()
  it.each([
    ['fr', fr],
    ['es', es],
    ['pt', pt],
  ] as const)('%s has exactly the same keys as en', (_name, dict) => {
    expect(Object.keys(dict).sort()).toEqual(expected)
  })
})
