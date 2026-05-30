import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/user'
import { query } from '@/lib/db'
import AdminClient from './AdminClient'
import type { RowDataPacket } from 'mysql2'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.is_admin) redirect('/dashboard')

  const users = await query<RowDataPacket[]>(
    `SELECT u.id, u.email, u.is_active, u.is_admin, u.created_at,
            p.username, p.display_name, p.total_views,
            pl.name as plan_name, pl.slug as plan_slug, pl.id as plan_id,
            (SELECT COUNT(*) FROM links l WHERE l.user_id = u.id) as link_count,
            (SELECT COALESCE(SUM(click_count), 0) FROM links l WHERE l.user_id = u.id) as total_clicks
     FROM users u
     LEFT JOIN profiles p ON u.id = p.user_id
     LEFT JOIN plans pl ON u.plan_id = pl.id
     ORDER BY u.created_at DESC`
  )

  const stats = await query<RowDataPacket[]>(
    `SELECT
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as active_users,
       (SELECT COUNT(*) FROM links) as total_links,
       (SELECT COALESCE(SUM(click_count), 0) FROM links) as total_clicks,
       (SELECT COUNT(*) FROM profiles) as total_profiles`
  )

  const plans = await query<RowDataPacket[]>(
    'SELECT * FROM plans WHERE is_active = TRUE ORDER BY id ASC'
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <AdminClient
      currentUser={user}
      users={users as any[]}
      stats={(stats[0] || {}) as Record<string, number>}
      plans={plans as any[]}
    />
  )
}
