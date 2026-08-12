# Private Family Setup

## Finish Coolify

- In Coolify, open `open-grocery-list` → **Environment Variables** → **Developer view**.
- Set these production variables and save them:

  ```text
  DATABASE_URL=<the internal Postgres URL displayed by the Coolify Postgres resource>
  NODE_ENV=production
  ```

- Redeploy the application and confirm `GET /health` returns `{"ok":true}`.
- Keep the Postgres resource private. Do not expose port `5432` publicly.
- Keep the API resource limits at 0.25 CPU / 160 MB and Postgres at 0.25 CPU / 192 MB unless monitoring shows a real need to increase them.

## DNS and HTTPS

- Create a DNS record for `groceries-api.bancroft.io` pointing to the public IP of the Coolify host.
- In Cloudflare, use **DNS only** until Coolify has completed its initial Let's Encrypt certificate issuance. Proxying can be enabled later if desired.
- Confirm `https://groceries-api.bancroft.io/health` works before configuring the iOS client.

## Apple sign-in

- Create/configure the production App ID in Apple Developer.
- Enable **Sign in with Apple** for the real iOS bundle identifier.
- Set these Coolify runtime variables:

  ```text
  APPLE_BUNDLE_ID=<production iOS bundle id>
  APPLE_ADMIN_SUBS=<Apple subject identifier for the initial household admin>
  ```

- Redeploy. Before these are set, the API intentionally returns `AUTH_NOT_CONFIGURED` only for Apple login attempts; the service itself remains healthy.

## Invitations and email

- Sign in as the bootstrap administrator.
- Create invitations using the admin API/UI once it exists and deliver the generated code manually.
- Optional: add `RESEND_API_KEY` and `RESEND_FROM` once a verified sender is available. Without them, invites still work; the API returns the code and reports `emailSent: false`.

## Security maintenance

- Change the Coolify password the user supplied to this session.
- Rotate the Coolify Postgres password if it was displayed or copied into any insecure location.
- Keep `.env` local only. It is ignored by Git; `.env.example` contains placeholders only.
