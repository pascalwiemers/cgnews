# Cloudflare OpenNext Skeleton

This branch adds the minimal OpenNext Cloudflare Worker skeleton without moving
the Prisma datasource or database adapter.

## Verification

- `npm exec --package pnpm@10.15.0 -- pnpm typecheck`
  - Passes after regenerating Prisma Client with `pnpm prisma generate`.
- `npm exec --package pnpm@10.15.0 -- pnpm cf:typegen`
  - Passes and writes `cloudflare-env.d.ts`.
- `npm exec --package pnpm@10.15.0 -- pnpm cf:build`
  - Fails because `@opennextjs/cloudflare@1.19.11` rejects Next `14.2.5`
    unless `--dangerouslyUseUnsupportedNextVersion` is supplied.
- `npm exec --package pnpm@10.15.0 -- pnpm exec opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion`
  - Passes and writes `.open-next/worker.js`.
- `npm exec --package pnpm@10.15.0 -- pnpm exec opennextjs-cloudflare preview`
  - Starts Wrangler on `http://localhost:8787`.
  - `GET /` returns `200 OK` with `x-opennext: 1`.
  - Data-backed story rendering logs a Prisma query-engine failure.

## Known Blockers

- The current OpenNext Cloudflare package has a peer requirement for Next
  `>=15.5.18 <16 || >=16.2.6`, while CGNews is currently on Next `14.2.5`.
  The Worker bundle can be produced with the explicit unsupported-version flag,
  but the normal `cf:build` script should not be considered green until the
  Next version plan is settled.
- Prisma is still using the native Postgres client path. In Wrangler preview,
  `prisma.story.findMany()` fails because Prisma Client was generated for
  `darwin-arm64`, while the Worker bundle attempts to load
  `debian-openssl-1.1.x`. Adding that binary target would only address the
  local preview error; Thread J still needs the real D1/edge-safe Prisma
  migration plan.
- Clerk middleware initializes in preview and reports signed-out status for
  anonymous requests. Authenticated flows were not validated in this skeleton
  thread.
- No bundle-size deployment limit issue was observed during build, but this
  branch does not deploy to Cloudflare.

## Thread J Placeholder

`wrangler.jsonc` intentionally leaves the D1 binding commented out. Thread J
should replace the placeholder only after the database binding name, D1
database id, and Prisma adapter strategy are validated together.
