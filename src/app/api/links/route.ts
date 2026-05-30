import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { validateUrl } from '@/lib/utils'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const links = await query(
    'SELECT * FROM links WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC',
    [session.userId]
  )

  return NextResponse.json({ success: true, data: links })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, url, icon_type } = body

  if (!title || !url) {
    return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 })
  }
  if (!validateUrl(url)) {
    return NextResponse.json({ error: 'Invalid URL. Include http:// or https://' }, { status: 400 })
  }
  if (title.length > 100) {
    return NextResponse.json({ error: 'Title too long (max 100 characters)' }, { status: 400 })
  }

  // Check plan limit
  const userRows = await query<Array<{ max_links: number }>>(
    `SELECT pl.max_links FROM users u JOIN plans pl ON u.plan_id = pl.id WHERE u.id = ?`,
    [session.userId]
  )
  const maxLinks = userRows[0]?.max_links ?? 5

  const countRows = await query<Array<{ cnt: number }>>(
    'SELECT COUNT(*) as cnt FROM links WHERE user_id = ?',
    [session.userId]
  )
  const currentCount = countRows[0]?.cnt ?? 0

  if (currentCount >= maxLinks) {
    return NextResponse.json(
      { error: `Your plan allows max ${maxLinks} links. Upgrade to Pro for unlimited links.` },
      { status: 403 }
    )
  }

  // Get max sort_order
  const orderRows = await query<Array<{ max_order: number | null }>>(
    'SELECT MAX(sort_order) as max_order FROM links WHERE user_id = ?',
    [session.userId]
  )
  const nextOrder = (orderRows[0]?.max_order ?? -1) + 1

  const result = await query<{ insertId: number }>(
    'INSERT INTO links (user_id, title, url, icon_type, sort_order) VALUES (?, ?, ?, ?, ?)',
    [session.userId, title.trim(), url.trim(), icon_type || 'link', nextOrder]
  )

  const newLink = await query('SELECT * FROM links WHERE id = ?', [(result as { insertId: number }).insertId])

  return NextResponse.json({ success: true, data: (newLink as unknown[])[0] }, { status: 201 })
}
