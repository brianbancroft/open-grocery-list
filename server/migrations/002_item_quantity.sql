ALTER TABLE list_items
  ADD COLUMN IF NOT EXISTS quantity text
  CHECK (quantity IS NULL OR char_length(quantity) BETWEEN 1 AND 80);
