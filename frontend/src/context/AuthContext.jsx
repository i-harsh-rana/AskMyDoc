import { useCallback, useMemo, useState } from 'react'
import { authApi, setAuthToken } from '../lib/api'
import { AuthContext } from './auth-context'

const TOKEN_KEY = 'askmydoc_token'
const USER_KEY = 'askmydoc_user'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(readStoredUser)

  const persist = useCallback((nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    setAuthToken(nextToken)
    if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken)
    else localStorage.removeItem(TOKEN_KEY)
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    else localStorage.removeItem(USER_KEY)
  }, [])

  const login = useCallback(
    async ({ email, password }) => {
      const { token: nextToken, user: nextUser } = await authApi.login({
        email,
        password,
      })
      persist(nextToken, nextUser)
      return nextUser
    },
    [persist],
  )

  const register = useCallback(
    async ({ name, email, password }) => {
      await authApi.register({ name, email, password })
      return login({ email, password })
    },
    [login],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      persist(null, null)
      return
    }
    persist(null, null)
  }, [persist])

  const value = useMemo(
    () => ({ token, user, isAuthenticated: !!token, login, register, logout }),
    [token, user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
