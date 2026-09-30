import { withSupabase } from 'npm:@supabase/server@^1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizeEmail(email: unknown) {
  return String(email || '').trim().toLowerCase();
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
      const adminEmail = normalizeEmail(Deno.env.get('ADMIN_EMAIL'));
      if (!adminEmail) return json({ error: 'ADMIN_EMAIL is not configured.' }, 500);

      const claims = ctx.userClaims;
      const userId = String(claims?.sub || '');
      let callerEmail = normalizeEmail(claims?.email);

      // Some JWT configurations do not expose email in the claims. Resolve it server-side.
      if (!callerEmail && userId) {
        const { data, error } = await ctx.supabaseAdmin.auth.admin.getUserById(userId);
        if (!error) callerEmail = normalizeEmail(data.user?.email);
      }

      if (!userId || !callerEmail) return json({ error: 'Not authenticated.' }, 401);
      if (callerEmail !== adminEmail) return json({ allowed: false, isAdmin: false, error: 'Admin access denied.' }, 403);

      let body: Record<string, unknown> = {};
      try { body = await req.json(); } catch (_) {}
      const action = String(body.action || 'me');

      if (action === 'me') {
        return json({ allowed: true, isAdmin: true, email: callerEmail });
      }

      const admin = ctx.supabaseAdmin;

      if (action === 'listUsers' || action === 'list_users') {
        const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (error) return json({ error: error.message }, 400);
        return json({
          users: (data.users || []).map((u) => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            email_confirmed_at: u.email_confirmed_at,
            banned_until: u.banned_until,
            is_admin: normalizeEmail(u.email) === adminEmail,
          })),
          total: data.users?.length || 0,
        });
      }

      if (action === 'createUser' || action === 'create_user') {
        const email = normalizeEmail(body.email);
        const password = String(body.password || '');
        if (!email || password.length < 6) {
          return json({ error: 'Email and a password of at least 6 characters are required.' }, 400);
        }
        const { data, error } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            first_name: String(body.first_name || ''),
            last_name: String(body.last_name || ''),
          },
        });
        if (error) return json({ error: error.message }, 400);
        return json({ success: true, user: data.user });
      }

      const targetId = String(body.userId || body.user_id || '');
      if (!targetId) return json({ error: 'User ID is required.' }, 400);

      const { data: targetData, error: targetError } = await admin.auth.admin.getUserById(targetId);
      if (targetError || !targetData.user) return json({ error: targetError?.message || 'User not found.' }, 404);

      const targetEmail = normalizeEmail(targetData.user.email);
      if (targetId === userId || targetEmail === adminEmail) {
        return json({ error: 'The administrator account cannot be modified.' }, 400);
      }

      if (action === 'deleteUser' || action === 'delete_user') {
        const { error } = await admin.auth.admin.deleteUser(targetId);
        if (error) return json({ error: error.message }, 400);
        return json({ success: true });
      }

      if (action === 'restrictUser' || action === 'ban_user') {
        const { data, error } = await admin.auth.admin.updateUserById(targetId, { ban_duration: '876000h' });
        if (error) return json({ error: error.message }, 400);
        return json({ success: true, user: data.user });
      }

      if (action === 'restoreUser' || action === 'unban_user') {
        const { data, error } = await admin.auth.admin.updateUserById(targetId, { ban_duration: 'none' });
        if (error) return json({ error: error.message }, 400);
        return json({ success: true, user: data.user });
      }

      if (action === 'confirmEmail' || action === 'confirm_user') {
        const { data, error } = await admin.auth.admin.updateUserById(targetId, { email_confirm: true });
        if (error) return json({ error: error.message }, 400);
        return json({ success: true, user: data.user });
      }

      return json({ error: 'Unknown admin action.' }, 400);
    } catch (error) {
      console.error('Admin function error:', error);
      return json({ error: error instanceof Error ? error.message : String(error) }, 500);
    }
  }),
};
