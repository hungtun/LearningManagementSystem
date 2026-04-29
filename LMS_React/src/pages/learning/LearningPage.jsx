import { useEffect, useState } from 'react'
import { getCourseDetail } from '../../api/coursesApi.js'
import { listMyCourses } from '../../api/enrollmentsApi.js'
import {
  createDiscussion,
  createReview,
  getCourseProgress,
  listDiscussions,
  updateVideoProgress,
} from '../../api/learningApi.js'
import CertificateView from './views/CertificateView.jsx'
import LessonPlayerView from './views/LessonPlayerView.jsx'
import MyCoursesView from './views/MyCoursesView.jsx'
import StudentProgressView from './views/StudentProgressView.jsx'

/**
 * Normalize MyCourseItemResponse + CourseDetailResponse + progress into
 * the enrollment shape the UI expects.
 */
function buildEnrollment(item, courseDetail, progress) {
  const lessons = (courseDetail?.lessons || []).map((l) => ({
    id: l.id,
    title: l.title,
    content: l.content || '',
    duration: l.duration || '',
    orderIndex: l.orderIndex,
    completed: false,
    progressPercent: 0,
  }))

  const completedLessons = progress?.completedLessons ?? 0
  const totalLessons = lessons.length || progress?.totalLessons || 0
  const completionPercent = progress?.completionPercent ?? (totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0)
  const isCompleted = item.status === 'COMPLETED' || completionPercent >= 100

  return {
    id: item.enrollmentId,
    courseId: item.courseId,
    courseTitle: item.courseTitle || courseDetail?.title || '',
    category: courseDetail?.categoryName || '',
    instructor: courseDetail?.instructorName || '',
    enrolledAt: item.enrolledAt,
    status: isCompleted ? 'COMPLETED' : 'ACTIVE',
    completedLessons,
    totalLessons,
    progressPercent: completionPercent,
    lessons,
  }
}

export default function LearningPage({ role }) {
  const isInstructor = role === 'INSTRUCTOR' || role === 'ADMIN'

  if (isInstructor) {
    return <StudentProgressView />
  }

  return <StudentLearning />
}

