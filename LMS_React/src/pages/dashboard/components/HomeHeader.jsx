export default function HomeHeader({
  searchKeyword,
  onSearchChange,
  accountLabel,
  avatarUrl,
  notifications,
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
  const notificationCount = notifications?.length || 0

  return (
    <header className="dashboardHeader">
      <div className="headerIdentity">
        <h1 className="dashboardTitle">LMS Learning Home</h1>
      </div>
      <div className="headerCenter">
        <label className="searchBox" htmlFor="dashboard-search">
          <input
            id="dashboard-search"
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchKeyword}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
      </div>
      <div className="headerRight">
        <div className="actionMenus" ref={actionMenusRef}>
          <div className="notificationMenu">
            <button className="bellButton" type="button" onClick={onToggleNotifications}>
              <svg
                className="bellGlyph"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M8 17H16M9 17V11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11V17M7 17H17M10.5 20C10.8 20.6 11.35 21 12 21C12.65 21 13.2 20.6 13.5 20"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {notificationCount > 0 ? <span className="notificationBadge">{notificationCount}</span> : null}
            </button>
            {isNotificationMenuOpen ? (
              <div className="notificationDropdown">
                <h4>Thông báo</h4>
                {notificationCount === 0 ? (
                  <p className="noteText">Bạn chưa có thông báo mới.</p>
                ) : (
                  <ul>
                    {notifications.slice(0, 6).map((notification) => (
                      <li key={notification.id}>
                        <strong>{notification.title}</strong>
                        <p>{notification.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>
          <div className="accountMenu">
          <button className="avatarButton" type="button" onClick={onToggleMenu}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="headerAvatarImage" />
            ) : (
              accountLabel
            )}
          </button>
          {isAccountMenuOpen ? (
            <div className="accountDropdown">
              <button type="button" onClick={onGoToProfile}>
                My profile
              </button>
              <button type="button" onClick={onGoToMyCourses}>
                My course
              </button>
              <button type="button" onClick={onGoToDiscover}>
                Discover
              </button>
              <button type="button" onClick={onLogout}>
                Logout
              </button>
            </div>
          ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
