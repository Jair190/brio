'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Wrench, ChevronRight, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const step1Schema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
})

const step2Schema = z.object({
  license_number: z.string().min(1, 'License number is required'),
  years_experience: z.number().min(0).max(60),
  bio: z.string().min(20, 'Tell clients a bit about yourself (min 20 chars)'),
  service_radius_miles: z.string(),
})

type Step1Values = z.infer<typeof step1Schema>
type Step2Values = z.infer<typeof step2Schema>

export default function TradesmanSignupPage() {
  const [step, setStep] = useState(1)
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form1 = useForm<Step1Values>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { service_radius_miles: '25' },
  })

  function handleStep1(values: Step1Values) {
    setStep1Data(values)
    setStep(2)
  }

  async function handleStep2(values: Step2Values) {
    if (!step1Data) return
    setError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: step1Data.email,
      password: step1Data.password,
      options: {
        data: {
          role: 'tradesman',
          full_name: step1Data.full_name,
          phone: step1Data.phone,
          license_number: values.license_number,
          years_experience: String(values.years_experience),
          bio: values.bio,
          service_radius_miles: values.service_radius_miles,
        },
      },
    })
    if (error) {
      setError(error.message)
      return
    }
    if (data.user) {
      await supabase.from('tradesmen').insert({
        id: data.user.id,
        full_name: step1Data.full_name,
        license_number: values.license_number,
        service_area: `${values.service_radius_miles} mile radius`,
        verified: false,
      })
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-2">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-semibold">Check your email</h2>
          <p className="text-slate-500 text-sm">
            We sent a confirmation link to your email. Once confirmed, you can set up your subscription and start receiving leads.
          </p>
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
        <CardTitle className="text-2xl">Join as a plumber</CardTitle>
        <div className="flex justify-center gap-2 mt-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full transition-colors ${s <= step ? 'bg-blue-600' : 'bg-slate-200'}`}
            />
          ))}
        </div>
        <p className="text-sm text-slate-500">Step {step} of 2</p>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" {...form1.register('full_name')} />
              {form1.formState.errors.full_name && (
                <p className="text-sm text-red-500">{form1.formState.errors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form1.register('email')} />
              {form1.formState.errors.email && (
                <p className="text-sm text-red-500">{form1.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form1.register('password')} />
              {form1.formState.errors.password && (
                <p className="text-sm text-red-500">{form1.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" type="tel" {...form1.register('phone')} />
              {form1.formState.errors.phone && (
                <p className="text-sm text-red-500">{form1.formState.errors.phone.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={form2.handleSubmit(handleStep2)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="license_number">Plumbing license number</Label>
              <Input id="license_number" {...form2.register('license_number')} />
              {form2.formState.errors.license_number && (
                <p className="text-sm text-red-500">{form2.formState.errors.license_number.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="years_experience">Years of experience</Label>
              <Input id="years_experience" type="number" min={0} {...form2.register('years_experience', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bio">About you</Label>
              <Textarea
                id="bio"
                placeholder="Tell clients about your experience, specialties, and what sets you apart…"
                rows={3}
                {...form2.register('bio')}
              />
              {form2.formState.errors.bio && (
                <p className="text-sm text-red-500">{form2.formState.errors.bio.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Service radius</Label>
              <Select
                defaultValue="25"
                onValueChange={(val) => form2.setValue('service_radius_miles', val ?? '25')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button type="submit" className="flex-1" disabled={form2.formState.isSubmitting}>
                {form2.formState.isSubmitting ? 'Creating account…' : 'Create account'}
              </Button>
            </div>
          </form>
        )}
        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  )
}
