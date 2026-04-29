import { useEffect, useState } from 'react'
import {
  createCourse,
  deleteCourse as apiDeleteCourse,
  getCourseDetail,
  listPendingCourses,
  listPublishedCourses,
  updateCourse as apiUpdateCourse,
  updateCourseStatus,
} from '../../api/coursesApi.js'
import './CoursesPage.css'
import AdminPendingView from './views/AdminPendingView.jsx'
import CourseDetailView from './views/CourseDetailView.jsx'
import InstructorView from './views/InstructorView.jsx'
import PublicCatalogView from './views/PublicCatalogView.jsx'

function LoadingBox() {
  return <div className="courseLoadingBox">Đang tải dữ liệu...</div>
}

function ErrorBox({ message, onRetry }) {
  return (
    <div className="courseErrorBox">
      <p>{message || 'Đã có lỗi xảy ra.'}</p>
      {onRetry && <button type="button" onClick={onRetry}>Thử lại</button>}
    </div>
  )
}

/**
 * Internal routing for the Courses module:
 *   catalog          → public course list
 *   detail           → course detail
 *   instructor       → instructor management
 *   admin_pending    → admin approval queue
 */
export default function CoursesPage({ role }) {
  const [courses, setCourses] = useState([])
  const [pendingCourses, setPendingCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [view, setView] = useState('catalog')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  async function loadCatalog() {
    setLoading(true)
    setError(null)
    try {
      const data = await listPublishedCourses()
      setCourses(Array.isArray(data) ? data : [])
    } catch {
      setError('Không thể tải danh sách khóa học.')
    } finally {
      setLoading(false)
    }
  }

  async function loadPending() {
    try {
      const data = await listPendingCourses()
      setPendingCourses(Array.isArray(data) ? data : [])
    } catch {
      setPendingCourses([])
    }
  }

  useEffect(() => {
    loadCatalog()
    if (role === 'ADMIN') loadPending()
  }, [role])

  async function goToDetail(courseId) {
    setDetailLoading(true)
    setView('detail')
    try {
      const data = await getCourseDetail(courseId)
      setSelectedCourse(data)
    } catch {
      // Fallback to summary from list
      setSelectedCourse(courses.find((c) => c.id === courseId) || null)
    } finally {
      setDetailLoading(false)
    }
  }

  function goToCatalog() {
    setView('catalog')
    setSelectedCourse(null)
  }

  function goToInstructor() { setView('instructor') }
  function goToAdminPending() { setView('admin_pending') }

  // ---- CRUD handlers ----
  async function handleAddCourse(courseData) {
    const created = await createCourse(courseData)
    setCourses((prev) => [...prev, created])
    return created
  }

  async function handleUpdateCourse(courseId, courseData) {
    const updated = await apiUpdateCourse(courseId, courseData)
    setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)))
    return updated
  }

  async function handleDeleteCourse(courseId) {
    await apiDeleteCourse(courseId)
    setCourses((prev) => prev.filter((c) => c.id !== courseId))
  }

  async function handleUpdateStatus(courseId, statusData) {
    const updated = await updateCourseStatus(courseId, statusData)
    setPendingCourses((prev) => prev.filter((c) => c.id !== courseId))
    setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)))
    return updated
  }

  const pendingCount = pendingCourses.filter((c) => c.publicationStatus === 'PENDING_REVIEW').length

  return (
    <>
      <div className="courseModuleNav">
        <button
          type="button"
          className={view === 'catalog' || view === 'detail' ? 'courseNavBtn active' : 'courseNavBtn'}
          onClick={goToCatalog}
        >
          Danh mục khóa học
        </button>
        {role === 'INSTRUCTOR' && (
          <button
            type="button"
            className={view === 'instructor' ? 'courseNavBtn active' : 'courseNavBtn'}
            onClick={goToInstructor}
          >
            Quản lý khóa học
          </button>
        )}
        {role === 'ADMIN' && (
          <button
            type="button"
            className={view === 'admin_pending' ? 'courseNavBtn active' : 'courseNavBtn'}
            onClick={goToAdminPending}
          >
            Chờ duyệt
            {pendingCount > 0 && <span className="pendingBadge">{pendingCount}</span>}
          </button>
        )}
      </div>

      {view === 'catalog' && (
        loading
          ? <LoadingBox />
          : error
          ? <ErrorBox message={error} onRetry={loadCatalog} />
          : <PublicCatalogView
              courses={courses.filter((c) => c.publicationStatus === 'PUBLISHED')}
              onViewDetail={goToDetail}
            />
      )}

      {view === 'detail' && (
        detailLoading
          ? <LoadingBox />
          : selectedCourse
          ? <CourseDetailView course={selectedCourse} role={role} onBack={goToCatalog} />
          : <ErrorBox message="Không tìm thấy khóa học." onRetry={goToCatalog} />
      )}

      {view === 'instructor' && (
        <InstructorView
          courses={courses}
          role={role}
          onViewDetail={goToDetail}
          onAddCourse={handleAddCourse}
          onUpdateCourse={handleUpdateCourse}
          onDeleteCourse={handleDeleteCourse}
          onReload={loadCatalog}
        />
      )}

      {view === 'admin_pending' && (
        loading
          ? <LoadingBox />
          : <AdminPendingView
              courses={pendingCourses}
              allCourses={courses}
              onUpdateStatus={handleUpdateStatus}
              onViewDetail={goToDetail}
            />
      )}
    </>
  )
}