function StudentLearning() {
  const [enrollments, setEnrollments] = useState([])
  const [discussions, setDiscussions] = useState({})
  const [reviews, setReviews] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [view, setView] = useState('myCourses')
  const [activeEnrollmentId, setActiveEnrollmentId] = useState(null)
  const [activeLessonId, setActiveLessonId] = useState(null)
  const [certificateCourseId, setCertificateCourseId] = useState(null)

  async function loadEnrollments() {
    setLoading(true)
    setError(null)
    try {
      const items = await listMyCourses()
      const list = Array.isArray(items) ? items : (Array.isArray(items?.data) ? items.data : [])

      // For each enrolled course, fetch detail + progress in parallel
      const enriched = await Promise.all(
        list.map(async (item) => {
          const [detail, progress] = await Promise.allSettled([
            getCourseDetail(item.courseId),
            getCourseProgress(item.courseId),
          ])
          return buildEnrollment(
            item,
            detail.status === 'fulfilled' ? detail.value : null,
            progress.status === 'fulfilled' ? progress.value : null,
          )
        })
      )
      setEnrollments(enriched)
    } catch {
      setError('Không thể tải danh sách khóa học.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEnrollments() }, [])

  // ---- navigation ----
  function openPlayer(enrollmentId, lessonId) {
    setActiveEnrollmentId(enrollmentId)
    setActiveLessonId(lessonId)
    setView('player')
  }

  function openCertificate(courseId) {
    setCertificateCourseId(courseId)
    setView('certificate')
  }

  function backToMyCourses() {
    setView('myCourses')
    setActiveEnrollmentId(null)
    setActiveLessonId(null)
  }

  // ---- update helpers ----
  async function updateLessonProgress(enrollmentId, lessonId, progressPercent) {
    const completed = progressPercent >= 100
    // Optimistic UI update
    setEnrollments((prev) =>
      prev.map((enr) => {
        if (enr.id !== enrollmentId) return enr
        const updatedLessons = enr.lessons.map((l) =>
          l.id === lessonId ? { ...l, progressPercent, completed } : l
        )
        const completedCount = updatedLessons.filter((l) => l.completed).length
        const status = completedCount === updatedLessons.length ? 'COMPLETED' : 'ACTIVE'
        return { ...enr, lessons: updatedLessons, completedLessons: completedCount, status }
      })
    )
    // Sync to server (fire & forget)
    try {
      await updateVideoProgress({ lessonId, progressPercent })
    } catch {
      // Keep optimistic UI state
    }
  }

  async function addDiscussion(lessonId, content, currentUser) {
    try {
      const created = await createDiscussion({ lessonId, content })
      const newItem = created?.id
        ? created
        : {
            id: Date.now(),
            userId: currentUser?.id || 0,
            userFullName: currentUser?.fullName || 'Bạn',
            lessonId,
            content,
            createdAt: new Date().toISOString(),
            replies: [],
          }
      setDiscussions((prev) => ({
        ...prev,
        [lessonId]: [newItem, ...(prev[lessonId] || [])],
      }))
    } catch {
      // Ignore discussion creation error
    }
  }

  async function loadDiscussions(lessonId) {
    try {
      const data = await listDiscussions(lessonId)
      const list = Array.isArray(data) ? data : []
      setDiscussions((prev) => ({ ...prev, [lessonId]: list }))
    } catch {
      // Ignore discussion load error
    }
  }

  async function addReview(courseId, rating, comment, currentUser) {
    try {
      const created = await createReview({ courseId, rating, comment })
      const newReview = created?.id
        ? created
        : {
            id: Date.now(),
            courseId,
            userId: currentUser?.id || 0,
            userFullName: currentUser?.fullName || 'Bạn',
            rating,
            comment,
            createdAt: new Date().toISOString(),
          }
      setReviews((prev) => ({
        ...prev,
        [courseId]: [...(prev[courseId] || []), newReview],
      }))
    } catch {
      // Ignore review creation error
    }
  }

  const activeEnrollment = enrollments.find((e) => e.id === activeEnrollmentId) || null
  const activeLesson = activeEnrollment?.lessons?.find((l) => l.id === activeLessonId) || null

  if (loading) {
    return <div className="learningLoading">Đang tải khóa học...</div>
  }

  if (error) {
    return (
      <div className="learningError">
        <p>{error}</p>
        <button type="button" onClick={loadEnrollments}>Thử lại</button>
      </div>
    )
  }

  return (
    <>
      {view === 'myCourses' && (
        <MyCoursesView
          enrollments={enrollments}
          onOpenLesson={openPlayer}
          onOpenCertificate={openCertificate}
        />
      )}

      {view === 'player' && activeEnrollment && (
        <LessonPlayerView
          enrollment={activeEnrollment}
          activeLesson={activeLesson}
          discussions={discussions[activeLessonId] || []}
          reviews={reviews[activeEnrollment.courseId] || []}
          onSelectLesson={(lessonId) => openPlayer(activeEnrollmentId, lessonId)}
          onUpdateProgress={(lessonId, percent) =>
            updateLessonProgress(activeEnrollmentId, lessonId, percent)
          }
          onAddDiscussion={(content, user) => addDiscussion(activeLessonId, content, user)}
          onLoadDiscussions={() => loadDiscussions(activeLessonId)}
          onAddReview={(rating, comment, user) =>
            addReview(activeEnrollment.courseId, rating, comment, user)
          }
          onOpenCertificate={() => openCertificate(activeEnrollment.courseId)}
          onBack={backToMyCourses}
        />
      )}

      {view === 'certificate' && (
        <CertificateView
          enrollment={enrollments.find((e) => e.courseId === certificateCourseId)}
          onBack={backToMyCourses}
        />
      )}
    </>
  )
}
