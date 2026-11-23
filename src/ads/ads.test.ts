import { describe, expect, it } from 'vitest'
import { adsEnabled, adsenseClient, adsenseSlot, adsSampleMode } from './ads'

describe('adsEnabled', () => {
  it('is off by default (flag false, no client)', () => {
    expect(adsEnabled({ VITE_ADS_ENABLED: 'false', VITE_ADSENSE_CLIENT: '' })).toBe(false)
  })
  it('stays off when flagged on but no client id', () => {
    expect(adsEnabled({ VITE_ADS_ENABLED: 'true', VITE_ADSENSE_CLIENT: '' })).toBe(false)
  })
  it('stays off when a client id is set but the flag is off', () => {
    expect(adsEnabled({ VITE_ADS_ENABLED: 'false', VITE_ADSENSE_CLIENT: 'ca-pub-123' })).toBe(false)
  })
  it('is on only when flagged AND a client id is present', () => {
    expect(adsEnabled({ VITE_ADS_ENABLED: 'true', VITE_ADSENSE_CLIENT: 'ca-pub-123' })).toBe(true)
  })
  it('treats whitespace-only client id as unset', () => {
    expect(adsEnabled({ VITE_ADS_ENABLED: 'true', VITE_ADSENSE_CLIENT: '   ' })).toBe(false)
  })
})

describe('adsSampleMode', () => {
  it('is off by default', () => {
    expect(adsSampleMode({})).toBe(false)
    expect(adsSampleMode({ VITE_ADS_SAMPLE: 'false' })).toBe(false)
  })
  it('is on when flagged', () => {
    expect(adsSampleMode({ VITE_ADS_SAMPLE: 'true' })).toBe(true)
  })
})

describe('adsenseClient / adsenseSlot', () => {
  it('trims configured values', () => {
    expect(adsenseClient({ VITE_ADSENSE_CLIENT: ' ca-pub-9 ' })).toBe('ca-pub-9')
    expect(adsenseSlot({ VITE_ADSENSE_SLOT: ' 12345 ' })).toBe('12345')
  })
  it('returns empty string when unset', () => {
    expect(adsenseClient({})).toBe('')
    expect(adsenseSlot({})).toBe('')
  })
})
