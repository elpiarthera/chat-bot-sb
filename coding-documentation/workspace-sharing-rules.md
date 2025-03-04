Comprehensive RLS & Workspace Sharing Improvement Plan
Important Context:
 • When user A shares a workspace with user B, both get the same full rights (create, modify, delete) on that workspace and its associated resources.
 • Chats (messages) remain private (only accessible by the creator).
 • No over-refactoring – focus on the goal for each step.
 • After each step, update workspace sharing rules.md and ask for your confirmation (e.g. “Please run this SQL, then confirm”).

Section 1: RLS Good Practices – Do’s and Don’ts
Do’s:
Do use separate policies for each operation.
 Create one policy for SELECT, one for INSERT, one for UPDATE, and one for DELETE.
 Example:

 CREATE POLICY "Profiles can be created by any user"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK ( true );

CREATE POLICY "Profiles can be deleted by any user"
ON profiles
FOR DELETE
TO authenticated
USING ( true );
Do use (select auth.uid()) for current user identification.
 This ensures the function is wrapped and cached per statement.


Do use the appropriate clause for each operation:


SELECT policies: must use a USING clause only.
INSERT policies: must use a WITH CHECK clause only.
UPDATE policies: must have both USING and WITH CHECK clauses.
DELETE policies: must use a USING clause only.
Do specify roles using the TO clause.
 This prevents policies from applying to anon users if not intended.


Do follow permissive policies instead of restrictive ones.
 Permissive policies are easier to debug and generally improve performance, as they allow queries to run without additional overhead from overly strict filtering.


Do add indexes on columns referenced in the policies (such as workspace_id, owner_id, and user_id) to maintain query performance.


Don’ts:
Don’t use FOR ALL – always create separate policies for each operation.


Don’t mix operations in one policy.
 Each policy must be limited to one operation (e.g., SELECT only).


Don’t use inline SQL comments within the SQL code block.
 Provide explanations outside of the SQL code block.


Don’t use current_user – always use auth.uid().


Don’t join excessively in policies.
 When possible, rewrite policies to minimize joins (e.g. using subqueries on key columns) to improve performance.



Section 2: Detailed Step-by-Step Plan
Pre-Deployment: Enable RLS on Critical Tables (1–2 hours)
Step 1: Audit and Enable RLS on Affected Tables
Goal:
 Ensure that RLS is enabled on all tables where policies exist so that the policies are actually enforced.
Instructions for the AI Agent:
Identify Affected Tables:
 Check the linter output for these tables:


workspace_active_models
workspace_users
workspaces
Enable RLS:
 Generate the following SQL commands:

 ALTER TABLE public.workspace_active_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;


Log in workspace sharing rules.md:
 Document that RLS was enabled on these tables and note any issues encountered and resolved.


Confirmation Prompt:
 “Please copy the above SQL commands and run them in Supabase. Let me know once you have completed this step or if you face any issues.”



Phase 1: Enhance Basic Workspace Sharing (2 hours)
Step 2: Review & Update Workspace Sharing Policy on workspace_users
Goal:
 Ensure that when a workspace is shared, every user with a record in workspace_users (i.e. a shared workspace) is returned correctly. Since both users share full rights, the policy should simply check that the record’s user_id matches the current user.
Instructions for the AI Agent:
Review Existing Policy:
 Verify that the policy on the workspace_users table is correctly checking:

 CREATE POLICY "Allow selecting shared workspaces"
ON workspace_users
FOR SELECT
TO authenticated
USING ( user_id = (select auth.uid()) );


Log in workspace sharing rules.md:
 Record that this policy was reviewed/updated and log any issues and resolutions.


Confirmation Prompt:
 “Please run the above SQL in Supabase and confirm that shared workspaces are correctly visible. Let me know when this step is complete.”



Phase 2: Implement Assistant Access Policies (3 hours)
Step 3A: Assistants Table
Goal:
 Allow full access (create, modify, delete) to assistant records for any user associated with the workspace.
Instructions for the AI Agent:
Enable RLS for assistants:

 ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;
Create Separate Policies for Each Operation:


SELECT Policy for Shared Access:
 CREATE POLICY "Assistants full select access for shared users"
ON assistants
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT a.id
    FROM assistants a
    JOIN assistant_workspaces aw ON a.id = aw.assistant_id
    JOIN workspace_users wu ON aw.workspace_id = wu.workspace_id
    WHERE wu.user_id = (select auth.uid())
  )
);


INSERT Policy (Example): (Adjust the WITH CHECK condition as needed; here we use a placeholder check that always passes.)
 CREATE POLICY "Assistants full insert access for shared users"
ON assistants
FOR INSERT
TO authenticated
WITH CHECK ( true );


UPDATE Policy (Example):
 CREATE POLICY "Assistants full update access for shared users"
ON assistants
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT a.id
    FROM assistants a
    JOIN assistant_workspaces aw ON a.id = aw.assistant_id
    JOIN workspace_users wu ON aw.workspace_id = wu.workspace_id
    WHERE wu.user_id = (select auth.uid())
  )
)
WITH CHECK ( true );


