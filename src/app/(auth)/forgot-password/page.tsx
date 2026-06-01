'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit({ email }: { email: string }) {
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    })
    setSent(true)
  }

  if (sent) {
    return (
      <div className="animate-fade-up text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-600/15 border border-amber-600/20 flex items-center justify-center mx-auto mb-6">
          <Mail className="h-7 w-7 text-amber-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-3">Check your email</h2>
        <p className="text-stone-400 text-sm leading-relaxed max-w-xs mx-auto mb-6">
          If an account exists for that email, we sent a password reset link.
        </p>
        <Link href="/login" className="text-sm text-amber-600 hover:text-amber-500 transition-colors">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Reset your password</h1>
        <p className="text-stone-400 text-sm">Enter your email and we&apos;ll send a reset link</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-stone-300">Email</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/60 transition-all duration-200"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-xs text-amber-400">{errors.email.message as string}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm"
          >
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-stone-500 mt-6">
        <Link href="/login" className="text-amber-600 hover:text-amber-500 transition-colors">Back to sign in</Link>
      </p>
    </div>
  )
}
