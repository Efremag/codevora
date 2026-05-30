import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyChapaPayment } from '@/lib/chapa'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const txRef = body.tx_ref || body.trx_ref
    if (!txRef) return NextResponse.json({ error: 'Missing tx_ref' }, { status: 400 })

    const { success } = await verifyChapaPayment(txRef)

    const txs = await query<Array<{ id: number; user_id: number; plan_id: number; status: string }>>(
      'SELECT id, user_id, plan_id, status FROM transactions WHERE out_trade_no = ?',
      [txRef]
    )
    if (txs.length === 0) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

    const tx = txs[0]
    if (tx.status === 'completed') return NextResponse.json({ ok: true })

    if (success) {
      await query("UPDATE transactions SET status = 'completed' WHERE out_trade_no = ?", [txRef])
      await query('UPDATE users SET plan_id = ? WHERE id = ?', [tx.plan_id, tx.user_id])
    } else {
      await query("UPDATE transactions SET status = 'failed' WHERE out_trade_no = ?", [txRef])
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Chapa callback error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
