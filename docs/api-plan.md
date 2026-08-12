# API Plan

## API Style

Use a JSON REST API for the MVP. It is simple for web, iOS, Watch, and Siri/App Intents clients to consume.

Base path:

```text
/api
```

All authenticated endpoints require an app session.

## Auth Endpoints

### POST /api/auth/google

Exchange a Google identity token or authorization code for an app session.

Request:

```json
{
  "idToken": "google-id-token",
  "clientType": "ios"
}
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "email": "person@example.com",
    "displayName": "Person"
  },
  "sessionToken": "opaque-token"
}
```

For web, the server can set an HTTP-only session cookie instead of returning `sessionToken`.

### POST /api/auth/logout

Revoke the current session.

### GET /api/me

Return the current signed-in user.

## List Endpoints

### GET /api/lists

Return active lists.

Response:

```json
{
  "lists": [
    {
      "id": "uuid",
      "name": "Weekly Groceries",
      "sortOrder": 1000,
      "itemCount": 12,
      "completedItemCount": 3,
      "updatedAt": "2026-07-24T12:00:00Z"
    }
  ]
}
```

### POST /api/lists

Create a list.

Request:

```json
{
  "name": "Costco"
}
```

### PATCH /api/lists/:listId

Rename or reorder a list.

Request:

```json
{
  "name": "Weekly Groceries",
  "sortOrder": 2000
}
```

### DELETE /api/lists/:listId

Archive a list.

## Item Endpoints

### GET /api/lists/:listId/items

Return non-deleted items for a list.

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "listId": "uuid",
      "name": "Milk",
      "quantity": "2L",
      "notes": null,
      "category": null,
      "sortOrder": 1000,
      "completedAt": null,
      "completedByUserId": null,
      "updatedAt": "2026-07-24T12:00:00Z"
    }
  ]
}
```

### POST /api/lists/:listId/items

Create an item.

Request:

```json
{
  "name": "Milk",
  "quantity": "2L"
}
```

### PATCH /api/items/:itemId

Update item fields.

Request:

```json
{
  "name": "Whole milk",
  "quantity": "2L",
  "notes": "Organic if available",
  "category": "Dairy",
  "sortOrder": 1500
}
```

### POST /api/items/:itemId/complete

Mark an item complete.

### POST /api/items/:itemId/uncomplete

Mark an item incomplete.

### DELETE /api/items/:itemId

Soft delete an item.

## Sync Endpoint

Add after MVP basics are stable.

### GET /api/sync?since=:timestamp

Return changed lists and items since a timestamp.

Response:

```json
{
  "serverTime": "2026-07-24T12:00:00Z",
  "lists": [],
  "items": [],
  "deletedItemIds": []
}
```

## API Rules

- Trim item and list names.
- Reject blank names.
- Limit names to reasonable lengths.
- Use UUIDs externally.
- Return `404` for missing or archived/deleted entities.
- Return `401` for missing or invalid session.
- Return `400` for validation errors.
- Return `500` only for unexpected server errors.

