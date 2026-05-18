import { NextRequest, NextResponse } from 'next/server'
import { verifyBasicAuth, getUnauthorizedResponse } from './lib/auth'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public assets and static files
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)
  ) {
    return NextResponse.next()
  }

  // Protect all API routes - require basic auth for API calls
  if (pathname.startsWith('/api/')) {
    if (!verifyBasicAuth(request)) {
      return getUnauthorizedResponse()
    }
  }

  // Allow main page to load (auth will be handled client-side)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
