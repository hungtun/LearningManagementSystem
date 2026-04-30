import { useEffect, useState } from 'react'
import { getCurrentUser } from './api/users.js'
import { getToken, setToken } from './api/http.js'
import AdminDashboard from './pages/AdminDashboard.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import InstructorDashboard from './pages/InstructorDashboard.jsx'
import LoginPage from './pages/LoginPage.jsx'

function hasRole(user, roleName) {
  return Array.isArray(user?.roles) && user.roles.includes(roleName)
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(getToken()))
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (!getToken()) {
      setIsLoading(false)
      return
    }
    getCurrentUser()
      .then((user) => {
        setCurrentUser(user)
        setIsAuthenticated(true)
      })
      .catch(() => {
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  function handleLoginSuccess(user) {
    setCurrentUser(user)
    setIsAuthenticated(true)
  }

  function handleLoggedOut() {
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontSize: 16, color: '#666' }}>
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  if (hasRole(currentUser, 'ADMIN')) {
    return <AdminDashboard currentUser={currentUser} onLoggedOut={handleLoggedOut} />
  }

  if (hasRole(currentUser, 'INSTRUCTOR')) {
    return <InstructorDashboard currentUser={currentUser} onLoggedOut={handleLoggedOut} />
  }

  return <DashboardPage currentUser={currentUser} onLoggedOut={handleLoggedOut} />
}
