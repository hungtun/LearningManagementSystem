import { useState } from 'react'
import { getToken } from './api/http.js'
import DashboardPage from './pages/DashboardPage.jsx'
import LoginPage from './pages/LoginPage.jsx'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getToken()))

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  return <DashboardPage onLoggedOut={() => setIsAuthenticated(false)} />
}
