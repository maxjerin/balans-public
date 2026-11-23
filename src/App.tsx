import { useState } from 'react'
import { useAppStore } from './state/store'
import { Wizard } from './wizard/Wizard'
import { SportStep } from './wizard/SportStep'
import { SharedView } from './ui/SharedView'
import { PrivacyPolicy } from './ui/PrivacyPolicy'
import { ConsentBanner } from './consent/ConsentBanner'
import { StickyAd } from './ads/StickyAd'
import { adsActive } from './ads/ads'

export function App() {
  const fromLink = useAppStore((s) => s.fromLink)
  const sportChosen = useAppStore((s) => s.sportChosen)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [adDismissed, setAdDismissed] = useState(false)
  const openPrivacy = () => setPrivacyOpen(true)
  const adVisible = adsActive() && !adDismissed
  return (
    <>
      {!sportChosen ? (
        <SportStep />
      ) : fromLink ? (
        <SharedView onPrivacy={openPrivacy} />
      ) : (
        <Wizard onPrivacy={openPrivacy} bottomInset={adVisible} />
      )}
      {privacyOpen && <PrivacyPolicy onClose={() => setPrivacyOpen(false)} />}
      {adVisible && <StickyAd onDismiss={() => setAdDismissed(true)} />}
      <ConsentBanner onPrivacy={openPrivacy} />
    </>
  )
}
