import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Wrench, LayoutDashboard, Briefcase, History, Inbox, DollarSign, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/auth/actions'
import { isDevMode, devUser } from '@/lib/dev-mode'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user: ReturnType<typeof devUser> | null = null

  if (isDevMode()) {
    const cookieStore = await cookies()
    const role = cookieStore.get('dev_session')?.value as 'client' | 'tradesman' | undefined
    if (!role) redirect('/beta')
    user = devUser(role)
  } else {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user as ReturnType<typeof devUser> | null
  }

  if (!user) redirect('/login')

  const role = user.user_metadata?.role as 'client' | 'tradesman'

  const clientNav = [
    { href: '/client', label: 'My Requests', icon: LayoutDashboard },
    { href: '/client/active', label: 'Active Jobs', icon: Briefcase },
    { href: '/client/history', label: 'History', icon: History },
  ]

  const tradesmanNav = [
    { href: '/tradesman', label: 'Lead Inbox', icon: Inbox },
    { href: '/tradesman/jobs', label: 'My Jobs', icon: Briefcase },
    { href: '/tradesman/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/tradesman/profile', label: 'Profile', icon: User },
  ]

  const navItems = role === 'tradesman' ? tradesmanNav : clientNav
  const dashboardRoot = role === 'tradesman' ? '/tradesman' : '/client'

  return (
    <div className="min-h-screen flex bg-slate-50/80">
      {/* Sidebar */}
      <aside className="hidden sm:flex flex-col w-56 bg-white border-r shadow-sm shrink-0">
        <Link href={dashboardRoot} className="flex items-center gap-2 px-4 h-16 border-b font-bold text-slate-900 hover:bg-slate-50 transition-colors duration-150">
          <Wrench className="h-5 w-5 text-blue-600" />
          Brio
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white/95 backdrop-blur-sm shadow-sm flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 sm:hidden">
            <Wrench className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-slate-900">Brio</span>
          </div>
          <div className="hidden sm:block" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              {user.user_metadata?.full_name ?? user.email}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
