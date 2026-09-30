# My Anime Tracker

GitHub Pages personal anime tracker with Supabase cloud sync, profile menu, private admin access, AniList enrichment, and MAL statistics.

## UI updates
- Sign in / Sign up moved into a compact account menu in the top-right.
- Signed-in users see their profile name and avatar in the corner.
- Profile supports first name, last name, and profile picture URL.
- Change password is available from the account menu.
- Cloud sync status is no longer permanently displayed on the page.
- Normal users see only Enrich Library; admin testing tools remain in the admin area.
- MAL rating and MAL scored-by vote count are shown on cards.
- Sort by MAL rating and MAL vote count.
- Stats cards are clickable filters.
- Outside clicks close the account menu.

## MAL statistics
Enrich Library uses AniList for metadata and Jikan for MyAnimeList score/scored-by statistics. Existing entries missing `malVotes` will request the MAL statistics during enrichment.

## Commit comment
**Polish account UI, add profile controls, and add MAL vote statistics**
