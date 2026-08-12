# Implementation Roadmap

## Phase 0: Project Setup

- Choose backend framework.
- Choose web framework.
- Add monorepo or simple app structure.
- Add linting, formatting, and test runner.
- Add Dockerfile and local Docker Compose.
- Add `.env.example`.

Deliverable:

- Empty app boots locally.
- Health endpoint works.
- CI or local test command exists.

## Phase 1: Backend Foundation

- Add Postgres connection.
- Add database migrations.
- Create `users`, `sessions`, `lists`, and `list_items`.
- Add request validation.
- Add consistent error responses.
- Add health/readiness endpoints.

Deliverable:

- API server can create and read test data.

## Phase 2: Auth

- Configure Google OAuth/OIDC.
- Implement `POST /api/auth/google`.
- Implement app sessions.
- Add session middleware.
- Add logout.
- Add email allowlist.

Deliverable:

- A family member can sign in and access protected API endpoints.

## Phase 3: Lists and Items API

- Implement list CRUD.
- Implement item CRUD.
- Implement complete/uncomplete.
- Add audit events or mutation logging.
- Add API tests.

Deliverable:

- All core list operations work through HTTP.

## Phase 4: Web UI

- Implement sign-in screen.
- Implement list overview.
- Implement list detail.
- Add create/rename/archive list flows.
- Add add/check/delete item flows.
- Handle loading, empty, and error states.

Deliverable:

- Household can use the app from a browser.

## Phase 5: iOS MVP

- Create SwiftUI app.
- Add Google sign-in.
- Add app session storage in Keychain.
- Add API client.
- Add list overview and detail.
- Add item add/check/delete.

Deliverable:

- iPhone can perform core grocery flows.

## Phase 6: Watch MVP

- Add watch target.
- Share models/API-facing logic where appropriate.
- Use WatchConnectivity for list and item data.
- Implement list overview and item checkoff.

Deliverable:

- Apple Watch can check off grocery items.

## Phase 7: Siri/App Intents

- Add App Intents target/code.
- Implement add grocery item intent.
- Add default list setting.
- Test common Siri phrases.

Deliverable:

- Siri can add an item to the default or named list.

## Phase 8: Sync and Reliability

- Add `updated_at`-based sync endpoint.
- Add local cache to iOS.
- Add retry queue for failed mutations.
- Add polling or SSE for active list updates.

Deliverable:

- App remains usable with brief network interruptions and updates across devices quickly.

## Phase 9: Deployment Hardening

- Finalize Coolify deployment config.
- Add database backups.
- Add health checks.
- Add basic log review process.
- Document restore process.

Deliverable:

- Production deployment is maintainable on the home server.

