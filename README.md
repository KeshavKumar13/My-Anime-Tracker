# My Anime Tracker Cloud Sync

GitHub Pages version of My Anime Tracker with Supabase authentication and cloud library sync.

## Features
- Personal anime library stored locally as a fallback/cache
- Supabase email/password sign up and sign in
- Cloud library stored per user with Row Level Security
- Import/export JSON
- Status, watched episodes, personal rating and notes
- Search, filtering and sorting
- AniList anime search when adding anime
- AniList metadata enrichment using MAL IDs
- AniList title search for entries without a MAL ID
- Live enrichment progress with per-anime saving
- Same library available across devices after signing in
- No Python server or localhost proxy required

## GitHub Pages
Upload `index.html` to the repository root and enable GitHub Pages from the `main` branch and `/ (root)`.

## Supabase setup
The app is configured with the project's browser-safe publishable key. Database access is protected by Row Level Security.

The required table is:
- `public.anime_libraries`
- one row per authenticated user
- `library` stores the user's anime library as JSON

Before using email confirmation, set the Supabase Authentication URL Configuration to the GitHub Pages URL:
`https://keshavkumar13.github.io/My-Anime-Tracker/`

If Supabase email confirmation is enabled, confirm the account from the email before signing in.

## First login
1. Open the GitHub Pages site.
2. Enter an email and password.
3. Click **Sign Up**.
4. Confirm the email if Supabase requests it.
5. Sign in.
6. When asked, upload the current device library to the cloud.

The existing local library is kept as a browser backup. Signing in on another device will load the cloud library there.

## Important
The Supabase publishable key is intended for browser use. Never put the Supabase secret/service key in this file.

## Commit comment
**Add Supabase authentication and cloud library sync**
