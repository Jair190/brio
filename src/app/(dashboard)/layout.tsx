import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { LayoutDashboard, Briefcase, History, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/auth/actions'
import { isDevMode, devUser } from '@/lib/dev-mode'
import { ClientNav } from './ClientNav'

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

  let role = user.user_metadata?.role as 'client' | 'tradesman' | undefined

  // Fallback: if role isn't in metadata, check team_members table.
  if (!role && !isDevMode()) {
    const supabase = await createClient()
    const { data: member } = await (supabase as any)
      .from('team_members')
      .select('id')
      .eq('user_id', user.id)
      .single() as { data: { id: string } | null }
    if (member) role = 'tradesman'
  }

  // Tradesman users get the full CRM shell from the nested (crm) layout.
  if (role === 'tradesman') {
    return <>{children}</>
  }

  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="min-h-screen flex" style={{ background: '#FAF9F6' }}>
      {/* Sidebar */}
      <aside className="hidden sm:flex flex-col w-56 shrink-0" style={{ background: '#fff', borderRight: '1px solid #e7e5e4' }}>
        {/* Logo */}
        <Link href="/client" className="flex items-center gap-2.5 px-5 h-16" style={{ borderBottom: '1px solid #f5f5f4' }}>
          <div className="w-6 h-6 rounded-md bg-amber-600 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 7C2 4.24 4.24 2 7 2C8.1 2 9.12 2.36 9.93 2.97L3.97 8.93C3.36 8.12 3 7.1 3 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 7C12 9.76 9.76 12 7 12C5.9 12 4.88 11.64 4.07 11.03L10.03 5.07C10.64 5.88 11 6.9 11 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-bold text-stone-900 text-base tracking-tight">Brio</span>
        </Link>

        {/* User greeting */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f5f5f4' }}>
          <p className="text-xs text-stone-400 mb-0.5">Signed in as</p>
          <p className="text-sm font-medium text-stone-700 truncate">{firstName}</p>
        </div>

        {/* Nav — client component for active highlighting */}
        <ClientNav />

        <div className="p-3 mt-auto" style={{ borderTop: '1px solid #f5f5f4' }}>
          {isDevMode() && (
            <Link
              href="/beta"
              className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-xs text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors duration-150 mb-1"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500/60" />
              Switch role
            </Link>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-lg text-sm text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
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
        <header className="h-14 flex items-center justify-between px-5 shrink-0" style={{ background: '#fff', borderBottom: '1px solid #e7e5e4' }}>
          {/* Mobile logo */}
          <div className="flex items-center gap-2 sm:hidden">
            <div className="w-6 h-6 rounded-md bg-amber-600 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <span className="font-display font-bold text-stone-900">Brio</span>
          </div>
          <div className="hidden sm:block" />
          <Link
            href="/client/new-request"
            className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all duration-200"
          >
            + New request
          </Link>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
