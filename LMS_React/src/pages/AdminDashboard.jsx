import { useEffect, useState } from 'react'
import { logout } from '../api/auth.js'
import { setToken } from '../api/http.js'
import {
  getAdminAnalytics,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  broadcastNotification,
  listNotifications,
  markAllNotificationsRead,
} from '../api/system.js'
import { useNotificationPolling } from '../hooks/useNotificationPolling.js'
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  patchAdminUserRole,
  disableAdminUser,
} from '../api/users.js'
import {
  listPendingReviewCourses,
  getAdminCourseDetail,
  getAdminLessonDetail,
  updateAdminCourseStatus,
} from '../api/courses.js'
import HomeFooter from './dashboard/components/HomeFooter.jsx'
import './DashboardPage.css'

function formatDate(dateString) {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('en-US')
  } catch (_) {
    return dateString
  }
}

function toEmbeddableVideoUrl(rawUrl) {
  if (!rawUrl) return ''
  const url = String(rawUrl).trim()
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be')
  if (!isYoutube) return url

  const videoId = (() => {
    try {
      if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split(/[?&]/)[0] || ''
      const parsed = new URL(url)
      return parsed.searchParams.get('v') || ''
    } catch (_) {
      return ''
    }
  })()

  return videoId ? `https://www.youtube.com/embed/${videoId}` : url
}

const ROLES = ['STUDENT', 'INSTRUCTOR', 'ADMIN']

