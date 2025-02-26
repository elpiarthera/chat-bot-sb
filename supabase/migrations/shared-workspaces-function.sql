-- Function to get shared workspaces for a user
CREATE OR REPLACE FUNCTION public.get_shared_workspaces(user_id_param UUID)
RETURNS SETOF public.workspaces AS $$
BEGIN
  RETURN QUERY
  SELECT w.*
  FROM public.workspaces w
  JOIN public.workspace_users wu ON w.id = wu.workspace_id
  WHERE wu.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 