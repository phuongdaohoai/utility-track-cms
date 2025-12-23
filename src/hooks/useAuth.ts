import { useState, useCallback } from 'react'

interface User {
  id?: number
  email?: string
  name?: string
}

interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      // TODO: Implement actual login logic
      // const response = await authService.login(email, password);
      // setUser(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback((): void => {
    setUser(null)
  }, [])

  return { user, loading, error, login, logout }
}

export default useAuth
