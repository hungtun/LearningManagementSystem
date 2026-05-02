export default function HomeHeader({
  searchKeyword,
  onSearchChange,
  accountLabel,
  avatarUrl,
  notifications,
  unreadCount,
  onNotificationsRead,
  isAccountMenuOpen,
  isNotificationMenuOpen,
  onToggleMenu,
  onToggleNotifications,
  onGoToProfile,
  onGoToMyCourses,
  onGoToDiscover,
  onLogout,
  actionMenusRef,
}) {
  const badgeCount = typeof unreadCount === 'number' ? unreadCount : 0
  const isNotificationRead = (notification) => Boolean(notification?.read ?? notification?.isRead)

  function handleToggleNotifications() {
    onToggleNotifications()
    if (!isNotificationMenuOpen && badgeCount > 0) {
      onNotificationsRead?.()
    }
  }

  return (
    <header className="dashboardHeader">
      <div className="headerLogo" onClick={onGoToDiscover} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onGoToDiscover?.()}>
        LearnHub
      </div>

      <button className="headerNavBtn" type="button" onClick={onGoToDiscover}>
        Discover
      </button>

      <div className="headerCenter">
        <label className="searchBox" htmlFor="dashboard-search">
          <input
            id="dashboard-search"
            type="text"
            placeholder="Search courses, instructors..."
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>
      </div>

      <div className="headerRight">
        <button className="headerNavBtn" type="button" onClick={onGoToMyCourses}>
          My courses
        </button>

        <div className="actionMenus" ref={actionMenusRef}>
          <div className="notificationMenu">
            <button className="bellButton" type="button" onClick={handleToggleNotifications}
              aria-label="Notifications">
              <svg className="bellGlyph" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {badgeCount > 0 && (
                <span className="notificationBadge">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </button>

            {isNotificationMenuOpen && (
              <div className="notificationDropdown">
                <h4>Notifications</h4>
                {(notifications || []).length === 0 ? (
                  <p className="noteText">You have no notifications.</p>
                ) : (
                  <ul>
                    {notifications.slice(0, 8).map((n) => (
                      <li key={n.id} style={{ opacity: isNotificationRead(n) ? 0.55 : 1 }}>
                        <strong>{n.title}</strong>
                        {!isNotificationRead(n) && (
                          <span style={{ marginLeft: 6, fontSize: 10, background: '#1e40af', color: '#fff', borderRadius: 3, padding: '1px 5px', fontWeight: 600 }}>
                            New
                          </span>
                        )}
                        <p>{n.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="accountMenu">
            <button className="avatarButton" type="button" onClick={onToggleMenu}
              aria-label="Account menu">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="headerAvatarImage" />
              ) : (
                accountLabel
              )}
            </button>

            {isAccountMenuOpen && (
              <div className="accountDropdown">
                <button type="button" onClick={onGoToProfile}>
                  My profile
                </button>
                <button type="button" onClick={onGoToMyCourses}>
                  My courses
                </button>
                <button type="button" onClick={onGoToDiscover}>
                  Discover
                </button>
                <button type="button" onClick={onLogout}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
