# Family Lists

An invite-only shared household grocery and to-do app: Hono/Postgres API plus a native SwiftUI iOS client.

## Security and access model

Only Sign in with Apple is accepted. The API verifies Apple identity-token signatures against Apple's JWKS, issuer, audience (your bundle ID), and expiration. API sessions are random opaque bearer tokens; only SHA-256 hashes are stored in Postgres. Every mutation requires a valid session.

There is one communal workspace: every authorized member sees and can change every list. Bootstrap the first administrator with their Apple `sub` in `APPLE_ADMIN_SUBS`; administrators create seven-day email-bound invitation codes via `POST /api/admin/invitations`. A new person must submit that code during their first Apple sign-in. The response includes the code exactly once, so deliver it to the recipient through a trusted channel.

## Run the API

1. Create a Postgres database, copy `.env.example` to `.env`, and set the values. Do not commit `.env`.
2. Apply the migrations in order with your migration runner, for example `psql "$DATABASE_URL" -f server/migrations/001_initial.sql` followed by `psql "$DATABASE_URL" -f server/migrations/002_item_quantity.sql`.
3. `npm install && npm run dev`

For production, place the service behind HTTPS and set `NODE_ENV=production`. Configure the same Apple Service ID / app bundle identifier as `APPLE_BUNDLE_ID`, enable Sign in with Apple for the iOS target, and use an HTTPS API address. The iOS app reads `apiBaseURL` from `UserDefaults`; set it via launch arguments or add a production configuration before shipping.

## Coolify deployment

`docker-compose.coolify.yml` is a two-container, low-footprint deployment: the API is capped at 0.25 CPU / 160 MB and Postgres at 0.25 CPU / 192 MB. Postgres is not published externally; Coolify should expose only the `api` service on port `3000` through its HTTPS proxy.

In Coolify, create a **Docker Compose** resource from this repository using `docker-compose.coolify.yml`, attach a persistent volume (the compose file declares `familylists-postgres`), and set these secrets/configuration values:

```text
POSTGRES_PASSWORD=<long random value>
APPLE_BUNDLE_ID=<the production iOS bundle id>
APPLE_ADMIN_SUBS=<comma-separated bootstrap Apple subject IDs>
RESEND_API_KEY=<optional>
RESEND_FROM=<optional verified Resend sender>
```

Route the API at a private HTTPS hostname such as `familylists-api.<your-domain>`. Leave the Resend variables blank to keep email delivery disabled; invitation creation still succeeds and returns the one-time code to the admin. Database migrations run automatically and safely on API startup.

## iOS app

Run `xcodegen generate` in `ios/`, open `FamilyLists.xcodeproj`, select your Apple development team, replace the placeholder bundle identifier, and ensure the Sign in with Apple capability is enabled. The client uses native `ASAuthorizationAppleIDProvider`, lists, confirmation dialogs for deleting whole lists, completion taps, and swipe Edit/Delete actions. Item editing requires exactly one of eight labels.

## Validation

`npm run typecheck` and `npm test` validate the server types and input constraints. Full API integration requires a configured Postgres instance and a genuine Apple-issued identity token.
