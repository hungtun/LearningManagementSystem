import { useEffect, useMemo, useRef, useState } from 'react'
import { logout } from '../api/auth.js'
import { getPublishedCourseDetail, listPublishedCourses } from '../api/courses.js'
import { createEnrollment, listMyCourses } from '../api/enrollments.js'
import { setToken } from '../api/http.js'
import { listNotifications } from '../api/system.js'
import { getCurrentUser, updateCurrentUser, uploadCurrentUserAvatar } from '../api/users.js'
import CourseDetailSection from './dashboard/components/CourseDetailSection.jsx'
import CourseRailSection from './dashboard/components/CourseRailSection.jsx'
import HeroSection from './dashboard/components/HeroSection.jsx'
import HomeFooter from './dashboard/components/HomeFooter.jsx'
import HomeHeader from './dashboard/components/HomeHeader.jsx'
import MyCoursesPage from './dashboard/components/MyCoursesPage.jsx'
import MyCoursesSection from './dashboard/components/MyCoursesSection.jsx'
import ProfilePage from './dashboard/components/ProfilePage.jsx'
import { getAccountLabel, getMessage } from './dashboard/dashboard.utils.js'
import './DashboardPage.css'

export default function DashboardPage({ onLoggedOut }) {
  const [isLoading, setIsLoading] = useState(true)
  const [globalError, setGlobalError] = useState('')
  const [globalSuccess, setGlobalSuccess] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeScreen, setActiveScreen] = useState('home')
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false)
  const actionMenusRef = useRef(null)
  const discoverSectionRef = useRef(null)
  const myCoursesSectionRef = useRef(null)

  const [currentUser, setCurrentUser] = useState(null)
  const [enrollmentForm, setEnrollmentForm] = useState({ courseId: '' })
  const [availableCourses, setAvailableCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [selectedCourseDetail, setSelectedCourseDetail] = useState(null)
  const [isLoadingCourseDetail, setIsLoadingCourseDetail] = useState(false)
  const [myCourses, setMyCourses] = useState([])
  const [notifications, setNotifications] = useState([])
  const [avatarUrl, setAvatarUrl] = useState('')

  const filteredCourses = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()
    if (!keyword) return availableCourses
    return availableCourses.filter((courseItem) => {
      const title = (courseItem.title || '').toLowerCase()
      const description = (courseItem.description || '').toLowerCase()
      const instructorName = (courseItem.instructorName || '').toLowerCase()
      const categoryName = (courseItem.categoryName || '').toLowerCase()
      return (
        title.includes(keyword) ||
        description.includes(keyword) ||
        instructorName.includes(keyword) ||
        categoryName.includes(keyword)
      )
    })
  }, [availableCourses, searchKeyword])
  const featuredCourses = useMemo(() => filteredCourses.slice(0, 8), [filteredCourses])
  const trendingCourses = useMemo(() => filteredCourses.slice(8, 16), [filteredCourses])
  const recommendedCourses = useMemo(() => filteredCourses.slice(16, 24), [filteredCourses])
  const enrolledCourseIds = useMemo(
    () => new Set(myCourses.filter((course) => course?.courseId != null).map((course) => course.courseId)),
    [myCourses]
  )
  const isSelectedCourseEnrolled = useMemo(
    () => selectedCourseId != null && enrolledCourseIds.has(Number(selectedCourseId)),
    [selectedCourseId, enrolledCourseIds]
  )
  const accountLabel = useMemo(() => getAccountLabel(currentUser), [currentUser])

  useEffect(() => {
    async function loadEnrollmentHome() {
      setIsLoading(true)
      setGlobalError('')
      try {
        const [me, publishedCourses, myCourseData, notificationData] = await Promise.all([
          getCurrentUser(),
          listPublishedCourses(),
          listMyCourses(),
          listNotifications(),
        ])
        setCurrentUser(me)
        setAvatarUrl(me?.avatarUrl || '')
        setAvailableCourses(Array.isArray(publishedCourses) ? publishedCourses : [])
        setMyCourses(Array.isArray(myCourseData) ? myCourseData : [])
        setNotifications(Array.isArray(notificationData) ? notificationData : [])
      } catch (error) {
        setGlobalError(getMessage(error, 'Không thể tải trang khóa học'))
      } finally {
        setIsLoading(false)
      }
    }

    loadEnrollmentHome()
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

  async function handleLogout() {
    try {
      await logout()
    } catch (_) {
      // Logout client side even if backend call fails.
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
    if (!enrollmentForm.courseId) {
      notifyError(null, 'Vui lòng chọn khóa học để đăng ký')
      return
    }
    try {
      await createEnrollment(enrollmentForm)
      setEnrollmentForm({ courseId: '' })
      setSelectedCourseId(null)
      setSelectedCourseDetail(null)
      setMyCourses(await listMyCourses())
      notifySuccess('Đăng ký khóa học thành công')
    } catch (error) {
      notifyError(error, 'Đăng ký khóa học thất bại')
    }
  }

  async function handleSelectCourse(courseId) {
    setSelectedCourseId(courseId)
    setEnrollmentForm({ courseId: String(courseId) })
    setActiveScreen('courseDetail')
    setIsLoadingCourseDetail(true)
    try {
      const detail = await getPublishedCourseDetail(courseId)
      setSelectedCourseDetail(detail)
    } catch (error) {
      setSelectedCourseDetail(null)
      notifyError(error, 'Không thể tải chi tiết khóa học')
    } finally {
      setIsLoadingCourseDetail(false)
    }
  }

  function handleStartLearning() {
    const firstLesson = selectedCourseDetail?.lessons?.[0]
    if (firstLesson?.id) {
      setGlobalError('')
      setGlobalSuccess(`Sẵn sàng vào học: bài "${firstLesson.title}"`)
      return
    }
    setGlobalError('')
    setGlobalSuccess('Khóa học đã đăng ký, bạn có thể vào học ngay khi có nội dung bài học')
  }

  async function handleSaveProfile({ fullName }) {
    try {
      const updatedUser = await updateCurrentUser({ fullName, avatarUrl })
      setCurrentUser(updatedUser)
      setAvatarUrl(updatedUser?.avatarUrl || '')
      notifySuccess('Cập nhật hồ sơ thành công')
    } catch (error) {
      notifyError(error, 'Không thể cập nhật hồ sơ')
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
      notifySuccess('Đã cập nhật ảnh đại diện')
    } catch (error) {
      notifyError(error, 'Không thể cập nhật ảnh đại diện')
    } finally {
      event.target.value = ''
    }
  }

  if (isLoading) {
    return <main className="dashboardLoading">Đang tải trang khóa học...</main>
  }

  return (
    <main className="dashboardRoot">
      <HomeHeader
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        accountLabel={accountLabel}
        avatarUrl={avatarUrl}
        notifications={notifications}
        isAccountMenuOpen={isAccountMenuOpen}
        isNotificationMenuOpen={isNotificationMenuOpen}
        onToggleMenu={() => {
          setIsNotificationMenuOpen(false)
          setIsAccountMenuOpen((oldState) => !oldState)
        }}
        onToggleNotifications={() => {
          setIsAccountMenuOpen(false)
          setIsNotificationMenuOpen((oldState) => !oldState)
        }}
        onGoToProfile={() => {
          setActiveScreen('profile')
          setIsAccountMenuOpen(false)
        }}
        onGoToMyCourses={() => {
          setActiveScreen('myCourses')
          setIsAccountMenuOpen(false)
        }}
        onGoToDiscover={() => {
          setActiveScreen('home')
          discoverSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          setIsAccountMenuOpen(false)
        }}
        onLogout={() => {
          setIsAccountMenuOpen(false)
          setIsNotificationMenuOpen(false)
          handleLogout()
        }}
        actionMenusRef={actionMenusRef}
      />

      {globalError ? <p className="alert error">{globalError}</p> : null}
      {globalSuccess ? <p className="alert success">{globalSuccess}</p> : null}

      {activeScreen === 'home' ? (
        <section className="modulePanel">
          <h2>Learning Home</h2>
          <HeroSection />
          <MyCoursesSection myCourses={myCourses} sectionRef={myCoursesSectionRef} />

          <CourseRailSection
            title="Khóa học nổi bật"
            courses={featuredCourses.length > 0 ? featuredCourses : filteredCourses}
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
            tagLabel="Bestseller"
            sectionRef={discoverSectionRef}
          />
          <CourseRailSection
            title="Xu hướng tuần này"
            courses={trendingCourses}
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
            tagLabel="Trending"
          />
          <CourseRailSection
            title="Đề xuất cho bạn"
            courses={recommendedCourses}
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
            tagLabel="Recommended"
          />
        </section>
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
          onOpenCourse={handleSelectCourse}
          onBackHome={() => setActiveScreen('home')}
        />
      ) : (
        <section className="modulePanel">
          <CourseDetailSection
            selectedCourseId={selectedCourseId}
            isLoadingCourseDetail={isLoadingCourseDetail}
            selectedCourseDetail={selectedCourseDetail}
            onEnroll={handleEnroll}
            isSelectedCourseEnrolled={isSelectedCourseEnrolled}
            onStartLearning={handleStartLearning}
            onBackHome={() => setActiveScreen('home')}
          />
        </section>
      )}
      <HomeFooter />
    </main>
  )
}
