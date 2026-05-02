import { useEffect, useMemo, useRef, useState } from 'react'
import { logout } from '../api/auth.js'
import { getPublishedCourseDetail, listPublishedCourses } from '../api/courses.js'
import { createEnrollment, listMyCourses } from '../api/enrollments.js'
import { setToken } from '../api/http.js'
import { getCourseProgress, listCourseReviews } from '../api/learnings.js'
import { listCategories, listNotifications, markAllNotificationsRead } from '../api/system.js'
import { getCurrentUser, updateCurrentUser, uploadCurrentUserAvatar } from '../api/users.js'
import { useNotificationPolling } from '../hooks/useNotificationPolling.js'
import CourseDetailSection from './dashboard/components/CourseDetailSection.jsx'
import CourseRailSection from './dashboard/components/CourseRailSection.jsx'
import HeroSection from './dashboard/components/HeroSection.jsx'
import HomeFooter from './dashboard/components/HomeFooter.jsx'
import HomeHeader from './dashboard/components/HomeHeader.jsx'
import LearningPage from './dashboard/components/LearningPage.jsx'
import MyCoursesPage from './dashboard/components/MyCoursesPage.jsx'
import MyCoursesSection from './dashboard/components/MyCoursesSection.jsx'
import ProfilePage from './dashboard/components/ProfilePage.jsx'
import { getAccountLabel, getMessage } from './dashboard/dashboard.utils.js'
import './DashboardPage.css'

function normalizeNotificationReadFlag(notification) {
  return {
    ...notification,
    read: Boolean(notification?.read ?? notification?.isRead),
  }
}