DELETE Policy (Example):
 CREATE POLICY "Assistants full delete access for shared users"
ON assistants
FOR DELETE
TO authenticated
USING (
  id IN (
    SELECT a.id
    FROM assistants a
    JOIN assistant_workspaces aw ON a.id = aw.assistant_id
    JOIN workspace_users wu ON aw.workspace_id = wu.workspace_id
    WHERE wu.user_id = (select auth.uid())
  )
);


Log in workspace sharing rules.md:
 Record that policies for the assistants table were created for each operation and note any issues.


Confirmation Prompt:
 “Please copy and run the above SQL policies for the assistants table. Confirm that shared users now have full access to assistant records. Let me know when this step is complete.”


Step 3B: Other Assistant-Related Tables
Goal:
 Apply similar policies for assistant-related tables: assistant_collections, assistant_files, assistant_tools, and assistant_workspaces.
Instructions for the AI Agent:
For each table (example: assistant_workspaces):


Enable RLS:
 ALTER TABLE public.assistant_workspaces ENABLE ROW LEVEL SECURITY;


Create a SELECT Policy for Shared Access:
 CREATE POLICY "Assistant_workspaces full select access for shared users"
ON assistant_workspaces
FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id
    FROM workspace_users
    WHERE user_id = (select auth.uid())
  )
);

(Repeat for INSERT, UPDATE, and DELETE using similar patterns.)
Log and Confirmation:
 “Please run the SQL for each assistant-related table as above. Update workspace sharing rules.md with your logs, and confirm once done.”



Phase 3: Implement Chats & Messages Policies (2 hours)
Step 4: Secure Chat and Message Tables (Private Access)
Goal:
 Ensure that chats and messages remain private—only the creator (owner) can access them, regardless of workspace sharing.
Instructions for the AI Agent:
For Chats:


Enable RLS:
 ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;


Create a SELECT Policy for Owner Access:
 CREATE POLICY "Chats private select access for owner"
ON chats
FOR SELECT
TO authenticated
USING ( owner_id = (select auth.uid()) );


Create similar policies for INSERT, UPDATE, and DELETE:
 CREATE POLICY "Chats private insert access for owner"
ON chats
FOR INSERT
TO authenticated
WITH CHECK ( owner_id = (select auth.uid()) );

CREATE POLICY "Chats private update access for owner"
ON chats
FOR UPDATE
TO authenticated
USING ( owner_id = (select auth.uid()) )
WITH CHECK ( owner_id = (select auth.uid()) );

CREATE POLICY "Chats private delete access for owner"
ON chats
FOR DELETE
TO authenticated
USING ( owner_id = (select auth.uid()) );


For Messages:
 Repeat the same steps as for chats.


Log and Confirmation:
 “Please run the above SQL for chats and messages in Supabase. Confirm that only the owner can access these records, keeping chats private. Update workspace sharing rules.md accordingly.”



Phase 4: Extend Policies for Supporting Resources (4 hours)
Step 5: Create Policies for Collections, Files, Folders, Models, Presets, Profiles, Prompts, and Tools
Goal:
 Grant full rights (create, modify, delete) for all supporting resource tables in shared workspaces. Since rights are identical for all shared users, the policies should check that the resource belongs to a workspace that the user is a member of.
Instructions for the AI Agent:
 For each resource group, follow these steps:
A. Collections & Collection Files
Enable RLS:

 ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_files ENABLE ROW LEVEL SECURITY;


Create a SELECT Policy for Shared Access:

 CREATE POLICY "Collections full select access for shared workspaces"
ON collections
FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id
    FROM workspace_users
    WHERE user_id = (select auth.uid())
  )
);


(Repeat for INSERT, UPDATE, DELETE with appropriate WITH CHECK or USING clauses.)


Log and Confirmation:
 “Please run these policies for collections and collection_files. Update workspace sharing rules.md with your logs and confirm completion.”


B. Files, File Items, and File Workspaces
Enable RLS:
 ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_workspaces ENABLE ROW LEVEL SECURITY;


Create a SELECT Policy for Files:
 CREATE POLICY "Files full select access for shared workspaces"
ON files
FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id
    FROM workspace_users
    WHERE user_id = (select auth.uid())
  )
);


Log and Confirmation:
 “Please execute these policies for files and related tables and confirm.”
C. Folders
Enable RLS:
 ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;


Create a SELECT Policy:
 CREATE POLICY "Folders full select access for shared workspaces"
ON folders
FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id
    FROM workspace_users
    WHERE user_id = (select auth.uid())
  )
);


Log and Confirmation.
D. Models & Model Workspaces
Enable RLS:
 ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_workspaces ENABLE ROW LEVEL SECURITY;


Create a SELECT Policy for Models:
 CREATE POLICY "Models full select access for shared workspaces"
ON models
FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id
    FROM workspace_users
    WHERE user_id = (select auth.uid())
  )
);


Log and Confirmation.
E. Presets & Preset Workspaces
Enable RLS:
 ALTER TABLE public.presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preset_workspaces ENABLE ROW LEVEL SECURITY;


