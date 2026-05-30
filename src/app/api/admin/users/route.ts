import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await query(
    `SELECT u.id, u.email, u.is_active, u.is_admin, u.created_at,
            p.username, p.display_name, p.total_views,
            pl.name as plan_name, pl.slug as plan_slug,
            (SELECT COUNT(*) FROM links l WHERE l.user_id = u.id) as link_count,
            (SELECT COALESCE(SUM(click_count), 0) FROM links l WHERE l.user_id = u.id) as total_clicks
     FROM users u
     LEFT JOIN profiles p ON u.id = p.user_id
     LEFT JOIN plans pl ON u.plan_id = pl.id
     ORDER BY u.created_at DESC`
  )

  const stats = await query<Array<{ total_users: number; active_users: number; total_links: number; total_clicks: number }>>(
    `SELECT
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as active_users,
       (SELECT COUNT(*) FROM links) as total_links,
       (SELECT COALESCE(SUM(click_count), 0) FROM links) as total_clicks`
  )

  return NextResponse.json({ success: true, data: { users, stats: stats[0] } })
}
