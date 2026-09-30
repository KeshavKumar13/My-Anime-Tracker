# My Anime Tracker — Admin Integration

This update connects the GitHub Pages frontend to the deployed Supabase `admin` Edge Function.

## Included
- Admin option appears only when the signed-in account is authorized by the Edge Function.
- Admin dashboard verifies authorization server-side before loading user management.
- User management actions use the deployed Edge Function action names.
- Admin account is displayed as protected and cannot be deleted/restricted by the backend.
- No Supabase secret/service key is included in the frontend.

## Deployment
Upload/replace these files in the GitHub Pages repository root:
- `index.html`
- `admin.html`
- `README.md`

The Supabase Edge Function must be deployed as `admin` with the `ADMIN_EMAIL` secret configured.

## Commit message
`Connect GitHub UI to protected Supabase admin function`


## Admin authentication fix
The frontend explicitly reads the current Supabase session and sends its user access token as `Authorization: Bearer <token>` when invoking the protected `admin` Edge Function. No secret key is exposed in the browser.
