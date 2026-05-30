import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Telebirr callback:', JSON.stringify(body))

    const { outTradeNo, tradeNo, transactionStatus } = body

    if (!outTradeNo) {
      return NextResponse.json({ code: '1', msg: 'missing outTradeNo' }, { status: 400 })
    }

    if (transactionStatus !== '1') {
      await query(
        'UPDATE transactions SET status = ? WHERE out_trade_no = ? AND status = ?',
        ['failed', outTradeNo, 'pending']
      )
      return NextResponse.json({ code: '0', msg: 'ok' })
    }

    // Mark transaction completed
    await query(
      'UPDATE transactions SET status = ?, telebirr_trade_no = ? WHERE out_trade_no = ? AND status = ?',
      ['completed', tradeNo || null, outTradeNo, 'pending']
    )

    // Upgrade the user's plan
    const rows = await query<Array<{ user_id: number; plan_id: number }>>(
      'SELECT user_id, plan_id FROM transactions WHERE out_trade_no = ?',
      [outTradeNo]
    )
    if (rows.length > 0) {
      const { user_id, plan_id } = rows[0]
      await query('UPDATE users SET plan_id = ? WHERE id = ?', [plan_id, user_id])
    }

    return NextResponse.json({ code: '0', msg: 'ok' })
  } catch (err) {
    console.error('Telebirr callback error:', err)
    return NextResponse.json({ code: '1', msg: 'internal error' }, { status: 500 })
  }
}
