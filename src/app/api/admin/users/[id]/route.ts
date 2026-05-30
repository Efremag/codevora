import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const userId = parseInt(params.id)
  if (isNaN(userId)) return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })

  // Prevent admin from deactivating themselves
  if (userId === session.userId) {
    return NextResponse.json({ error: 'Cannot modify your own account here' }, { status: 400 })
  }

  const body = await req.json()
  const { is_active, plan_id, is_admin } = body

  const updates: string[] = []
  const values: (string | number | boolean | null)[] = []

  if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0) }
  if (plan_id !== undefined) { updates.push('plan_id = ?'); values.push(plan_id) }
  if (is_admin !== undefined) { updates.push('is_admin = ?'); values.push(is_admin ? 1 : 0) }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  values.push(userId)
  await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values)

  return NextResponse.json({ success: true, message: 'User updated' })
}
