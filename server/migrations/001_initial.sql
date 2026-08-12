CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apple_sub text NOT NULL UNIQUE,
  email text,
  display_name text NOT NULL DEFAULT 'Family member',
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code_hash text NOT NULL UNIQUE,
  invited_by_user_id uuid NOT NULL REFERENCES users(id),
  accepted_by_user_id uuid REFERENCES users(id),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX invitations_active_email ON invitations (lower(email)) WHERE accepted_at IS NULL;

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  sort_order integer NOT NULL DEFAULT 0,
  deleted_at timestamptz,
  created_by_user_id uuid NOT NULL REFERENCES users(id),
  updated_by_user_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES lists(id),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 140),
  quantity text CHECK (quantity IS NULL OR char_length(quantity) BETWEEN 1 AND 80),
  color_label text NOT NULL CHECK (color_label IN ('red','orange','yellow','green','mint','blue','purple','pink')),
  sort_order integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  completed_by_user_id uuid REFERENCES users(id),
  deleted_at timestamptz,
  created_by_user_id uuid NOT NULL REFERENCES users(id),
  updated_by_user_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX list_items_visible ON list_items(list_id, completed_at, sort_order) WHERE deleted_at IS NULL;
