import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/user'
import { query } from '@/lib/db'
import DashboardClient from './DashboardClient'
import type { RowDataPacket } from 'mysql2'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profiles = await query<RowDataPacket[]>(
    'SELECT * FROM profiles WHERE user_id = ?',
    [user.id]
  )
  const profile = (profiles[0] as Record<string, unknown>) || null

  const links = await query<RowDataPacket[]>(
    'SELECT * FROM links WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC',
    [user.id]
  )

  const analytics = await query<RowDataPacket[]>(
    `SELECT
       COALESCE(SUM(l.click_count), 0) as total_clicks,
       p.total_views,
       (SELECT COUNT(*) FROM link_clicks lc JOIN links ll ON lc.link_id = ll.id
        WHERE ll.user_id = ? AND DATE(lc.clicked_at) = CURDATE()) as clicks_today
     FROM links l
     LEFT JOIN profiles p ON p.user_id = l.user_id
     WHERE l.user_id = ?`,
    [user.id, user.id]
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <DashboardClient
      user={user}
      profile={profile as any}
      links={links as any}
      analytics={(analytics[0] || {}) as Record<string, number>}
    />
  )
}
