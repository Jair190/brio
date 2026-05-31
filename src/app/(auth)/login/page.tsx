'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { devLogin } from '@/lib/auth/dev-login'

const DEV_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('http')

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setError(null)
    if (DEV_MODE) {
      await devLogin()
      return
    }
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      setError('Invalid email or password.')
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="animate-fade-up">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-stone-400 text-sm">Sign in to your Brio account</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-stone-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/60 focus:bg-white/8 transition-all duration-200"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-xs text-amber-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-sm font-medium text-stone-300">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-amber-600 hover:text-amber-500 transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/60 focus:bg-white/8 transition-all duration-200"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-amber-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-900/40 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm mt-2"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-stone-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-amber-600 hover:text-amber-500 transition-colors">
          Sign up
        </Link>
      </p>

      {DEV_MODE && (
        <div className="mt-4 bg-amber-900/20 border border-amber-800/30 rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-amber-600">Dev mode — any credentials will work</p>
        </div>
      )}
    </div>
  )
}
