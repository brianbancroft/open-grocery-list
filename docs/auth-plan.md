# Auth Plan

## Authentication Goal

Use Sign in with Apple to verify identity, then use first-party app sessions for all API access.

This keeps the app independent from Google after login and gives the backend one consistent session model for web, iOS, Watch, and Siri/App Intents.

## MVP Access Model

- Every authorized user can access every shared list and item.
- Only an administrator-created invitation admits a new person.
- Administrators manage invitations; household members share one workspace.
- There is no per-user list ownership gating.

The server should still record `created_by_user_id`, `updated_by_user_id`, and `completed_by_user_id` for accountability.

## Google OAuth/OIDC Setup

Create Google OAuth clients for:

- Web client.
- iOS client.

Potentially add separate identifiers later for:

- Watch companion flow, if needed.
- Development/staging environments.

Required configuration:

- Authorized redirect URI for web.
- iOS bundle ID.
- Server-side Google client ID allowlist.

## Server Verification

The server must verify Google identity tokens or authorization-code exchanges before creating a session.

Validation should confirm:

- Token signature.
- Issuer.
- Audience/client ID.
- Expiry.
- Stable `sub` claim.
- Email, if needed for display.

The local user identity should be keyed by Google `sub`, not email.

## Session Strategy

Use opaque app session tokens.

Web:

- HTTP-only secure cookie.
- SameSite=Lax.
- Rotating session optional after MVP.

iOS/Watch/Siri:

- Bearer token stored in Keychain.
- Watch receives token through WatchConnectivity or independent sign-in if needed.

Server:

- Store only a hash of the token.
- Include expiry.
- Support logout by revoking the session.

## Household Restriction Options

Because Google sign-in alone allows any Google account that passes OAuth to sign in, choose one of these before exposing the service publicly:

### Option A: Email Allowlist

Keep a server-side allowlist of family Google account emails.

Pros:

- Simple.
- Good for private family app.

Cons:

- Manual updates when adding users.

### Option B: Invite Code

Require a one-time household invite code after first Google login.

Pros:

- Allows new family members without redeploying config.

Cons:

- More product and backend work.

### Recommendation

Use an email allowlist for the MVP.

## Environment Variables

Suggested variables:

```text
GOOGLE_WEB_CLIENT_ID=
GOOGLE_IOS_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SESSION_SECRET=
ALLOWED_EMAILS=
APP_PUBLIC_URL=
```

## Security Checklist

- Use HTTPS for production.
- Never store Google access tokens unless a future feature requires them.
- Hash app session tokens in the database.
- Expire sessions.
- Rate-limit auth endpoints.
- Log failed login attempts without storing sensitive tokens.
- Keep secrets in Coolify environment variables.
