# My Anime Tracker • Admin + UI Update

This update keeps the existing GitHub Pages + Supabase tracker and adds:

- Private administrator dashboard
- Real admin authorization through a Supabase Edge Function
- User creation
- User listing/search
- Email confirmation
- Restrict/unrestrict user access
- User deletion
- Protected administrator account
- Anime library editing from the admin dashboard
- Visible MAL rating on anime cards and in the admin table
- Clickable dashboard status cards that filter the library
- Tools dropdown closes when clicking elsewhere
- Existing AniList search/enrichment, import/export and cloud sync retained

## Files

- `index.html` — main tracker
- `admin.html` — administrator dashboard
- `supabase/functions/admin/index.ts` — protected server-side admin function

## Important security setup

The browser app contains only the Supabase publishable key. Do **not** put a Supabase secret/service-role key into `index.html` or `admin.html`.

The admin dashboard calls the `admin` Edge Function. The Edge Function checks the signed-in user's email against the `ADMIN_EMAIL` secret and performs privileged Auth actions server-side.

### Deploy the Edge Function

In Supabase:

1. Open **Edge Functions**.
2. Create a function named `admin`.
3. Replace its code with `supabase/functions/admin/index.ts` from this package.
4. Deploy the function.
5. Add an Edge Function secret:

   `ADMIN_EMAIL=your-admin-email@example.com`

Use the exact email address of the account that should own administrator access.

After deployment, sign in to the main tracker with that account. The **Admin** button will appear. Other accounts will not receive the Admin button, and direct access to `admin.html` is denied by the server-side function.

## GitHub Pages files

Upload these two files to the repository root:

- `index.html`
- `admin.html`

The Edge Function is deployed in Supabase, not GitHub Pages.

## Commit message

`Improve UI, secure admin access, and add user management`
