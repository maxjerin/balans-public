// Content source for the static pages, in all four supported languages. Keep
// prose faithful across languages; the AdSense advertising/consent disclosures
// in `privacy` must stay accurate in every locale. Rendered by content/render.ts.
import type { ChromeLabels, ContentLang, ContentPage } from './types'

const EMAIL = 'hello@balans.team'

export const CHROME: Record<ContentLang, ChromeLabels> = {
  en: {
    home: 'Home',
    about: 'About',
    help: 'Help',
    contact: 'Contact',
    privacy: 'Privacy',
    terms: 'Terms',
    tagline: 'Balans · No account · no server · your data lives only in your link.',
    langName: 'English',
  },
  fr: {
    home: 'Accueil',
    about: 'À propos',
    help: 'Aide',
    contact: 'Contact',
    privacy: 'Confidentialité',
    terms: 'Conditions',
    tagline: 'Balans · Sans compte · sans serveur · vos données vivent uniquement dans votre lien.',
    langName: 'Français',
  },
  es: {
    home: 'Inicio',
    about: 'Acerca de',
    help: 'Ayuda',
    contact: 'Contacto',
    privacy: 'Privacidad',
    terms: 'Términos',
    tagline: 'Balans · Sin cuenta · sin servidor · tus datos viven solo en tu enlace.',
    langName: 'Español',
  },
  pt: {
    home: 'Início',
    about: 'Sobre',
    help: 'Ajuda',
    contact: 'Contato',
    privacy: 'Privacidade',
    terms: 'Termos',
    tagline: 'Balans · Sem conta · sem servidor · seus dados vivem apenas no seu link.',
    langName: 'Português',
  },
}

const about: ContentPage = {
  slug: 'about',
  perLang: {
    en: {
      title: 'About Balans — Fair football teams, every week',
      description:
        'Balans splits a weekly pool of players into balanced football teams, assigns positions and a formation, and shares the whole setup as one link. No account, no server.',
      h1: 'Fair football teams, every week',
      blocks: [
        {
          kind: 'lead',
          text: 'Balans takes your weekly pool of players and splits it into balanced sides — then assigns positions, derives a formation, and packs the whole setup into a single shareable link. No account. No server. Your data never leaves your device.',
        },
        { kind: 'cta', href: '/', label: 'Open Balans →' },
        { kind: 'h2', text: 'How it works' },
        {
          kind: 'ol',
          items: [
            "<strong>Add players</strong> and tag each one's positions (GK / DEF / MID / FWD).",
            '<strong>Generate teams</strong> — the balancer spreads keepers and evens out positions across the sides.',
            '<strong>Pick a style</strong> per team and it derives a formation; drag players to fine-tune.',
            '<strong>Share the link</strong> — or a WhatsApp-ready text version. Whoever opens it sees the exact setup.',
          ],
        },
        { kind: 'h2', text: 'How does it make teams fair?' },
        {
          kind: 'p',
          html: 'Balans balances by position, not guesswork: it makes sure goalkeepers are spread across sides, evens out defenders, midfielders and forwards, and flags when one team would be a player short. Re-generate for a fresh split any time, or tap two players to swap them.',
        },
        { kind: 'h2', text: 'FAQ' },
        { kind: 'p', html: '<strong>Is it free?</strong> Yes.' },
        {
          kind: 'p',
          html: '<strong>Do you store my players or setups?</strong> No. There is no backend. Everything lives in your browser and in the share link’s URL fragment, which browsers never send to a server.',
        },
        {
          kind: 'p',
          html: '<strong>Do I need an account?</strong> No account, no sign-up, no app to install (though it installs as a PWA if you want).',
        },
        {
          kind: 'p',
          html: '<strong>Which sports?</strong> Built for football / 5-a-side, but the balancing works for any team split.',
        },
        { kind: 'cta', href: '/', label: 'Split your teams →' },
      ],
    },
    fr: {
      title: 'À propos de Balans — Des équipes de foot équilibrées, chaque semaine',
      description:
        'Balans répartit votre groupe de joueurs de la semaine en équipes de football équilibrées, attribue les postes et une formation, et partage le tout via un seul lien. Sans compte, sans serveur.',
      h1: 'Des équipes de foot équilibrées, chaque semaine',
      blocks: [
        {
          kind: 'lead',
          text: 'Balans prend votre groupe de joueurs de la semaine et le répartit en équipes équilibrées — puis attribue les postes, en déduit une formation et regroupe le tout dans un seul lien à partager. Sans compte. Sans serveur. Vos données ne quittent jamais votre appareil.',
        },
        { kind: 'cta', href: '/', label: 'Ouvrir Balans →' },
        { kind: 'h2', text: 'Comment ça marche' },
        {
          kind: 'ol',
          items: [
            '<strong>Ajoutez des joueurs</strong> et indiquez les postes de chacun (GB / DÉF / MIL / ATT).',
            '<strong>Générez les équipes</strong> — l’équilibreur répartit les gardiens et égalise les postes entre les camps.',
            '<strong>Choisissez un style</strong> par équipe : une formation en est déduite ; déplacez les joueurs pour ajuster.',
            '<strong>Partagez le lien</strong> — ou une version texte prête pour WhatsApp. Qui l’ouvre voit exactement la même configuration.',
          ],
        },
        { kind: 'h2', text: 'Comment les équipes sont-elles équilibrées ?' },
        {
          kind: 'p',
          html: 'Balans équilibre par poste, pas au hasard : il répartit les gardiens entre les camps, égalise défenseurs, milieux et attaquants, et signale quand une équipe serait en sous-effectif. Régénérez pour une nouvelle répartition à tout moment, ou touchez deux joueurs pour les échanger.',
        },
        { kind: 'h2', text: 'FAQ' },
        { kind: 'p', html: '<strong>Est-ce gratuit ?</strong> Oui.' },
        {
          kind: 'p',
          html: '<strong>Stockez-vous mes joueurs ou mes configurations ?</strong> Non. Il n’y a aucun serveur. Tout vit dans votre navigateur et dans le fragment d’URL du lien de partage, que les navigateurs n’envoient jamais à un serveur.',
        },
        {
          kind: 'p',
          html: '<strong>Faut-il un compte ?</strong> Aucun compte, aucune inscription, aucune application à installer (mais elle s’installe comme PWA si vous le souhaitez).',
        },
        {
          kind: 'p',
          html: '<strong>Quels sports ?</strong> Conçu pour le football / le foot à 5, mais l’équilibrage fonctionne pour toute répartition d’équipes.',
        },
        { kind: 'cta', href: '/', label: 'Répartissez vos équipes →' },
      ],
    },
    es: {
      title: 'Acerca de Balans — Equipos de fútbol equilibrados, cada semana',
      description:
        'Balans divide tu grupo de jugadores de la semana en equipos de fútbol equilibrados, asigna posiciones y una formación, y comparte todo en un solo enlace. Sin cuenta, sin servidor.',
      h1: 'Equipos de fútbol equilibrados, cada semana',
      blocks: [
        {
          kind: 'lead',
          text: 'Balans toma tu grupo de jugadores de la semana y lo divide en equipos equilibrados — luego asigna posiciones, deriva una formación y reúne todo en un único enlace para compartir. Sin cuenta. Sin servidor. Tus datos nunca salen de tu dispositivo.',
        },
        { kind: 'cta', href: '/', label: 'Abrir Balans →' },
        { kind: 'h2', text: 'Cómo funciona' },
        {
          kind: 'ol',
          items: [
            '<strong>Añade jugadores</strong> y etiqueta las posiciones de cada uno (POR / DEF / MED / DEL).',
            '<strong>Genera los equipos</strong> — el equilibrador reparte a los porteros y nivela las posiciones entre los bandos.',
            '<strong>Elige un estilo</strong> por equipo y se deriva una formación; arrastra jugadores para ajustar.',
            '<strong>Comparte el enlace</strong> — o una versión de texto lista para WhatsApp. Quien lo abra ve exactamente la misma configuración.',
          ],
        },
        { kind: 'h2', text: '¿Cómo logra equipos justos?' },
        {
          kind: 'p',
          html: 'Balans equilibra por posición, no a ojo: reparte a los porteros entre los bandos, nivela defensas, centrocampistas y delanteros, y avisa cuando un equipo quedaría con un jugador menos. Regenera para un nuevo reparto cuando quieras, o toca dos jugadores para intercambiarlos.',
        },
        { kind: 'h2', text: 'Preguntas frecuentes' },
        { kind: 'p', html: '<strong>¿Es gratis?</strong> Sí.' },
        {
          kind: 'p',
          html: '<strong>¿Guardáis mis jugadores o configuraciones?</strong> No. No hay servidor. Todo vive en tu navegador y en el fragmento de URL del enlace, que los navegadores nunca envían a un servidor.',
        },
        {
          kind: 'p',
          html: '<strong>¿Necesito una cuenta?</strong> Sin cuenta, sin registro, sin app que instalar (aunque se instala como PWA si quieres).',
        },
        {
          kind: 'p',
          html: '<strong>¿Para qué deportes?</strong> Hecho para fútbol / fútbol 5, pero el equilibrado sirve para cualquier reparto de equipos.',
        },
        { kind: 'cta', href: '/', label: 'Divide tus equipos →' },
      ],
    },
    pt: {
      title: 'Sobre o Balans — Times de futebol equilibrados, toda semana',
      description:
        'O Balans divide seu grupo de jogadores da semana em times de futebol equilibrados, atribui posições e uma formação, e compartilha tudo em um único link. Sem conta, sem servidor.',
      h1: 'Times de futebol equilibrados, toda semana',
      blocks: [
        {
          kind: 'lead',
          text: 'O Balans pega seu grupo de jogadores da semana e o divide em times equilibrados — depois atribui posições, deriva uma formação e reúne tudo em um único link para compartilhar. Sem conta. Sem servidor. Seus dados nunca saem do seu dispositivo.',
        },
        { kind: 'cta', href: '/', label: 'Abrir o Balans →' },
        { kind: 'h2', text: 'Como funciona' },
        {
          kind: 'ol',
          items: [
            '<strong>Adicione jogadores</strong> e marque as posições de cada um (GOL / DEF / MEI / ATA).',
            '<strong>Gere os times</strong> — o equilibrador distribui os goleiros e nivela as posições entre os lados.',
            '<strong>Escolha um estilo</strong> por time e uma formação é derivada; arraste jogadores para ajustar.',
            '<strong>Compartilhe o link</strong> — ou uma versão em texto pronta para o WhatsApp. Quem abrir vê exatamente a mesma configuração.',
          ],
        },
        { kind: 'h2', text: 'Como ele deixa os times justos?' },
        {
          kind: 'p',
          html: 'O Balans equilibra por posição, não no chute: distribui os goleiros entre os lados, nivela zagueiros, meias e atacantes, e avisa quando um time ficaria com um jogador a menos. Gere novamente para uma nova divisão quando quiser, ou toque em dois jogadores para trocá-los.',
        },
        { kind: 'h2', text: 'Perguntas frequentes' },
        { kind: 'p', html: '<strong>É gratuito?</strong> Sim.' },
        {
          kind: 'p',
          html: '<strong>Vocês guardam meus jogadores ou configurações?</strong> Não. Não há servidor. Tudo vive no seu navegador e no fragmento de URL do link, que os navegadores nunca enviam a um servidor.',
        },
        {
          kind: 'p',
          html: '<strong>Preciso de uma conta?</strong> Sem conta, sem cadastro, sem app para instalar (mas ele instala como PWA se você quiser).',
        },
        {
          kind: 'p',
          html: '<strong>Quais esportes?</strong> Feito para futebol / society, mas o equilíbrio funciona para qualquer divisão de times.',
        },
        { kind: 'cta', href: '/', label: 'Divida seus times →' },
      ],
    },
  },
}

