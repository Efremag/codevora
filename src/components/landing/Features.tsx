import { BarChart3, Globe, Link2, Palette, Shield, Smartphone, Zap } from 'lucide-react'

const features = [
  {
    icon: Link2,
    title: 'All Your Links in One Place',
    desc: 'Add Telegram, TikTok, YouTube, WhatsApp, Instagram, portfolio, and any other link — all on one beautiful page.',
    color: 'bg-orange-50 text-orange-500',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    desc: 'Your profile looks stunning on every device. Designed specifically for mobile sharing culture in Ethiopia.',
    color: 'bg-blue-50 text-blue-500',
  },
  {
    icon: BarChart3,
    title: 'Click Analytics',
    desc: 'See how many people visit your profile and which links they click. Know what content resonates most.',
    color: 'bg-green-50 text-green-500',
  },
  {
    icon: Palette,
    title: 'Custom Themes',
    desc: 'Personalize your profile with custom colors, backgrounds, and button styles to match your brand.',
    color: 'bg-purple-50 text-purple-500',
  },
  {
    icon: Globe,
    title: 'Shareable Profile URL',
    desc: 'Get your own link: codevora.com/u/yourname — share it in bio, WhatsApp status, or anywhere online.',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    desc: 'Your data is safe with us. Secure authentication, encrypted passwords, and reliable uptime you can count on.',
    color: 'bg-red-50 text-red-500',
  },
  {
    icon: Zap,
    title: 'Instant Setup',
    desc: 'Create your complete bio-link page in under 5 minutes. No coding, no design skills needed.',
    color: 'bg-indigo-50 text-indigo-500',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-orange-500 uppercase tracking-wider">Features</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-4">
            Everything you need to grow
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Codevora Link gives creators, freelancers, and businesses the tools to share everything in one professional link.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.slice(0, 6).map((f) => (
            <div key={f.title} className="card p-6 group cursor-default">
              <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <f.icon size={22} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Extra highlight */}
        {(() => {
          const LastFeature = features[6]
          const LastIcon = LastFeature.icon
          return (
            <div className="mt-6 card p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className={`w-12 h-12 rounded-2xl ${LastFeature.color} flex items-center justify-center shrink-0`}>
                <LastIcon size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{LastFeature.title}</h3>
                <p className="text-gray-500 text-sm">{LastFeature.desc}</p>
              </div>
              <a href="/register" className="btn-primary text-sm whitespace-nowrap shrink-0 !py-2">
                Start Free &rarr;
              </a>
            </div>
          )
        })()}
      </div>
    </section>
  )
}
