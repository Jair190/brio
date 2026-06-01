'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit({ password }: { password: string; confirm: string }) {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      return
    }
    router.push('/client')
  }

  return (
    <div className="min-h-screen relative grain overflow-hidden flex items-center justify-center p-6" style={{ background: '#0C0A09' }}>
      <div className="bg-grid absolute inset-0" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse, #C26D21 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-md bg-amber-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 7C2 4.24 4.24 2 7 2C8.1 2 9.12 2.36 9.93 2.97L3.97 8.93C3.36 8.12 3 7.1 3 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 7C12 9.76 9.76 12 7 12C5.9 12 4.88 11.64 4.07 11.03L10.03 5.07C10.64 5.88 11 6.9 11 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">Brio</span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Set new password</h1>
          <p className="text-stone-400 text-sm">Choose a strong password for your account</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-stone-300">New password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/60 transition-all duration-200"
                placeholder="At least 8 characters"
              />
              {errors.password && <p className="text-xs text-amber-400">{errors.password.message as string}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm" className="block text-sm font-medium text-stone-300">Confirm password</label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                {...register('confirm')}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-amber-600/60 transition-all duration-200"
                placeholder="••••••••"
              />
              {errors.confirm && <p className="text-xs text-amber-400">{errors.confirm.message as string}</p>}
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
              {isSubmitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
