# Production deployment

CGNews uses Clerk Hobby for identity and Cloudflare Workers + D1 for the app and
community data. Clerk owns passwords, verification, OAuth, and sessions. CGNews
still owns public profiles and submitted community content.

## One-time bootstrap

1. Run `wrangler login` and confirm the account owns `cgnews.app`.
2. Create the database: `wrangler d1 create cgnews`.
3. Put the returned database ID in `wrangler.jsonc`.
4. Apply migrations: `pnpm db:migrate:remote`.
5. Create a Clerk production instance for `cgnews.app`. Enable verified email
   and require a username. Add Google or GitHub only if desired.
6. Make `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` available during builds.
7. Store runtime secrets with `wrangler secret put CLERK_SECRET_KEY` and, when
   needed, `wrangler secret put CGNEWS_CURATOR_CLERK_IDS`.
8. Run `pnpm deploy:prod`. The deploy script sets `OPEN_NEXT_DEPLOY=true` to
   upload the already-built bundle directly and avoid redundant package-manager
   reconciliation inside Wrangler.

## GitHub Actions secrets

- `CLOUDFLARE_API_TOKEN`: Workers Scripts write, D1 write, and zone route access.
- `CLOUDFLARE_ACCOUNT_ID`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Pull requests and feature branches run the secret-free `Validate CGNews`
workflow. Merging to `main` runs `Deploy CGNews`, which checks, builds, migrates,
deploys, and smoke-tests production in order. Do not merge until all four
repository secrets above are configured.

## Operations

Before migrations, export a backup:

```bash
wrangler d1 export cgnews --remote --output cgnews-backup.sql
```

Inspect deployments with `wrangler deployments list`. Roll back with
`wrangler rollback [deployment-id]`. Verify production with `pnpm smoke:prod`.

The Worker upload is roughly 9 MB and may remain silent for two to three
minutes after Wrangler prints `Total Upload`. Leave the process attached until
it prints a version ID; do not treat asset upload as deployment success.

After every deploy, verify both the active version and D1 integrity:

```bash
wrangler deployments status
pnpm smoke:prod
wrangler d1 execute cgnews --remote --command \
  "PRAGMA foreign_key_check;"
```

`.env.production` is intentionally ignored. It may contain the public Clerk
publishable key needed at build time, but it remains machine-local so no future
secret can be committed there accidentally.
