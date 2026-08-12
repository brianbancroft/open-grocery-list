# Open-source Release Checklist

Goal: a free, self-hosted grocery/to-do app that works with any user-owned API server.

## Before publishing

- Remove private hostnames, Apple subject IDs, database URLs, and deployment screenshots from docs, examples, and Git history.
- Keep only placeholders in `.env.example`.
- Add a license. `AGPL-3.0-or-later` is appropriate if hosted modifications must also be shared; `MIT` is the simplest permissive choice. Choose one before accepting contributions.
- Add `SECURITY.md`, `CONTRIBUTING.md`, a Code of Conduct, and GitHub issue/PR templates.
- Add a support matrix: iOS version, Node version, Postgres version, and supported self-hosting platforms.
- Add CI for `npm run typecheck`, `npm test`, Docker build, and Swift/Xcode build.

## Product changes required for a public app

- Implement the first-launch server/provisioning screen in [the provisioning design](./04-first-launch-provisioning.md).
- Keep Sign in with Apple as the only end-user identity method. Each self-hosting administrator configures their own Apple Developer credentials.
- Add an administrator management UI for provisioning tokens and invitations.
- Add backup/restore instructions and a database migration policy.
- Add an in-app privacy notice explaining that household data lives on the chosen server.

## Release assets

- Architecture diagram and screenshots using fictional data.
- One-command Docker Compose quick start.
- Coolify deployment walkthrough.
- App Store/TestFlight setup guide for self-hosters.
- A clear statement that this is free software and that hosting, Apple Developer, DNS, and email-provider costs remain the operator's responsibility.
