// Master dictionary — the single source of truth. Other languages are typed
// against `Dict` so missing/extra keys fail the build. Flat keys; dotted names
// are plain string keys, not nested objects. Placeholders use {name} syntax.
export const en = {
  // app / chrome
  'appName': 'Balans',
  'tagline': 'Pick. Balance. Play.',
  'fromLink': 'Loaded a shared link — edit and regenerate for a new week.',
  'footerPrivacy': 'No account · no server · your data lives only in this link.',
  'back': 'Back',
  'next': 'Next',
  'addToContinue': 'Add {n} more {unit} to continue (min {min}).',
  'player': 'player',
  'players': 'players',
  'comingSoon': '{label} — coming soon (built in a later milestone).',
  'wizard.stepsAria': 'Wizard steps',
  'home.aria': 'Go to the first step',

  // step labels
  'step.players': 'Players',
  'step.teams': 'Teams',
  'step.formation': 'Formation',
  'step.share': 'Share',

  // positions (football)
  'pos.football.gk': 'GK',
  'pos.football.def': 'DEF',
  'pos.football.mid': 'MID',
  'pos.football.fwd': 'FWD',

  // positions (basketball)
  'pos.basketball.g': 'G',
  'pos.basketball.f': 'F',
  'pos.basketball.c': 'C',

  // positions (cricket)
  'pos.cricket.bat': 'BAT',
  'pos.cricket.all': 'ALL',
  'pos.cricket.bowl': 'BOWL',
  'pos.cricket.wk': 'WK',
  'pos.cricket.bwl': 'BWL',
  'pos.cricket.slip': 'SLIP',
  'pos.cricket.gully': 'GULLY',
  'pos.cricket.point': 'POINT',
  'pos.cricket.cover': 'COVER',
  'pos.cricket.mid-off': 'MID-OFF',
  'pos.cricket.mid-on': 'MID-ON',
  'pos.cricket.sq-leg': 'SQ-LEG',
  'pos.cricket.fine-leg': 'FINE-LEG',
  'pos.cricket.third-man': 'THIRD-MAN',

  // styles
  'style.def': 'Defensive',
  'style.bal': 'Balanced',
  'style.att': 'Attacking',

  // sport picker (Step 0 gate)
  'sport.picker.eyebrow': 'Choose a sport',
  'sport.football.label': 'Football',
  'sport.football.caption': 'GK/DEF/MID/FWD · pitch',
  'sport.basketball.label': 'Basketball',
  'sport.basketball.caption': 'G/F/C · court',
  'sport.cricket.label': 'Cricket',
  'sport.cricket.caption': 'BAT/ALL/BOWL/WK · scorecard',
  'sport.generic.label': 'Other / no positions',
  'sport.generic.caption': 'plain split',
  'sport.switch': 'Switch sport',
  'sport.switch.aria': 'Switch sport — returns to the sport picker',

  // theme
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.system': 'System',
  'theme.label': 'Theme',
  'theme.aria': 'Theme: {label} (tap to change)',
  'theme.title': 'Theme: {label}',

  // language picker (names stay native in every dict)
  'lang.aria': 'Language',
  'lang.en': 'English',
  'lang.fr': 'Français',
  'lang.es': 'Español',
  'lang.pt': 'Português',

  // players step
  'players.addLabel': 'Add players',
  'players.placeholder': 'Ana, Ben, Chris…',
  'players.hint': 'Separate with a comma or new line — paste a whole list.',
  'players.add': 'Add',
  'players.addAll': 'Add all',
  'players.loadTestSquad': 'Load test squad',
  'players.pool': 'Pool',
  'players.playersWord': 'players',
  'players.clear': 'Clear',
  'players.clearConfirm': 'Clear all players?',
  'players.empty': 'No players yet.',
  'players.nameAria': 'Name for {name}',
  'players.removeAria': 'Remove {name}',
  'players.pickPosition': 'Pick at least one position',
  'players.skillToggle': 'Balance by skill',
  'players.skillLabel': 'Skill',
  'players.skillUp': 'Increase skill for {name}',
  'players.skillDown': 'Decrease skill for {name}',
  'players.positionRank': '{pos} — priority {n}',
  'players.positionHint': 'Tap positions in preference order — darker = primary, lighter = backup.',
  'players.skillSet': 'Set {name}’s skill to {n}',

  // teams step
  'teams.numberOfTeams': 'Number of teams',
  'teams.subsPerTeam': 'Subs per team',
  'teams.decreaseAria': 'Decrease {label}',
  'teams.increaseAria': 'Increase {label}',
  'teams.generate': 'Generate teams',
  'teams.regenerate': 'Regenerate',
  'teams.tapTwo': 'Tap a player, then tap another — same team or a different one — to swap.',
  'teams.tapAnother': 'Swap {name} with… (tap again to cancel)',
  'teams.reshuffle': 'Re-shuffle',
  'teams.onField': 'on field',
  'teams.starter': 'Starter',
  'teams.sub': 'Sub',
  'teams.needGenerate': 'Generate teams to continue.',

  // layout summary + warnings (domain returns codes; UI formats here)
  'layout.summary': 'Teams: {k} · sizes {sizes} · field {field} · subs {subs}',
  'warn.needTeams': 'Need at least 2 teams.',
  'warn.tooFewPlayers': 'Too few players: {total} for {k} teams (need at least {k}).',
  'warn.unevenSides':
    'Uneven sides: {lowCount} team(s) a player short on the field ({highCount} on field {highField}, {lowCount} on field {lowField}).',
  'warn.fieldExceedsTarget': 'Field counts exceed your target of {target}; reduce teams or add subs to match.',
  'warn.keeperShortfall':
    '{keepers} keeper(s) for {k} teams — some sides have no specialist GK; multi-position players cover.',

  // formation step
  'formation.needTeams': 'Generate teams first (step 2), then pick a style here.',
  'formation.tapAnother': 'Swap {name} with… (tap again to cancel)',
  'formation.tapTwo': 'Tap two spots on one team to swap their positions.',
  'formation.resetStyles': 'Reset styles',
  'formation.resetTitle': 'Reset every team to the same style',
  'formation.subs': 'Subs: {names}',
  'formation.offPosition': 'Amber = playing out of their tagged positions.',
  'formation.ctaQuestion': 'Want to change the shape itself (not just swap players)?',
  'formation.ctaContact': 'Contact us →',

  // share step
  'share.intro': 'This link is locked — anyone who opens it sees these exact teams and can view different formations, but can’t change them.',
  'share.linkLabel': 'Share link',
  'share.copyLink': 'Copy link',
  'share.copied': 'Copied ✓',
  'share.longUrl': 'This link is long ({n} chars). It still works, but trim the pool if a chat app clips it.',
  'share.textLabel': 'Text for WhatsApp / group chat',
  'share.copyText': 'Copy text',
  'share.noTeams': 'No teams generated yet — go to Teams to build them, then come back to share.',
  'share.remixIntro': 'Playing again next week? Keep the pool, drop the no-shows, regenerate.',
  'share.newWeek': 'Start a new week from this',

  // pitch
  'pitch.aria': 'Formation pitch',

  // team name
  'team.namePlaceholder': 'Team {n}',
  'team.nameAria': 'Name for team {n}',
  'team.colorAria': 'Colour for team {n}',
  'team.colorSwatchAria': 'Colour {n}',

  // export text
  'export.poolHeading': 'Pool ({n})',

  // sign-up list (step 1)
  'list.heading': 'This week',
  'list.summaryIn': '{n} in',
  'list.summaryCap': '{n}/{cap} in',
  'list.summaryFull': '{n}/{cap} · full',
  'list.needMore': 'need {n} more',
  'list.waitlistCount': '{n} on waitlist',
  'list.guestOf': '+1 {name}',
  'list.confirmed': 'Playing',
  'list.waitlist': 'Waitlist',
  'list.maybe': 'Maybe',
  'list.none': 'No reply',
  'list.out': 'Out',
  'list.editLink': '✏️ Add yourself / edit:',
  'list.statusIn': 'In',
  'list.statusMaybe': 'Maybe',
  'list.statusOut': 'Out',
  'list.statusAria': 'Set {name} to {status}',
  'list.addGuest': '+ Guest',
  'list.addGuestAria': 'Add a guest for {name}',
  'list.guestPlaceholder': 'Guest name',
  'list.guestLabel': 'Guest',
  'list.guestWith': 'Guest · with {name}',
  'list.cap': 'Max players',
  'list.min': 'Min players',
  'list.shareHeading': 'Share the list',
  'list.shareHint': 'Post it in the group chat — anyone with the link can update it and share it back.',
  'list.copyText': 'Copy list for WhatsApp',
  'list.copyLink': 'Copy link',
  'list.mergeHeading': 'Got two versions of the list? Merge another link',
  'list.mergePlaceholder': 'Paste the other Balans link',
  'list.merge': 'Merge',
  'list.mergeError': 'That doesn’t look like a Balans link for this sport.',
  'list.merged': 'Merged ✓',

  // ads
  'ads.label': 'Advertisement',
  'ads.sample': 'Sample ad — your ad here',

  // consent banner
  'consent.title': 'Your privacy choices',
  'consent.body': 'We’d use cookies for ads and analytics. Accept or decline — the app works either way.',
  'consent.accept': 'Accept',
  'consent.decline': 'Decline',
  'consent.privacyLink': 'Privacy policy',

  // privacy policy
  'privacy.footerLink': 'Privacy',
  'about.link': 'About',
  'help.link': 'Help',
  'privacy.title': 'Privacy',
  'privacy.intro': 'Balans runs entirely in your browser. There is no account and no server that stores your data.',
  'privacy.noServer.title': 'No server, no database',
  'privacy.noServer.body': 'All team-balancing happens on your device. We don’t run a backend that receives your players or setups.',
  'privacy.localData.title': 'Where your data lives',
  'privacy.localData.body': 'Your pool and last setup are saved only in this browser’s local storage. Clearing your browser data removes them.',
  'privacy.sharing.title': 'Share links',
  'privacy.sharing.body': 'A share link encodes the whole setup after the “#” in the URL, which browsers never send to a server. Only people you send the link to can read it.',
  'privacy.adsAnalytics.title': 'Ads & analytics',
  'privacy.adsAnalytics.body': 'The default build shows no ads and runs no tracking. If a future build enables them, they stay behind your consent where the law requires it.',
  'privacy.close': 'Close',

  // setup title + shared read-only view
  'title.label': 'Setup name',
  'title.placeholder': 'Name this week',
  'view.sharedBadge': 'Shared with you',
  'view.createdOn': 'Created {date}',
  'view.remix': 'Edit these teams',
  'view.remixHint': 'Tweak this week — makes your own copy; this link stays unchanged.',
  'view.formationFor': 'Formation for {name}',
  'view.previewNotice': 'Preview only — you can switch formations to explore, but you can’t change these teams. Want a different version? Use “Edit these teams” below to make your own — this link stays as shared.',
  'view.makeOwn': 'Make your own',
  'view.makeOwnHint': 'Start fresh with an empty squad — for your own group.',
  'view.untitled': 'Shared setup',
} as const

/** Keys are fixed by the English master; values are free strings per language. */
export type Dict = Record<keyof typeof en, string>
