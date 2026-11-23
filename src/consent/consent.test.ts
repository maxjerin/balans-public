import { describe, expect, it } from 'vitest'
import { needsConsent } from './region'
import { consentEnabled, gaMeasurementId, shouldShowBanner } from './consent'

describe('needsConsent', () => {
  it('is true for EEA/UK European timezones', () => {
    expect(needsConsent('Europe/Berlin')).toBe(true)
    expect(needsConsent('Europe/London')).toBe(true)
    expect(needsConsent('Europe/Paris')).toBe(true)
  })
  it('is true for EEA Atlantic islands', () => {
    expect(needsConsent('Atlantic/Reykjavik')).toBe(true)
    expect(needsConsent('Atlantic/Madeira')).toBe(true)
  })
  it('is false for non-European timezones', () => {
    expect(needsConsent('America/New_York')).toBe(false)
    expect(needsConsent('Asia/Kolkata')).toBe(false)
    expect(needsConsent('Australia/Sydney')).toBe(false)
  })
  it('is false for empty/undefined input', () => {
    expect(needsConsent('')).toBe(false)
    expect(needsConsent(undefined)).toBe(false)
  })
})

describe('consentEnabled / gaMeasurementId', () => {
  it('is off by default', () => {
    expect(consentEnabled({ VITE_CONSENT_ENABLED: 'false' })).toBe(false)
    expect(consentEnabled({})).toBe(false)
  })
  it('is on when flagged true', () => {
    expect(consentEnabled({ VITE_CONSENT_ENABLED: 'true' })).toBe(true)
  })
  it('reads + trims the GA id', () => {
    expect(gaMeasurementId({ VITE_GA_MEASUREMENT_ID: ' G-ABC ' })).toBe('G-ABC')
    expect(gaMeasurementId({})).toBe('')
  })
})

describe('shouldShowBanner', () => {
  it('shows only when enabled, region needs it, and no prior choice', () => {
    expect(shouldShowBanner({ enabled: true, regionNeedsConsent: true, stored: null })).toBe(true)
  })
  it('hides when feature disabled', () => {
    expect(shouldShowBanner({ enabled: false, regionNeedsConsent: true, stored: null })).toBe(false)
  })
  it('hides outside a consent region', () => {
    expect(shouldShowBanner({ enabled: true, regionNeedsConsent: false, stored: null })).toBe(false)
  })
  it('hides once a choice is stored', () => {
    expect(shouldShowBanner({ enabled: true, regionNeedsConsent: true, stored: 'granted' })).toBe(false)
    expect(shouldShowBanner({ enabled: true, regionNeedsConsent: true, stored: 'denied' })).toBe(false)
  })
})
