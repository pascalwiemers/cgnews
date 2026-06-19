# Cloudflare OpenNext + D1 Runtime

This branch adds the OpenNext Cloudflare Worker skeleton and moves Prisma onto a
SQLite/D1-compatible schema with the `@prisma/adapter-d1` runtime path.

## Database Runtime

- Local Next.js and seed scripts use `DATABASE_URL="file:./dev.db"` with the
  libSQL Prisma adapter. Prisma CLI still reads the same SQLite URL from the
  Prisma schema.
- Cloudflare Worker execution uses the `DB` D1 binding through
  `@prisma/adapter-d1`.
- Prisma Client is generated with `engineType = "client"` so Worker requests do
  not depend on native query-engine binaries.
- Worker requests import the generated Prisma WASM client. The Node-only local
  SQLite fallback dynamically imports the regular Prisma client so plain Node
  scripts do not have to load Prisma's Worker WASM loader.
- `lib/db.ts` resolves the D1 binding inside `getDb()` during server execution;
  it does not create a D1-backed Prisma client at module import time.
- Local fallback is allowed only when `CGNEWS_DB_RUNTIME="local"` is set.
  Worker requests fail loudly if the D1 context or `DB` binding is missing
  instead of silently falling back to local SQLite.
- D1 does not provide Prisma's normal transaction guarantees; mutation code
  avoids `$transaction` on the request path.

## D1 Migrations

Wrangler is configured to read Prisma migration SQL from
`prisma/migrations/*/migration.sql`.

```bash
pnpm db:migrate:local
pnpm db:migrate:remote
pnpm cf:typegen
```

Before a real remote deploy, replace the placeholder `database_id` in
`wrangler.jsonc` with the id returned by:

```bash
pnpm exec wrangler d1 create cgnews
```

## Verification

- `DATABASE_URL="file:./dev.db" npm exec --package pnpm@10.15.0 -- pnpm prisma validate`
  - Passes with provider `sqlite` and `driverAdapters`.
- `DATABASE_URL="file:./dev.db" npm exec --package pnpm@10.15.0 -- pnpm prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`
  - Produces the tracked initial migration in `prisma/migrations`.
- `npm exec --package pnpm@10.15.0 -- pnpm cf:typegen`
  - Regenerates `cloudflare-env.d.ts` with the D1 binding.
- `npm exec --package pnpm@10.15.0 -- pnpm cf:build`
  - Fails because `@opennextjs/cloudflare@1.19.11` rejects Next `14.2.5`
    unless `--dangerouslyUseUnsupportedNextVersion` is supplied.
- `npm exec --package pnpm@10.15.0 -- pnpm cf:build:unsafe`
  - Passes, writes `.open-next/worker.js`, and copies Prisma's query compiler
    WASM into the OpenNext server-function bundle.
- `CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV=false node_modules/.bin/wrangler dev --port 8788 --local`
  - Starts Wrangler with the local D1 binding from `wrangler.jsonc`.
  - `GET /` returns `200 OK` with `x-opennext: 1`.
- `CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV=false node_modules/.bin/wrangler deploy --dry-run --outdir /tmp/cgnews-worker-dryrun`
  - Passes and emits the bundled `query_compiler_bg.wasm` asset.

## Known Blockers

- The current OpenNext Cloudflare package has a peer requirement for Next
  `>=15.5.18 <16 || >=16.2.6`, while CGNews is currently on Next `14.2.5`.
  The Worker bundle can be produced with the explicit unsupported-version flag,
  but the normal `cf:build` script should not be considered green until the
  Next version plan is settled.
- `wrangler.jsonc` contains a placeholder D1 `database_id` so local validation
  can run. Remote deploy/migration requires replacing it with the real D1 id.
- Wrangler's local D1 store is separate from `prisma/dev.db`; the standard
  `pnpm seed` command seeds local SQLite, not the Wrangler D1 preview database.
- Clerk middleware initializes in preview and reports signed-out status for
  anonymous requests. Authenticated flows were not validated in this skeleton
  thread.
- No bundle-size deployment limit issue was observed during build, but this
  branch does not deploy to Cloudflare.
