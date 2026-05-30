import Link from 'next/link'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { query } from '@/lib/db'
import { verifyChapaPayment } from '@/lib/chapa'

interface Props {
  searchParams: { tx_ref?: string }
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const txRef = searchParams.tx_ref
  let status: 'success' | 'pending' | 'failed' | 'unknown' = 'unknown'

  if (txRef) {
    const txs = await query<Array<{ status: string; user_id: number; plan_id: number }>>(
      'SELECT status, user_id, plan_id FROM transactions WHERE out_trade_no = ?',
      [txRef]
    ).catch(() => [] as Array<{ status: string; user_id: number; plan_id: number }>)

    if (txs.length > 0) {
      const tx = txs[0]
      if (tx.status === 'completed') {
        status = 'success'
      } else if (tx.status === 'failed') {
        status = 'failed'
      } else {
        // Pending: try to verify directly (webhook may not have fired yet)
        try {
          const { success } = await verifyChapaPayment(txRef)
          if (success) {
            await query("UPDATE transactions SET status = 'completed' WHERE out_trade_no = ?", [txRef])
            await query('UPDATE users SET plan_id = ? WHERE id = ?', [tx.plan_id, tx.user_id])
            status = 'success'
          } else {
            status = 'pending'
          }
        } catch {
          status = 'pending'
        }
      }
    }
  } else {
    status = 'success'
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500 mb-8">
            Your Codevora Pro plan is now active. Enjoy unlimited links and analytics!
          </p>
          <Link href="/dashboard" className="btn-primary w-full block text-center">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <XCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-500 mb-8">
            Your payment could not be processed. Please try again.
          </p>
          <Link href="/dashboard" className="btn-primary w-full block text-center">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Clock size={32} className="text-yellow-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Pending</h1>
        <p className="text-gray-500 mb-8">
          Your payment is being processed. Your plan will be updated shortly. Check your dashboard in a moment.
        </p>
        <Link href="/dashboard" className="btn-primary w-full block text-center">
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
