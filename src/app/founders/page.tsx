import Link from 'next/link'
import { ArrowLeft, ExternalLink, ArrowRight } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

const founders = [
  {
    name: 'Jose Lopez',
    role: 'Co-founder & CEO',
    initials: 'JL',
    bio: [
      'Jose brings operational and business development experience to Brio, focused on building the go-to-market strategy and tradesman network in the Bay Area.',
      'He\'s passionate about creating economic opportunity for skilled tradespeople while improving the experience for homeowners who have long been underserved by the status quo.',
      'Brio is his effort to build a company that does both — makes money and genuinely helps people.',
    ],
    links: {
      linkedin: 'https://linkedin.com/in/joselopez',
    },
  },
  {
    name: 'Jair Galindo',
    role: 'Co-founder & CTO',
    initials: 'JG',
    bio: [
      'Jair is a data engineer from Meta with experience building large-scale distributed systems across infrastructure and machine learning pipelines.',
      'He\'s transitioning his career fully into software engineering and entrepreneurship, with a focus on applying AI to industries that have historically been opaque and inefficient.',
      'Brio was born out of his own frustration trying to find a reliable plumber — and the belief that the home services industry is overdue for a transparent, tech-driven alternative.',
    ],
    links: {
      linkedin: 'https://linkedin.com/in/jairgalindo',
      github: 'https://github.com/jairgalindo',
    },
  },
]

export default function FoundersPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0C0A09' }}>
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative grain overflow-hidden py-24 px-6" style={{ background: '#0C0A09' }}>
          <div className="bg-grid absolute inset-0" />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(ellipse, #C26D21 0%, transparent 70%)' }}
          />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-amber-600/30 bg-amber-600/10 text-amber-400 text-xs font-medium px-3.5 py-1.5 rounded-full mb-8 tracking-widest uppercase">
              The team
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-white leading-tight mb-5">
              Meet the founders
            </h1>
            <p className="text-stone-400 text-lg max-w-xl mx-auto leading-relaxed">
              Two people who got tired of the broken home services experience and decided to fix it.
            </p>
          </div>
        </section>

        {/* Founders — cream section */}
        <section className="py-24 px-6" style={{ background: '#FAF9F6' }}>
          <div className="max-w-4xl mx-auto space-y-20">
            {founders.map(({ name, role, initials, bio, links }) => (
              <div key={name} className="flex flex-col sm:flex-row gap-10 items-start">
                <div className="flex-shrink-0">
                  <div className="h-20 w-20 rounded-2xl bg-stone-900 flex items-center justify-center font-display font-bold text-white text-2xl">
                    {initials}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-5">
                    <h2 className="font-display text-2xl font-bold text-stone-900">{name}</h2>
                    <p className="text-amber-600 font-medium text-sm mt-0.5">{role}</p>
                  </div>
                  <div className="space-y-4">
                    {bio.map((paragraph, i) => (
                      <p key={i} className="text-stone-600 leading-relaxed">{paragraph}</p>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-6">
                    {links.linkedin && (
                      <a
                        href={links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-amber-600 transition-colors duration-150"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        LinkedIn
                      </a>
                    )}
                    {('github' in links) && links.github && (
                      <a
                        href={(links as { linkedin: string; github?: string }).github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors duration-150"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why we're building this */}
        <section className="py-20 px-6 relative grain overflow-hidden" style={{ background: '#141210' }}>
          <div className="bg-grid absolute inset-0" />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-[0.2em] mb-4">Our mission</p>
            <h2 className="font-display text-3xl font-bold text-white mb-6 leading-tight">
              Why we&apos;re building this
            </h2>
            <p className="text-stone-400 leading-relaxed max-w-2xl mx-auto mb-5">
              We both experienced the same frustration — calling five plumbers, getting three wildly different quotes,
              waiting three days for someone to show up, and having no idea if the work was actually done right.
            </p>
            <p className="text-stone-400 leading-relaxed max-w-2xl mx-auto">
              The trades industry employs millions of people and touches every home — but it&apos;s running on
              phone calls, paper invoices, and word of mouth. Brio is our attempt to change that,
              starting with plumbing in the Bay Area.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center" style={{ background: '#FAF9F6' }}>
          <div className="max-w-lg mx-auto">
            <p className="font-display text-2xl font-bold text-stone-900 mb-3">Interested in what we&apos;re building?</p>
            <p className="text-stone-500 text-sm mb-8">Get AI-powered plumbing help or join as a licensed contractor.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/client/new-request"
                className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm"
              >
                Get a free diagnosis <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border border-stone-300 text-stone-600 hover:border-stone-400 hover:text-stone-800 px-6 py-3 rounded-xl transition-all duration-200 text-sm"
              >
                <ArrowLeft className="h-4 w-4" /> Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: '#0C0A09' }} className="border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-600 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <span className="font-display font-bold text-white">Brio</span>
          </div>
          <p className="text-xs text-stone-500">Bay Area · Private Beta · 2025</p>
          <div className="flex gap-6 text-xs text-stone-500">
            <Link href="/founders" className="hover:text-stone-400 transition-colors">Founders</Link>
            <Link href="/signup/tradesman" className="hover:text-stone-400 transition-colors">For Plumbers</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
