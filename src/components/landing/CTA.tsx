import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="gradient-brand rounded-3xl p-10 sm:p-16 text-center text-white relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

          <h2 className="relative text-3xl sm:text-4xl font-black mb-4">
            Ready to share everything in one link?
          </h2>
          <p className="relative text-orange-100 text-lg mb-8 max-w-xl mx-auto">
            Join hundreds of Ethiopian creators and freelancers who already use Codevora Link to grow their audience.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-orange-500 font-bold px-8 py-3.5 rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
            >
              Create Your Free Page
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="bg-white/10 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
