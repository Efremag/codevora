import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { capturePayPalOrder } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  try {
    const { orderId, txRef } = await req.json()
    if (!orderId || !txRef) return NextResponse.json({ error: 'orderId and txRef are required' }, { status: 400 })

    const txs = await query<Array<{ id: number; user_id: number; plan_id: number; status: string }>>(
      'SELECT id, user_id, plan_id, status FROM transactions WHERE out_trade_no = ? AND payment_method = ?',
      [txRef, 'paypal']
    )
    if (txs.length === 0) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

    const tx = txs[0]
    if (tx.status === 'completed') return NextResponse.json({ success: true })

    const { success } = await capturePayPalOrder(orderId)

    if (success) {
      await query("UPDATE transactions SET status = 'completed' WHERE out_trade_no = ?", [txRef])
      await query('UPDATE users SET plan_id = ? WHERE id = ?', [tx.plan_id, tx.user_id])
      return NextResponse.json({ success: true })
    } else {
      await query("UPDATE transactions SET status = 'failed' WHERE out_trade_no = ?", [txRef])
      return NextResponse.json({ success: false, error: 'Capture failed' }, { status: 402 })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('PayPal capture error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
