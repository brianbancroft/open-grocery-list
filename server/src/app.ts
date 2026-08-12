import { Hono } from 'hono'
import type { Pool } from 'pg'
import type { Config } from './config.js'
import { hashToken, newOpaqueToken, verifyAppleIdentityToken } from './security.js'
import { sendInvitationEmail } from './email.js'
import { authSchema, createItemSchema, createListSchema, inviteSchema, updateItemSchema, updateListSchema } from './validation.js'

type User = { id: string; apple_sub: string; email: string | null; display_name: string; is_admin: boolean }
const jsonError = (c: any, status: 400 | 401 | 403 | 404 | 409 | 503, code: string, message: string) => c.json({ error: { code, message } }, status)
const codeHash = (code: string) => hashToken(`invite:${code}`)

export function createApp(db: Pool, config: Config) {
  const app = new Hono()
  app.get('/health', c => c.json({ ok: true }))

  async function currentUser(c: any): Promise<User | Response> {
    const header = c.req.header('authorization')
    if (!header?.startsWith('Bearer ')) return jsonError(c, 401, 'UNAUTHENTICATED', 'Sign in is required')
    const result = await db.query<User>(`SELECT u.id,u.apple_sub,u.email,u.display_name,u.is_admin FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.revoked_at IS NULL AND s.expires_at > now()`, [hashToken(header.slice(7))])
    return result.rows[0] ?? jsonError(c, 401, 'UNAUTHENTICATED', 'Session is invalid or expired')
  }
  async function requireUser(c: any) { const user = await currentUser(c); return user instanceof Response ? null : user }
  async function requireAdmin(c: any) { const user = await requireUser(c); if (!user) return null; if (!user.is_admin) { jsonError(c, 403, 'ADMIN_REQUIRED', 'Administrator access is required'); return null }; return user }
  async function body<T>(c: any, schema: { safeParse: (x: unknown) => any }): Promise<T | null> {
    const parsed = schema.safeParse(await c.req.json().catch(() => null)); if (!parsed.success) { jsonError(c, 400, 'VALIDATION_ERROR', 'Request is invalid'); return null }; return parsed.data
  }

  app.post('/api/auth/apple', async c => {
    const input = await body<{ identityToken: string; inviteCode?: string; displayName?: string }>(c, authSchema); if (!input) return c.res
    if (!config.APPLE_BUNDLE_ID) return jsonError(c, 503, 'AUTH_NOT_CONFIGURED', 'Sign in with Apple is not configured yet')
    let apple: { sub: string; email?: string }
    try { apple = await verifyAppleIdentityToken(input.identityToken, config.APPLE_BUNDLE_ID) } catch { return jsonError(c, 401, 'INVALID_IDENTITY_TOKEN', 'Apple identity token could not be verified') }
    const client = await db.connect()
    try {
      await client.query('BEGIN')
      const existing = await client.query<User>('SELECT id,apple_sub,email,display_name,is_admin FROM users WHERE apple_sub=$1 FOR UPDATE', [apple.sub])
      let user = existing.rows[0]
      if (!user) {
        const bootstrapAdmin = config.adminSubs.has(apple.sub)
        let inviteId: string | undefined
        if (!bootstrapAdmin) {
          if (!input.inviteCode || !apple.email) { await client.query('ROLLBACK'); return jsonError(c, 403, 'INVITE_REQUIRED', 'This Apple ID must use a valid invitation') }
          const invite = await client.query<{ id: string }>(`SELECT id FROM invitations WHERE code_hash=$1 AND lower(email)=lower($2) AND accepted_at IS NULL AND expires_at > now() FOR UPDATE`, [codeHash(input.inviteCode), apple.email])
          inviteId = invite.rows[0]?.id
          if (!inviteId) { await client.query('ROLLBACK'); return jsonError(c, 403, 'INVITE_INVALID', 'Invitation is invalid, expired, or belongs to another email') }
        }
        const created = await client.query<User>('INSERT INTO users (apple_sub,email,display_name,is_admin) VALUES ($1,$2,$3,$4) RETURNING id,apple_sub,email,display_name,is_admin', [apple.sub, apple.email ?? null, input.displayName ?? 'Family member', bootstrapAdmin])
        user = created.rows[0]
        if (inviteId) await client.query('UPDATE invitations SET accepted_at=now(), accepted_by_user_id=$1 WHERE id=$2', [user.id, inviteId])
      } else await client.query('UPDATE users SET last_login_at=now(), email=COALESCE(email,$1) WHERE id=$2', [apple.email ?? null, user.id])
      const token = newOpaqueToken()
      await client.query(`INSERT INTO sessions (user_id,token_hash,expires_at) VALUES ($1,$2,now() + interval '30 days')`, [user.id, hashToken(token)])
      await client.query('COMMIT')
      return c.json({ user: { id: user.id, displayName: user.display_name, isAdmin: user.is_admin }, sessionToken: token })
    } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
  })
  app.post('/api/auth/logout', async c => { const header = c.req.header('authorization'); if (header?.startsWith('Bearer ')) await db.query('UPDATE sessions SET revoked_at=now() WHERE token_hash=$1', [hashToken(header.slice(7))]); return c.body(null, 204) })
  app.get('/api/me', async c => { const user = await requireUser(c); return user ? c.json({ user: { id: user.id, displayName: user.display_name, isAdmin: user.is_admin } }) : c.res })

  app.post('/api/admin/invitations', async c => { const user = await requireAdmin(c); if (!user) return c.res; const input = await body<{ email: string }>(c, inviteSchema); if (!input) return c.res; const code = newOpaqueToken(); const result = await db.query(`INSERT INTO invitations (email,code_hash,invited_by_user_id,expires_at) VALUES ($1,$2,$3,now() + interval '7 days') RETURNING id,email,expires_at`, [input.email, codeHash(code), user.id]); const invitation = result.rows[0]; const emailSent = await sendInvitationEmail(config, input.email, code, invitation.expires_at).catch(() => false); return c.json({ invitation, inviteCode: code, emailSent }, 201) })
  app.get('/api/admin/invitations', async c => { if (!await requireAdmin(c)) return c.res; const result = await db.query(`SELECT id,email,expires_at,accepted_at,created_at FROM invitations ORDER BY created_at DESC`); return c.json({ invitations: result.rows }) })

  app.get('/api/lists', async c => { if (!await requireUser(c)) return c.res; const result = await db.query(`SELECT l.id,l.name,l.sort_order AS "sortOrder",l.updated_at AS "updatedAt",count(i.id)::int AS "itemCount",count(i.id) FILTER (WHERE i.completed_at IS NOT NULL)::int AS "completedItemCount" FROM lists l LEFT JOIN list_items i ON i.list_id=l.id AND i.deleted_at IS NULL WHERE l.deleted_at IS NULL GROUP BY l.id ORDER BY l.sort_order,l.created_at`); return c.json({ lists: result.rows }) })
  app.post('/api/lists', async c => { const user = await requireUser(c); if (!user) return c.res; const input = await body<{ name: string }>(c, createListSchema); if (!input) return c.res; const result = await db.query(`INSERT INTO lists(name,sort_order,created_by_user_id,updated_by_user_id) VALUES($1,(SELECT COALESCE(max(sort_order),0)+1000 FROM lists WHERE deleted_at IS NULL),$2,$2) RETURNING id,name,sort_order AS "sortOrder",updated_at AS "updatedAt"`, [input.name, user.id]); return c.json({ list: result.rows[0] }, 201) })
  app.patch('/api/lists/:id', async c => { const user = await requireUser(c); if (!user) return c.res; const input = await body<{ name: string }>(c, updateListSchema); if (!input) return c.res; const result = await db.query(`UPDATE lists SET name=$1,updated_by_user_id=$2,updated_at=now() WHERE id=$3 AND deleted_at IS NULL RETURNING id,name,sort_order AS "sortOrder",updated_at AS "updatedAt"`, [input.name,user.id,c.req.param('id')]); return result.rows[0] ? c.json({ list: result.rows[0] }) : jsonError(c,404,'NOT_FOUND','List was not found') })
  app.delete('/api/lists/:id', async c => { const user = await requireUser(c); if (!user) return c.res; const result = await db.query('UPDATE lists SET deleted_at=now(),updated_by_user_id=$1,updated_at=now() WHERE id=$2 AND deleted_at IS NULL RETURNING id',[user.id,c.req.param('id')]); return result.rows[0] ? c.body(null,204) : jsonError(c,404,'NOT_FOUND','List was not found') })

  app.get('/api/lists/:id/items', async c => { if (!await requireUser(c)) return c.res; const list = await db.query('SELECT id FROM lists WHERE id=$1 AND deleted_at IS NULL', [c.req.param('id')]); if (!list.rows[0]) return jsonError(c,404,'NOT_FOUND','List was not found'); const result = await db.query(`SELECT id,list_id AS "listId",name,quantity,color_label AS "colorLabel",sort_order AS "sortOrder",completed_at AS "completedAt",updated_at AS "updatedAt" FROM list_items WHERE list_id=$1 AND deleted_at IS NULL ORDER BY completed_at NULLS FIRST,sort_order,created_at`, [c.req.param('id')]); return c.json({ items: result.rows }) })
  app.post('/api/lists/:id/items', async c => { const user = await requireUser(c); if (!user) return c.res; const input = await body<{ name:string;quantity?:string | null;colorLabel: string }>(c, createItemSchema); if (!input) return c.res; const list = await db.query('SELECT id FROM lists WHERE id=$1 AND deleted_at IS NULL',[c.req.param('id')]); if (!list.rows[0]) return jsonError(c,404,'NOT_FOUND','List was not found'); const result = await db.query(`INSERT INTO list_items(list_id,name,quantity,color_label,sort_order,created_by_user_id,updated_by_user_id) VALUES($1,$2,$3,$4,(SELECT COALESCE(max(sort_order),0)+1000 FROM list_items WHERE list_id=$1 AND deleted_at IS NULL),$5,$5) RETURNING id,list_id AS "listId",name,quantity,color_label AS "colorLabel",sort_order AS "sortOrder",completed_at AS "completedAt",updated_at AS "updatedAt"`, [c.req.param('id'),input.name,input.quantity ?? null,input.colorLabel,user.id]); return c.json({ item: result.rows[0] },201) })
  app.patch('/api/items/:id', async c => { const user = await requireUser(c); if (!user) return c.res; const input = await body<{name?:string;quantity?:string | null;colorLabel?:string}>(c,updateItemSchema); if (!input) return c.res; const result = await db.query(`UPDATE list_items SET name=COALESCE($1,name),quantity=CASE WHEN $2::boolean THEN $3 ELSE quantity END,color_label=COALESCE($4,color_label),updated_by_user_id=$5,updated_at=now() WHERE id=$6 AND deleted_at IS NULL RETURNING id,list_id AS "listId",name,quantity,color_label AS "colorLabel",sort_order AS "sortOrder",completed_at AS "completedAt",updated_at AS "updatedAt"`,[input.name ?? null,input.quantity !== undefined,input.quantity ?? null,input.colorLabel ?? null,user.id,c.req.param('id')]); return result.rows[0] ? c.json({item:result.rows[0]}) : jsonError(c,404,'NOT_FOUND','Item was not found') })
  app.post('/api/items/:id/complete', async c => { const user = await requireUser(c); if (!user) return c.res; const result = await db.query(`UPDATE list_items SET completed_at=now(),completed_by_user_id=$1,updated_by_user_id=$1,updated_at=now() WHERE id=$2 AND deleted_at IS NULL RETURNING id,completed_at AS "completedAt"`,[user.id,c.req.param('id')]); return result.rows[0] ? c.json({item:result.rows[0]}) : jsonError(c,404,'NOT_FOUND','Item was not found') })
  app.post('/api/items/:id/uncomplete', async c => { const user = await requireUser(c); if (!user) return c.res; const result = await db.query(`UPDATE list_items SET completed_at=NULL,completed_by_user_id=NULL,updated_by_user_id=$1,updated_at=now() WHERE id=$2 AND deleted_at IS NULL RETURNING id,completed_at AS "completedAt"`,[user.id,c.req.param('id')]); return result.rows[0] ? c.json({item:result.rows[0]}) : jsonError(c,404,'NOT_FOUND','Item was not found') })
  app.delete('/api/items/:id', async c => { const user = await requireUser(c); if (!user) return c.res; const result = await db.query('UPDATE list_items SET deleted_at=now(),updated_by_user_id=$1,updated_at=now() WHERE id=$2 AND deleted_at IS NULL RETURNING id',[user.id,c.req.param('id')]); return result.rows[0] ? c.body(null,204) : jsonError(c,404,'NOT_FOUND','Item was not found') })
  return app
}
