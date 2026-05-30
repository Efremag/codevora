import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg">
                Codevora <span className="text-orange-500">Link</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              One link. Infinite possibilities. The smart bio-link platform built for Ethiopian creators, freelancers, and businesses.
            </p>
            <p className="text-gray-500 text-xs mt-4">
              By <span className="text-orange-400 font-medium">Codevora Forge</span>
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-orange-400 transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-orange-400 transition-colors">Pricing</a></li>
              <li><a href="#faq" className="hover:text-orange-400 transition-colors">FAQ</a></li>
              <li><Link href="/register" className="hover:text-orange-400 transition-colors">Get Started</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/login" className="hover:text-orange-400 transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-orange-400 transition-colors">Register</Link></li>
              <li><Link href="/dashboard" className="hover:text-orange-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Codevora Link by Codevora Forge. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  )
}
