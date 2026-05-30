import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { validateUsername, sanitizeUsername } from '@/lib/utils'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profiles = await query<Array<Record<string, unknown>>>(
    `SELECT p.*, u.email, u.plan_id,
            pl.name as plan_name, pl.slug as plan_slug,
            pl.max_links, pl.has_analytics, pl.has_custom_themes
     FROM profiles p
     JOIN users u ON p.user_id = u.id
     JOIN plans pl ON u.plan_id = pl.id
     WHERE p.user_id = ?`,
    [session.userId]
  )

  if (profiles.length === 0) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: profiles[0] })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { display_name, bio, profile_image, username, theme_color } = body

  // Validate username if changing
  if (username !== undefined) {
    const clean = sanitizeUsername(username)
    if (!validateUsername(clean)) {
      return NextResponse.json({ error: 'Invalid username format' }, { status: 400 })
    }

    const taken = await query<unknown[]>(
      'SELECT id FROM profiles WHERE username = ? AND user_id != ?',
      [clean, session.userId]
    )
    if ((taken as unknown[]).length > 0) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 })
    }
  }

  // Validate theme color
  if (theme_color && !/^#[0-9A-Fa-f]{6}$/.test(theme_color)) {
    return NextResponse.json({ error: 'Invalid theme color format' }, { status: 400 })
  }

  // Build update
  const updates: string[] = []
  const values: (string | number | boolean | null)[] = []

  if (display_name !== undefined) { updates.push('display_name = ?'); values.push(display_name.slice(0, 100)) }
  if (bio !== undefined) { updates.push('bio = ?'); values.push(bio.slice(0, 500)) }
  if (profile_image !== undefined) { updates.push('profile_image = ?'); values.push(profile_image) }
  if (username !== undefined) { updates.push('username = ?'); values.push(sanitizeUsername(username)) }
  if (theme_color !== undefined) { updates.push('theme_color = ?'); values.push(theme_color) }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  values.push(session.userId)
  await query(`UPDATE profiles SET ${updates.join(', ')} WHERE user_id = ?`, values)

  return NextResponse.json({ success: true, message: 'Profile updated' })
}
