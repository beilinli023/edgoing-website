import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Only apply middleware to admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip middleware for login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check if authentication is disabled (only in development)
    if (process.env.DISABLE_AUTH === 'true' && process.env.NODE_ENV === 'development') {
      console.log('🔓 Middleware: Authentication disabled in development mode')
      return NextResponse.next()
    }

    // Check for auth token
    const authToken = request.cookies.get('auth-token')?.value

    if (!authToken) {
      // Redirect to login page if no token
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Token exists, let the request proceed
    // The actual token validation will be done by the API routes
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all admin routes except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/admin/:path*'
  ]
}
