import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Handle protected routes
  if (!user && (pathname.startsWith('/patient') || pathname.startsWith('/doctor'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)
    // Copy cookies to redirect response
    supabaseResponse.cookies.getAll().forEach(c => redirectResponse.cookies.set(c))
    return redirectResponse
  }

  // Handle authenticated users on login/register pages
  if (user && (pathname === '/login' || pathname.startsWith('/register'))) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    const url = request.nextUrl.clone()
    if (userData?.role === 'doctor') {
      url.pathname = '/doctor/dashboard'
    } else {
      url.pathname = '/patient/dashboard'
    }
    const redirectResponse = NextResponse.redirect(url)
    // Copy cookies to redirect response
    supabaseResponse.cookies.getAll().forEach(c => redirectResponse.cookies.set(c))
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
