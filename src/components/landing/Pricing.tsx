import Link from 'next/link'
import { Check, X } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    priceETB: '0',
    priceUSD: '0',
    period: 'forever',
    description: 'Perfect for getting started',
    badge: null,
    features: [
      { text: 'Up to 3 links', included: true },
      { text: 'Public profile page', included: true },
      { text: 'Basic themes', included: true },
      { text: 'Mobile-optimized', included: true },
      { text: 'Click analytics', included: false },
      { text: 'Custom theme colors', included: false },
      { text: 'Unlimited links', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started Free',
    ctaStyle: 'btn-outline',
    highlighted: false,
  },
  {
    name: 'Pro',
    priceETB: '199',
    priceUSD: '4.99',
    period: 'per month',
    description: 'For serious creators & freelancers',
    badge: 'Most Popular',
    features: [
      { text: 'Unlimited links', included: true },
      { text: 'Public profile page', included: true },
      { text: 'All themes + custom colors', included: true },
      { text: 'Mobile-optimized', included: true },
      { text: 'Full click analytics', included: true },
      { text: 'Custom theme colors', included: true },
      { text: 'Profile view stats', included: true },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Pro — 199 ETB/month',
    ctaStyle: 'btn-primary',
    highlighted: true,
  },
  {
    name: 'Business',
    priceETB: '499',
    priceUSD: '9.99',
    period: 'per month',
    description: 'For teams and businesses',
    badge: null,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Custom domain (coming)', included: true },
      { text: 'Team management', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'API access', included: true },
      { text: 'White-label options', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Contact Us',
    ctaStyle: 'btn-secondary',
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-orange-500 uppercase tracking-wider">Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Start free. Upgrade when you&apos;re ready. Payment via Chapa & Telebirr coming soon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border-2 transition-all duration-200 ${
                plan.highlighted
                  ? 'border-orange-500 bg-orange-50 shadow-xl shadow-orange-100 scale-105'
                  : 'border-gray-100 bg-white hover:border-orange-200 hover:shadow-lg'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-black text-gray-900 text-xl mb-1">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-gray-900">
                    {plan.priceETB === '0' ? 'Free' : `${plan.priceETB} ETB`}
                  </span>
                  {plan.priceETB !== '0' && (
                    <span className="text-gray-400 text-sm mb-1">/ {plan.period}</span>
                  )}
                </div>
                {plan.priceUSD !== '0' && (
                  <p className="text-gray-400 text-xs mt-1">~${plan.priceUSD} USD</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat.text} className="flex items-center gap-3 text-sm">
                    {feat.included ? (
                      <Check size={16} className="text-green-500 shrink-0" />
                    ) : (
                      <X size={16} className="text-gray-300 shrink-0" />
                    )}
                    <span className={feat.included ? 'text-gray-700' : 'text-gray-400'}>
                      {feat.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/register" className={`${plan.ctaStyle} w-full text-center block text-sm`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          💳 Pay securely via Telebirr. Cancel anytime.
        </p>
      </div>
    </section>
  )
}
