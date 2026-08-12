# Open Questions

## Product

- Should completed items stay visible, collapse, or disappear by default?
- Should lists be archived or permanently deleted from the UI?
- Should items support quantity as a separate field from the item name in the MVP?
- Should there be a default grocery list for Siri and quick-add?
- Should the app suggest previously used items?

## Access

- Which Google accounts should be allowed to sign in?
- Is an email allowlist acceptable for the first version?
- Will the app be exposed publicly on the internet or only through VPN/private network?

## Backend

- Preferred backend framework: Fastify, Hono, Express, or something else?
- Preferred ORM/query tool: Drizzle, Kysely, Prisma, or raw SQL migrations?
- Should the web UI be served by the API container or as a separate static app?

## iOS

- Is independent Apple Watch use required, or is phone-mediated WatchConnectivity enough?
- How important is offline usage for the first iOS release?
- Should item categories be manually assigned, auto-suggested, or skipped initially?

## Deployment

- What domain/subdomain will be used?
- How will Postgres backups be stored off the home server?
- Should deployment happen automatically from Git pushes?

