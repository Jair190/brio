import Link from 'next/link'
import { ArrowRight, Wrench, Home } from 'lucide-react'

export default function SignupPage() {
  return (
    <div className="animate-fade-up w-full">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Join Brio</h1>
        <p className="text-stone-400 text-sm">How will you use Brio?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/signup/client" className="group">
          <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col items-center text-center gap-5 hover:bg-white/8 hover:border-amber-600/30 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-amber-600/15 border border-amber-600/20 flex items-center justify-center group-hover:bg-amber-600/25 transition-colors duration-300">
              <Home className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-lg mb-2">I need a plumber</p>
              <p className="text-sm text-stone-400 leading-relaxed">
                Describe your issue, get expert guidance, and have a trusted plumber sent to your door.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-600 group-hover:text-amber-500 transition-colors mt-auto">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </Link>

        <Link href="/signup/tradesman" className="group">
          <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col items-center text-center gap-5 hover:bg-white/8 hover:border-amber-600/30 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-stone-700/40 border border-stone-600/30 flex items-center justify-center group-hover:bg-amber-600/15 group-hover:border-amber-600/20 transition-all duration-300">
              <Wrench className="h-6 w-6 text-stone-300 group-hover:text-amber-400 transition-colors duration-300" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-lg mb-2">I&apos;m a plumber</p>
              <p className="text-sm text-stone-400 leading-relaxed">
                Get quality leads, manage your jobs, and grow your plumbing business in the Bay Area.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 group-hover:text-amber-600 transition-colors mt-auto">
              Apply now <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </Link>
      </div>

      <p className="text-center text-sm text-stone-500 mt-8">
        Already have an account?{' '}
        <Link href="/login" className="text-amber-600 hover:text-amber-500 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
