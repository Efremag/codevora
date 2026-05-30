import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check plan has analytics
  const userRows = await query<Array<{ has_analytics: boolean }>>(
    `SELECT pl.has_analytics FROM users u JOIN plans pl ON u.plan_id = pl.id WHERE u.id = ?`,
    [session.userId]
  )

  // Get profile id
  const profileRows = await query<Array<{ id: number; total_views: number }>>(
    'SELECT id, total_views FROM profiles WHERE user_id = ?',
    [session.userId]
  )
  if (profileRows.length === 0) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }
  const profileId = profileRows[0].id
  const totalViews = profileRows[0].total_views

  // Total link clicks
  const clickRows = await query<Array<{ total: number }>>(
    'SELECT COALESCE(SUM(click_count), 0) as total FROM links WHERE user_id = ?',
    [session.userId]
  )
  const totalClicks = clickRows[0]?.total ?? 0

  // Top links
  const topLinks = await query(
    'SELECT title, click_count FROM links WHERE user_id = ? ORDER BY click_count DESC LIMIT 5',
    [session.userId]
  )

  // Clicks by day (last 7 days) — only for Pro
  let clicksByDay: unknown[] = []
  if (userRows[0]?.has_analytics) {
    clicksByDay = await query(
      `SELECT DATE(clicked_at) as date, COUNT(*) as count
       FROM link_clicks lc
       JOIN links l ON lc.link_id = l.id
       WHERE l.user_id = ? AND clicked_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(clicked_at)
       ORDER BY date ASC`,
      [session.userId]
    ) as unknown[]
  }

  // Views last 7 days
  let viewsByDay: unknown[] = []
  if (userRows[0]?.has_analytics) {
    viewsByDay = await query(
      `SELECT DATE(viewed_at) as date, COUNT(*) as count
       FROM profile_views
       WHERE profile_id = ? AND viewed_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(viewed_at)
       ORDER BY date ASC`,
      [profileId]
    ) as unknown[]
  }

  return NextResponse.json({
    success: true,
    data: {
      total_clicks: totalClicks,
      total_views: totalViews,
      top_links: topLinks,
      clicks_by_day: clicksByDay,
      views_by_day: viewsByDay,
      has_analytics: userRows[0]?.has_analytics ?? false,
    },
  })
}
