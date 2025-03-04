# Deployment Instructions

## Required Packages

First, make sure to install the necessary Supabase SSR package:

```bash
npm install @supabase/ssr
```

## Pre-Deployment Database Setup

Before deploying to Vercel, run the following SQL in your Supabase SQL Editor:

```sql
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
```

## Deployment Steps

1. Run the above SQL in your Supabase SQL Editor
2. Make sure you have the required packages installed:
   ```bash
   npm install @supabase/ssr
   ```
3. Deploy your application to Vercel using the normal deployment process:
   ```bash
   vercel --prod
   ```
   
## Troubleshooting

If you encounter issues:

1. Check the Vercel logs for detailed error messages
2. Ensure the `get_shared_workspaces` function is correctly created in Supabase
3. Verify that your database has the correct tables (`workspaces` and `workspace_users`)
4. Make sure your Supabase connection string is correctly set in Vercel environment variables
5. Check console logs in browser for any client-side errors with loading shared workspaces
6. If the shared workspaces feature still doesn't work but the app builds successfully, you might need to manually query and add the `is_shared` property in your database 