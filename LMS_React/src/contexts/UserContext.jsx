import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser } from '../api/users.js'
import { getToken } from '../api/http.js'

/**
 * Normalize role string to one of ADMIN | INSTRUCTOR | STUDENT.
 * Primary source: role field returned by /api/users/me.
 * Fallback: decode JWT payload (only works if backend embeds role claims).
 */
function normalizeRole(roleStr) {
  if (!roleStr) return 'STUDENT'
  const r = roleStr.toUpperCase().replace('ROLE_', '')
  if (r.includes('ADMIN')) return 'ADMIN'
  if (r.includes('INSTRUCTOR')) return 'INSTRUCTOR'
  return 'STUDENT'
}

function parseRoleFromToken(token) {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    )
    const auths = payload.authorities || payload.roles || payload.role || []
    const list = Array.isArray(auths) ? auths : [auths]
    const str = list.map((a) => (typeof a === 'object' ? a.authority || '' : String(a))).join(' ')
    return normalizeRole(str)
  } catch {
    return 'STUDENT'
  }
}

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  async function refreshUser() {
    const token = getToken()
    if (!token) {
      setCurrentUser(null)
      return
    }
    try {
      const user = await getCurrentUser()
      // Prefer role from API response; fall back to JWT if backend doesn't include it
      const role = user.role ? normalizeRole(user.role) : parseRoleFromToken(token)
      setCurrentUser({ ...user, role })
    } catch {
      setCurrentUser(null)
    }
  }

  useEffect(() => {
    async function loadUser() {
      const token = getToken()
      if (!token) {
        setCurrentUser(null)
        setIsLoading(false)
        return
      }
      try {
        const user = await getCurrentUser()
        // Prefer role from API response; fall back to JWT if backend doesn't include it
        const role = user.role ? normalizeRole(user.role) : parseRoleFromToken(token)
        setCurrentUser({ ...user, role })
      } catch {
        // Token invalid or expired — force re-login
        setCurrentUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadUser()
  }, [])

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, isLoading, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCurrentUser() {
  return useContext(UserContext)
}
