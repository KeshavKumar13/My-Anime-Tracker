# My Anime Tracker UI + Admin Dashboard

GitHub Pages ready static version of My Anime Tracker with Supabase cloud sync and a dedicated `admin.html` dashboard.

## Files
- `index.html` — main tracker
- `admin.html` — authenticated admin/control dashboard for the signed-in user's cloud library

## Admin capabilities
- View cloud library and statistics
- Search/filter anime
- Add, edit and delete anime
- Save/reload the cloud library
- Backup and restore JSON
- Delete the entire cloud library
- Clear the local browser cache

## Security note
The admin dashboard uses the normal Supabase browser client and Row Level Security. It controls the authenticated user's own library. A true multi-user super-admin that can manage other users should be implemented with a protected Supabase Edge Function/service role key; never expose a service role key in GitHub Pages.

## Commit comment
**Add authenticated admin dashboard for library control**
