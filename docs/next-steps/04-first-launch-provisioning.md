# First-launch Server and Provisioning Design

## User experience

On a fresh install, show **Connect to Open Grocery List** before any Sign in with Apple control:

| Field | Required | Rules |
| --- | --- | --- |
| Server URL | Yes | `https` only; normalized without a trailing slash. |
| Provisioning token | Yes | Paste-only, opaque, single-use. |

The app calls `POST {serverURL}/api/provision/claim`. If successful, it saves the server URL plus a short-lived bootstrap grant in the Keychain, then presents Sign in with Apple. The grant is consumed during the first Apple login and never appears in logs or UI again.

After setup, put **Change Server** under an explicit destructive Settings action that clears the Keychain session and returns to this screen.

## API model

Add a `provisioning_tokens` table:

```text
id, token_hash, name, created_by_user_id, expires_at, max_uses,
uses, revoked_at, created_at
```

Rules:

- Generate 32-byte random opaque tokens; store only SHA-256 hashes.
- Default to `max_uses=1` and a 24-hour expiry.
- Admin-only endpoints create, list, revoke, and rotate tokens.
- The claim endpoint atomically checks expiry/revocation/uses, increments `uses`, and returns a signed or opaque one-time bootstrap grant valid for 10 minutes.
- Rate limit claims by IP and token hash. Return the same generic error for invalid, expired, and revoked tokens.
- Never make a provisioning token an app session or a durable household credential.

Suggested endpoints:

```text
POST /api/admin/provisioning-tokens       # authenticated admin creates a token
GET  /api/admin/provisioning-tokens       # authenticated admin lists status, never raw tokens
POST /api/admin/provisioning-tokens/:id/revoke
POST /api/provision/claim                 # unauthenticated, token-only, rate limited
```

`POST /api/provision/claim` request:

```json
{ "token": "opaque-token-from-the-admin" }
```

Response:

```json
{ "bootstrapGrant": "opaque-10-minute-grant", "expiresAt": "2026-08-12T23:00:00Z" }
```

## Apple sign-in integration

Extend `POST /api/auth/apple` with an optional `bootstrapGrant` field. For a first-ever user, the server accepts either:

- a valid email-bound administrator invitation, or
- a valid, unused bootstrap grant.

Do not use a provisioning token directly in Apple sign-in. That separation limits the impact of a pasted token and allows a provisioning token to be revoked independently.

## Implementation order

1. Add migration and token/grant hashing helpers.
2. Add the admin endpoints plus focused expiry/revocation/rate-limit tests.
3. Add `claim` and consume-grant logic in Apple sign-in.
4. Add Swift Keychain storage and the first-launch configuration screen.
5. Add Settings → Change Server and an end-to-end TestFlight test with two users.
