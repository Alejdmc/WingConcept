import { NextResponse } from 'next/server'

const adminPaths = ['/admin']

export async function middleware(request) {
  const token = request.cookies.get('access_token')?.value
  const isAdminPath = adminPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (isAdminPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Validar token con backend
    try {
      const apiBase = process.env.INTERNAL_API_URL || request.nextUrl.origin
      const res = await fetch(`${apiBase}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      const user = await res.json()
      
      // Solo admin accede
      if (user.rol !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}