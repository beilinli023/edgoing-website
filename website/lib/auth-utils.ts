// Development mode authentication utilities

export const MOCK_USER = {
  id: 'dev-user-id',
  email: 'dev@edgoing.com',
  username: 'developer',
  role: 'ADMIN',
  name: 'Development User'
}

export const isAuthDisabled = () => {
  return process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'
}

export const checkAuthWithFallback = async (
  router: any,
  setUser: (user: any) => void,
  redirectPath: string = '/admin/login'
) => {
  try {
    const response = await fetch('/api/auth/me')
    if (response.ok) {
      const data = await response.json()
      setUser(data.user)
    } else {
      // Only redirect to login if authentication is not disabled
      if (!isAuthDisabled()) {
        router.push(redirectPath)
        return
      } else {
        console.log('🔓 Authentication disabled - using development mode')
        setUser(MOCK_USER)
      }
    }
  } catch (error) {
    console.error('Auth check failed:', error)
    // Only redirect to login if authentication is not disabled
    if (!isAuthDisabled()) {
      router.push(redirectPath)
      return
    } else {
      console.log('🔓 Authentication disabled - using development mode')
      setUser(MOCK_USER)
    }
  }
}
