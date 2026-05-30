'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Zap } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">
              Codevora <span className="text-orange-500">Link</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-orange-500 text-sm font-medium transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-orange-500 text-sm font-medium transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-gray-600 hover:text-orange-500 text-sm font-medium transition-colors">
              FAQ
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm !py-2 !px-4">
              Get Started Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3 animate-fade-in">
            <a href="#features" className="block text-gray-600 hover:text-orange-500 text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#pricing" className="block text-gray-600 hover:text-orange-500 text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
              Pricing
            </a>
            <a href="#faq" className="block text-gray-600 hover:text-orange-500 text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
              FAQ
            </a>
            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
              <Link href="/login" className="btn-secondary text-sm text-center !py-2">Sign In</Link>
              <Link href="/register" className="btn-primary text-sm text-center !py-2">Get Started Free</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
