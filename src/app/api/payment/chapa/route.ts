import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { initializeChapaPayment } from '@/lib/chapa'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { planId } = await req.json()
    if (!planId) return NextResponse.json({ error: 'planId is required' }, { status: 400 })

    const plans = await query<Array<{ id: number; name: string; price_birr: number }>>(
      'SELECT id, name, price_birr FROM plans WHERE id = ? AND is_active = TRUE',
      [planId]
    )
    if (plans.length === 0) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    const plan = plans[0]
    if (plan.price_birr <= 0) return NextResponse.json({ error: 'Cannot pay for free plan' }, { status: 400 })

    const rows = await query<Array<{ email: string; display_name: string | null }>>(
      'SELECT u.email, p.display_name FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id = ?',
      [session.userId]
    )
    if (rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { email, display_name } = rows[0]
    const parts = (display_name || email.split('@')[0]).split(' ')
    const firstName = parts[0]
    const lastName = parts.slice(1).join(' ') || 'User'

    const txRef = `COD-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`
    const appUrl = req.nextUrl.origin

    await query(
      'INSERT INTO transactions (user_id, out_trade_no, amount, plan_id, status) VALUES (?, ?, ?, ?, ?)',
      [session.userId, txRef, plan.price_birr, plan.id, 'pending']
    )

    const { checkoutUrl } = await initializeChapaPayment({
      amount: Number(plan.price_birr),
      email,
      firstName,
      lastName,
      txRef,
      callbackUrl: `${appUrl}/api/payment/chapa/callback`,
      returnUrl: `${appUrl}/payment/success?tx_ref=${txRef}`,
      title: `Codevora ${plan.name}`.slice(0, 16),
    })

    return NextResponse.json({ success: true, data: { checkoutUrl } })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Chapa error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
