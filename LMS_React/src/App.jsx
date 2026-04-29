import { getToken, setToken } from './api/http.js'
import LoginPage from './pages/LoginPage.jsx'
import WorkspacePage from './pages/WorkspacePage.jsx'
import { useCurrentUser } from './contexts/UserContext.jsx'

export default function App() {
  const { currentUser, setCurrentUser, isLoading, refreshUser } = useCurrentUser()

  function handleLoginSuccess() {
    // Token is already saved by LoginPage — re-fetch user + parse role from JWT
    refreshUser()
  }

  function handleLogout() {
    setToken(null)
    setCurrentUser(null)
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#64748b', fontSize: 16 }}>
        Đang tải...
      </div>
    )
  }

  if (!getToken() || !currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return <WorkspacePage onLogout={handleLogout} />
}
