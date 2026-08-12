# Deploy to Railway

1. Click the Railway button in the repository README, or create a Railway project and select this GitHub repository.
2. Add a PostgreSQL service in the same Railway project.
3. In the API service variables, set:

   ```text
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   NODE_ENV=production
   APPLE_BUNDLE_ID=com.example.opengrocerylist
   APPLE_ADMIN_SUBS=
   ```

4. Deploy. `railway.json` tells Railway to build the Dockerfile and check `/health`.
5. Generate a public domain and configure the iOS app with that HTTPS API URL.

The Apple settings above are placeholders. The service runs and migrations apply, but sign-in stays disabled until the operator supplies their own Apple Developer App ID and a bootstrap administrator subject ID.
