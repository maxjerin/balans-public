// Region detection for the consent banner. EEA + UK visitors get a GDPR/UK-GDPR
// consent prompt; everyone else does not. Detected entirely client-side from the
// browser's IANA timezone — NO IP lookup, NO geo server call (keeps the no-server
// promise, brief §3). This is a conservative approximation: every `Europe/*`
// zone plus the EEA Atlantic islands counts as "needs consent". Over-inclusion
// only means a few extra non-EEA European visitors see the banner — safe. The
// owner can swap in a certified CMP's own geo signal later without touching the UI.

const EEA_ATLANTIC = new Set([
  'Atlantic/Reykjavik', // Iceland (EEA)
  'Atlantic/Canary', // Spain
  'Atlantic/Madeira', // Portugal
  'Atlantic/Azores', // Portugal
  'Atlantic/Faroe', // Denmark
])

/** True when a timezone falls in (a conservative superset of) the EEA/UK. */
export function needsConsent(timezone: string | undefined): boolean {
  const tz = (timezone ?? '').trim()
  if (!tz) return false
  return tz.startsWith('Europe/') || EEA_ATLANTIC.has(tz)
}

/** Best-effort current IANA timezone; '' if unavailable. */
export function currentTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
  } catch {
    return ''
  }
}