const help: ContentPage = {
  slug: 'help',
  perLang: {
    en: {
      title: 'Help & FAQ — Balans',
      description:
        'How to use Balans: add players, generate balanced football teams, pick a formation and share the whole setup as one link. Answers to common questions.',
      h1: 'Help & FAQ',
      blocks: [
        {
          kind: 'lead',
          text: "Balans splits your weekly pool of players into balanced football teams, assigns positions and a formation, and packs the whole thing into one shareable link. Here's how to use it, and answers to the questions people ask most.",
        },
        { kind: 'cta', href: '/', label: 'Open Balans →' },
        { kind: 'h2', text: 'Step by step' },
        {
          kind: 'ol',
          items: [
            "<strong>Add players.</strong> Type one name per line, or paste a whole list at once. Tag each player's positions — goalkeeper, defender, midfielder or forward. A player can have more than one.",
            '<strong>Set the teams.</strong> Choose how many teams to split into and how many substitutes per side. Balans previews the split and warns you if it would be uneven or a player short.',
            '<strong>Generate.</strong> Balans spreads the goalkeepers across the sides and evens out defenders, midfielders and forwards, then picks starters and subs. Re-generate any time for a fresh split, or tap two players to swap them.',
            '<strong>Pick a style.</strong> Choose defensive, balanced or attacking per team — Balans derives a formation that fits the team size and slots players into positions on the pitch.',
            '<strong>Share.</strong> Copy the link, or grab a WhatsApp-ready text version. Whoever opens it sees the same setup, rendered in their own language.',
          ],
        },
        { kind: 'h2', text: 'Frequently asked questions' },
        { kind: 'h3', text: 'Is Balans free?' },
        { kind: 'p', html: 'Yes — completely free, with no account and no sign-up.' },
        { kind: 'h3', text: 'Do you store my players or setups?' },
        {
          kind: 'p',
          html: 'No. There is no backend. Everything lives in your browser and inside the share link’s URL fragment, which browsers never send to a server. See the <a href="/privacy">Privacy Policy</a> for details.',
        },
        { kind: 'h3', text: 'How does the share link work?' },
        {
          kind: 'p',
          html: 'The entire setup is compressed into the part of the link after the “#”. Anyone who opens the link reconstructs your teams instantly — no lookup, no server. The link can get long for big squads; that’s normal, and chat apps handle it fine.',
        },
        { kind: 'h3', text: 'Does it work offline?' },
        {
          kind: 'p',
          html: 'Yes. Balans installs as a Progressive Web App and works fully offline, because there is no server to talk to. Add it to your home screen from your browser’s menu if you like.',
        },
        { kind: 'h3', text: 'Which languages are supported?' },
        {
          kind: 'p',
          html: 'English, French, Spanish and Portuguese. Your language is stored only on your device, so a link you share renders in the recipient’s own language.',
        },
        { kind: 'h3', text: "How does Balans decide what's fair?" },
        {
          kind: 'p',
          html: 'It balances by position rather than guesswork: keepers are spread across sides, and defenders, midfielders and forwards are evened out between teams. It flags when one team would be short. You stay in control — re-generate or swap any two players by tapping them.',
        },
        { kind: 'h3', text: 'Which sports does it work for?' },
        {
          kind: 'p',
          html: "It's built for football and 5-a-side, but the balancing logic works for any team split.",
        },
        { kind: 'h3', text: 'Still stuck?' },
        {
          kind: 'p',
          html: "Reach us on the <a href=\"/contact\">Contact page</a> and we'll help.",
        },
        { kind: 'cta', href: '/', label: 'Split your teams →' },
      ],
    },
    fr: {
      title: 'Aide & FAQ — Balans',
      description:
        'Comment utiliser Balans : ajouter des joueurs, générer des équipes de football équilibrées, choisir une formation et partager le tout via un seul lien. Réponses aux questions courantes.',
      h1: 'Aide & FAQ',
      blocks: [
        {
          kind: 'lead',
          text: 'Balans répartit votre groupe de joueurs de la semaine en équipes de football équilibrées, attribue les postes et une formation, et regroupe le tout dans un seul lien à partager. Voici comment l’utiliser, et les réponses aux questions les plus fréquentes.',
        },
        { kind: 'cta', href: '/', label: 'Ouvrir Balans →' },
        { kind: 'h2', text: 'Étape par étape' },
        {
          kind: 'ol',
          items: [
            '<strong>Ajoutez des joueurs.</strong> Un nom par ligne, ou collez toute une liste d’un coup. Indiquez les postes de chaque joueur — gardien, défenseur, milieu ou attaquant. Un joueur peut en avoir plusieurs.',
            '<strong>Réglez les équipes.</strong> Choisissez le nombre d’équipes et de remplaçants par camp. Balans prévisualise la répartition et vous prévient si elle serait inégale ou en sous-effectif.',
            '<strong>Générez.</strong> Balans répartit les gardiens entre les camps, égalise défenseurs, milieux et attaquants, puis désigne titulaires et remplaçants. Régénérez à tout moment, ou touchez deux joueurs pour les échanger.',
            '<strong>Choisissez un style.</strong> Défensif, équilibré ou offensif par équipe — Balans en déduit une formation adaptée à l’effectif et place les joueurs sur le terrain.',
            '<strong>Partagez.</strong> Copiez le lien, ou récupérez une version texte prête pour WhatsApp. Qui l’ouvre voit la même configuration, dans sa propre langue.',
          ],
        },
        { kind: 'h2', text: 'Questions fréquentes' },
        { kind: 'h3', text: 'Balans est-il gratuit ?' },
        { kind: 'p', html: 'Oui — entièrement gratuit, sans compte ni inscription.' },
        { kind: 'h3', text: 'Stockez-vous mes joueurs ou mes configurations ?' },
        {
          kind: 'p',
          html: 'Non. Il n’y a aucun serveur. Tout vit dans votre navigateur et dans le fragment d’URL du lien de partage, que les navigateurs n’envoient jamais à un serveur. Voir la <a href="/fr/privacy">politique de confidentialité</a> pour les détails.',
        },
        { kind: 'h3', text: 'Comment fonctionne le lien de partage ?' },
        {
          kind: 'p',
          html: 'Toute la configuration est compressée dans la partie du lien après le “#”. Quiconque ouvre le lien reconstitue vos équipes instantanément — sans requête, sans serveur. Le lien peut être long pour de grands effectifs ; c’est normal, et les messageries le gèrent bien.',
        },
        { kind: 'h3', text: 'Fonctionne-t-il hors ligne ?' },
        {
          kind: 'p',
          html: 'Oui. Balans s’installe comme une application web progressive (PWA) et fonctionne entièrement hors ligne, car il n’y a aucun serveur à contacter. Ajoutez-le à votre écran d’accueil depuis le menu de votre navigateur si vous le souhaitez.',
        },
        { kind: 'h3', text: 'Quelles langues sont prises en charge ?' },
        {
          kind: 'p',
          html: 'Anglais, français, espagnol et portugais. Votre langue est stockée uniquement sur votre appareil ; un lien que vous partagez s’affiche donc dans la langue du destinataire.',
        },
        { kind: 'h3', text: 'Comment Balans décide-t-il de ce qui est équitable ?' },
        {
          kind: 'p',
          html: 'Il équilibre par poste plutôt qu’au hasard : les gardiens sont répartis entre les camps, et défenseurs, milieux et attaquants sont égalisés entre les équipes. Il signale quand une équipe serait en sous-effectif. Vous gardez le contrôle — régénérez ou échangez deux joueurs en les touchant.',
        },
        { kind: 'h3', text: 'Pour quels sports ?' },
        {
          kind: 'p',
          html: 'Conçu pour le football et le foot à 5, mais la logique d’équilibrage fonctionne pour toute répartition d’équipes.',
        },
        { kind: 'h3', text: 'Toujours bloqué ?' },
        {
          kind: 'p',
          html: 'Contactez-nous via la <a href="/fr/contact">page Contact</a> et nous vous aiderons.',
        },
        { kind: 'cta', href: '/', label: 'Répartissez vos équipes →' },
      ],
    },
    es: {
      title: 'Ayuda y preguntas frecuentes — Balans',
      description:
        'Cómo usar Balans: añade jugadores, genera equipos de fútbol equilibrados, elige una formación y comparte todo en un solo enlace. Respuestas a preguntas comunes.',
      h1: 'Ayuda y preguntas frecuentes',
      blocks: [
        {
          kind: 'lead',
          text: 'Balans divide tu grupo de jugadores de la semana en equipos de fútbol equilibrados, asigna posiciones y una formación, y reúne todo en un único enlace para compartir. Aquí te explicamos cómo usarlo y respondemos las dudas más frecuentes.',
        },
        { kind: 'cta', href: '/', label: 'Abrir Balans →' },
        { kind: 'h2', text: 'Paso a paso' },
        {
          kind: 'ol',
          items: [
            '<strong>Añade jugadores.</strong> Un nombre por línea, o pega una lista entera de una vez. Etiqueta las posiciones de cada jugador — portero, defensa, centrocampista o delantero. Un jugador puede tener varias.',
            '<strong>Configura los equipos.</strong> Elige en cuántos equipos dividir y cuántos suplentes por bando. Balans previsualiza el reparto y avisa si quedaría desigual o con un jugador menos.',
            '<strong>Genera.</strong> Balans reparte a los porteros entre los bandos y nivela defensas, centrocampistas y delanteros, y luego elige titulares y suplentes. Regenera cuando quieras, o toca dos jugadores para intercambiarlos.',
            '<strong>Elige un estilo.</strong> Defensivo, equilibrado u ofensivo por equipo — Balans deriva una formación acorde al tamaño y coloca a los jugadores en el campo.',
            '<strong>Comparte.</strong> Copia el enlace, o usa una versión de texto lista para WhatsApp. Quien lo abra ve la misma configuración, en su propio idioma.',
          ],
        },
        { kind: 'h2', text: 'Preguntas frecuentes' },
        { kind: 'h3', text: '¿Balans es gratis?' },
        { kind: 'p', html: 'Sí — totalmente gratis, sin cuenta ni registro.' },
        { kind: 'h3', text: '¿Guardáis mis jugadores o configuraciones?' },
        {
          kind: 'p',
          html: 'No. No hay servidor. Todo vive en tu navegador y en el fragmento de URL del enlace, que los navegadores nunca envían a un servidor. Consulta la <a href="/es/privacy">Política de privacidad</a> para más detalles.',
        },
        { kind: 'h3', text: '¿Cómo funciona el enlace para compartir?' },
        {
          kind: 'p',
          html: 'Toda la configuración se comprime en la parte del enlace tras la “#”. Quien abra el enlace reconstruye tus equipos al instante — sin consulta, sin servidor. El enlace puede ser largo con plantillas grandes; es normal, y las apps de chat lo manejan bien.',
        },
        { kind: 'h3', text: '¿Funciona sin conexión?' },
        {
          kind: 'p',
          html: 'Sí. Balans se instala como aplicación web progresiva (PWA) y funciona totalmente sin conexión, porque no hay servidor con el que hablar. Añádelo a tu pantalla de inicio desde el menú del navegador si quieres.',
        },
        { kind: 'h3', text: '¿Qué idiomas admite?' },
        {
          kind: 'p',
          html: 'Inglés, francés, español y portugués. Tu idioma se guarda solo en tu dispositivo, así que un enlace que compartas se muestra en el idioma del destinatario.',
        },
        { kind: 'h3', text: '¿Cómo decide Balans qué es justo?' },
        {
          kind: 'p',
          html: 'Equilibra por posición en lugar de a ojo: reparte a los porteros entre los bandos y nivela defensas, centrocampistas y delanteros entre los equipos. Avisa cuando un equipo quedaría corto. Tú mandas — regenera o intercambia dos jugadores tocándolos.',
        },
        { kind: 'h3', text: '¿Para qué deportes sirve?' },
        {
          kind: 'p',
          html: 'Está hecho para fútbol y fútbol 5, pero la lógica de equilibrado sirve para cualquier reparto de equipos.',
        },
        { kind: 'h3', text: '¿Sigues atascado?' },
        {
          kind: 'p',
          html: 'Escríbenos en la <a href="/es/contact">página de Contacto</a> y te ayudaremos.',
        },
        { kind: 'cta', href: '/', label: 'Divide tus equipos →' },
      ],
    },
    pt: {
      title: 'Ajuda e perguntas frequentes — Balans',
      description:
        'Como usar o Balans: adicione jogadores, gere times de futebol equilibrados, escolha uma formação e compartilhe tudo em um único link. Respostas para dúvidas comuns.',
      h1: 'Ajuda e perguntas frequentes',
      blocks: [
        {
          kind: 'lead',
          text: 'O Balans divide seu grupo de jogadores da semana em times de futebol equilibrados, atribui posições e uma formação, e reúne tudo em um único link para compartilhar. Veja como usá-lo e as respostas para as dúvidas mais comuns.',
        },
        { kind: 'cta', href: '/', label: 'Abrir o Balans →' },
        { kind: 'h2', text: 'Passo a passo' },
        {
          kind: 'ol',
          items: [
            '<strong>Adicione jogadores.</strong> Um nome por linha, ou cole uma lista inteira de uma vez. Marque as posições de cada jogador — goleiro, zagueiro, meia ou atacante. Um jogador pode ter várias.',
            '<strong>Defina os times.</strong> Escolha em quantos times dividir e quantos reservas por lado. O Balans prevê a divisão e avisa se ficaria desigual ou com um jogador a menos.',
            '<strong>Gere.</strong> O Balans distribui os goleiros entre os lados e nivela zagueiros, meias e atacantes, e então escolhe titulares e reservas. Gere novamente quando quiser, ou toque em dois jogadores para trocá-los.',
            '<strong>Escolha um estilo.</strong> Defensivo, equilibrado ou ofensivo por time — o Balans deriva uma formação adequada ao tamanho e posiciona os jogadores no campo.',
            '<strong>Compartilhe.</strong> Copie o link, ou pegue uma versão em texto pronta para o WhatsApp. Quem abrir vê a mesma configuração, no seu próprio idioma.',
          ],
        },
        { kind: 'h2', text: 'Perguntas frequentes' },
        { kind: 'h3', text: 'O Balans é gratuito?' },
        { kind: 'p', html: 'Sim — totalmente gratuito, sem conta e sem cadastro.' },
        { kind: 'h3', text: 'Vocês guardam meus jogadores ou configurações?' },
        {
          kind: 'p',
          html: 'Não. Não há servidor. Tudo vive no seu navegador e no fragmento de URL do link, que os navegadores nunca enviam a um servidor. Veja a <a href="/pt/privacy">Política de Privacidade</a> para detalhes.',
        },
        { kind: 'h3', text: 'Como funciona o link de compartilhamento?' },
        {
          kind: 'p',
          html: 'Toda a configuração é compactada na parte do link após o “#”. Quem abrir o link reconstrói seus times na hora — sem consulta, sem servidor. O link pode ficar longo para elencos grandes; é normal, e os apps de mensagem lidam bem com isso.',
        },
        { kind: 'h3', text: 'Funciona offline?' },
        {
          kind: 'p',
          html: 'Sim. O Balans instala como um aplicativo web progressivo (PWA) e funciona totalmente offline, porque não há servidor para acessar. Adicione-o à sua tela inicial pelo menu do navegador, se quiser.',
        },
        { kind: 'h3', text: 'Quais idiomas são suportados?' },
        {
          kind: 'p',
          html: 'Inglês, francês, espanhol e português. Seu idioma fica salvo apenas no seu dispositivo, então um link que você compartilha aparece no idioma de quem recebe.',
        },
        { kind: 'h3', text: 'Como o Balans decide o que é justo?' },
        {
          kind: 'p',
          html: 'Ele equilibra por posição, não no chute: os goleiros são distribuídos entre os lados, e zagueiros, meias e atacantes são nivelados entre os times. Avisa quando um time ficaria desfalcado. Você manda — gere novamente ou troque dois jogadores tocando neles.',
        },
        { kind: 'h3', text: 'Para quais esportes funciona?' },
        {
          kind: 'p',
          html: 'É feito para futebol e society, mas a lógica de equilíbrio funciona para qualquer divisão de times.',
        },
        { kind: 'h3', text: 'Ainda com dúvidas?' },
        {
          kind: 'p',
          html: 'Fale com a gente na <a href="/pt/contact">página de Contato</a> e nós ajudamos.',
        },
        { kind: 'cta', href: '/', label: 'Divida seus times →' },
      ],
    },
  },
}

