# Deploy to Fly.io

Open Grocery List is a stateless Docker service. It needs a PostgreSQL database reachable over TLS.

1. Fork this repository and install/log in to `flyctl`.
2. Copy `fly.toml.example` to `fly.toml`.
3. Replace `change-me-open-grocery-list` with a globally unique Fly app name and pick a nearby `primary_region`.
4. Provision a managed PostgreSQL database (Fly, Neon, Supabase, or another provider) and obtain its connection URL.
5. Set secrets; do not put them in `fly.toml`:

   ```sh
   fly secrets set DATABASE_URL='postgres://…' APPLE_BUNDLE_ID='com.example.opengrocerylist' APPLE_ADMIN_SUBS=''
   ```

6. Deploy:

   ```sh
   fly deploy
   ```

7. Confirm `https://<your-app>.fly.dev/health` returns `{"ok":true}`.

The checked-in configuration automatically stops the single small machine when idle, starts it on requests, and uses 256 MB shared CPU. Set `min_machines_running = 1` only if always-on latency matters more than cost.

Apple sign-in intentionally responds with `AUTH_NOT_CONFIGURED` until you set a real `APPLE_BUNDLE_ID`; the health check still passes.
