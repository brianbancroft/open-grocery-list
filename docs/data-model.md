# Data Model

## Initial Schema

### users

Stores authenticated Google users.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| google_sub | text | Stable Google subject identifier, unique |
| email | text | User email |
| display_name | text | Display name from Google |
| avatar_url | text | Optional profile image |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update time |
| last_login_at | timestamptz | Last successful login |

### sessions

Stores application sessions.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| user_id | uuid | References `users.id` |
| token_hash | text | Hash of opaque session token |
| client_type | text | `web`, `ios`, `watch`, or `unknown` |
| expires_at | timestamptz | Expiry |
| revoked_at | timestamptz | Nullable |
| created_at | timestamptz | Creation time |

### lists

Stores grocery lists.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| name | text | Display name |
| sort_order | integer | Manual order |
| archived_at | timestamptz | Soft delete/archive |
| created_by_user_id | uuid | References `users.id` |
| updated_by_user_id | uuid | References `users.id` |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update time |

### list_items

Stores grocery items.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| list_id | uuid | References `lists.id` |
| name | text | Item text |
| quantity | text | Optional, for values like `2`, `1 bag`, `500g` |
| notes | text | Optional |
| category | text | Optional future grouping |
| sort_order | integer | Manual order |
| completed_at | timestamptz | Nullable |
| completed_by_user_id | uuid | Nullable, references `users.id` |
| deleted_at | timestamptz | Soft delete |
| created_by_user_id | uuid | References `users.id` |
| updated_by_user_id | uuid | References `users.id` |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update time |

### audit_events

Optional but useful even early.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| actor_user_id | uuid | References `users.id` |
| entity_type | text | `list` or `item` |
| entity_id | uuid | Entity changed |
| action | text | `created`, `updated`, `completed`, `uncompleted`, `deleted`, `archived` |
| metadata | jsonb | Small event payload |
| created_at | timestamptz | Event time |

## Indexes

Recommended indexes:

- `users.google_sub` unique.
- `sessions.token_hash` unique.
- `sessions.user_id`.
- `lists.archived_at`.
- `lists.updated_at`.
- `list_items.list_id`.
- `list_items.list_id, deleted_at, completed_at`.
- `list_items.updated_at`.
- `audit_events.entity_type, entity_id`.
- `audit_events.created_at`.

## Soft Delete Strategy

Use soft deletes for lists and items:

- Lists use `archived_at`.
- Items use `deleted_at`.

This protects against accidental deletion and helps future sync clients avoid dangling references.

## Future Schema Extensions

Potential future tables:

- `households`
- `household_members`
- `item_suggestions`
- `stores`
- `store_sections`
- `recipes`
- `recipe_items`
- `device_push_tokens`

Design the MVP so `household_id` can be added to `lists` later without rewriting the whole product.