const contact: ContentPage = {
  slug: 'contact',
  perLang: {
    en: {
      title: 'Contact — Balans',
      description:
        'Get in touch with the team behind Balans — feedback, bug reports, feature requests and privacy questions.',
      h1: 'Contact',
      blocks: [
        {
          kind: 'lead',
          text: "Balans is a small, independent project. We'd love to hear from you — whether something broke, something could be better, or you just have a question.",
        },
        { kind: 'h2', text: 'Email us' },
        { kind: 'email', address: EMAIL },
        { kind: 'p', html: 'We read everything and reply when we can.' },
        { kind: 'h2', text: 'What to write about' },
        {
          kind: 'ul',
          items: [
            '<strong>Feedback & ideas</strong> — what would make Balans better for your group.',
            '<strong>Bug reports</strong> — tell us your browser and what happened.',
            "<strong>Custom formations</strong> — want a specific shape that isn't offered yet? Let us know.",
            '<strong>Privacy questions</strong> — see the <a href="/privacy">Privacy Policy</a> first; anything else, just ask.',
          ],
        },
      ],
    },
    fr: {
      title: 'Contact — Balans',
      description:
        'Contactez l’équipe derrière Balans — retours, signalements de bugs, demandes de fonctionnalités et questions de confidentialité.',
      h1: 'Contact',
      blocks: [
        {
          kind: 'lead',
          text: 'Balans est un petit projet indépendant. Nous serions ravis d’avoir de vos nouvelles — qu’un problème soit survenu, qu’une chose puisse être améliorée, ou que vous ayez simplement une question.',
        },
        { kind: 'h2', text: 'Écrivez-nous' },
        { kind: 'email', address: EMAIL },
        { kind: 'p', html: 'Nous lisons tout et répondons dès que possible.' },
        { kind: 'h2', text: 'À quel sujet écrire' },
        {
          kind: 'ul',
          items: [
            '<strong>Retours & idées</strong> — ce qui rendrait Balans meilleur pour votre groupe.',
            '<strong>Signalements de bugs</strong> — indiquez votre navigateur et ce qui s’est passé.',
            '<strong>Formations personnalisées</strong> — une disposition précise pas encore proposée ? Dites-le-nous.',
            '<strong>Questions de confidentialité</strong> — consultez d’abord la <a href="/fr/privacy">politique de confidentialité</a> ; pour le reste, demandez.',
          ],
        },
      ],
    },
    es: {
      title: 'Contacto — Balans',
      description:
        'Ponte en contacto con el equipo de Balans — comentarios, informes de errores, sugerencias y dudas de privacidad.',
      h1: 'Contacto',
      blocks: [
        {
          kind: 'lead',
          text: 'Balans es un proyecto pequeño e independiente. Nos encantaría saber de ti — ya sea que algo se rompió, algo podría mejorar, o simplemente tienes una pregunta.',
        },
        { kind: 'h2', text: 'Escríbenos' },
        { kind: 'email', address: EMAIL },
        { kind: 'p', html: 'Leemos todo y respondemos cuando podemos.' },
        { kind: 'h2', text: 'Sobre qué escribir' },
        {
          kind: 'ul',
          items: [
            '<strong>Comentarios e ideas</strong> — qué haría mejor a Balans para tu grupo.',
            '<strong>Informes de errores</strong> — dinos tu navegador y qué pasó.',
            '<strong>Formaciones personalizadas</strong> — ¿quieres una disposición concreta que aún no está? Cuéntanos.',
            '<strong>Dudas de privacidad</strong> — consulta primero la <a href="/es/privacy">Política de privacidad</a>; para lo demás, pregunta.',
          ],
        },
      ],
    },
    pt: {
      title: 'Contato — Balans',
      description:
        'Fale com a equipe por trás do Balans — feedback, relatos de bugs, sugestões e dúvidas de privacidade.',
      h1: 'Contato',
      blocks: [
        {
          kind: 'lead',
          text: 'O Balans é um projeto pequeno e independente. Adoraríamos ouvir você — seja porque algo quebrou, algo poderia ser melhor, ou você só tem uma pergunta.',
        },
        { kind: 'h2', text: 'Envie um e-mail' },
        { kind: 'email', address: EMAIL },
        { kind: 'p', html: 'Lemos tudo e respondemos quando possível.' },
        { kind: 'h2', text: 'Sobre o que escrever' },
        {
          kind: 'ul',
          items: [
            '<strong>Feedback e ideias</strong> — o que tornaria o Balans melhor para o seu grupo.',
            '<strong>Relatos de bugs</strong> — diga seu navegador e o que aconteceu.',
            '<strong>Formações personalizadas</strong> — quer um esquema específico que ainda não existe? Avise a gente.',
            '<strong>Dúvidas de privacidade</strong> — veja primeiro a <a href="/pt/privacy">Política de Privacidade</a>; o resto, é só perguntar.',
          ],
        },
      ],
    },
  },
}

