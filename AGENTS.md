# CGNews operator guide

## Architecture

- Next.js App Router deployed to Cloudflare Workers with OpenNext.
- Cloudflare D1 stores profiles, stories, comments, votes, and favorites.
- Clerk stores credentials and sessions. Never add password fields to D1.
- Local development uses `CGNEWS_DB_RUNTIME=local` and `prisma/dev.db`.

## Safe workflow

1. Copy `.env.example` to `.env.local`; never commit `.env*` secrets.
2. Run `pnpm check` before a production build.
3. Run `pnpm cf:build` to verify the supported Worker bundle.
4. Add schema changes as a new tracked SQL migration. Never edit an applied migration.
5. Back up D1 before destructive migrations.
6. Run `pnpm deploy:prod` only with production Clerk and Cloudflare credentials.

## Production invariants

- Authenticated mutations must call `getOrCreateLocalUser()`.
- User-authored text must render as text or pass through an audited sanitizer.
- Vote and comment counters are maintained by D1 triggers.
- `cgnews.app` is the canonical production origin.
