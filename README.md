# Balans

**Live:** https://balans.team

Balans splits a rotating weekly pool of players into balanced teams, assigns
positions and a formation, and shares the whole setup as a single link. It
supports football, basketball, cricket and a generic mode for any team sport.

## How it works

- **No backend, no accounts, no database.** Everything runs in the browser.
- **State lives in the URL fragment (`#…`).** A shared link fully rebuilds the
  setup. The fragment never reaches the server, so the host only ever serves
  static files.
- **Installable PWA** with offline support (Workbox service worker).
- **Cookieless analytics only**, so no consent wall is needed.

## Stack

- React 19, TypeScript, Vite, Tailwind CSS, Zustand
- Vitest unit tests (team balancing, URL encoding, sign-up lists, content)
- Hosted as a static build on Cloudflare Pages; an nginx `Dockerfile` is
  included for container hosting

## Run locally

```bash
bun install
bun run dev        # dev server
bun run test       # unit tests
bun run typecheck
bun run build      # static build in dist/
```

## Deploy

`bun run build` produces a static `dist/` that any CDN can serve. For a
container, build `dist/` first, then `docker build .` (nginx serves the SPA and
falls back to `index.html`).
