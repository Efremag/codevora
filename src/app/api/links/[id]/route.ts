import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { validateUrl } from '@/lib/utils'

interface Params { params: { id: string } }

async function getLink(id: number, userId: number) {
  const rows = await query<unknown[]>('SELECT * FROM links WHERE id = ? AND user_id = ?', [id, userId])
  return (rows as unknown[])[0] as Record<string, unknown> | undefined
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const linkId = parseInt(params.id)
  if (isNaN(linkId)) return NextResponse.json({ error: 'Invalid link ID' }, { status: 400 })

  const link = await getLink(linkId, session.userId)
  if (!link) return NextResponse.json({ error: 'Link not found' }, { status: 404 })

  const body = await req.json()
  const { title, url, icon_type, is_active, sort_order } = body

  if (url !== undefined && !validateUrl(url)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const updates: string[] = []
  const values: (string | number | boolean | null)[] = []

  if (title !== undefined) { updates.push('title = ?'); values.push(title.slice(0, 100)) }
  if (url !== undefined) { updates.push('url = ?'); values.push(url.trim()) }
  if (icon_type !== undefined) { updates.push('icon_type = ?'); values.push(icon_type) }
  if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0) }
  if (sort_order !== undefined) { updates.push('sort_order = ?'); values.push(sort_order) }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  values.push(linkId, session.userId)
  await query(`UPDATE links SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, values)

  const updated = await query('SELECT * FROM links WHERE id = ?', [linkId])
  return NextResponse.json({ success: true, data: (updated as unknown[])[0] })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const linkId = parseInt(params.id)
  if (isNaN(linkId)) return NextResponse.json({ error: 'Invalid link ID' }, { status: 400 })

  const link = await getLink(linkId, session.userId)
  if (!link) return NextResponse.json({ error: 'Link not found' }, { status: 404 })

  await query('DELETE FROM links WHERE id = ? AND user_id = ?', [linkId, session.userId])
  return NextResponse.json({ success: true, message: 'Link deleted' })
}
