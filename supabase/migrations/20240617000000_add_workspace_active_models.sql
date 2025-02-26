--------------- WORKSPACE ACTIVE MODELS ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS workspace_active_models (
    -- REQUIRED RELATIONSHIPS
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    -- REQUIRED
    model_id TEXT NOT NULL CHECK (char_length(model_id) <= 1000),
    provider TEXT NOT NULL CHECK (char_length(provider) <= 100),
    
    PRIMARY KEY(workspace_id, model_id),
    
    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- INDEXES --

CREATE INDEX workspace_active_models_user_id_idx ON workspace_active_models(user_id);
CREATE INDEX workspace_active_models_workspace_id_idx ON workspace_active_models(workspace_id);
CREATE INDEX workspace_active_models_model_id_idx ON workspace_active_models(model_id);
CREATE INDEX workspace_active_models_provider_idx ON workspace_active_models(provider);

-- RLS --

ALTER TABLE workspace_active_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to own workspace_active_models" ON workspace_active_models;

CREATE POLICY "Allow full access to own workspace_active_models"
    ON workspace_active_models
    USING (
        user_id = auth.uid() OR 
        workspace_id IN (
            SELECT workspace_id FROM workspace_users 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        user_id = auth.uid() OR 
        workspace_id IN (
            SELECT workspace_id FROM workspace_users 
            WHERE user_id = auth.uid()
        )
    );

-- TRIGGERS --

CREATE TRIGGER update_workspace_active_models_updated_at
BEFORE UPDATE ON workspace_active_models
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- STORED PROCEDURES --

-- Create a function to get active models for a workspace
CREATE OR REPLACE FUNCTION get_active_models_for_workspace(workspace_id_param UUID)
RETURNS SETOF workspace_active_models
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM workspace_active_models
  WHERE workspace_id = workspace_id_param;
END;
$$;

-- Create a function to insert a workspace active model safely
CREATE OR REPLACE FUNCTION insert_workspace_active_model(
  user_id_param UUID,
  workspace_id_param UUID,
  model_id_param TEXT,
  provider_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO workspace_active_models (user_id, workspace_id, model_id, provider)
  VALUES (user_id_param, workspace_id_param, model_id_param, provider_param);
END;
$$; 