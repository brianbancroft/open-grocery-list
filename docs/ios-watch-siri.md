# iOS, Watch, and Siri Plan

## iOS App

Build the iOS app in SwiftUI.

Primary screens:

- Sign in.
- List overview.
- List detail.
- Add/edit item.
- Settings.

## iOS Data Flow

MVP:

1. User signs in with Google.
2. App stores app session token in Keychain.
3. App fetches lists from the API.
4. App fetches items when a list opens.
5. Mutations call the API and update local UI optimistically.

Recommended local storage:

- Start with in-memory state plus URLSession.
- Add SwiftData or SQLite once offline behavior is needed.

## Shopping UX Priorities

- Large tap targets for checkoff.
- Quick add field at the top or bottom of list detail.
- Completed items visually distinct and optionally collapsed.
- Preserve scroll position while checking items.
- Fast recovery from failed requests.

## Apple Watch App

Use WatchKit/SwiftUI companion app.

MVP features:

- Show active lists.
- Open a list.
- Mark items complete/incomplete.
- Refresh list items.

Optional later:

- Dictate a new item.
- Complication showing remaining item count.
- Smart Stack widget.

## Watch Data Strategy

Preferred MVP:

- Watch app communicates with iPhone app through WatchConnectivity.
- iPhone app performs authenticated API calls.

Alternative:

- Watch app stores its own token and calls API directly.

Recommendation:

Start with WatchConnectivity because it avoids an independent watch login flow. Revisit direct API calls if independent watch use becomes important.

## Siri and App Intents

Use App Intents for Siri integration.

Initial intents:

- `AddGroceryItemIntent`
- `ShowGroceryListIntent`, if useful.

`AddGroceryItemIntent` inputs:

- Item name.
- Optional list name.
- Optional quantity.

Behavior:

- If list name is supplied, match an existing list by normalized name.
- If list name is missing, use the user's configured default list.
- If no default list exists, use the most recently used list or fail with a clear prompt.

## Shared iOS Code

Create shared modules for:

- API client.
- Auth/session storage.
- List/item models.
- Sync/cache logic.
- App Intents actions.

This keeps iOS, Watch, widgets, and Siri from drifting into separate implementations.

## iOS Milestones

1. Build iOS app with sign-in and list browsing.
2. Add item create/check/delete.
3. Add token persistence and session recovery.
4. Add basic Watch app using phone-mediated data.
5. Add App Intent to add an item.
6. Add local cache/offline retry.

