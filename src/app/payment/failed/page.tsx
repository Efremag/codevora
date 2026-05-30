import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-500 mb-8">
          Something went wrong with your payment. Please try again or contact support.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/dashboard" className="btn-primary w-full block text-center">
            Back to Dashboard
          </Link>
          <Link href="/" className="btn-secondary w-full block text-center">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