const privacy: ContentPage = {
  slug: 'privacy',
  perLang: {
    en: {
      title: 'Privacy Policy — Balans',
      description:
        'How Balans handles your data: no account, no server, no database. Your players and setups stay in your browser. Details on cookies, advertising and analytics.',
      h1: 'Privacy Policy',
      blocks: [
        { kind: 'updated', text: 'Last updated: 29 June 2026' },
        {
          kind: 'lead',
          text: 'Balans runs entirely in your browser. There is no account and no server that stores your data. This policy explains what that means in practice, and how cookies, advertising and analytics are handled if they are ever enabled.',
        },
        { kind: 'h2', text: 'No server, no database' },
        {
          kind: 'p',
          html: 'All team-balancing happens on your device. We do not run a backend that receives your players or your setups. Nothing you type into Balans is transmitted to or stored by us.',
        },
        { kind: 'h2', text: 'Where your data lives' },
        {
          kind: 'p',
          html: "Your player pool, your last setup and your preferences (such as language and theme) are saved only in your browser's local storage. They never leave your device. Clearing your browser data removes them permanently.",
        },
        { kind: 'h2', text: 'Share links' },
        {
          kind: 'p',
          html: 'A Balans share link encodes the whole setup after the “#” (the URL fragment). By web standard, browsers never send the part after “#” to a server — so a share link is read only by the people you send it to, on their own device. We never see it.',
        },
        { kind: 'h2', text: 'Cookies and local storage' },
        {
          kind: 'p',
          html: "The default build of Balans sets no advertising or tracking cookies. It uses your browser's local storage only to remember your own preferences and your last setup, as described above. This is not used to track you across other websites.",
        },
        { kind: 'h2', text: 'Advertising' },
        {
          kind: 'p',
          html: 'Balans may display advertising provided by Google AdSense in order to keep the app free. When advertising is enabled:',
        },
        {
          kind: 'ul',
          items: [
            "Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this and other websites.",
            "Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to Balans and/or other sites on the Internet.",
            'You may opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" rel="nofollow noopener" target="_blank">Google Ads Settings</a>. You can also opt out of some third-party vendors’ use of cookies at <a href="https://www.aboutads.info/choices/" rel="nofollow noopener" target="_blank">aboutads.info</a>.',
            'For more on how Google uses data, see <a href="https://policies.google.com/technologies/partner-sites" rel="nofollow noopener" target="_blank">Google’s policy</a>.',
          ],
        },
        { kind: 'h2', text: 'Analytics' },
        {
          kind: 'p',
          html: 'Balans may use a privacy-respecting analytics measurement (such as Cloudflare Web Analytics, which is cookieless, or Google Analytics) to understand aggregate, anonymous usage. The default build runs no analytics. Any analytics that count as non-essential are loaded only after you consent where the law requires it.',
        },
        { kind: 'h2', text: 'Your consent choices (EEA / UK)' },
        {
          kind: 'p',
          html: "If you are in the European Economic Area or the United Kingdom, Balans asks for your consent before loading any non-essential advertising or analytics, using Google Consent Mode. Your choice is stored in your browser's local storage and you can change it at any time. Region is detected from your browser's time zone — no IP lookup or location service is used.",
        },
        { kind: 'h2', text: 'Children' },
        {
          kind: 'p',
          html: 'Balans is not directed at children under 13 and does not knowingly collect personal information from them. Because we do not collect personal data at all, there is nothing to request or delete.',
        },
        { kind: 'h2', text: 'Changes to this policy' },
        {
          kind: 'p',
          html: 'We may update this policy as the app evolves. Material changes will be reflected by the “last updated” date above.',
        },
        { kind: 'h2', text: 'Contact' },
        {
          kind: 'p',
          html: `Questions about privacy? Email <a href="mailto:${EMAIL}">${EMAIL}</a>.`,
        },
      ],
    },
    fr: {
      title: 'Politique de confidentialité — Balans',
      description:
        'Comment Balans traite vos données : sans compte, sans serveur, sans base de données. Vos joueurs et configurations restent dans votre navigateur. Détails sur les cookies, la publicité et l’analyse.',
      h1: 'Politique de confidentialité',
      blocks: [
        { kind: 'updated', text: 'Dernière mise à jour : 29 juin 2026' },
        {
          kind: 'lead',
          text: 'Balans fonctionne entièrement dans votre navigateur. Il n’y a aucun compte ni serveur stockant vos données. Cette politique explique ce que cela signifie en pratique, et comment les cookies, la publicité et l’analyse sont gérés s’ils sont un jour activés.',
        },
        { kind: 'h2', text: 'Sans serveur, sans base de données' },
        {
          kind: 'p',
          html: 'Tout l’équilibrage des équipes se fait sur votre appareil. Nous n’exploitons aucun serveur recevant vos joueurs ou vos configurations. Rien de ce que vous saisissez dans Balans ne nous est transmis ni stocké.',
        },
        { kind: 'h2', text: 'Où vivent vos données' },
        {
          kind: 'p',
          html: 'Votre groupe de joueurs, votre dernière configuration et vos préférences (langue, thème) sont enregistrés uniquement dans le stockage local de votre navigateur. Ils ne quittent jamais votre appareil. Effacer les données de votre navigateur les supprime définitivement.',
        },
        { kind: 'h2', text: 'Liens de partage' },
        {
          kind: 'p',
          html: 'Un lien de partage Balans encode toute la configuration après le “#” (le fragment d’URL). Par norme du web, les navigateurs n’envoient jamais la partie après le “#” à un serveur — un lien de partage n’est donc lu que par les personnes à qui vous l’envoyez, sur leur propre appareil. Nous ne le voyons jamais.',
        },
        { kind: 'h2', text: 'Cookies et stockage local' },
        {
          kind: 'p',
          html: 'La version par défaut de Balans ne dépose aucun cookie publicitaire ou de suivi. Elle utilise le stockage local de votre navigateur uniquement pour mémoriser vos préférences et votre dernière configuration, comme décrit ci-dessus. Cela ne sert pas à vous suivre sur d’autres sites.',
        },
        { kind: 'h2', text: 'Publicité' },
        {
          kind: 'p',
          html: 'Balans peut afficher des publicités fournies par Google AdSense afin de rester gratuit. Lorsque la publicité est activée :',
        },
        {
          kind: 'ul',
          items: [
            'Des fournisseurs tiers, dont Google, utilisent des cookies pour diffuser des annonces en fonction des visites antérieures de l’utilisateur sur ce site et d’autres.',
            'L’utilisation de cookies publicitaires par Google lui permet, ainsi qu’à ses partenaires, de vous diffuser des annonces en fonction de votre visite sur Balans et/ou d’autres sites.',
            'Vous pouvez désactiver la publicité personnalisée via les <a href="https://www.google.com/settings/ads" rel="nofollow noopener" target="_blank">paramètres des annonces Google</a>. Vous pouvez aussi refuser l’usage de cookies de certains fournisseurs tiers sur <a href="https://www.aboutads.info/choices/" rel="nofollow noopener" target="_blank">aboutads.info</a>.',
            'Pour en savoir plus sur l’utilisation des données par Google, voir la <a href="https://policies.google.com/technologies/partner-sites" rel="nofollow noopener" target="_blank">politique de Google</a>.',
          ],
        },
        { kind: 'h2', text: 'Analyse d’audience' },
        {
          kind: 'p',
          html: 'Balans peut utiliser une mesure d’audience respectueuse de la vie privée (comme Cloudflare Web Analytics, sans cookie, ou Google Analytics) pour comprendre l’usage agrégé et anonyme. La version par défaut n’exécute aucune analyse. Toute analyse considérée comme non essentielle n’est chargée qu’après votre consentement là où la loi l’exige.',
        },
        { kind: 'h2', text: 'Vos choix de consentement (EEE / Royaume-Uni)' },
        {
          kind: 'p',
          html: 'Si vous êtes dans l’Espace économique européen ou au Royaume-Uni, Balans demande votre consentement avant de charger toute publicité ou analyse non essentielle, via le mode Consentement de Google. Votre choix est stocké dans le stockage local de votre navigateur et vous pouvez le modifier à tout moment. La région est détectée d’après le fuseau horaire de votre navigateur — sans recherche d’IP ni service de localisation.',
        },
        { kind: 'h2', text: 'Enfants' },
        {
          kind: 'p',
          html: 'Balans ne s’adresse pas aux enfants de moins de 13 ans et ne collecte pas sciemment d’informations personnelles les concernant. Comme nous ne collectons aucune donnée personnelle, il n’y a rien à demander ni à supprimer.',
        },
        { kind: 'h2', text: 'Modifications de cette politique' },
        {
          kind: 'p',
          html: 'Nous pouvons mettre à jour cette politique à mesure que l’application évolue. Les changements importants seront reflétés par la date de “dernière mise à jour” ci-dessus.',
        },
        { kind: 'h2', text: 'Contact' },
        {
          kind: 'p',
          html: `Des questions sur la confidentialité ? Écrivez à <a href="mailto:${EMAIL}">${EMAIL}</a>.`,
        },
      ],
    },
    es: {
      title: 'Política de privacidad — Balans',
      description:
        'Cómo trata Balans tus datos: sin cuenta, sin servidor, sin base de datos. Tus jugadores y configuraciones quedan en tu navegador. Detalles sobre cookies, publicidad y analítica.',
      h1: 'Política de privacidad',
      blocks: [
        { kind: 'updated', text: 'Última actualización: 29 de junio de 2026' },
        {
          kind: 'lead',
          text: 'Balans funciona enteramente en tu navegador. No hay cuenta ni servidor que almacene tus datos. Esta política explica qué significa eso en la práctica, y cómo se gestionan las cookies, la publicidad y la analítica si alguna vez se activan.',
        },
        { kind: 'h2', text: 'Sin servidor, sin base de datos' },
        {
          kind: 'p',
          html: 'Todo el equilibrado de equipos ocurre en tu dispositivo. No operamos ningún servidor que reciba tus jugadores o configuraciones. Nada de lo que escribes en Balans se nos transmite ni se almacena.',
        },
        { kind: 'h2', text: 'Dónde viven tus datos' },
        {
          kind: 'p',
          html: 'Tu grupo de jugadores, tu última configuración y tus preferencias (como idioma y tema) se guardan solo en el almacenamiento local de tu navegador. Nunca salen de tu dispositivo. Borrar los datos del navegador los elimina de forma permanente.',
        },
        { kind: 'h2', text: 'Enlaces para compartir' },
        {
          kind: 'p',
          html: 'Un enlace de Balans codifica toda la configuración tras la “#” (el fragmento de URL). Por estándar de la web, los navegadores nunca envían la parte tras la “#” a un servidor — así que un enlace solo lo leen las personas a quienes se lo envías, en su propio dispositivo. Nosotros nunca lo vemos.',
        },
        { kind: 'h2', text: 'Cookies y almacenamiento local' },
        {
          kind: 'p',
          html: 'La versión por defecto de Balans no coloca cookies de publicidad ni de seguimiento. Usa el almacenamiento local de tu navegador solo para recordar tus preferencias y tu última configuración, como se describe arriba. Esto no se usa para rastrearte por otros sitios.',
        },
        { kind: 'h2', text: 'Publicidad' },
        {
          kind: 'p',
          html: 'Balans puede mostrar publicidad de Google AdSense para mantener la app gratuita. Cuando la publicidad está activada:',
        },
        {
          kind: 'ul',
          items: [
            'Proveedores externos, incluido Google, usan cookies para mostrar anuncios según las visitas previas del usuario a este y otros sitios web.',
            'El uso de cookies publicitarias por parte de Google le permite, a él y a sus socios, mostrarte anuncios según tu visita a Balans u otros sitios de Internet.',
            'Puedes desactivar la publicidad personalizada en la <a href="https://www.google.com/settings/ads" rel="nofollow noopener" target="_blank">configuración de anuncios de Google</a>. También puedes rechazar el uso de cookies de algunos proveedores externos en <a href="https://www.aboutads.info/choices/" rel="nofollow noopener" target="_blank">aboutads.info</a>.',
            'Para saber más sobre cómo usa Google los datos, consulta la <a href="https://policies.google.com/technologies/partner-sites" rel="nofollow noopener" target="_blank">política de Google</a>.',
          ],
        },
        { kind: 'h2', text: 'Analítica' },
        {
          kind: 'p',
          html: 'Balans puede usar una medición de analítica respetuosa con la privacidad (como Cloudflare Web Analytics, sin cookies, o Google Analytics) para entender el uso agregado y anónimo. La versión por defecto no ejecuta analítica. Cualquier analítica considerada no esencial se carga solo tras tu consentimiento donde la ley lo exige.',
        },
        { kind: 'h2', text: 'Tus opciones de consentimiento (EEE / Reino Unido)' },
        {
          kind: 'p',
          html: 'Si estás en el Espacio Económico Europeo o el Reino Unido, Balans pide tu consentimiento antes de cargar cualquier publicidad o analítica no esencial, mediante el Modo de consentimiento de Google. Tu elección se guarda en el almacenamiento local de tu navegador y puedes cambiarla cuando quieras. La región se detecta por la zona horaria de tu navegador — sin consulta de IP ni servicio de ubicación.',
        },
        { kind: 'h2', text: 'Menores' },
        {
          kind: 'p',
          html: 'Balans no está dirigido a menores de 13 años y no recopila a sabiendas información personal de ellos. Como no recopilamos datos personales en absoluto, no hay nada que solicitar ni eliminar.',
        },
        { kind: 'h2', text: 'Cambios en esta política' },
        {
          kind: 'p',
          html: 'Podemos actualizar esta política a medida que la app evoluciona. Los cambios importantes se reflejarán en la fecha de “última actualización” de arriba.',
        },
        { kind: 'h2', text: 'Contacto' },
        {
          kind: 'p',
          html: `¿Dudas sobre privacidad? Escribe a <a href="mailto:${EMAIL}">${EMAIL}</a>.`,
        },
      ],
    },
    pt: {
      title: 'Política de Privacidade — Balans',
      description:
        'Como o Balans trata seus dados: sem conta, sem servidor, sem banco de dados. Seus jogadores e configurações ficam no seu navegador. Detalhes sobre cookies, publicidade e análise.',
      h1: 'Política de Privacidade',
      blocks: [
        { kind: 'updated', text: 'Última atualização: 29 de junho de 2026' },
        {
          kind: 'lead',
          text: 'O Balans funciona inteiramente no seu navegador. Não há conta nem servidor que armazene seus dados. Esta política explica o que isso significa na prática, e como cookies, publicidade e análise são tratados caso sejam ativados.',
        },
        { kind: 'h2', text: 'Sem servidor, sem banco de dados' },
        {
          kind: 'p',
          html: 'Todo o equilíbrio dos times acontece no seu dispositivo. Não operamos um servidor que receba seus jogadores ou configurações. Nada do que você digita no Balans é transmitido a nós ou armazenado.',
        },
        { kind: 'h2', text: 'Onde seus dados vivem' },
        {
          kind: 'p',
          html: 'Seu grupo de jogadores, sua última configuração e suas preferências (como idioma e tema) são salvos apenas no armazenamento local do seu navegador. Eles nunca saem do seu dispositivo. Limpar os dados do navegador os remove permanentemente.',
        },
        { kind: 'h2', text: 'Links de compartilhamento' },
        {
          kind: 'p',
          html: 'Um link do Balans codifica toda a configuração após o “#” (o fragmento de URL). Por padrão da web, os navegadores nunca enviam a parte após o “#” a um servidor — então um link é lido apenas pelas pessoas para quem você o envia, no próprio dispositivo delas. Nós nunca o vemos.',
        },
        { kind: 'h2', text: 'Cookies e armazenamento local' },
        {
          kind: 'p',
          html: 'A versão padrão do Balans não coloca cookies de publicidade ou rastreamento. Ela usa o armazenamento local do navegador apenas para lembrar suas preferências e sua última configuração, como descrito acima. Isso não é usado para rastrear você por outros sites.',
        },
        { kind: 'h2', text: 'Publicidade' },
        {
          kind: 'p',
          html: 'O Balans pode exibir publicidade do Google AdSense para manter o app gratuito. Quando a publicidade está ativada:',
        },
        {
          kind: 'ul',
          items: [
            'Fornecedores terceiros, incluindo o Google, usam cookies para exibir anúncios com base nas visitas anteriores do usuário a este e a outros sites.',
            'O uso de cookies de publicidade pelo Google permite que ele e seus parceiros exibam anúncios com base na sua visita ao Balans e/ou a outros sites da Internet.',
            'Você pode desativar a publicidade personalizada nas <a href="https://www.google.com/settings/ads" rel="nofollow noopener" target="_blank">configurações de anúncios do Google</a>. Você também pode recusar o uso de cookies de alguns fornecedores terceiros em <a href="https://www.aboutads.info/choices/" rel="nofollow noopener" target="_blank">aboutads.info</a>.',
            'Para saber mais sobre como o Google usa os dados, veja a <a href="https://policies.google.com/technologies/partner-sites" rel="nofollow noopener" target="_blank">política do Google</a>.',
          ],
        },
        { kind: 'h2', text: 'Análise' },
        {
          kind: 'p',
          html: 'O Balans pode usar uma medição de análise que respeita a privacidade (como o Cloudflare Web Analytics, sem cookies, ou o Google Analytics) para entender o uso agregado e anônimo. A versão padrão não executa análise. Qualquer análise considerada não essencial é carregada apenas após o seu consentimento onde a lei exige.',
        },
        { kind: 'h2', text: 'Suas escolhas de consentimento (EEE / Reino Unido)' },
        {
          kind: 'p',
          html: 'Se você está no Espaço Econômico Europeu ou no Reino Unido, o Balans pede o seu consentimento antes de carregar qualquer publicidade ou análise não essencial, usando o Modo de Consentimento do Google. Sua escolha é salva no armazenamento local do navegador e você pode alterá-la a qualquer momento. A região é detectada pelo fuso horário do navegador — sem consulta de IP nem serviço de localização.',
        },
        { kind: 'h2', text: 'Crianças' },
        {
          kind: 'p',
          html: 'O Balans não é direcionado a crianças menores de 13 anos e não coleta intencionalmente informações pessoais delas. Como não coletamos dados pessoais, não há nada a solicitar ou excluir.',
        },
        { kind: 'h2', text: 'Alterações nesta política' },
        {
          kind: 'p',
          html: 'Podemos atualizar esta política conforme o app evolui. Mudanças relevantes serão refletidas na data de “última atualização” acima.',
        },
        { kind: 'h2', text: 'Contato' },
        {
          kind: 'p',
          html: `Dúvidas sobre privacidade? Escreva para <a href="mailto:${EMAIL}">${EMAIL}</a>.`,
        },
      ],
    },
  },
}

