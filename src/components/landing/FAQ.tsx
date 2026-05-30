'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'What is Codevora Link?',
    a: 'Codevora Link is a smart bio-link platform that lets you create one public profile page containing all your important links — Telegram, TikTok, YouTube, WhatsApp, portfolio, and more. Share this single link everywhere instead of multiple separate links.',
  },
  {
    q: 'Is it free to use?',
    a: "Yes! The Free plan lets you create a profile with up to 5 links at no cost — forever. You can upgrade to Pro for unlimited links and analytics when you're ready.",
  },
  {
    q: 'How do I share my Codevora Link page?',
    a: 'Once you create your profile, you get a unique URL like codevora.com/u/yourname. Put this link in your Instagram bio, WhatsApp status, Telegram profile, TikTok bio, or share it directly with clients.',
  },
  {
    q: 'Can I customize how my page looks?',
    a: 'Free users get basic white/light themes. Pro users can choose custom colors, gradient backgrounds, and more theme options to match their personal brand.',
  },
  {
    q: 'How do I pay for Pro? Do you accept Chapa or Telebirr?',
    a: 'We are currently integrating Chapa and Telebirr payment systems for easy Ethiopian payment. For now, contact us directly to upgrade your plan. Full payment integration is coming very soon!',
  },
  {
    q: 'Can I track how many people click my links?',
    a: 'Yes — Pro users get full click analytics showing total clicks per link, daily trends, and profile view counts. Free users get basic stats.',
  },
  {
    q: 'Is my data safe?',
    a: 'Absolutely. We use industry-standard encryption for passwords (bcrypt hashing), JWT authentication for sessions, and follow secure coding practices. Your profile data is stored securely in our database.',
  },
  {
    q: 'Who built Codevora Link?',
    a: 'Codevora Link is built and maintained by Codevora Forge — a software development brand focused on building tools for Ethiopian creators, freelancers, and businesses.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-orange-500 uppercase tracking-wider">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-4">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-orange-500 shrink-0 transition-transform duration-200 ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 animate-fade-in">
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
