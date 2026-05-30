import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

interface Params { params: { linkId: string } }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const linkId = parseInt(params.linkId)
    if (isNaN(linkId)) return NextResponse.json({ error: 'Invalid link' }, { status: 400 })

    const links = await query<Array<{ id: number; user_id: number; url: string }>>(
      'SELECT id, user_id, url FROM links WHERE id = ? AND is_active = TRUE',
      [linkId]
    )
    if (links.length === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    const link = links[0]
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') ||
               '0.0.0.0'
    const ua = req.headers.get('user-agent')?.slice(0, 500) || ''
    const referrer = req.headers.get('referer')?.slice(0, 500) || ''

    // Increment click count
    await query('UPDATE links SET click_count = click_count + 1 WHERE id = ?', [linkId])

    // Record analytics
    await query(
      'INSERT INTO link_clicks (link_id, user_id, ip_address, user_agent, referrer) VALUES (?, ?, ?, ?, ?)',
      [linkId, link.user_id, ip, ua, referrer]
    )

    return NextResponse.json({ success: true, url: link.url })
  } catch (err) {
    console.error('Track error:', err)
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 })
  }
}
