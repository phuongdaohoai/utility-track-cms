import type { FC, ReactNode } from 'react'
import { createContext, useState, useCallback } from 'react'

interface User {
  id?: number
  email?: string
  name?: string
}

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  login: (userData: User) => void
  logout: () => void
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const login = useCallback((userData: User): void => {
    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback((): void => {
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return (
    <UserContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export default UserContext
