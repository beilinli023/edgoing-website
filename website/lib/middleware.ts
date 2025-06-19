import { NextRequest, NextResponse } from 'next/server'
import { validateSession, AuthUser } from './auth'

// Mock user for development mode
const MOCK_USER: AuthUser = {
  id: 'dev-user-id',
  email: 'dev@edgoing.com',
  username: 'developer',
  role: 'ADMIN',
  name: 'Development User'
}

export async function requireAuth(request: NextRequest): Promise<{ user: AuthUser } | NextResponse> {
  // Check if authentication is disabled in development mode
  if (process.env.DISABLE_AUTH === 'true') {
    console.log('🔓 Authentication disabled in development mode')
    return { user: MOCK_USER }
  }

  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const user = await validateSession(token)
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    )
  }

  return { user }
}

export async function requireAdmin(request: NextRequest): Promise<{ user: AuthUser } | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  if (authResult.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  return authResult
}

export async function requireEditor(request: NextRequest): Promise<{ user: AuthUser } | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  if (!['ADMIN', 'EDITOR'].includes(authResult.user.role)) {
    return NextResponse.json(
      { error: 'Editor access required' },
      { status: 403 }
    )
  }

  return authResult
}