const terms: ContentPage = {
  slug: 'terms',
  perLang: {
    en: {
      title: 'Terms of Use — Balans',
      description:
        'The simple terms for using Balans: free, provided as-is, no account, and your data stays yours.',
      h1: 'Terms of Use',
      blocks: [
        { kind: 'updated', text: 'Last updated: 29 June 2026' },
        {
          kind: 'lead',
          text: 'Balans is a free tool for splitting players into balanced teams. By using it, you agree to these simple terms.',
        },
        { kind: 'h2', text: 'The service' },
        {
          kind: 'p',
          html: 'Balans runs entirely in your browser. It is provided free of charge, with no account and no sign-up. There is no server that stores your data — see the <a href="/privacy">Privacy Policy</a>.',
        },
        { kind: 'h2', text: 'Provided “as is”' },
        {
          kind: 'p',
          html: 'Balans is provided on an “as is” and “as available” basis, without warranties of any kind. Team suggestions are a starting point, not a guarantee of a perfectly even match. We are not liable for any loss arising from use of the app.',
        },
        { kind: 'h2', text: 'Your data is yours' },
        {
          kind: 'p',
          html: 'The player names and setups you enter belong to you. They are stored only on your device and in the links you choose to share. You are responsible for the content you enter and for who you share your links with.',
        },
        { kind: 'h2', text: 'Acceptable use' },
        {
          kind: 'p',
          html: "Use Balans for organising friendly teams. Don't attempt to disrupt the service, misuse it to harass others, or use it unlawfully.",
        },
        { kind: 'h2', text: 'Advertising' },
        {
          kind: 'p',
          html: 'Balans may display third-party advertising to remain free. Advertisers are responsible for their own content; see the <a href="/privacy">Privacy Policy</a> for how advertising cookies are handled.',
        },
        { kind: 'h2', text: 'Not affiliated' },
        {
          kind: 'p',
          html: 'Balans is an independent project and is not affiliated with, endorsed by, or sponsored by any football club, league or governing body.',
        },
        { kind: 'h2', text: 'Changes' },
        {
          kind: 'p',
          html: 'We may update these terms as the app evolves. Continued use after a change means you accept the updated terms.',
        },
        { kind: 'h2', text: 'Contact' },
        {
          kind: 'p',
          html: `Questions? Email <a href="mailto:${EMAIL}">${EMAIL}</a> or see the <a href="/contact">Contact page</a>.`,
        },
      ],
    },
    fr: {
      title: 'Conditions d’utilisation — Balans',
      description:
        'Les conditions simples d’utilisation de Balans : gratuit, fourni tel quel, sans compte, et vos données restent les vôtres.',
      h1: 'Conditions d’utilisation',
      blocks: [
        { kind: 'updated', text: 'Dernière mise à jour : 29 juin 2026' },
        {
          kind: 'lead',
          text: 'Balans est un outil gratuit pour répartir des joueurs en équipes équilibrées. En l’utilisant, vous acceptez ces conditions simples.',
        },
        { kind: 'h2', text: 'Le service' },
        {
          kind: 'p',
          html: 'Balans fonctionne entièrement dans votre navigateur. Il est fourni gratuitement, sans compte ni inscription. Aucun serveur ne stocke vos données — voir la <a href="/fr/privacy">politique de confidentialité</a>.',
        },
        { kind: 'h2', text: 'Fourni “en l’état”' },
        {
          kind: 'p',
          html: 'Balans est fourni “en l’état” et “selon disponibilité”, sans garantie d’aucune sorte. Les suggestions d’équipes sont un point de départ, pas une garantie de match parfaitement équilibré. Nous ne sommes pas responsables des pertes découlant de l’usage de l’application.',
        },
        { kind: 'h2', text: 'Vos données vous appartiennent' },
        {
          kind: 'p',
          html: 'Les noms de joueurs et les configurations que vous saisissez vous appartiennent. Ils sont stockés uniquement sur votre appareil et dans les liens que vous choisissez de partager. Vous êtes responsable du contenu saisi et des personnes avec qui vous partagez vos liens.',
        },
        { kind: 'h2', text: 'Usage acceptable' },
        {
          kind: 'p',
          html: 'Utilisez Balans pour organiser des équipes amicales. N’essayez pas de perturber le service, de l’utiliser pour harceler autrui, ni de manière illégale.',
        },
        { kind: 'h2', text: 'Publicité' },
        {
          kind: 'p',
          html: 'Balans peut afficher des publicités de tiers pour rester gratuit. Les annonceurs sont responsables de leur propre contenu ; voir la <a href="/fr/privacy">politique de confidentialité</a> pour la gestion des cookies publicitaires.',
        },
        { kind: 'h2', text: 'Sans affiliation' },
        {
          kind: 'p',
          html: 'Balans est un projet indépendant et n’est ni affilié, ni approuvé, ni sponsorisé par un club, une ligue ou une instance dirigeante de football.',
        },
        { kind: 'h2', text: 'Modifications' },
        {
          kind: 'p',
          html: 'Nous pouvons mettre à jour ces conditions à mesure que l’application évolue. Continuer à l’utiliser après une modification vaut acceptation des conditions mises à jour.',
        },
        { kind: 'h2', text: 'Contact' },
        {
          kind: 'p',
          html: `Des questions ? Écrivez à <a href="mailto:${EMAIL}">${EMAIL}</a> ou voir la <a href="/fr/contact">page Contact</a>.`,
        },
      ],
    },
    es: {
      title: 'Términos de uso — Balans',
      description:
        'Los términos simples para usar Balans: gratis, tal cual, sin cuenta, y tus datos siguen siendo tuyos.',
      h1: 'Términos de uso',
      blocks: [
        { kind: 'updated', text: 'Última actualización: 29 de junio de 2026' },
        {
          kind: 'lead',
          text: 'Balans es una herramienta gratuita para repartir jugadores en equipos equilibrados. Al usarla, aceptas estos términos simples.',
        },
        { kind: 'h2', text: 'El servicio' },
        {
          kind: 'p',
          html: 'Balans funciona enteramente en tu navegador. Se ofrece gratis, sin cuenta ni registro. No hay servidor que almacene tus datos — consulta la <a href="/es/privacy">Política de privacidad</a>.',
        },
        { kind: 'h2', text: 'Se ofrece “tal cual”' },
        {
          kind: 'p',
          html: 'Balans se ofrece “tal cual” y “según disponibilidad”, sin garantías de ningún tipo. Las sugerencias de equipos son un punto de partida, no una garantía de partido perfectamente parejo. No somos responsables de ninguna pérdida derivada del uso de la app.',
        },
        { kind: 'h2', text: 'Tus datos son tuyos' },
        {
          kind: 'p',
          html: 'Los nombres de jugadores y las configuraciones que introduces te pertenecen. Se guardan solo en tu dispositivo y en los enlaces que decides compartir. Eres responsable del contenido que introduces y de con quién compartes tus enlaces.',
        },
        { kind: 'h2', text: 'Uso aceptable' },
        {
          kind: 'p',
          html: 'Usa Balans para organizar equipos amistosos. No intentes perturbar el servicio, usarlo para acosar a otros, ni de forma ilícita.',
        },
        { kind: 'h2', text: 'Publicidad' },
        {
          kind: 'p',
          html: 'Balans puede mostrar publicidad de terceros para seguir siendo gratis. Los anunciantes son responsables de su propio contenido; consulta la <a href="/es/privacy">Política de privacidad</a> para saber cómo se gestionan las cookies publicitarias.',
        },
        { kind: 'h2', text: 'Sin afiliación' },
        {
          kind: 'p',
          html: 'Balans es un proyecto independiente y no está afiliado, respaldado ni patrocinado por ningún club, liga u organismo rector de fútbol.',
        },
        { kind: 'h2', text: 'Cambios' },
        {
          kind: 'p',
          html: 'Podemos actualizar estos términos a medida que la app evoluciona. Seguir usándola tras un cambio significa que aceptas los términos actualizados.',
        },
        { kind: 'h2', text: 'Contacto' },
        {
          kind: 'p',
          html: `¿Dudas? Escribe a <a href="mailto:${EMAIL}">${EMAIL}</a> o consulta la <a href="/es/contact">página de Contacto</a>.`,
        },
      ],
    },
    pt: {
      title: 'Termos de Uso — Balans',
      description:
        'Os termos simples para usar o Balans: gratuito, fornecido como está, sem conta, e seus dados continuam seus.',
      h1: 'Termos de Uso',
      blocks: [
        { kind: 'updated', text: 'Última atualização: 29 de junho de 2026' },
        {
          kind: 'lead',
          text: 'O Balans é uma ferramenta gratuita para dividir jogadores em times equilibrados. Ao usá-lo, você concorda com estes termos simples.',
        },
        { kind: 'h2', text: 'O serviço' },
        {
          kind: 'p',
          html: 'O Balans funciona inteiramente no seu navegador. É fornecido gratuitamente, sem conta e sem cadastro. Não há servidor que armazene seus dados — veja a <a href="/pt/privacy">Política de Privacidade</a>.',
        },
        { kind: 'h2', text: 'Fornecido “como está”' },
        {
          kind: 'p',
          html: 'O Balans é fornecido “como está” e “conforme disponível”, sem garantias de qualquer tipo. As sugestões de times são um ponto de partida, não uma garantia de partida perfeitamente equilibrada. Não somos responsáveis por qualquer perda decorrente do uso do app.',
        },
        { kind: 'h2', text: 'Seus dados são seus' },
        {
          kind: 'p',
          html: 'Os nomes de jogadores e as configurações que você insere pertencem a você. Eles são armazenados apenas no seu dispositivo e nos links que você escolhe compartilhar. Você é responsável pelo conteúdo que insere e por com quem compartilha seus links.',
        },
        { kind: 'h2', text: 'Uso aceitável' },
        {
          kind: 'p',
          html: 'Use o Balans para organizar times amistosos. Não tente perturbar o serviço, usá-lo para assediar outras pessoas, nem de forma ilegal.',
        },
        { kind: 'h2', text: 'Publicidade' },
        {
          kind: 'p',
          html: 'O Balans pode exibir publicidade de terceiros para continuar gratuito. Os anunciantes são responsáveis pelo próprio conteúdo; veja a <a href="/pt/privacy">Política de Privacidade</a> para saber como os cookies de publicidade são tratados.',
        },
        { kind: 'h2', text: 'Sem afiliação' },
        {
          kind: 'p',
          html: 'O Balans é um projeto independente e não é afiliado, endossado ou patrocinado por nenhum clube, liga ou entidade de futebol.',
        },
        { kind: 'h2', text: 'Alterações' },
        {
          kind: 'p',
          html: 'Podemos atualizar estes termos conforme o app evolui. Continuar usando após uma alteração significa que você aceita os termos atualizados.',
        },
        { kind: 'h2', text: 'Contato' },
        {
          kind: 'p',
          html: `Dúvidas? Escreva para <a href="mailto:${EMAIL}">${EMAIL}</a> ou veja a <a href="/pt/contact">página de Contato</a>.`,
        },
      ],
    },
  },
}

export const PAGES: ContentPage[] = [about, help, contact, privacy, terms]
