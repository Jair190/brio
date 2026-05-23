import { User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { isDevMode, devUser } from '@/lib/dev-mode'

export default async function TradesmanProfilePage() {
  let name = ''
  let email = ''
  let license = ''
  let bio = ''
  let radius = ''

  if (isDevMode()) {
    const u = devUser('tradesman')
    name = u.user_metadata.full_name
    email = u.email
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    name = user?.user_metadata?.full_name ?? ''
    email = user?.email ?? ''
    license = user?.user_metadata?.license_number ?? ''
    bio = user?.user_metadata?.bio ?? ''
    radius = user?.user_metadata?.service_radius_miles ?? ''
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">Your information shown to clients.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
              {name?.[0]?.toUpperCase() ?? <User className="h-6 w-6" />}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{name || '—'}</p>
              <p className="text-sm text-slate-500">{email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'License number', value: license || '—' },
            { label: 'Service radius', value: radius ? `${radius} miles` : '—' },
            { label: 'Bio', value: bio || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="border-t pt-4 first:border-t-0 first:pt-0">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{label}</p>
              <p className="text-sm text-slate-700">{value}</p>
            </div>
          ))}

          <div className="border-t pt-4">
            <p className="text-xs text-slate-400">Profile editing coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
