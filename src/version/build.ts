// Build identity + a stale-cache check. The running app carries the commit it
// was built from (BUILD.version, baked in via vite `define`). /version.json is
// served fresh from the edge (never precached), so fetching it tells you the
// commit Cloudflare actually deployed. If they differ, this client is running a
// stale service-worker cache and needs a reload.

export const BUILD = {
  version: __APP_VERSION__,
  builtAt: __BUILD_TIME__,
} as const

export interface BuildStatus {
  current: string
  latest: string
  stale: boolean
}

/** Pure comparison — easy to test, no fetch. */
export function compareBuild(current: string, latest: string): BuildStatus {
  return { current, latest, stale: !!latest && !!current && latest !== current }
}

/**
 * Fetch the edge's /version.json and compare it to this bundle's baked version.
 * Returns null if the check can't run (offline, missing file). `cache:'no-store'`
 * so the service worker never answers from cache.
 */
export async function checkForUpdate(): Promise<BuildStatus | null> {
  try {
    const res = await fetch('/version.json', { cache: 'no-store' })
    if (!res.ok) return null
    const latest = (await res.json())?.version
    if (typeof latest !== 'string') return null
    return compareBuild(BUILD.version, latest)
  } catch {
    return null
  }
}
