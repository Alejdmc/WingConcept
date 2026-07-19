import { NextResponse } from 'next/server'

const adminPaths = ['/admin']

function getAuthMeEndpoints(origin) {
  const bases = [
    process.env.INTERNAL_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    origin,
  ]
    .filter(Boolean)
    .map((base) => base.replace(/\/$/, ''))

  return [...new Set(bases.map((base) => `${base}/api/v1/auth/me`))]
}

async function fetchAuthUser(token, origin) {
  for (const url of getAuthMeEndpoints(origin)) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (res.ok) {
        return await res.json()
      }
    } catch {
      // probar siguiente endpoint
    }
  }
  return null
}

export async function middleware(request) {
  const token = request.cookies.get('access_token')?.value
  const isAdminPath = adminPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isAdminPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const user = await fetchAuthUser(token, request.nextUrl.origin)
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user.rol !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
