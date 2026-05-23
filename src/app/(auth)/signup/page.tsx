import Link from 'next/link'
import { Wrench, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <Wrench className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Join Brio</h1>
        <p className="text-slate-500 mt-1">How will you use Brio?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/signup/client">
          <Card className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all h-full">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-3">
                <div className="bg-blue-100 rounded-full p-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle>I need a plumber</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-slate-500">
                Describe your issue, get expert guidance, and have a trusted plumber sent to your door.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/signup/tradesman">
          <Card className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all h-full">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-3">
                <div className="bg-slate-100 rounded-full p-4">
                  <Wrench className="h-8 w-8 text-slate-600" />
                </div>
              </div>
              <CardTitle>I&apos;m a plumber</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-slate-500">
                Get quality leads, manage your jobs, and grow your plumbing business in the Bay Area.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
