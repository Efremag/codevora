import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { createPayPalOrder } from '@/lib/paypal'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { planId } = await req.json()
    if (!planId) return NextResponse.json({ error: 'planId is required' }, { status: 400 })

    const plans = await query<Array<{ id: number; name: string; price_usd: number }>>(
      'SELECT id, name, price_usd FROM plans WHERE id = ? AND is_active = TRUE',
      [planId]
    )
    if (plans.length === 0) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    const plan = plans[0]
    if (plan.price_usd <= 0) return NextResponse.json({ error: 'Cannot pay for free plan' }, { status: 400 })

    const txRef = `COD-PP-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`
    const appUrl = req.nextUrl.origin

    await query(
      'INSERT INTO transactions (user_id, out_trade_no, amount, plan_id, status, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
      [session.userId, txRef, plan.price_usd, plan.id, 'pending', 'paypal']
    )

    const { orderId, approveUrl } = await createPayPalOrder({
      amount: Number(plan.price_usd),
      txRef,
      returnUrl: `${appUrl}/payment/success?tx_ref=${txRef}&provider=paypal`,
      cancelUrl: `${appUrl}/payment/failed?tx_ref=${txRef}&provider=paypal`,
    })

    await query('UPDATE transactions SET paypal_order_id = ? WHERE out_trade_no = ?', [orderId, txRef])

    return NextResponse.json({ success: true, data: { checkoutUrl: approveUrl } })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('PayPal error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
