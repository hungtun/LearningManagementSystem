import { useCurrentUser } from '../contexts/UserContext.jsx'
import './MainLayout.css'

const ALL_NAV_ITEMS = [
  { key: 'courses',     label: 'Khóa học',   roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] },
  { key: 'assessments', label: 'Kiểm tra',   roles: ['STUDENT', 'INSTRUCTOR'] },
  { key: 'learning',   label: 'Học tập',     roles: ['STUDENT'] },
]

const ROLE_META = {
  STUDENT:    { label: 'Học viên',   color: '#059669', bg: '#d1fae5' },
  INSTRUCTOR: { label: 'Giảng viên', color: '#d97706', bg: '#fef3c7' },
  ADMIN:      { label: 'Quản trị',   color: '#dc2626', bg: '#fee2e2' },
}

function UserAvatar({ user }) {
  const initials = user?.fullName
    ? user.fullName.trim().split(/\s+/).slice(-2).map((w) => w[0]).join('').toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase()

  if (user?.avatarUrl) {
    return <img className="avatarImage" src={user.avatarUrl} alt={user.fullName} />
  }
  return <span className="avatarInitials">{initials}</span>
}

export default function MainLayout({ activeModule, onChangeModule, role: roleProp, onLogout, children }) {
  const { currentUser, isLoading } = useCurrentUser()

  const role = roleProp || currentUser?.role || 'STUDENT'
  const roleMeta = ROLE_META[role] || ROLE_META.STUDENT
  const navItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="sidebarBrand">
          <span className="brandIcon">L</span>
          <span className="brandName">LMS</span>
        </div>

        <nav className="sidebarNav">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={activeModule === item.key ? 'navItem active' : 'navItem'}
              onClick={() => onChangeModule(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="sidebarUser">
          <div className="sidebarAvatar">
            {!isLoading && <UserAvatar user={currentUser} />}
          </div>
          <div className="sidebarUserInfo">
            <p className="sidebarUserName">
              {isLoading ? '...' : (currentUser?.fullName || currentUser?.email || 'Unknown')}
            </p>
            <span
              className="sidebarUserRole"
              style={{ color: roleMeta.color, background: roleMeta.bg }}
            >
              {roleMeta.label}
            </span>
          </div>
          {onLogout && (
            <button type="button" className="logoutBtn" onClick={onLogout} title="Đăng xuất">
              &#8594;
            </button>
          )}
        </div>
      </aside>

      <div className="mainContent">
        <header className="topBar">
          <h2 className="topBarTitle">
            {ALL_NAV_ITEMS.find((i) => i.key === activeModule)?.label}
          </h2>
          <div className="topBarRight">
            {role && (
              <span
                className="roleBadge"
                style={{ color: roleMeta.color, background: roleMeta.bg, border: `1px solid ${roleMeta.color}30` }}
              >
                {roleMeta.label}
              </span>
            )}
            <span className="topBarUser">{currentUser?.fullName}</span>
          </div>
        </header>

        <div className="pageBody">{children}</div>
      </div>
    </div>
  )
}
