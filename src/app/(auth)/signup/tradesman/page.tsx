'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
})

type FormValues = z.infer<typeof schema>

export default function TradesmanSignupPage() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function handleSubmit(values: FormValues) {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          role: 'tradesman',
          full_name: values.full_name,
          phone: values.phone,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/tradesman`,
      },
    })
    if (error) {
      setError(error.message)
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="animate-fade-up text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-600/15 border border-amber-600/20 flex items-center justify-center mx-auto mb-6">
          <Mail className="h-7 w-7 text-amber-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-3">Check your email</h2>
        <p className="text-stone-400 text-sm leading-relaxed max-w-xs mx-auto">
          We sent a confirmation link to your email. After confirming, you&apos;ll set up your company and start using the Brio CRM.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Join as a plumber</h1>
        <p className="text-stone-400 text-sm">
          You&apos;ll set up your company details after confirming your email.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="full_name" className="block text-sm font-medium text-stone-300">Full name</label>
            <input
              id="full_name"
              {...form.register('full_name')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/60 transition-all duration-200"
              placeholder="John Smith"
            />
            {form.formState.errors.full_name && (
              <p className="text-xs text-amber-400">{form.formState.errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-stone-300">Email</label>
            <input
              id="email"
              type="email"
              {...form.register('email')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/60 transition-all duration-200"
              placeholder="you@example.com"
            />
            {form.formState.errors.email && (
              <p className="text-xs text-amber-400">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-stone-300">Password</label>
            <input
              id="password"
              type="password"
              {...form.register('password')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/60 transition-all duration-200"
              placeholder="At least 8 characters"
            />
            {form.formState.errors.password && (
              <p className="text-xs text-amber-400">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-sm font-medium text-stone-300">Phone number</label>
            <input
              id="phone"
              type="tel"
              {...form.register('phone')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/60 transition-all duration-200"
              placeholder="(415) 555-0100"
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-amber-400">{form.formState.errors.phone.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-900/40 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm mt-2"
          >
            {form.formState.isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-stone-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-amber-600 hover:text-amber-500 transition-colors">Sign in</Link>
      </p>
    </div>
  )
}
