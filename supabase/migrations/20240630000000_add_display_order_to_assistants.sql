-- Add display_order column to assistants table
ALTER TABLE assistants ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Add an index on display_order for faster sorting
CREATE INDEX IF NOT EXISTS assistants_display_order_idx ON assistants(display_order);

-- Update existing assistants to have a default display order based on creation date
UPDATE assistants
SET display_order = sub.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM assistants
) as sub
WHERE assistants.id = sub.id AND assistants.display_order IS NULL; 