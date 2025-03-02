// A simple script to apply the workspace_active_models migration manually
const { createClient } = require('@supabase/supabase-js')
const path = require('path')
const fs = require('fs')

// Try to load from .env.local instead of .env
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  console.log('Loading environment from .env.local')
  require('dotenv').config({ path: envPath })
} else {
  console.log('No .env.local file found, trying default .env')
  require('dotenv').config()
}

// Use the correct environment variable names for your project
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key is missing in environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  }
})

const migrationSQL = `
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

CREATE INDEX IF NOT EXISTS workspace_active_models_user_id_idx ON workspace_active_models(user_id);
CREATE INDEX IF NOT EXISTS workspace_active_models_workspace_id_idx ON workspace_active_models(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_active_models_model_id_idx ON workspace_active_models(model_id);
CREATE INDEX IF NOT EXISTS workspace_active_models_provider_idx ON workspace_active_models(provider);

-- RLS --

ALTER TABLE workspace_active_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to own workspace_active_models" ON workspace_active_models;
CREATE POLICY "Allow full access to own workspace_active_models"
    ON workspace_active_models
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- TRIGGERS --

DROP TRIGGER IF EXISTS update_workspace_active_models_updated_at ON workspace_active_models;
CREATE TRIGGER update_workspace_active_models_updated_at
BEFORE UPDATE ON workspace_active_models
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
`;

async function applyMigration() {
  console.log('Applying workspace_active_models migration...')
  console.log(`Using Supabase URL: ${supabaseUrl}`)
  
  try {
    // Use the correct method to execute raw SQL with the Supabase client
    const { data, error } = await supabase.rpc('exec_sql', {
      query: migrationSQL
    })
    
    if (error) {
      console.error('Migration failed:', error)
      process.exit(1)
    }
    
    console.log('Migration successfully applied!')
  } catch (err) {
    console.error('Error applying migration:', err)
    process.exit(1)
  }
}

applyMigration()