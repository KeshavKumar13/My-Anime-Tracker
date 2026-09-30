import { withSupabase } from 'npm:@supabase/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders })
}

function normalizeEmail(email: unknown) {
  return String(email || '').trim().toLowerCase()
}

const handler = withSupabase({ auth: 'user' }, async (req, ctx) => {
  const adminEmail = normalizeEmail(Deno.env.get('ADMIN_EMAIL'))
  const callerEmail = normalizeEmail(ctx.userClaims?.email)

  if (!adminEmail || !callerEmail || callerEmail !== adminEmail) {
    return json({ error: 'Forbidden', isAdmin: false }, 403)
  }

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch (_) {}
  const action = String(body.action || 'me')

  if (action === 'me') return json({ isAdmin: true, email: callerEmail })

  const admin = ctx.supabaseAdmin

  try {
    if (action === 'list_users') {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
      if (error) throw error
      const users = (data.users || []).map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        email_confirmed_at: u.email_confirmed_at,
        banned_until: u.banned_until,
        is_admin: normalizeEmail(u.email) === adminEmail,
      }))
      return json({ users })
    }

    if (action === 'create_user') {
      const email = normalizeEmail(body.email)
      const password = String(body.password || '')
      if (!email || password.length < 6) return json({ error: 'Email and a password of at least 6 characters are required.' }, 400)
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (error) throw error
      return json({ ok: true, user: { id: data.user?.id, email: data.user?.email } })
    }

    const userId = String(body.user_id || '')
    if (!userId) return json({ error: 'user_id is required.' }, 400)

    const { data: targetData, error: targetError } = await admin.auth.admin.getUserById(userId)
    if (targetError) throw targetError
    const targetEmail = normalizeEmail(targetData.user?.email)
    if (!targetData.user) return json({ error: 'User not found.' }, 404)
    if (targetEmail === adminEmail || userId === ctx.userClaims?.sub) {
      return json({ error: 'The admin account cannot be modified from this dashboard.' }, 400)
    }

    if (action === 'delete_user') {
      const { error } = await admin.auth.admin.deleteUser(userId)
      if (error) throw error
      return json({ ok: true })
    }

    if (action === 'ban_user') {
      const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' })
      if (error) throw error
      return json({ ok: true })
    }

    if (action === 'unban_user') {
      const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' })
      if (error) throw error
      return json({ ok: true })
    }

    if (action === 'confirm_user') {
      const { error } = await admin.auth.admin.updateUserById(userId, { email_confirm: true })
      if (error) throw error
      return json({ ok: true })
    }

    return json({ error: 'Unknown action.' }, 400)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, 400)
  }
})

export default {
  async fetch(req: Request) {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
    try {
      const response = await handler(req)
      const headers = new Headers(response.headers)
      for (const [key, value] of Object.entries(corsHeaders)) headers.set(key, value)
      return new Response(response.body, { status: response.status, headers })
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : String(error) }, 500)
    }
  },
}
