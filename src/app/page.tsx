import Link from 'next/link'
import { Wrench, Zap, ShieldCheck, Clock, ArrowRight, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/layout/Navbar'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1d4ed8_0%,_transparent_60%)] opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#1e3a5f_0%,_transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <span className="inline-block bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            Private Beta · Bay Area
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight">
            Plumbing help,{' '}
            <span className="text-blue-400">handled end-to-end.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Brio uses AI to diagnose your plumbing issue, tell you if you can fix
            it yourself, or connect you with a vetted Bay Area plumber — transparently
            priced, start to finish.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/founders">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 transition-all duration-200">
                Meet the team <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <span className="inline-flex items-center justify-center text-sm text-slate-500 border border-slate-700 rounded-lg px-6 py-2.5">
              🚧 Product in development
            </span>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            The problem with plumbing today
          </h2>
          <p className="text-slate-700 text-center max-w-2xl mx-auto mb-14">
            Finding a trustworthy plumber in the Bay Area is a broken experience. Prices are opaque,
            quality is inconsistent, and there's no visibility into what's actually happening with your job.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: 'No transparency',
                desc: 'Quotes vary wildly with no explanation. You have no idea if you\'re being overcharged.',
              },
              {
                title: 'Slow response',
                desc: 'Calling around takes hours. Getting someone out can take days — even for urgent issues.',
              },
              {
                title: 'No accountability',
                desc: 'Once the job\'s done, there\'s little recourse if the work was poor quality.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="border rounded-xl p-6 bg-white shadow-sm ring-1 ring-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20 px-6 bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How Brio fixes it</h2>
          <p className="text-slate-400 text-center max-w-xl mx-auto mb-14">
            We combine AI triage with a curated network of vetted Bay Area plumbers — so you always know
            what you're getting and what it'll cost before anyone shows up.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="h-6 w-6 text-blue-400" />,
                title: 'AI diagnosis',
                desc: 'Describe your issue in plain English. Our AI tells you if it\'s DIY or needs a pro — instantly, for free.',
              },
              {
                icon: <ShieldCheck className="h-6 w-6 text-blue-400" />,
                title: 'Vetted plumbers',
                desc: 'Every tradesman is licensed, insured, and manually verified before they can access a single lead.',
              },
              {
                icon: <Clock className="h-6 w-6 text-blue-400" />,
                title: 'Real-time tracking',
                desc: 'Follow your job from match to arrival to completion. No more wondering when someone will show up.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-slate-900 rounded-xl p-6 border border-slate-700 shadow-lg hover:bg-slate-800 transition-all duration-200">
                <div className="mb-4">{icon}</div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders teaser */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Built by people who get it</h2>
          <p className="text-slate-700 mb-10 max-w-xl mx-auto">
            Brio is built by a two-person team with experience in large-scale engineering
            and operations — and a genuine frustration with how broken home services are.
          </p>
          <div className="flex justify-center gap-6 flex-wrap mb-10">
            {[
              { name: 'Jose Lopez', role: 'Co-founder & CEO' },
              { name: 'Jair Galindo', role: 'Co-founder & CTO' },
            ].map(({ name, role }) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xl">
                  {name[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{name}</p>
                  <p className="text-xs text-slate-500">{role}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/founders" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150">
            Meet the team <ChevronRight className="h-4 w-4 ml-0.5" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-slate-950 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Currently in development
          </span>
          <h2 className="text-3xl font-bold mb-4">We&apos;re building this in the open</h2>
          <p className="text-slate-400 mb-8 text-lg leading-relaxed">
            Brio is in active development in the Bay Area. We&apos;re working with our first
            clients and plumbers to get this right before opening up more broadly.
          </p>
          <Link href="/founders">
            <Button size="lg" variant="ghost" className="border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 px-8 transition-all duration-200">
              Learn about the team <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

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
          </div>
        </div>
      </footer>
    </div>
  )
}
