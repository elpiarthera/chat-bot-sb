-- Direct SQL migration script for workspace_active_models

CREATE TABLE IF NOT EXISTS workspace_active_models (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    model_id TEXT NOT NULL CHECK (char_length(model_id) <= 1000),
    provider TEXT NOT NULL CHECK (char_length(provider) <= 100),
    PRIMARY KEY(workspace_id, model_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS workspace_active_models_user_id_idx ON workspace_active_models(user_id);
CREATE INDEX IF NOT EXISTS workspace_active_models_workspace_id_idx ON workspace_active_models(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_active_models_model_id_idx ON workspace_active_models(model_id);
CREATE INDEX IF NOT EXISTS workspace_active_models_provider_idx ON workspace_active_models(provider);

ALTER TABLE workspace_active_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to own workspace_active_models" ON workspace_active_models;
CREATE POLICY "Allow full access to own workspace_active_models"
    ON workspace_active_models
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS update_workspace_active_models_updated_at ON workspace_active_models;
CREATE TRIGGER update_workspace_active_models_updated_at
BEFORE UPDATE ON workspace_active_models
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column(); 