import Link from 'next/link'
import { Wrench, ArrowLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/layout/Navbar'

const founders = [
  {
    name: 'Jose Lopez',
    role: 'Co-founder & CEO',
    initials: 'JL',
    avatarClass: 'bg-slate-200 text-slate-600',
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
    avatarClass: 'bg-blue-100 text-blue-700',
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
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-slate-950 text-white py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
              The team
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Meet the founders
            </h1>
            <p className="mt-5 text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
              Two people who got tired of the broken home services experience and decided to fix it.
            </p>
          </div>
        </section>

        {/* Founders */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto space-y-16">
            {founders.map(({ name, role, initials, avatarClass, bio, links }) => (
              <div key={name} className="flex flex-col sm:flex-row gap-10 items-start">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`h-24 w-24 rounded-2xl flex items-center justify-center font-bold text-3xl border border-slate-200 ${avatarClass}`}>
                    {initials}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">{name}</h2>
                    <p className="text-blue-600 font-medium text-sm mt-0.5">{role}</p>
                  </div>

                  <div className="space-y-4">
                    {bio.map((paragraph, i) => (
                      <p key={i} className="text-slate-700 leading-relaxed">{paragraph}</p>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-5">
                    {links.linkedin && (
                      <a
                        href={links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors duration-150"
                      >
                        <ExternalLink className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                    {('github' in links) && links.github && (
                      <a
                        href={links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-150"
                      >
                        <ExternalLink className="h-4 w-4" />
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
        <section className="py-16 px-6 bg-slate-50 border-t border-slate-100">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Why we&apos;re building this</h2>
            <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto mb-6">
              We both experienced the same frustration — calling five plumbers, getting three wildly different quotes,
              waiting three days for someone to show up, and having no idea if the work was actually done right.
            </p>
            <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto">
              The trades industry employs millions of people and touches every home — but it&apos;s running on
              phone calls, paper invoices, and word of mouth. Brio is our attempt to change that,
              starting with plumbing in the Bay Area.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 text-center bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-lg mx-auto space-y-4">
            <p className="text-slate-600 text-lg font-medium">Interested in what we&apos;re building?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/beta">
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 transition-all duration-200">
                  Request Beta Access
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full sm:w-auto text-slate-600 hover:text-slate-800 transition-colors duration-150">
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to home
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10 px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Wrench className="h-4 w-4 text-blue-400" />
            Brio
          </div>
          <p className="text-xs">Bay Area · Private Beta · 2025</p>
          <div className="flex gap-5 text-xs">
            <Link href="/founders" className="hover:text-white transition-colors duration-150">Founders</Link>
            <Link href="/beta" className="hover:text-white transition-colors duration-150">Beta Access</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
