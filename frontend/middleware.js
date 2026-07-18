import { NextResponse } from 'next/server'

const adminPaths = ['/admin']

function getApiBase() {
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8000'
  )
}

export async function middleware(request) {
  const token = request.cookies.get('access_token')?.value
  const isAdminPath = adminPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isAdminPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!res.ok) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      const user = await res.json()
      if (user.rol !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
