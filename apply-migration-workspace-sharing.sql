-- Create a new workspace_users table for workspace sharing
CREATE TABLE IF NOT EXISTS workspace_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer', -- 'viewer', 'editor', 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (workspace_id, user_id)
);

-- Create an RLS policy for workspace_users to allow row selection for the owning user
CREATE POLICY "Allow selecting shared workspaces" ON workspace_users
FOR SELECT
USING (auth.uid() = user_id);

-- Create an RLS policy for workspace_users to allow workspace owners to manage sharing
CREATE POLICY "Allow workspace owners to manage sharing" ON workspace_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = workspace_users.workspace_id
    AND workspaces.user_id = auth.uid()
  )
);

-- Enable RLS on workspace_users
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_workspace_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workspace_users_updated_at
BEFORE UPDATE ON workspace_users
FOR EACH ROW
EXECUTE PROCEDURE update_workspace_users_updated_at();

-- Update workspaces RLS policy to allow shared users to access the workspace
CREATE POLICY "Allow users with shared access to view workspaces" ON workspaces
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM workspace_users
    WHERE workspace_users.workspace_id = id
  )
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS workspace_users_workspace_id_idx ON workspace_users(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_users_user_id_idx ON workspace_users(user_id); 