export default function AdminDashboard({ currentUser, onLoggedOut }) {
  const [activeScreen, setActiveScreen] = useState('overview')
  const [globalError, setGlobalError] = useState('')
  const [globalSuccess, setGlobalSuccess] = useState('')
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useNotificationPolling(setNotifications)

  const [analytics, setAnalytics] = useState(null)

  const [users, setUsers] = useState([])
  const [userForm, setUserForm] = useState({ id: null, email: '', password: '', fullName: '', roleName: 'STUDENT' })
  const [showUserForm, setShowUserForm] = useState(false)

  const [categories, setCategories] = useState([])
  const [catForm, setCatForm] = useState({ id: null, name: '', description: '' })
  const [showCatForm, setShowCatForm] = useState(false)

  const [pendingCourses, setPendingCourses] = useState([])
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingCourseId, setRejectingCourseId] = useState(null)
  const [reviewCourseDetail, setReviewCourseDetail] = useState(null)
  const [reviewLessonDetail, setReviewLessonDetail] = useState(null)
  const [reviewLessonId, setReviewLessonId] = useState(null)
  const [isLoadingReview, setIsLoadingReview] = useState(false)

  const [notifForm, setNotifForm] = useState({ title: '', content: '' })

  const accountLabel = (currentUser?.fullName?.trim()?.split(/\s+/)?.slice(0, 2)?.map((w) => w[0])?.join('')?.toUpperCase()) || 'A'

  useEffect(() => {
    loadAnalytics()
    listNotifications().then((data) => setNotifications(Array.isArray(data) ? data : [])).catch(() => {})
  }, [])

  async function loadAnalytics() {
    try {
      const data = await getAdminAnalytics()
      setAnalytics(data)
    } catch (_) { setAnalytics(null) }
  }

  async function loadUsers() {
    try {
      const data = await listAdminUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (_) { setUsers([]) }
  }

  async function loadCategories() {
    try {
      const data = await listCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (_) { setCategories([]) }
  }

  async function loadPendingCourses() {
    try {
      const json = await listPendingReviewCourses()
      const courses = Array.isArray(json) ? json : []
      setPendingCourses(courses)
    } catch (_) { setPendingCourses([]) }
  }

  async function handleApprove(courseId) {
    try {
      await updateAdminCourseStatus(courseId, { status: 'PUBLISHED' })
      await loadPendingCourses()
      if (reviewCourseDetail?.id === courseId) {
        setReviewCourseDetail(null)
        setReviewLessonDetail(null)
        setReviewLessonId(null)
      }
      notifySuccess('Course approved and published')
    } catch (error) {
      if (error?.status === 404) {
        await loadPendingCourses()
        notifyError('Course not found or already removed from review queue')
        return
      }
      notifyError('Failed to approve')
    }
  }

  async function handleReject(courseId) {
    if (!rejectReason.trim()) {
      notifyError('Rejection reason is required')
      return
    }
    try {
      await updateAdminCourseStatus(courseId, { status: 'REJECTED', reason: rejectReason })
      setRejectingCourseId(null)
      setRejectReason('')
      await loadPendingCourses()
      if (reviewCourseDetail?.id === courseId) {
        setReviewCourseDetail(null)
        setReviewLessonDetail(null)
        setReviewLessonId(null)
      }
      notifySuccess('Course rejected')
    } catch (error) {
      if (error?.status === 404) {
        await loadPendingCourses()
        notifyError('Course not found or already removed from review queue')
        return
      }
      notifyError('Failed to reject')
    }
  }

  async function handleOpenReview(courseId) {
    setIsLoadingReview(true)
    setReviewCourseDetail(null)
    setReviewLessonDetail(null)
    setReviewLessonId(null)
    try {
      const detail = await getAdminCourseDetail(courseId)
      setReviewCourseDetail(detail)
      const firstLessonId = detail?.lessons?.[0]?.id
      if (firstLessonId) {
        const lesson = await getAdminLessonDetail(firstLessonId)
        setReviewLessonId(firstLessonId)
        setReviewLessonDetail(lesson)
      }
    } catch (error) {
      if (error?.status === 404) {
        await loadPendingCourses()
        notifyError('Course not found or no longer available for review')
      } else {
        notifyError('Failed to load course content')
      }
    } finally {
      setIsLoadingReview(false)
    }
  }

  async function handleSelectReviewLesson(lessonId) {
    setReviewLessonId(lessonId)
    setReviewLessonDetail(null)
    try {
      const lesson = await getAdminLessonDetail(lessonId)
      setReviewLessonDetail(lesson)
    } catch (_) {
      notifyError('Failed to load lesson detail')
    }
  }

  async function handleSaveUser(event) {
    event.preventDefault()
    const { id, email, password, fullName, roleName } = userForm
    try {
      if (id) {
        await updateAdminUser(id, { fullName })
        if (roleName) await patchAdminUserRole(id, { roleName })
        notifySuccess('User updated')
      } else {
        await createAdminUser({ email, password, fullName, roleName })
        notifySuccess('User created')
      }
      await loadUsers()
      setShowUserForm(false)
      setUserForm({ id: null, email: '', password: '', fullName: '', roleName: 'STUDENT' })
    } catch (_) { notifyError('Failed to save user') }
  }

  async function handleDisableUser(user) {
    if (!window.confirm(`Disable user "${user.fullName}"?`)) return
    try {
      await disableAdminUser(user.id)
      await loadUsers()
      notifySuccess('User disabled')
    } catch (_) { notifyError('Failed to disable user') }
  }

  async function handleSaveCategory(event) {
    event.preventDefault()
    const { id, name, description } = catForm
    try {
      if (id) {
        await updateCategory(id, { name, description })
        notifySuccess('Category updated')
      } else {
        await createCategory({ name, description })
        notifySuccess('Category created')
      }
      await loadCategories()
      setShowCatForm(false)
      setCatForm({ id: null, name: '', description: '' })
    } catch (_) { notifyError('Failed to save category') }
  }

  async function handleDeleteCategory(cat) {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return
    try {
      await deleteCategory(cat.id)
      await loadCategories()
      notifySuccess('Category deleted')
    } catch (_) { notifyError('Cannot delete category in use') }
  }

  async function handleBroadcast(event) {
    event.preventDefault()
    try {
      await broadcastNotification(notifForm)
      setNotifForm({ title: '', content: '' })
      notifySuccess('Notification sent to all users')
    } catch (_) { notifyError('Failed to send notification') }
  }

  function notifySuccess(msg) { setGlobalError(''); setGlobalSuccess(msg) }
  function notifyError(msg) { setGlobalSuccess(''); setGlobalError(msg) }

  async function handleLogout() {
    try { await logout() } catch (_) {}
    setToken(null)
    onLoggedOut?.()
  }

  function navTo(screen) {
    setActiveScreen(screen)
    if (screen === 'users') loadUsers()
    if (screen === 'categories') loadCategories()
    if (screen === 'pending') loadPendingCourses()
    setShowUserForm(false)
    setShowCatForm(false)
    setRejectingCourseId(null)
    setRejectReason('')
    setReviewCourseDetail(null)
    setReviewLessonDetail(null)
    setReviewLessonId(null)
  }

  const navItems = [
    ['overview', 'Overview'],
    ['users', 'Users'],
    ['categories', 'Categories'],
    ['pending', 'Pending Courses'],
    ['notifications', 'Notifications'],
  ]

  return (
    <div className="dashboardRoot">
      <header className="dashboardHeader">
        <div className="headerLogo">LearnHub - Admin</div>
        <nav style={{ display: 'flex', gap: 8, flex: 1 }}>
          {navItems.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="headerNavBtn"
              style={{ fontWeight: activeScreen === key ? 700 : 400 }}
              onClick={() => navTo(key)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Notification bell */}
          <div style={{ position: 'relative' }}>
            <button
              className="bellButton"
              type="button"
              aria-label="Notifications"
              onClick={() => {
                const opening = !isNotificationMenuOpen
                setIsNotificationMenuOpen(opening)
                setIsAccountMenuOpen(false)
                if (opening && notifications.some((n) => !n.read)) {
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                  markAllNotificationsRead().catch(() => {})
                }
              }}
            >
              <svg className="bellGlyph" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="notificationBadge">
                  {notifications.filter((n) => !n.read).length > 9 ? '9+' : notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>
            {isNotificationMenuOpen && (
              <div className="notificationDropdown">
                <h4>Notifications</h4>
                {notifications.length === 0
                  ? <p className="noteText">No notifications.</p>
                  : (
                    <ul>
                      {notifications.slice(0, 8).map((n) => (
                        <li key={n.id} style={{ opacity: n.read ? 0.6 : 1 }}>
                          <strong>{n.title}</strong>
                          {!n.read && <span style={{ marginLeft: 6, fontSize: 10, background: '#1e40af', color: '#fff', borderRadius: 3, padding: '1px 5px', fontWeight: 600 }}>New</span>}
                          <p>{n.content}</p>
                        </li>
                      ))}
                    </ul>
                  )
                }
              </div>
            )}
          </div>

          {/* Account menu */}
          <div style={{ position: 'relative' }}>
            <button className="avatarButton" type="button" onClick={() => { setIsAccountMenuOpen((s) => !s); setIsNotificationMenuOpen(false) }}>
              {currentUser?.avatarUrl
                ? <img src={currentUser.avatarUrl} alt="Avatar" className="headerAvatarImage" />
                : accountLabel}
            </button>
            {isAccountMenuOpen && (
              <div className="accountDropdown">
                <button type="button" onClick={handleLogout}>Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {globalError && <p className="alert error">{globalError}</p>}
      {globalSuccess && <p className="alert success">{globalSuccess}</p>}

      <main className="modulePanel">

        {/* Overview */}
        {activeScreen === 'overview' && (
          <section>
            <h2 style={{ marginBottom: 16 }}>System Overview</h2>
            <p>Welcome back, <strong>{currentUser?.fullName}</strong></p>
            {analytics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginTop: 16 }}>
                {[
                  ['Total Users', analytics.totalUsers],
                  ['Instructors', analytics.totalInstructors],
                  ['Total Courses', analytics.totalCourses],
                  ['Published', analytics.publishedCourses],
                  ['Enrollments', analytics.totalEnrollments],
                  ['Categories', analytics.totalCategories],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: 20, textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 26, fontWeight: 700, color: '#1e40af' }}>{value ?? '-'}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Users */}
        {activeScreen === 'users' && (
          <section>
            <div className="profileHeaderRow">
              <h2>User Management</h2>
              <button
                type="button"
                className="primaryButton"
                onClick={() => { setUserForm({ id: null, email: '', password: '', fullName: '', roleName: 'STUDENT' }); setShowUserForm(true) }}
              >
                + New User
              </button>
            </div>

            {showUserForm && (
              <div className="dataBlock" style={{ maxWidth: 500, marginBottom: 20 }}>
                <h3>{userForm.id ? 'Edit User' : 'Create User'}</h3>
                <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                  {!userForm.id && (
                    <>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 14, fontWeight: 600 }}>
                        Email *
                        <input value={userForm.email} onChange={(e) => setUserForm((s) => ({ ...s, email: e.target.value }))} type="email" required style={{ border: '1px solid #ccc', borderRadius: 4, padding: '6px 10px', fontSize: 14 }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 14, fontWeight: 600 }}>
                        Password *
                        <input value={userForm.password} onChange={(e) => setUserForm((s) => ({ ...s, password: e.target.value }))} type="password" required style={{ border: '1px solid #ccc', borderRadius: 4, padding: '6px 10px', fontSize: 14 }} />
                      </label>
                    </>
                  )}
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 14, fontWeight: 600 }}>
                    Full Name *
                    <input value={userForm.fullName} onChange={(e) => setUserForm((s) => ({ ...s, fullName: e.target.value }))} required style={{ border: '1px solid #ccc', borderRadius: 4, padding: '6px 10px', fontSize: 14 }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 14, fontWeight: 600 }}>
                    Role
                    <select value={userForm.roleName} onChange={(e) => setUserForm((s) => ({ ...s, roleName: e.target.value }))} style={{ border: '1px solid #ccc', borderRadius: 4, padding: '6px 10px', fontSize: 14 }}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="primaryButton small">Save</button>
                    <button type="button" className="secondaryButton" onClick={() => setShowUserForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="dataBlock">
              {users.length === 0
                ? <p className="noteText">No users.</p>
                : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Name', 'Email', 'Roles', 'Active', 'Actions'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '9px 12px', fontSize: 13, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0', opacity: u.active ? 1 : 0.5 }}>
                          <td style={{ padding: '9px 12px', fontSize: 14 }}>{u.fullName}</td>
                          <td style={{ padding: '9px 12px', fontSize: 13, color: '#666' }}>{u.email}</td>
                          <td style={{ padding: '9px 12px', fontSize: 13 }}>{(u.roles || []).join(', ')}</td>
                          <td style={{ padding: '9px 12px', fontSize: 13 }}>{u.active ? 'Yes' : 'No'}</td>
                          <td style={{ padding: '9px 12px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                type="button"
                                className="secondaryButton"
                                style={{ fontSize: 12, padding: '3px 9px' }}
                                onClick={() => { setUserForm({ id: u.id, email: u.email, password: '', fullName: u.fullName, roleName: u.roles?.[0] || 'STUDENT' }); setShowUserForm(true) }}
                              >
                                Edit
                              </button>
                              {u.active && (
                                <button
                                  type="button"
                                  style={{ fontSize: 12, padding: '3px 9px', background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 4, cursor: 'pointer' }}
                                  onClick={() => handleDisableUser(u)}
                                >
                                  Disable
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              }
            </div>
          </section>
        )}

        {/* Categories */}
        {activeScreen === 'categories' && (
          <section>
            <div className="profileHeaderRow">
              <h2>Category Management</h2>
              <button
                type="button"
                className="primaryButton"
                onClick={() => { setCatForm({ id: null, name: '', description: '' }); setShowCatForm(true) }}
              >
                + New Category
              </button>
            </div>

            {showCatForm && (
              <div className="dataBlock" style={{ maxWidth: 420, marginBottom: 20 }}>
                <h3>{catForm.id ? 'Edit Category' : 'New Category'}</h3>
                <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 14, fontWeight: 600 }}>
                    Name *
                    <input value={catForm.name} onChange={(e) => setCatForm((s) => ({ ...s, name: e.target.value }))} required style={{ border: '1px solid #ccc', borderRadius: 4, padding: '6px 10px', fontSize: 14 }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 14, fontWeight: 600 }}>
                    Description
                    <input value={catForm.description} onChange={(e) => setCatForm((s) => ({ ...s, description: e.target.value }))} style={{ border: '1px solid #ccc', borderRadius: 4, padding: '6px 10px', fontSize: 14 }} />
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="primaryButton small">Save</button>
                    <button type="button" className="secondaryButton" onClick={() => setShowCatForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="dataBlock">
              {categories.length === 0
                ? <p className="noteText">No categories.</p>
                : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Name', 'Description', 'Actions'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '9px 12px', fontSize: 13, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '9px 12px', fontSize: 14 }}>{cat.name}</td>
                          <td style={{ padding: '9px 12px', fontSize: 13, color: '#666' }}>{cat.description || '-'}</td>
                          <td style={{ padding: '9px 12px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                type="button"
                                className="secondaryButton"
                                style={{ fontSize: 12, padding: '3px 9px' }}
                                onClick={() => { setCatForm({ id: cat.id, name: cat.name, description: cat.description || '' }); setShowCatForm(true) }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                style={{ fontSize: 12, padding: '3px 9px', background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 4, cursor: 'pointer' }}
                                onClick={() => handleDeleteCategory(cat)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              }
            </div>
          </section>
        )}

        {/* Pending courses */}
        {activeScreen === 'pending' && (
          <section>
            <h2 style={{ marginBottom: 16 }}>Pending Course Review ({pendingCourses.length})</h2>
            {pendingCourses.length === 0
              ? <p className="noteText">No courses pending review.</p>
              : (
                <div className="dataBlock">
                  {rejectingCourseId && (
                    <div style={{ marginBottom: 16, background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 6, padding: 14 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Reject reason for course #{rejectingCourseId}</p>
                      <textarea
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        style={{ width: '100%', border: '1px solid #ccc', borderRadius: 4, padding: 8, fontSize: 14, fontFamily: 'inherit', marginBottom: 8 }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" className="primaryButton small" onClick={() => handleReject(rejectingCourseId)}>Confirm Reject</button>
                        <button type="button" className="secondaryButton" onClick={() => { setRejectingCourseId(null); setRejectReason('') }}>Cancel</button>
                      </div>
                    </div>
                  )}
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Title', 'Instructor', 'Category', 'Actions'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '9px 12px', fontSize: 13, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingCourses.map((course) => (
                        <tr key={course.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '9px 12px', fontSize: 14 }}>{course.title}</td>
                          <td style={{ padding: '9px 12px', fontSize: 13, color: '#666' }}>{course.instructorName || '-'}</td>
                          <td style={{ padding: '9px 12px', fontSize: 13, color: '#666' }}>{course.categoryName || '-'}</td>
                          <td style={{ padding: '9px 12px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button type="button" className="primaryButton small" onClick={() => handleApprove(course.id)}>Approve</button>
                              <button
                                type="button"
                                className="secondaryButton"
                                onClick={() => handleOpenReview(course.id)}
                              >
                                Review
                              </button>
                              <button
                                type="button"
                                style={{ fontSize: 12, padding: '4px 10px', background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 4, cursor: 'pointer' }}
                                onClick={() => { setRejectingCourseId(course.id); setRejectReason('') }}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
            {(isLoadingReview || reviewCourseDetail) && (
              <div className="dataBlock" style={{ marginTop: 16 }}>
                {isLoadingReview && <p className="noteText">Loading course content...</p>}
                {!isLoadingReview && reviewCourseDetail && (
                  <div style={{ display: 'grid', gap: 14 }}>
                    <div>
                      <h3 style={{ marginBottom: 6 }}>Course Preview: {reviewCourseDetail.title}</h3>
                      <p className="noteText" style={{ marginBottom: 4 }}>Instructor: {reviewCourseDetail.instructorName || '-'}</p>
                      <p className="noteText" style={{ marginBottom: 4 }}>Category: {reviewCourseDetail.categoryName || '-'}</p>
                      <p style={{ fontSize: 14, color: '#333' }}>{reviewCourseDetail.description || '-'}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 12 }}>
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 10, background: '#fff' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                          Lessons ({reviewCourseDetail.lessons?.length || 0})
                        </p>
                        {(reviewCourseDetail.lessons || []).length === 0 && <p className="noteText">No lesson content.</p>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {(reviewCourseDetail.lessons || []).map((lesson) => (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => handleSelectReviewLesson(lesson.id)}
                              style={{
                                textAlign: 'left',
                                border: '1px solid #d1d5db',
                                borderRadius: 4,
                                padding: '6px 8px',
                                background: reviewLessonId === lesson.id ? '#eef2ff' : '#fff',
                                cursor: 'pointer',
                                fontSize: 13,
                              }}
                            >
                              {lesson.orderIndex + 1}. {lesson.title}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 12, background: '#fff' }}>
                        {!reviewLessonDetail && <p className="noteText">Select a lesson to view details.</p>}
                        {reviewLessonDetail && (
                          <div>
                            <h4 style={{ marginBottom: 6 }}>{reviewLessonDetail.title}</h4>
                            <p style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: '#333', marginBottom: 10 }}>
                              {reviewLessonDetail.content || 'No lesson text content.'}
                            </p>
                            {reviewLessonDetail.videoUrl && (
                              <div style={{ marginBottom: 10 }}>
                                <p className="noteText" style={{ marginBottom: 4 }}>Video</p>
                                <iframe
                                  src={toEmbeddableVideoUrl(reviewLessonDetail.videoUrl)}
                                  title="Lesson video preview"
                                  style={{ width: '100%', height: 260, border: '1px solid #ddd', borderRadius: 6 }}
                                  allowFullScreen
                                />
                              </div>
                            )}
                            <p className="noteText" style={{ marginBottom: 4 }}>
                              Attachments ({reviewLessonDetail.attachments?.length || 0})
                            </p>
                            {(reviewLessonDetail.attachments || []).length === 0
                              ? <p className="noteText">No attachments.</p>
                              : (
                                <ul style={{ margin: 0, paddingLeft: 18 }}>
                                  {(reviewLessonDetail.attachments || []).map((file) => (
                                    <li key={file.id}>
                                      <a href={file.fileUrl} target="_blank" rel="noreferrer">{file.fileName || file.fileUrl}</a>
                                    </li>
                                  ))}
                                </ul>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Notifications */}
        {activeScreen === 'notifications' && (
          <section>
            <h2 style={{ marginBottom: 16 }}>Broadcast Notification</h2>
            <div className="dataBlock" style={{ maxWidth: 500 }}>
              <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 600 }}>
                  Title *
                  <input
                    value={notifForm.title}
                    onChange={(e) => setNotifForm((s) => ({ ...s, title: e.target.value }))}
                    required maxLength={200}
                    style={{ border: '1px solid #ccc', borderRadius: 4, padding: '7px 10px', fontSize: 14 }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 600 }}>
                  Content *
                  <textarea
                    rows={4}
                    value={notifForm.content}
                    onChange={(e) => setNotifForm((s) => ({ ...s, content: e.target.value }))}
                    required
                    style={{ border: '1px solid #ccc', borderRadius: 4, padding: '7px 10px', fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </label>
                <button type="submit" className="primaryButton">Send to all users</button>
              </form>
            </div>
          </section>
        )}

      </main>
      <HomeFooter />
    </div>
  )
}
