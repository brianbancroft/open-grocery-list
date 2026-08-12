# Architecture

## System Overview

The app should be built around a small self-hosted API server backed by Postgres. The web app, iOS app, Apple Watch app, and Siri/App Intents integration should all use the same API contract.

```text
iOS App / Watch App / Siri
          |
          | HTTPS JSON API
          v
Backend API Server ---- Postgres
          ^
          |
Web UI
```

## Recommended Components

### Backend API

Use a small TypeScript service:

- Fastify, Hono, or Express.
- Zod or Valibot for request validation.
- Drizzle ORM, Kysely, Prisma, or SQL migrations.
- Cookie sessions for web clients.
- Bearer/session tokens for native clients.

Fastify or Hono are good fits because the API surface is small and self-hosting should stay lightweight.

### Database

Use Postgres because it is reliable, easy to host in Coolify, and strong enough for future sync/history features.

Primary tables:

- `users`
- `sessions`
- `lists`
- `list_items`
- `item_events` or `audit_events`

### Web UI

Use React with either:

- Vite for a simple SPA served by the API or static hosting.
- Next.js if server-rendered pages or a unified app/API deployment becomes valuable.

For this app, Vite plus the API server is likely enough.

### iOS App

Use SwiftUI for:

- Native list interactions.
- Watch app companion.
- App Intents/Siri support.
- Local caching with SwiftData or SQLite if needed.

The iOS app should treat the backend as the source of truth.

## Authentication Boundary

Google is the identity provider, but the app server owns application sessions.

Flow:

1. Client starts Google sign-in.
2. Client receives an ID token or authorization code.
3. Server verifies with Google.
4. Server creates or updates a local user.
5. Server issues an app session.

This keeps app authorization simple and avoids trusting client-only identity checks.

## Household Access Model

For the MVP, every authenticated user belongs to one implicit household.

Implications:

- No authorization checks per list beyond "is authenticated".
- Every list query returns all non-archived household lists.
- Every mutation is allowed for every signed-in user.
- Database schema should still include `created_by_user_id` and `updated_by_user_id`.

Future multi-household support can be added by introducing a `households` table and `household_members` table.

## Sync Model

Start with normal API fetches and mutations.

MVP:

- Fetch all lists on app load.
- Fetch list items when opening a list.
- Optimistic UI updates for checking items.
- Refetch after mutations.

Next step:

- Add `updated_at` timestamps and `sync_cursor`.
- Poll for changes every few seconds while a list is open.

Later:

- Server-Sent Events or WebSockets for live updates.
- Local offline queue for iOS.

## Error Handling

Clients should handle:

- Not authenticated.
- Server unavailable.
- Mutation conflict or stale item.
- Validation error.
- Deleted list/item.

Server responses should use consistent JSON error shapes:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Item name is required"
  }
}
```

## Security Notes

- Enforce HTTPS in production.
- Store Google client IDs and secrets in environment variables.
- Set secure cookie flags for web sessions.
- Hash session tokens at rest if using token storage.
- Validate all request bodies server-side.
- Rate-limit auth endpoints.
- Keep backups of Postgres data.

