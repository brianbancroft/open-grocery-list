# Family Development Mode

This mode is for you and your wife to use the app before a production App Store release and before Apple production configuration is finished.

## Recommended path: TestFlight

1. Give the API a reachable HTTPS development hostname, for example `groceries-api-dev.bancroft.io`.
2. Create a separate Coolify application and separate Postgres database for development. Never point development at family production data.
3. Add the iOS app to App Store Connect and distribute it through TestFlight to both Apple IDs.
4. Enable Sign in with Apple on the development App ID and configure the development API with that bundle identifier.
5. Create the first admin account through the provisioning flow described in [first-launch provisioning](./04-first-launch-provisioning.md), then invite the second person.

## First-launch configuration

The app should not compile a private server URL into the binary. On first launch, show a setup screen with:

- **Server URL** — HTTPS URL, for example `https://groceries-api-dev.bancroft.io`.
- **Provisioning token** — a single-use token created by the API administrator.
- **Continue** — validates the server and exchanges the token for a device-local household bootstrap grant.

Store the URL in `UserDefaults`; store the received credential in the Keychain. Do not store a provisioning token after use.

## Local-only alternative

For simulator development, run Postgres locally and start the API with `npm run dev`. Use a local HTTPS tunnel only if testing on a physical device; Sign in with Apple requires the configured app identity and reachable HTTPS API.

## Exit criteria

- Both people can install the TestFlight build.
- Both see the same list changes through the development API.
- Failed/deleted invitations cannot be reused.
- A new build can point at a different server without source changes.
