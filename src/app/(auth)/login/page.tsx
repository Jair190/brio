'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { devLogin } from '@/lib/auth/dev-login'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    const { data, error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      setError('Invalid email or password.')
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <Card className="shadow-lg ring-1 ring-slate-200/50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Wrench className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <p className="text-sm text-slate-600">Sign in to your Brio account</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && (
              <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline transition-colors duration-150">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
            {errors.password && (
              <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">{errors.password.message}</p>
            )}
          </div>
          {error && (
            <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">{error}</p>
          )}
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="text-center text-sm text-slate-600 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline transition-colors duration-150">
            Sign up
          </Link>
        </p>
        {DEV_MODE && (
          <p className="text-center text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
            Dev mode — any credentials will work
          </p>
        )}
      </CardContent>
    </Card>
  )
}
