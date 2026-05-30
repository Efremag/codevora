import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-6">
              <Star size={13} className="text-orange-500 fill-orange-500" />
              <span className="text-sm text-orange-600 font-medium">Built for Ethiopian creators</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
              One link.{' '}
              <span className="text-orange-500">Infinite</span>{' '}
              possibilities.
            </h1>

            <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto lg:mx-0">
              Create your smart bio-link page in minutes. Share your Telegram, TikTok, YouTube, WhatsApp, portfolio, and everything — all in one beautiful link.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/register" className="btn-primary flex items-center justify-center gap-2 text-base">
                Create Your Free Page
                <ArrowRight size={18} />
              </Link>
              <Link href="/u/admin" className="btn-secondary flex items-center justify-center gap-2 text-base">
                See Demo Profile
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {['ET', 'AB', 'YG', 'MK'].map((init) => (
                  <div key={init} className="w-8 h-8 rounded-full gradient-brand border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    {init}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">500+</span> creators already joined
              </p>
            </div>
          </div>

          {/* Right — phone mockup */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-orange-400 opacity-20 blur-3xl rounded-full scale-75" />

              {/* Phone */}
              <div className="relative w-64 bg-white rounded-[2.5rem] shadow-2xl border-4 border-gray-100 overflow-hidden">
                {/* Status bar */}
                <div className="bg-gray-900 h-6 flex items-center justify-center">
                  <div className="w-16 h-3 bg-gray-800 rounded-full" />
                </div>

                {/* Profile header */}
                <div className="bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-6 text-center text-white">
                  <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white mx-auto mb-3 flex items-center justify-center text-2xl font-bold">
                    AB
                  </div>
                  <h3 className="font-bold text-sm">Abebe Bekele</h3>
                  <p className="text-xs text-orange-100 mt-1">Designer & Freelancer</p>
                </div>

                {/* Links */}
                <div className="px-3 py-4 space-y-2 bg-gray-50">
                  {[
                    { label: 'My Portfolio', color: 'bg-gray-900' },
                    { label: 'Telegram Channel', color: 'bg-blue-500' },
                    { label: 'TikTok Videos', color: 'bg-black' },
                    { label: 'WhatsApp Me', color: 'bg-green-500' },
                    { label: 'YouTube Channel', color: 'bg-red-500' },
                  ].map((link) => (
                    <div
                      key={link.label}
                      className={`${link.color} text-white text-xs font-medium rounded-xl py-2.5 px-3 text-center cursor-pointer hover:opacity-90 transition-opacity`}
                    >
                      {link.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
