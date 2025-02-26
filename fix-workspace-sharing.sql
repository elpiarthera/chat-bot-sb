-- Drop existing constraints
ALTER TABLE workspace_users DROP CONSTRAINT IF EXISTS workspace_users_user_id_fkey;

-- Add new foreign key constraint to auth.users instead of profiles
ALTER TABLE workspace_users 
  ADD CONSTRAINT workspace_users_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to work with auth.users
DROP POLICY IF EXISTS "Allow selecting shared workspaces" ON workspace_users;
CREATE POLICY "Allow selecting shared workspaces" ON workspace_users
FOR SELECT
USING (
  -- User is directly referenced in auth.users
  auth.uid() = user_id
);

-- Update the RLS policy for workspace access
DROP POLICY IF EXISTS "Allow users with shared access to view workspaces" ON workspaces;
CREATE POLICY "Allow users with shared access to view workspaces" ON workspaces
FOR SELECT
USING (
  -- User ID matches directly
  auth.uid() IN (
    SELECT user_id FROM workspace_users
    WHERE workspace_users.workspace_id = id
  )
);

-- Information for applying this migration
-- Run this migration using:
-- psql -h [host] -p [port] -d [database] -U [user] -f fix-workspace-sharing.sql
-- or by running it in the Supabase dashboard SQL editor 