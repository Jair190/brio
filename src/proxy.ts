import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const pathname = request.nextUrl.pathname

  const protectedPrefixes = ['/dashboard', '/client', '/tradesman', '/diagnose']
  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p))

  // Skip Supabase auth when not configured — use dev session cookie instead
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    const devSession = request.cookies.get('dev_session')?.value
    const hasDevSession = devSession === 'client' || devSession === 'tradesman'
    if (isProtected && !hasDevSession) {
      return NextResponse.redirect(new URL('/beta', request.url))
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (pathname === '/login' || pathname.startsWith('/signup'))) {
    // Tradesman signup → always send to /tradesman (CRM layout handles onboarding redirect if needed)
    if (pathname.startsWith('/signup/tradesman')) {
      return NextResponse.redirect(new URL('/tradesman', request.url))
    }
    const role = user.user_metadata?.role
    const dest = role === 'tradesman' ? '/tradesman' : '/client'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
