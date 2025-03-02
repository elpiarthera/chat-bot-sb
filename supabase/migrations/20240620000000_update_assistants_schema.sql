-- Add is_visible, is_default fields to assistants table
ALTER TABLE assistants ADD COLUMN is_visible BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE assistants ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT FALSE;

-- Add trigger to ensure only one default assistant
CREATE OR REPLACE FUNCTION ensure_single_default_assistant()
RETURNS TRIGGER
LANGUAGE 'plpgsql'
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.is_default THEN
    -- Clear default status from all other assistants
    UPDATE assistants
    SET is_default = FALSE
    WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_default_assistant_status
BEFORE UPDATE ON assistants
FOR EACH ROW
WHEN (OLD.is_default IS DISTINCT FROM NEW.is_default AND NEW.is_default = TRUE)
EXECUTE PROCEDURE ensure_single_default_assistant();

CREATE TRIGGER insert_default_assistant_status
BEFORE INSERT ON assistants
FOR EACH ROW
WHEN (NEW.is_default = TRUE)
EXECUTE PROCEDURE ensure_single_default_assistant();

-- Create assistant_labels table
CREATE TABLE IF NOT EXISTS assistant_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL CHECK (char_length(name) <= 50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- Add updated_at trigger to assistant_labels
CREATE TRIGGER update_assistant_labels_updated_at
BEFORE UPDATE ON assistant_labels
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Create assistant_label_assignments table for many-to-many relationship
CREATE TABLE IF NOT EXISTS assistant_label_assignments (
    assistant_id UUID NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES assistant_labels(id) ON DELETE CASCADE,
    PRIMARY KEY(assistant_id, label_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policies for labels and assignments
ALTER TABLE assistant_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_label_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all users to view labels"
    ON assistant_labels
    FOR SELECT
    USING (TRUE);

CREATE POLICY "Allow admins to manage labels"
    ON assistant_labels
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    ));

CREATE POLICY "Allow view access to label assignments"
    ON assistant_label_assignments
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM assistants
        WHERE assistants.id = assistant_id
        AND (assistants.user_id = auth.uid() OR assistants.sharing <> 'private')
    ));

CREATE POLICY "Allow management of own assistant label assignments"
    ON assistant_label_assignments
    USING (EXISTS (
        SELECT 1 FROM assistants
        WHERE assistants.id = assistant_id
        AND assistants.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM assistants
        WHERE assistants.id = assistant_id
        AND assistants.user_id = auth.uid()
    ));

-- Create assistant_starter_messages table
CREATE TABLE IF NOT EXISTS assistant_starter_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assistant_id UUID NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
    name TEXT,
    message TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- Add updated_at trigger to assistant_starter_messages
CREATE TRIGGER update_assistant_starter_messages_updated_at
BEFORE UPDATE ON assistant_starter_messages
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Create indexes
CREATE INDEX assistant_starter_messages_assistant_id_idx ON assistant_starter_messages(assistant_id);
CREATE INDEX assistant_label_assignments_assistant_id_idx ON assistant_label_assignments(assistant_id);
CREATE INDEX assistant_label_assignments_label_id_idx ON assistant_label_assignments(label_id);

-- Add RLS for starter messages
ALTER TABLE assistant_starter_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow view access to starter messages"
    ON assistant_starter_messages
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM assistants
        WHERE assistants.id = assistant_id
        AND (assistants.user_id = auth.uid() OR assistants.sharing <> 'private')
    ));

CREATE POLICY "Allow management of own assistant starter messages"
    ON assistant_starter_messages
    USING (EXISTS (
        SELECT 1 FROM assistants
        WHERE assistants.id = assistant_id
        AND assistants.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM assistants
        WHERE assistants.id = assistant_id
        AND assistants.user_id = auth.uid()
    )); 