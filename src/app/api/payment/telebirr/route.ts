import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { initiateTelebirrPayment } from '@/lib/telebirr'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { planId } = await req.json()
    if (!planId) return NextResponse.json({ error: 'planId is required' }, { status: 400 })

    const plans = await query<Array<{ id: number; name: string; price_birr: number; slug: string }>>(
      'SELECT id, name, price_birr, slug FROM plans WHERE id = ? AND is_active = TRUE',
      [planId]
    )
    if (plans.length === 0) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    const plan = plans[0]
    if (plan.price_birr <= 0) return NextResponse.json({ error: 'Cannot pay for free plan' }, { status: 400 })

    const outTradeNo = `COD-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    await query(
      'INSERT INTO transactions (user_id, out_trade_no, amount, plan_id, status) VALUES (?, ?, ?, ?, ?)',
      [session.userId, outTradeNo, plan.price_birr, plan.id, 'pending']
    )

    const { toPayUrl } = await initiateTelebirrPayment({
      outTradeNo,
      totalAmount: Number(plan.price_birr).toFixed(2),
      subject: `Codevora ${plan.name} Plan - 1 month`,
      notifyUrl: `${appUrl}/api/payment/telebirr/callback`,
      returnUrl: `${appUrl}/payment/success?order=${outTradeNo}`,
    })

    return NextResponse.json({ success: true, data: { toPayUrl } })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Telebirr initiate error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
