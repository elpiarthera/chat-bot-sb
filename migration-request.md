# Supabase Migration API Instructions

You can manually trigger migrations using the Supabase API. Here's how to do it:

## Option 1: Using the Management API (Recommended)

```bash
curl -X POST 'https://api.supabase.com/v1/projects/{project_id}/migrations' \
-H "Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
--data '{
  "name": "add_workspace_active_models",
  "sql": "CREATE TABLE IF NOT EXISTS workspace_active_models (user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, model_id TEXT NOT NULL CHECK (char_length(model_id) <= 1000), provider TEXT NOT NULL CHECK (char_length(provider) <= 100), PRIMARY KEY(workspace_id, model_id), created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ); CREATE INDEX workspace_active_models_user_id_idx ON workspace_active_models(user_id); CREATE INDEX workspace_active_models_workspace_id_idx ON workspace_active_models(workspace_id); CREATE INDEX workspace_active_models_model_id_idx ON workspace_active_models(model_id); CREATE INDEX workspace_active_models_provider_idx ON workspace_active_models(provider); ALTER TABLE workspace_active_models ENABLE ROW LEVEL SECURITY; CREATE POLICY \"Allow full access to own workspace_active_models\" ON workspace_active_models USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid()); CREATE TRIGGER update_workspace_active_models_updated_at BEFORE UPDATE ON workspace_active_models FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();"
}'
```

You'll need:
1. Your project ID (found in the Supabase dashboard URL)
2. Your Supabase access token (from your account settings)

## Option 2: Using the Dashboard SQL Editor

The simplest approach is to:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Create a new query
4. Paste in the SQL from the migration file
5. Run the query

This SQL will create the workspace_active_models table needed for your feature to work.

## SQL for the workspace_active_models table

```sql
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

CREATE POLICY "Allow full access to own workspace_active_models"
    ON workspace_active_models
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- TRIGGERS --

CREATE TRIGGER update_workspace_active_models_updated_at
BEFORE UPDATE ON workspace_active_models
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
``` 