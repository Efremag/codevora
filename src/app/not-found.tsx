import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mb-6">
        <Zap size={28} className="text-white" />
      </div>
      <h1 className="text-5xl font-black text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-700 mb-3">Page not found</h2>
      <p className="text-gray-500 max-w-sm mb-8">
        The page or profile you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary">Go Home</Link>
        <Link href="/register" className="btn-secondary">Create Profile</Link>
      </div>
    </div>
  )
}
