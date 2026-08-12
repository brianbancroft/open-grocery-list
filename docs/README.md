# Grocery List App Planning

This directory captures the working plan for a private family grocery list app.

The app should support:

- Multiple shared grocery lists.
- Any signed-in family member can view and edit every list.
- iOS Sign in with Apple for authentication.
- iOS app as the primary client.
- Apple Watch support for quick list viewing/checkoff.
- Siri/App Intents support for adding items by voice.
- Simple web UI for household use and administration.
- Self-hosted server deployment on a home Coolify setup.

## Documents

- [Product Requirements](./product-requirements.md)
- [Architecture](./architecture.md)
- [Data Model](./data-model.md)
- [API Plan](./api-plan.md)
- [Auth Plan](./auth-plan.md)
- [iOS, Watch, and Siri Plan](./ios-watch-siri.md)
- [Deployment Plan](./deployment.md)
- [Implementation Roadmap](./roadmap.md)
- [Open Questions](./open-questions.md)

## Recommended Starting Stack

The initial recommended stack is:

- Backend: Node.js with TypeScript, Fastify or Hono.
- Database: Postgres.
- Auth: Google OAuth/OIDC on the server, app session tokens for clients.
- iOS: Native SwiftUI app.
- iOS: Native SwiftUI app.
- Sync: API-first MVP, followed by lightweight polling or WebSocket/SSE updates.
- Deployment: Docker Compose managed by Coolify.

This stack keeps the server simple to self-host, keeps the iOS app native enough for Watch and Siri integrations, and avoids tying the household data to a third-party backend.
