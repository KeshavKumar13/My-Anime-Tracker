# My Anime Tracker — Admin Integration

This update connects the tracker and admin dashboard to the protected Supabase `admin` Edge Function.

## Supabase

Function name: `admin`

Edge Function authentication: `withSupabase({ auth: 'user' })`

Required Edge Function secret:

`ADMIN_EMAIL` = the exact email address of the administrator account.

Keep all Supabase secret/service keys server-side. Only the publishable key belongs in the browser.

## GitHub Pages

Replace `index.html` and `admin.html` in the repository. The `supabase/functions/admin/index.ts` file is the backend source and must be deployed to the Supabase Edge Function named `admin`.
