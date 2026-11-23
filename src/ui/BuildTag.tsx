import { BUILD } from '../version/build'

// Tiny, dim footer marker of the running commit. Lets you confirm at a glance
// which build a page is actually rendering (a stale SW cache shows an old value
// here while /version.json shows the current edge build).
export function BuildTag() {
  return (
    <span className="text-faint" title={`built ${BUILD.builtAt}`}>
      build {BUILD.version}
    </span>
  )
}
