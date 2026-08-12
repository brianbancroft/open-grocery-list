# Deployment Plan

## Target Environment

Deploy the backend and web UI to a home Coolify setup.

Recommended services:

- API/web container.
- Postgres database.
- Optional reverse proxy managed by Coolify.

## Container Strategy

Use Docker Compose for local production parity.

Services:

- `app`: backend API and optionally static web assets.
- `postgres`: database.

Suggested runtime:

- Node.js LTS.
- Production build copied into a small runtime image.
- Healthcheck endpoint exposed at `/healthz`.

## Domain and HTTPS

Use a stable domain or subdomain, for example:

```text
https://groceries.example.com
```

HTTPS is required for:

- Secure cookies.
- OAuth redirect flows.
- iOS production networking.

## Environment Variables

Expected production variables:

```text
DATABASE_URL=
APP_PUBLIC_URL=
GOOGLE_WEB_CLIENT_ID=
GOOGLE_IOS_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SESSION_SECRET=
ALLOWED_EMAILS=
NODE_ENV=production
```

## Database Migrations

Use versioned migrations checked into the repo.

Deployment should run migrations automatically or through a controlled release command before the app starts serving traffic.

For a personal app, automatic migrations on startup are acceptable if:

- They are idempotent.
- Backups exist.
- Failed migrations fail the deployment.

## Backups

Back up Postgres regularly.

Minimum backup plan:

- Nightly database dump.
- Retain at least 7 daily backups.
- Store backups outside the app container volume.
- Test restore before relying on the system.

## Observability

MVP logging:

- Structured server logs.
- Request ID per request.
- Auth failures without sensitive token contents.
- Mutation logs for list/item changes.

Health endpoints:

- `GET /healthz`: process is alive.
- `GET /readyz`: database is reachable.

## Coolify Checklist

- Create project in Coolify.
- Add Postgres service or connect external Postgres.
- Add app service from Git repository.
- Set environment variables.
- Configure domain and HTTPS.
- Configure persistent volume or managed storage for Postgres.
- Enable deploy-on-push if desired.
- Confirm `/healthz` and `/readyz`.
- Confirm Google OAuth redirect URI matches production URL.

