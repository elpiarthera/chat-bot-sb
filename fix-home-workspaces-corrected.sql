-- Fix multiple home workspaces issue

-- 1. First, let's identify if any users have multiple home workspaces
SELECT user_id, COUNT(*) as home_count
FROM workspaces
WHERE is_home = true
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 2. For users with multiple home workspaces, keep only the most recently updated one
WITH HomeWorkspaces AS (
  SELECT 
    id,
    user_id,
    created_at,
    updated_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY COALESCE(updated_at, created_at) DESC) as rn
  FROM workspaces
  WHERE is_home = true
)
UPDATE workspaces
SET is_home = false
WHERE id IN (
  SELECT id FROM HomeWorkspaces WHERE rn > 1
);

-- 3. Ensure that the unique index on home workspaces is in place
DROP INDEX IF EXISTS idx_unique_home_workspace_per_user;
CREATE UNIQUE INDEX idx_unique_home_workspace_per_user 
ON workspaces(user_id) 
WHERE is_home;

-- 4. For any auth users without a home workspace, create one (using the correct foreign key relationship)
INSERT INTO workspaces (
  user_id, 
  default_context_length, 
  default_model, 
  default_prompt, 
  default_temperature, 
  description, 
  embeddings_provider, 
  include_profile_context, 
  include_workspace_instructions, 
  instructions, 
  is_home, 
  name,
  sharing
)
SELECT 
  u.id as user_id,
  4000 as default_context_length,
  'gpt-3.5-turbo' as default_model,
  'You are a helpful AI assistant.' as default_prompt,
  0.7 as default_temperature,
  'My home workspace' as description,
  'openai' as embeddings_provider,
  true as include_profile_context,
  true as include_workspace_instructions,
  'Default instructions for the assistant.' as instructions,
  true as is_home,
  'Home' as name,
  'private' as sharing
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM workspaces w 
  WHERE w.user_id = u.id 
  AND w.is_home = true
); 