import Link from 'next/link'
import { ArrowRight, CheckCircle, Shield, Zap, Clock } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0C0A09' }}>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden grain" style={{ background: '#0C0A09' }}>
        <div className="bg-grid absolute inset-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #C26D21 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-36 text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 border border-amber-600/30 bg-amber-600/10 text-amber-400 text-xs font-medium px-3.5 py-1.5 rounded-full mb-8 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Private Beta · Bay Area
          </div>

          <h1 className="animate-fade-up delay-100 font-display text-5xl sm:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            Plumbing help,<br />
            <span className="text-copper">handled end-to-end.</span>
          </h1>

          <p className="animate-fade-up delay-200 text-lg text-stone-400 max-w-xl mx-auto leading-relaxed mb-10">
            AI-powered triage meets vetted Bay Area plumbers.
            Know what's wrong, what it'll cost, and who's coming — before anyone shows up.
          </p>

          <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/diagnose"
              className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm"
            >
              Get a free diagnosis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/founders"
              className="inline-flex items-center justify-center gap-2 border border-white/10 text-stone-300 hover:text-white hover:border-white/20 px-7 py-3.5 rounded-xl transition-all duration-200 text-sm"
            >
              Meet the team
            </Link>
          </div>

          <div className="animate-fade-up delay-400 flex items-center justify-center gap-6 mt-12 text-xs text-stone-500">
            {['Free diagnosis', 'No commitment', 'Licensed & insured plumbers'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-amber-600/70" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 px-6" style={{ background: '#FAF9F6' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-[0.2em] text-center mb-4">The problem</p>
          <h2 className="font-display text-4xl font-bold text-stone-900 text-center mb-4 leading-tight">
            Finding a plumber is broken.
          </h2>
          <p className="text-stone-500 text-center max-w-lg mx-auto mb-16 leading-relaxed">
            No transparency. No accountability. No idea what it's going to cost until someone's already at your door.
          </p>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                num: '01',
                title: 'Opaque pricing',
                desc: 'Quotes vary 3× with no explanation. You have no way to know if you\'re being overcharged until it\'s too late.',
              },
              {
                num: '02',
                title: 'Days of waiting',
                desc: 'Calling around takes hours. Getting anyone on-site can take days — even for urgent leaks.',
              },
              {
                num: '03',
                title: 'No recourse',
                desc: 'Once the job\'s done, you\'re on your own if the work was shoddy or the price wasn\'t what was discussed.',
              },
            ].map(({ num, title, desc }) => (
              <div key={num} className="group bg-white border border-stone-200 rounded-2xl p-7 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all duration-300">
                <p className="text-xs font-bold text-amber-600 mb-4 tracking-widest">{num}</p>
                <h3 className="font-display font-bold text-stone-900 text-xl mb-3">{title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-24 px-6 relative grain overflow-hidden" style={{ background: '#141210' }}>
        <div className="bg-grid absolute inset-0" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, #C26D21 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-[0.2em] text-center mb-4">How Brio works</p>
          <h2 className="font-display text-4xl font-bold text-white text-center mb-4 leading-tight">
            We fixed it.
          </h2>
          <p className="text-stone-400 text-center max-w-md mx-auto mb-16 leading-relaxed">
            AI triage + a curated network of vetted Bay Area plumbers. Transparent from start to finish.
          </p>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: Zap,
                title: 'AI diagnosis',
                desc: 'Describe your issue in plain English. Get an instant assessment — DIY or pro — with estimated costs before anyone shows up.',
              },
              {
                icon: Shield,
                title: 'Vetted plumbers',
                desc: 'Every tradesman is licensed, insured, and manually verified. No wildcards. We stand behind every pro we send.',
              },
              {
                icon: Clock,
                title: 'Full visibility',
                desc: 'Track your job from match through completion. Know when they\'re coming, what it costs, and what was done.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/8 rounded-2xl p-7 hover:bg-white/8 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center mb-5">
                  <Icon className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="font-display font-bold text-white text-xl mb-3">{title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-24 px-6" style={{ background: '#FAF9F6' }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-[0.2em] mb-4">The team</p>
          <h2 className="font-display text-4xl font-bold text-stone-900 mb-4">Built by people who get it.</h2>
          <p className="text-stone-500 mb-14 leading-relaxed max-w-lg mx-auto">
            Two founders with deep engineering and operations experience — and a genuine frustration with how broken home services are in the Bay Area.
          </p>

          <div className="flex justify-center gap-10 flex-wrap mb-12">
            {[
              { name: 'Jose Lopez', role: 'Co-founder & CEO', init: 'JL' },
              { name: 'Jair Galindo', role: 'Co-founder & CTO', init: 'JG' },
            ].map(({ name, role, init }) => (
              <div key={name} className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-2xl bg-stone-900 flex items-center justify-center font-display font-bold text-white text-lg">
                  {init}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-stone-900 text-sm">{name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{role}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/founders"
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            Read our story <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative grain overflow-hidden" style={{ background: '#0C0A09' }}>
        <div className="bg-grid absolute inset-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, #C26D21 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to fix it?</h2>
          <p className="text-stone-400 mb-8 leading-relaxed">
            Describe your problem. We'll tell you what it is, what it'll cost, and who can fix it.
          </p>
          <Link
            href="/diagnose"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200"
          >
            Get your free diagnosis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

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
