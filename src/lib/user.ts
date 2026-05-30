import { getSession } from './auth'
import { query } from './db'

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  const rows = await query<Array<{
    id: number
    email: string
    plan_id: number
    is_active: boolean
    is_admin: boolean
    plan_slug: string
    plan_name: string
    max_links: number
    has_analytics: boolean
    has_custom_themes: boolean
  }>>(
    `SELECT u.id, u.email, u.plan_id, u.is_active, u.is_admin,
            p.slug as plan_slug, p.name as plan_name,
            p.max_links, p.has_analytics, p.has_custom_themes
     FROM users u
     JOIN plans p ON u.plan_id = p.id
     WHERE u.id = ? AND u.is_active = TRUE`,
    [session.userId]
  )

  return rows[0] || null
}
