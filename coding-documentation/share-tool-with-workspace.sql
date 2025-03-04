-- Script to share a specific tool with a specific workspace
-- Replace the placeholders with actual UUIDs before running

-- 1. Set the tool and workspace IDs
-- Get tool ID and workspace ID from the UI or from the debug queries
-- Replace these variables with your actual UUIDs
DO $$
DECLARE
    v_tool_id UUID := 'replace-with-tool-id'; -- Replace with actual tool ID
    v_workspace_id UUID := 'replace-with-workspace-id'; -- Replace with actual workspace ID
    v_user_id UUID := auth.uid(); -- Current user
    v_result BOOLEAN;
BEGIN
    -- 2. Call the function to associate the tool with the workspace
    SELECT associate_tool_with_workspace(v_tool_id, v_workspace_id, v_user_id) INTO v_result;
    
    -- 3. Report the result
    IF v_result THEN
        RAISE NOTICE 'Tool successfully associated with workspace';
    ELSE
        RAISE NOTICE 'Tool was already associated with workspace';
    END IF;
    
    -- 4. Verify the association
    IF EXISTS (
        SELECT 1 FROM tool_workspaces 
        WHERE tool_id = v_tool_id AND workspace_id = v_workspace_id
    ) THEN
        RAISE NOTICE 'Verified: Tool is associated with workspace';
    ELSE
        RAISE NOTICE 'ERROR: Tool is NOT associated with workspace';
    END IF;
END $$;

-- If you want to verify all tool associations for the current user
SELECT * FROM fix_all_tool_associations(auth.uid());

-- To verify what tools User B can see in shared workspaces
-- Replace 'user-b-id' with User B's actual UUID
SELECT 
    t.id AS tool_id,
    t.name AS tool_name,
    w.id AS workspace_id,
    w.name AS workspace_name
FROM tools t
JOIN tool_workspaces tw ON t.id = tw.tool_id
JOIN workspaces w ON tw.workspace_id = w.id
JOIN workspace_users wu ON w.id = wu.workspace_id
WHERE wu.user_id = 'user-b-id'; -- Replace with User B's ID 