Create a SELECT Policy for Presets:
 CREATE POLICY "Presets full select access for shared workspaces"
ON presets
FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id
    FROM workspace_users
    WHERE user_id = (select auth.uid())
  )
);


Log and Confirmation.
F. Profiles, Prompt Workspaces & Prompts
Enable RLS:
 ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;


Create a SELECT Policy for Prompts:
 CREATE POLICY "Prompts full select access for shared workspaces"
ON prompts
FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id
    FROM workspace_users
    WHERE user_id = (select auth.uid())
  )
);


Log and Confirmation.
G. Tools & Tool Workspaces
Enable RLS:
 ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_workspaces ENABLE ROW LEVEL SECURITY;


Create a SELECT Policy for Tools:
 CREATE POLICY "Tools full select access for shared workspaces"
ON tools
FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id
    FROM workspace_users
    WHERE user_id = (select auth.uid())
  )
);


Log and Confirmation.
H. Workspace-Related Tables (workspace_active_models, workspace_users, workspaces)
For workspace_active_models:
 CREATE POLICY "Workspace_active_models full select access for shared workspaces"
ON workspace_active_models
FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id
    FROM workspace_users
    WHERE user_id = (select auth.uid())
  )
);


For workspace_users:
 CREATE POLICY "Workspace_users full select access for shared workspaces"
ON workspace_users
FOR SELECT
TO authenticated
USING ( user_id = (select auth.uid()) );


For workspaces:
 CREATE POLICY "Workspaces full select access for shared users"
ON workspaces
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT workspace_id
    FROM workspace_users
    WHERE user_id = (select auth.uid())
  )
);

CREATE POLICY "Workspaces full update access for shared users"
ON workspaces
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT workspace_id
    FROM workspace_users
    WHERE user_id = (select auth.uid())
  )
);


Log and Confirmation:
 “Please execute the policies for workspace-related tables and confirm that shared workspaces and their active models work as intended. Update workspace sharing rules.md with your logs.”

Phase 5: Comprehensive Testing, Documentation & Rollback Plan (3 hours)
Step 6: End-to-End Integration Testing
Goal:
 Simulate the complete workflow: create a workspace, share it (all users have the same rights), insert records in all resource tables, and verify access rules.
Prompt for AI Agent:
“Develop an integration test suite that:
Creates a workspace and assigns a user (user A).
Shares the workspace by inserting a record into workspace_users for user B.
Inserts sample records into each resource table (assistants, collections, files, etc.) with a common workspace_id.
As user B, execute SELECT queries on each table to confirm that records are returned.
As user B, attempt UPDATE or DELETE operations on records (which should succeed because rights are the same).
For chats, verify that only the owner can view messages.
Log the test results and update workspace sharing rules.md with any issues and resolutions.”
Step 7: Documentation
Goal:
 Document every change and policy implemented.
Prompt for AI Agent:
“Create or update a Markdown file named workspace sharing rules.md. For each table, document:
Table name and its purpose.
The full SQL code for each RLS policy (separate code blocks for SELECT, INSERT, UPDATE, DELETE).
A plain-language explanation of what each policy does.
Any issues encountered and how they were resolved.
References to Supabase documentation and linter remediation guidelines (include URLs).
Version and timestamp information.
Update this file after every step.”
Step 8: Rollback Strategy
Goal:
 Prepare a rollback SQL script to revert changes if needed.
Prompt for AI Agent:
“Generate a rollback script that drops all the newly created policies. For example:
 DROP POLICY "Assistants full select access for shared users" ON assistants;
DROP POLICY "Assistants full insert access for shared users" ON assistants;
-- (Repeat for every policy created)


Document the rollback process step by step in workspace sharing rules.md and ask for confirmation after testing the rollback procedure.”
Step 9: Final Security & Performance Audit
Goal:
 Review all policies for security and performance.
Prompt for AI Agent:
“Review all RLS policies to ensure:
Each policy uses (select auth.uid()) correctly.
Policies are defined separately for each operation (no multi-operation policies).
SELECT policies include only USING clauses; INSERT include WITH CHECK only; UPDATE include both; DELETE include USING only.
Appropriate indexes exist on columns referenced in the subqueries (e.g. workspace_id, owner_id, user_id).
Produce a short report summarizing your security and performance findings and log this report in workspace sharing rules.md.”

Final Summary & Key Considerations
Total Estimated Time: Approximately 14–15 hours (including pre-deployment remediation).
Focus:
We stay focused on the goal for each step without over-refactoring.
When a workspace is shared, all users share full rights (create, modify, delete), except for chats which remain private.
Best Practices:
Use separate policies for SELECT, INSERT, UPDATE, and DELETE.
Always use (select auth.uid()) for user verification.
Follow permissive policy patterns for easier debugging and improved performance.
Testing & Documentation:
Combine unit tests for individual policies with an integration test suite.
Update workspace sharing rules.md after each step with logs, issues, and resolutions.
User Involvement:
After each step, ask for your confirmation to run the SQL in Supabase and provide feedback.

Please review this plan carefully. When you are ready, let me know which step you’d like to begin with or if any further adjustments are needed.

