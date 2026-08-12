# Product Requirements

## Goal

Build a personal grocery list system for family use. The product should make it fast to create lists, add grocery items, mark items complete while shopping, and let every signed-in family member see and edit the same household data.

## Target Users

- Family members who share household shopping responsibilities.
- Primary use cases happen on iPhone while planning or shopping.
- Secondary use cases happen on Apple Watch while in the store.
- Voice use cases happen through Siri when someone wants to add an item quickly.

## Core Requirements

### Authentication

- Users sign in with Google.
- Any authenticated user can access all lists.
- No per-list permissions for the MVP.
- Server should still keep track of who created or changed records for audit/history.

### Lists

- Create a grocery list.
- Rename a grocery list.
- Delete or archive a grocery list.
- View all active lists.
- Open a list and see all active items.
- Support multiple lists, for example `Weekly Groceries`, `Costco`, `Camping`, or `Holiday Dinner`.

### Items

- Add item to a list.
- Rename item.
- Mark item as completed.
- Unmark completed item.
- Delete item.
- Reorder items manually.
- Optionally group by category later.

### Sharing Model

- Household-wide visibility.
- Any authenticated user can create, edit, complete, or delete any list or item.
- The MVP does not need invitations, roles, or item ownership.

### Web UI

- Simple responsive UI.
- Sign in with Google.
- List overview.
- List detail view.
- Create/delete/rename lists.
- Add/check/delete items.

### iOS App

- Native iOS app.
- Google sign-in or web-based OAuth flow.
- Browse and manage lists.
- Add/check/delete items quickly.
- Work reliably during shopping trips, including handling spotty network.

### Apple Watch App

- Show active lists.
- Open a list.
- Check items off.
- Add simple item text if practical.
- Keep interactions minimal and glanceable.

### Siri Integration

- Add item to a grocery list using App Intents.
- Support phrases such as "Add milk to groceries" once configured by the user/system.
- Default to a configured primary list when no list is specified.

## Non-Goals For MVP

- Complex household membership management.
- Role-based access control.
- Store price tracking.
- Barcode scanning.
- Recipe import.
- Meal planning.
- Push notifications.
- Real-time collaborative cursors or presence.
- Offline-first conflict resolution beyond basic retry/sync.

## Success Criteria

- A family member can sign in and add an item from iPhone, web, or Siri.
- Another signed-in family member can see that item.
- A shopping user can check items off from iPhone or Apple Watch.
- The server can be deployed and updated through Coolify.
- Data is stored in a persistent Postgres database with backups.

