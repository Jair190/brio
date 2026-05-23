'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
      redirectTo: `${window.location.origin}/update-password`,
    })
    setSent(true)
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-2">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-semibold">Check your email</h2>
          <p className="text-slate-500 text-sm">
            If an account exists for that email, we sent a password reset link.
          </p>
          <Link href="/login" className="text-blue-600 hover:underline text-sm block mt-4">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Wrench className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <p className="text-sm text-slate-500">Enter your email and we&apos;ll send a reset link</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message as string}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">
          <Link href="/login" className="text-blue-600 hover:underline">Back to sign in</Link>
        </p>
      </CardContent>
    </Card>
  )
}
