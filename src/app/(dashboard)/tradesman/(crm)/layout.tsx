import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { LayoutDashboard, Users, Columns3, Calendar, CheckSquare, Activity, Inbox, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/auth/actions'
import { isDevMode, devUser } from '@/lib/dev-mode'

const NAV = [
  { href: '/tradesman',            label: 'Overview',   icon: LayoutDashboard },
  { href: '/tradesman/clients',    label: 'Clients',    icon: Users },
  { href: '/tradesman/pipeline',   label: 'Pipeline',   icon: Columns3 },
  { href: '/tradesman/calendar',   label: 'Calendar',   icon: Calendar },
  { href: '/tradesman/tasks',      label: 'Tasks',      icon: CheckSquare },
  { href: '/tradesman/activity',   label: 'Activity',   icon: Activity },
]

const NAV_SECONDARY = [
  { href: '/tradesman/marketplace', label: 'Marketplace', icon: Inbox },
  { href: '/tradesman/settings',    label: 'Settings',    icon: Settings },
]

export default async function CRMLayout({ children }: { children: React.ReactNode }) {
  let userName = 'Plumber'
  let orgName = 'My Company'

  if (isDevMode()) {
    const cookieStore = await cookies()
    const role = cookieStore.get('dev_session')?.value
    if (role !== 'tradesman') redirect('/beta')
    userName = devUser('tradesman').user_metadata.full_name
    orgName = 'Test Plumbing Co.'
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: member } = await (supabase as any)
      .from('team_members')
      .select('name, organizations(name)')
      .eq('user_id', user.id)
      .single() as { data: { name: string; organizations: { name: string } | null } | null }

    if (!member) redirect('/tradesman/onboarding')

    userName = member.name
    orgName = member.organizations?.name ?? 'My Company'
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0F0D0B' }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0" style={{ background: '#141210', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Org header */}
        <div className="flex items-center gap-3 px-5 h-16" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-7 h-7 rounded-md bg-amber-600 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 7C2 4.24 4.24 2 7 2C8.1 2 9.12 2.36 9.93 2.97L3.97 8.93C3.36 8.12 3 7.1 3 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 7C12 9.76 9.76 12 7 12C5.9 12 4.88 11.64 4.07 11.03L10.03 5.07C10.64 5.88 11 6.9 11 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-none truncate">{orgName}</p>
            <p className="text-stone-500 text-xs mt-0.5 tracking-wide">CRM</p>
          </div>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-500 hover:bg-white/5 hover:text-white transition-all duration-150"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}

          <div className="my-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

          {NAV_SECONDARY.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-500 hover:bg-white/5 hover:text-white transition-all duration-150"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="px-3 text-xs text-stone-400 mb-2 truncate">{userName}</p>
          {isDevMode() && (
            <Link
              href="/beta"
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-xs text-stone-600 hover:bg-white/5 hover:text-stone-400 transition-all duration-150 mb-1"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600/60 shrink-0" />
              Switch role
            </Link>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-stone-500 hover:bg-white/5 hover:text-red-400 transition-all duration-150"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden h-14 flex items-center px-4 gap-3" style={{ background: '#141210', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-6 h-6 rounded-md bg-amber-600 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <span className="text-white font-semibold text-sm">{orgName}</span>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