export default function DashboardPage({ currentUser: currentUserProp, onLoggedOut }) {
  const [isLoading, setIsLoading] = useState(true)
  const [globalError, setGlobalError] = useState('')
  const [globalSuccess, setGlobalSuccess] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [activeScreen, setActiveScreen] = useState('home')
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false)
  const actionMenusRef = useRef(null)
  const discoverSectionRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(1)

  const [currentUser, setCurrentUser] = useState(currentUserProp ?? null)
  const [availableCourses, setAvailableCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [selectedCourseDetail, setSelectedCourseDetail] = useState(null)
  const [isLoadingCourseDetail, setIsLoadingCourseDetail] = useState(false)
  const [selectedCourseReviews, setSelectedCourseReviews] = useState([])
  const [isLoadingCourseReviews, setIsLoadingCourseReviews] = useState(false)
  const [myCourses, setMyCourses] = useState([])
  const [courseProgressById, setCourseProgressById] = useState({})
  const [notifications, setNotifications] = useState([])
  const [avatarUrl, setAvatarUrl] = useState(currentUserProp?.avatarUrl || '')

  useNotificationPolling((incomingNotifications) => {
    if (!Array.isArray(incomingNotifications)) return
    setNotifications(incomingNotifications.map(normalizeNotificationReadFlag))
  })

  const filteredCourses = useMemo(() => {
    let result = availableCourses
    const keyword = searchKeyword.trim().toLowerCase()
    if (keyword) {
      result = result.filter((c) => {
        const title = (c.title || '').toLowerCase()
        const desc = (c.description || '').toLowerCase()
        const instructor = (c.instructorName || '').toLowerCase()
        const category = (c.categoryName || '').toLowerCase()
        return (
          title.includes(keyword) ||
          desc.includes(keyword) ||
          instructor.includes(keyword) ||
          category.includes(keyword)
        )
      })
    }
    if (selectedCategory) {
      result = result.filter((c) => c.categoryName === selectedCategory)
    }
    return result
  }, [availableCourses, searchKeyword, selectedCategory])

  const pageSize = 12
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredCourses.length / pageSize)),
    [filteredCourses.length]
  )
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCourses.slice(start, start + pageSize)
  }, [filteredCourses, currentPage])

  const enrolledCourseIds = useMemo(
    () => new Set(myCourses.filter((c) => c?.courseId != null).map((c) => c.courseId)),
    [myCourses]
  )
  const isSelectedCourseEnrolled = useMemo(
    () => selectedCourseId != null && enrolledCourseIds.has(Number(selectedCourseId)),
    [selectedCourseId, enrolledCourseIds]
  )
  const accountLabel = useMemo(() => getAccountLabel(currentUser), [currentUser])

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true)
      setGlobalError('')
      try {
        const fetchUser = currentUser ? Promise.resolve(currentUser) : getCurrentUser()
        const [me, publishedCourses, myCourseData, categoryData, notificationData] =
          await Promise.all([
            fetchUser,
            listPublishedCourses(),
            listMyCourses(),
            listCategories().catch(() => []),
            listNotifications().catch(() => []),
          ])
        setCurrentUser(me)
        setAvatarUrl(me?.avatarUrl || '')
        setAvailableCourses(Array.isArray(publishedCourses) ? publishedCourses : [])
        setMyCourses(Array.isArray(myCourseData) ? myCourseData : [])
        setCategories(Array.isArray(categoryData) ? categoryData : [])
        setNotifications(
          Array.isArray(notificationData)
            ? notificationData.map(normalizeNotificationReadFlag)
            : []
        )
      } catch (error) {
        if (error?.status === 401 || error?.status === 403) {
          setToken(null)
          onLoggedOut?.()
          return
        }
        setGlobalError(getMessage(error, 'Unable to load course page'))
      } finally {
        setIsLoading(false)
      }
    }
    loadInitialData()
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (!actionMenusRef.current) return
      if (!actionMenusRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false)
        setIsNotificationMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchKeyword, selectedCategory, filteredCourses.length])

  useEffect(() => {
    async function loadCourseProgress() {
      if (!myCourses.length) {
        setCourseProgressById({})
        return
      }

      const uniqueCourseIds = [...new Set(myCourses.map((course) => Number(course.courseId)).filter(Boolean))]
      const progressEntries = await Promise.all(
        uniqueCourseIds.map(async (courseId) => {
          try {
            const progress = await getCourseProgress(courseId)
            return [courseId, progress]
          } catch (_) {
            return [courseId, null]
          }
        })
      )

      setCourseProgressById(Object.fromEntries(progressEntries))
    }

    loadCourseProgress()
  }, [myCourses])

  async function handleLogout() {
    try {
      await logout()
    } catch (_) {
      // Logout client side even if backend call fails
    } finally {
      setToken(null)
      onLoggedOut?.()
    }
  }

  function notifySuccess(message) {
    setGlobalError('')
    setGlobalSuccess(message)
  }

  function notifyError(error, fallback) {
    setGlobalSuccess('')
    setGlobalError(getMessage(error, fallback))
  }

  async function handleEnroll(event) {
    event.preventDefault()
    if (!selectedCourseId) {
      notifyError(null, 'Please select a course to enroll')
      return
    }
    try {
      await createEnrollment({ courseId: selectedCourseId })
      setMyCourses(await listMyCourses())
      notifySuccess('Course enrollment successful')
    } catch (error) {
      notifyError(error, 'Course enrollment failed')
    }
  }

  async function handleSelectCourse(courseId) {
    setSelectedCourseId(courseId)
    setActiveScreen('courseDetail')
    setIsLoadingCourseDetail(true)
    setIsLoadingCourseReviews(true)
    setGlobalError('')
    setGlobalSuccess('')
    try {
      const [detail, reviews] = await Promise.all([
        getPublishedCourseDetail(courseId),
        listCourseReviews(courseId).catch(() => []),
      ])
      setSelectedCourseDetail(detail)
      setSelectedCourseReviews(Array.isArray(reviews) ? reviews : [])
    } catch (error) {
      setSelectedCourseDetail(null)
      setSelectedCourseReviews([])
      notifyError(error, 'Unable to load course details')
    } finally {
      setIsLoadingCourseDetail(false)
      setIsLoadingCourseReviews(false)
    }
  }

  function handleStartLearning() {
    if (!selectedCourseDetail?.lessons?.length) {
      notifySuccess('This course has no lessons yet. Please wait for the instructor to add content.')
      return
    }
    setActiveScreen('learning')
    setGlobalError('')
    setGlobalSuccess('')
  }

  async function handleSaveProfile({ fullName }) {
    try {
      const updatedUser = await updateCurrentUser({ fullName, avatarUrl })
      setCurrentUser(updatedUser)
      setAvatarUrl(updatedUser?.avatarUrl || '')
      notifySuccess('Profile updated successfully')
    } catch (error) {
      notifyError(error, 'Unable to update profile')
      throw error
    }
  }

  async function handleAvatarSelected(event) {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return
    try {
      const updatedUser = await uploadCurrentUserAvatar(selectedFile)
      setCurrentUser(updatedUser)
      setAvatarUrl(updatedUser?.avatarUrl || '')
      notifySuccess('Avatar updated successfully')
    } catch (error) {
      notifyError(error, 'Unable to update avatar')
    } finally {
      event.target.value = ''
    }
  }

  function handleCourseProgressUpdated(updatedProgress) {
    const courseId = Number(updatedProgress?.courseId)
    if (!courseId) return
    setCourseProgressById((prev) => ({
      ...prev,
      [courseId]: updatedProgress,
    }))
  }

  if (isLoading) {
    return <main className="dashboardLoading">Loading course page...</main>
  }

  const sharedHeaderProps = {
    searchKeyword,
    onSearchChange: setSearchKeyword,
    accountLabel,
    avatarUrl,
    notifications,
    isAccountMenuOpen,
    isNotificationMenuOpen,
    onToggleMenu: () => {
      setIsNotificationMenuOpen(false)
      setIsAccountMenuOpen((s) => !s)
    },
    onToggleNotifications: () => {
      setIsAccountMenuOpen(false)
      setIsNotificationMenuOpen((s) => !s)
    },
    unreadCount: notifications.filter((n) => !n.read).length,
    onNotificationsRead: async () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      try { await markAllNotificationsRead() } catch (_) {}
    },
    onGoToProfile: () => {
      setActiveScreen('profile')
      setIsAccountMenuOpen(false)
    },
    onGoToMyCourses: () => {
      setActiveScreen('myCourses')
      setIsAccountMenuOpen(false)
    },
    onGoToDiscover: () => {
      setActiveScreen('home')
      setIsAccountMenuOpen(false)
      setTimeout(() => discoverSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    },
    onLogout: () => {
      setIsAccountMenuOpen(false)
      setIsNotificationMenuOpen(false)
      handleLogout()
    },
    actionMenusRef,
  }

  if (activeScreen === 'learning' && selectedCourseDetail) {
    return (
      <div className="dashboardRoot">
        <HomeHeader {...sharedHeaderProps} />
        {globalError ? <p className="alert error">{globalError}</p> : null}
        {globalSuccess ? <p className="alert success">{globalSuccess}</p> : null}
        <LearningPage
          courseDetail={selectedCourseDetail}
          onBack={() => setActiveScreen('courseDetail')}
          onNotifyError={notifyError}
          onNotifySuccess={notifySuccess}
          onCourseProgressUpdated={handleCourseProgressUpdated}
        />
        <HomeFooter />
      </div>
    )
  }

  return (
    <div className="dashboardRoot">
      <HomeHeader {...sharedHeaderProps} />

      {globalError ? <p className="alert error">{globalError}</p> : null}
      {globalSuccess ? <p className="alert success">{globalSuccess}</p> : null}

      {activeScreen === 'home' ? (
        <>
          <HeroSection categories={categories} onSelectCategory={setSelectedCategory} />

          <div className="modulePanel">
            {myCourses.length > 0 && (
              <MyCoursesSection
                myCourses={myCourses}
                courseProgressById={courseProgressById}
                onOpenCourse={handleSelectCourse}
              />
            )}

            <CourseRailSection
              title="All Courses"
              courses={paginatedCourses}
              selectedCourseId={selectedCourseId}
              onSelectCourse={handleSelectCourse}
              sectionRef={discoverSectionRef}
            />

            {filteredCourses.length > pageSize ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 8,
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  className="secondaryButton"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <p className="noteText">
                  Page {currentPage} of {totalPages}
                </p>
                <button
                  type="button"
                  className="secondaryButton"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </>
      ) : activeScreen === 'profile' ? (
        <ProfilePage
          currentUser={currentUser}
          avatarUrl={avatarUrl}
          onAvatarSelected={handleAvatarSelected}
          onSaveProfile={handleSaveProfile}
          onBackHome={() => setActiveScreen('home')}
        />
      ) : activeScreen === 'myCourses' ? (
        <MyCoursesPage
          myCourses={myCourses}
          courseCatalog={availableCourses}
          courseProgressById={courseProgressById}
          onOpenCourse={handleSelectCourse}
          onBackHome={() => setActiveScreen('home')}
        />
      ) : (
        <div className="modulePanel">
          <CourseDetailSection
            selectedCourseId={selectedCourseId}
            isLoadingCourseDetail={isLoadingCourseDetail}
            selectedCourseDetail={selectedCourseDetail}
            selectedCourseReviews={selectedCourseReviews}
            isLoadingCourseReviews={isLoadingCourseReviews}
            onEnroll={handleEnroll}
            isSelectedCourseEnrolled={isSelectedCourseEnrolled}
            onStartLearning={handleStartLearning}
            onBackHome={() => setActiveScreen('home')}
          />
        </div>
      )}

      <HomeFooter />
    </div>
  )
}
