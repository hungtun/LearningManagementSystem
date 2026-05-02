import { useEffect, useState } from 'react'
import { logout } from '../api/auth.js'
import {
  listInstructorSubmissions,
  gradeSubmission,
  getQuizByLesson,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getAssignmentByLesson,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../api/assessments.js'
import {
  addLesson,
  createCourse,
  deleteCourse,
  deleteLesson,
  deleteLessonAttachment,
  getMyLessonDetail,
  listMyInstructorCourses,
  updateCourse,
  updateLesson,
  uploadLessonAttachment,
} from '../api/courses.js'
import { listCourseStudents } from '../api/enrollments.js'
import { setToken } from '../api/http.js'
import { listDiscussions, createDiscussion } from '../api/learnings.js'
import { getInstructorAnalytics, listCategories, listNotifications, markAllNotificationsRead } from '../api/system.js'
import { useNotificationPolling } from '../hooks/useNotificationPolling.js'
import { getMyCourseDetail } from '../api/courses.js'
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

export default function InstructorDashboard({ currentUser, onLoggedOut }) {
  const [activeScreen, setActiveScreen] = useState('overview')
  const [globalError, setGlobalError] = useState('')
  const [globalSuccess, setGlobalSuccess] = useState('')

  const [analytics, setAnalytics] = useState(null)
  const [myCourses, setMyCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)

  const [courseStudents, setCourseStudents] = useState([])
  const [submissions, setSubmissions] = useState([])

  const [discussionLessonId, setDiscussionLessonId] = useState(null)
  const [discussions, setDiscussions] = useState([])
  const [newDiscussion, setNewDiscussion] = useState('')
  const [replyToId, setReplyToId] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [isPostingReply, setIsPostingReply] = useState(false)

  const [courseForm, setCourseForm] = useState({ id: null, title: '', description: '', categoryId: '' })
  const [lessonForm, setLessonForm] = useState({ id: null, title: '', content: '', videoUrl: '' })
  const [selectedLessonForAssignment, setSelectedLessonForAssignment] = useState(null)
  const [assignmentData, setAssignmentData] = useState(null)
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', maxScore: 100, startAt: '', endAt: '' })
  const [isAssignmentFormOpen, setIsAssignmentFormOpen] = useState(false)

  const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState(null)
  const [quizData, setQuizData] = useState(null)
  const [quizForm, setQuizForm] = useState({ title: '', description: '', passScore: 0, startAt: '', endAt: '' })
  const [questionForm, setQuestionForm] = useState({ id: null, questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', point: 1, orderIndex: 0 })
  const [isQuizFormOpen, setIsQuizFormOpen] = useState(false)

  const [selectedLessonForAttachment, setSelectedLessonForAttachment] = useState(null)
  const [lessonAttachments, setLessonAttachments] = useState([])
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false)
  const [gradeForm, setGradeForm] = useState({ submissionId: null, submissionType: '', score: 0, feedback: '' })

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [confirmDialog, setConfirmDialog] = useState({ open: false, message: '', onConfirm: null })

  useNotificationPolling(setNotifications)

  const accountLabel = (currentUser?.fullName?.trim()?.split(/\s+/)?.slice(0, 2)?.map((w) => w[0])?.join('')?.toUpperCase()) || 'I'

  useEffect(() => {
    loadOverview()
    loadMyCourses()
    listCategories().then((data) => setCategories(Array.isArray(data) ? data : [])).catch(() => {})
    listNotifications().then((data) => setNotifications(Array.isArray(data) ? data : [])).catch(() => {})
  }, [])

  async function loadOverview() {
    try {
      const data = await getInstructorAnalytics()
      setAnalytics(data)
    } catch (_) {
      setAnalytics(null)
    }
  }

  async function loadMyCourses() {
    try {
      const data = await listMyInstructorCourses()
      setMyCourses(Array.isArray(data) ? data : [])
    } catch (_) {
      setMyCourses([])
    }
  }

  async function handleLogout() {
    try { await logout() } catch (_) {}
    setToken(null)
    onLoggedOut?.()
  }

  function notifySuccess(msg) {
    setGlobalError('')
    setGlobalSuccess(msg)
  }

  function notifyError(msg) {
    setGlobalSuccess('')
    setGlobalError(msg)
  }

  function openConfirmDialog(message, onConfirm) {
    setConfirmDialog({ open: true, message, onConfirm })
  }

  async function handleConfirmDialogOk() {
    const action = confirmDialog.onConfirm
    setConfirmDialog({ open: false, message: '', onConfirm: null })
    if (typeof action === 'function') {
      await action()
    }
  }

  function handleConfirmDialogCancel() {
    setConfirmDialog({ open: false, message: '', onConfirm: null })
  }

  async function handleOpenCourseStudents(course) {
    setSelectedCourse(course)
    setCourseStudents([])
    setActiveScreen('students')
    try {
      const data = await listCourseStudents(course.id)
      setCourseStudents(Array.isArray(data) ? data : [])
    } catch (_) {
      setCourseStudents([])
    }
  }

  async function handleOpenDiscussions(lesson) {
    setDiscussionLessonId(lesson.id)
    setDiscussions([])
    setNewDiscussion('')
    setActiveScreen('discussions')
    try {
      const data = await listDiscussions(lesson.id)
      setDiscussions(Array.isArray(data) ? data : [])
    } catch (_) { setDiscussions([]) }
  }

  async function refreshDiscussions() {
    const updated = await listDiscussions(discussionLessonId)
    setDiscussions(Array.isArray(updated) ? updated : [])
  }

  async function handlePostDiscussion(event) {
    event.preventDefault()
    const content = newDiscussion.trim()
    if (!content || !discussionLessonId) return
    try {
      await createDiscussion({ lessonId: discussionLessonId, content })
      await refreshDiscussions()
      setNewDiscussion('')
      notifySuccess('Reply posted')
    } catch (_) {
      notifyError('Failed to post reply')
    }
  }

  async function handlePostReply(event) {
    event.preventDefault()
    const content = replyContent.trim()
    if (!content || !discussionLessonId || !replyToId) return
    setIsPostingReply(true)
    try {
      await createDiscussion({ lessonId: discussionLessonId, content, parentId: replyToId })
      await refreshDiscussions()
      setReplyToId(null)
      setReplyContent('')
      notifySuccess('Reply posted')
    } catch (_) {
      notifyError('Failed to post reply')
    } finally {
      setIsPostingReply(false)
    }
  }

  async function handleOpenSubmissions() {
    setActiveScreen('submissions')
    try {
      const data = await listInstructorSubmissions()
      setSubmissions(Array.isArray(data) ? data : [])
    } catch (_) {
      setSubmissions([])
    }
  }

  async function handleGrade(event) {
    event.preventDefault()
    try {
      await gradeSubmission(gradeForm)
      const updated = await listInstructorSubmissions()
      setSubmissions(Array.isArray(updated) ? updated : [])
      setGradeForm({ submissionId: null, submissionType: '', score: 0, feedback: '' })
      notifySuccess('Graded successfully')
    } catch (_) {
      notifyError('Failed to grade')
    }
  }

  function openCreateCourse() {
    setCourseForm({ id: null, title: '', description: '', categoryId: categories[0]?.id || '' })
    setActiveScreen('courseForm')
  }

  function openEditCourse(course) {
    setCourseForm({
      id: course.id,
      title: course.title,
      description: course.description || '',
      categoryId: course.categoryId || '',
    })
    setActiveScreen('courseForm')
  }

  async function handleSaveCourse(event) {
    event.preventDefault()
    const { id, title, description, categoryId } = courseForm
    try {
      if (id) {
        await updateCourse(id, { title, description, categoryId })
        notifySuccess('Course updated')
      } else {
        await createCourse({ title, description, categoryId, instructorId: currentUser.id })
        notifySuccess('Course created')
      }
      await loadMyCourses()
      setActiveScreen('courses')
    } catch (_) {
      notifyError('Failed to save course')
    }
  }

  async function handleSubmitForReview(course) {
    try {
      await updateCourse(course.id, {
        title: course.title,
        description: course.description || '',
        categoryId: course.categoryId,
        submitForReview: true,
      })
      await loadMyCourses()
      notifySuccess('Submitted for review')
    } catch (_) {
      notifyError('Failed to submit for review')
    }
  }

  async function handleDeleteCourse(course) {
    if (!window.confirm(`Delete course "${course.title}"?`)) return
    try {
      await deleteCourse(course.id)
      await loadMyCourses()
      notifySuccess('Course deleted')
    } catch (_) {
      notifyError('Cannot delete course with enrolled students')
    }
  }

  async function handleOpenLessons(course) {
    try {
      const detail = await getMyCourseDetail(course.id)
      setSelectedCourse({ ...course, lessons: detail.lessons || [] })
    } catch (_) {
      setSelectedCourse({ ...course, lessons: [] })
    }
    setLessonForm({ id: null, title: '', content: '', videoUrl: '' })
    setActiveScreen('lessons')
  }

  async function handleSaveLesson(event) {
    event.preventDefault()
    const { id, title, content, videoUrl } = lessonForm
    try {
      if (id) {
        await updateLesson(id, { title, content, videoUrl })
        notifySuccess('Lesson updated')
      } else {
        await addLesson(selectedCourse.id, { title, content, videoUrl })
        notifySuccess('Lesson added')
      }
      const detail = await getMyCourseDetail(selectedCourse.id)
      setSelectedCourse((prev) => ({ ...prev, lessons: detail.lessons || [] }))
      setLessonForm({ id: null, title: '', content: '', videoUrl: '' })
    } catch (_) {
      notifyError('Failed to save lesson')
    }
  }

  async function handleOpenAssignment(lesson) {
    setSelectedLessonForAssignment(lesson)
    setAssignmentData(null)
    setIsAssignmentFormOpen(false)
    try {
      const data = await getAssignmentByLesson(lesson.id)
      setAssignmentData(data)
      setAssignmentForm({
        title: data.title,
        description: data.description || '',
        maxScore: data.maxScore,
        startAt: data.startAt ? data.startAt.slice(0, 16) : '',
        endAt: data.endAt ? data.endAt.slice(0, 16) : '',
      })
    } catch (_) {
      setAssignmentData(null)
      setAssignmentForm({ title: '', description: '', maxScore: 100, startAt: '', endAt: '' })
    }
  }

  async function handleSaveAssignment(event) {
    event.preventDefault()
    try {
      if (assignmentData) {
        const updated = await updateAssignment(assignmentData.assignmentId, assignmentForm)
        setAssignmentData(updated)
        notifySuccess('Assignment updated')
      } else {
        const created = await createAssignment({ lessonId: selectedLessonForAssignment.id, ...assignmentForm })
        setAssignmentData(created)
        notifySuccess('Assignment created')
      }
      setIsAssignmentFormOpen(false)
    } catch (_) {
      notifyError('Failed to save assignment')
    }
  }

  async function handleDeleteAssignment() {
    if (!window.confirm('Delete this assignment?')) return
    try {
      await deleteAssignment(assignmentData.assignmentId)
      setAssignmentData(null)
      setAssignmentForm({ title: '', description: '', maxScore: 100, startAt: '', endAt: '' })
      notifySuccess('Assignment deleted')
    } catch (_) {
      notifyError('Failed to delete assignment')
    }
  }

  async function handleOpenQuiz(lesson) {
    setSelectedLessonForQuiz(lesson)
    setQuizData(null)
    setIsQuizFormOpen(false)
    try {
      const data = await getQuizByLesson(lesson.id)
      setQuizData(data)
      setQuizForm({
        title: data.title,
        description: data.description || '',
        passScore: data.passScore || 0,
        startAt: data.startAt ? data.startAt.slice(0, 16) : '',
        endAt: data.endAt ? data.endAt.slice(0, 16) : '',
      })
    } catch (_) {
      setQuizData(null)
      setQuizForm({ title: '', description: '', passScore: 0, startAt: '', endAt: '' })
    }
  }

  async function handleSaveQuiz(event) {
    event.preventDefault()
    try {
      if (quizData) {
        const updated = await updateQuiz(quizData.quizId, quizForm)
        setQuizData(updated)
        notifySuccess('Quiz updated')
      } else {
        const created = await createQuiz({ lessonId: selectedLessonForQuiz.id, ...quizForm })
        setQuizData(created)
        notifySuccess('Quiz created')
      }
      setIsQuizFormOpen(false)
    } catch (_) {
      notifyError('Failed to save quiz')
    }
  }

  async function handleDeleteQuiz() {
    if (!window.confirm('Delete this quiz and all its questions?')) return
    try {
      await deleteQuiz(quizData.quizId)
      setQuizData(null)
      setQuizForm({ title: '', description: '', passScore: 0, startAt: '', endAt: '' })
      notifySuccess('Quiz deleted')
    } catch (_) {
      notifyError('Failed to delete quiz')
    }
  }

  async function handleSaveQuestion(event) {
    event.preventDefault()
    try {
      let updated
      if (questionForm.id) {
        updated = await updateQuestion(quizData.quizId, questionForm.id, questionForm)
        notifySuccess('Question updated')
      } else {
        updated = await addQuestion(quizData.quizId, questionForm)
        notifySuccess('Question added')
      }
      setQuizData(updated)
      setQuestionForm({ id: null, questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', point: 1, orderIndex: 0 })
    } catch (_) {
      notifyError('Failed to save question')
    }
  }

  async function handleDeleteQuestion(questionId) {
    if (!window.confirm('Delete this question?')) return
    try {
      const updated = await deleteQuestion(quizData.quizId, questionId)
      setQuizData(updated)
      notifySuccess('Question deleted')
    } catch (_) {
      notifyError('Failed to delete question')
    }
  }

  async function handleOpenAttachments(lesson) {
    setSelectedLessonForAttachment(lesson)
    try {
      const detail = await getMyLessonDetail(lesson.id)
      setLessonAttachments(Array.isArray(detail.attachments) ? detail.attachments : [])
    } catch (_) {
      setLessonAttachments([])
    }
  }

  async function handleUploadAttachment(event) {
    const file = event.target.files?.[0]
    if (!file || !selectedLessonForAttachment) return
    setIsUploadingAttachment(true)
    try {
      await uploadLessonAttachment(selectedLessonForAttachment.id, file)
      const detail = await getMyLessonDetail(selectedLessonForAttachment.id)
      setLessonAttachments(Array.isArray(detail.attachments) ? detail.attachments : [])
      notifySuccess('Attachment uploaded')
    } catch (_) {
      notifyError('Failed to upload attachment')
    } finally {
      setIsUploadingAttachment(false)
      event.target.value = ''
    }
  }

  async function handleDeleteAttachment(attachmentId) {
    if (!window.confirm('Delete this attachment?')) return
    try {
      await deleteLessonAttachment(attachmentId)
      setLessonAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
      notifySuccess('Attachment deleted')
    } catch (_) {
      notifyError('Failed to delete attachment')
    }
  }

  async function handleDeleteLesson(lesson) {
    openConfirmDialog(`Are you sure you want to delete lesson "${lesson.title}"?`, async () => {
      try {
        await deleteLesson(lesson.id)
        const detail = await getMyCourseDetail(selectedCourse.id)
        setSelectedCourse((prev) => ({ ...prev, lessons: detail.lessons || [] }))
        notifySuccess('Lesson deleted')
      } catch (_) {
        notifyError('Failed to delete lesson')
      }
    })
  }

  return (
    <div className="dashboardRoot">
      {/* Header */}
      <header className="dashboardHeader">
        <div className="headerLogo">LearnHub - Instructor</div>
        <nav style={{ display: 'flex', gap: 8, flex: 1 }}>
          {[
            ['overview', 'Overview'],
            ['courses', 'My Courses'],
            ['submissions', 'Submissions'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="headerNavBtn"
              style={{ fontWeight: activeScreen === key || (key === 'courses' && ['courseForm', 'lessons', 'students', 'discussions'].includes(activeScreen)) ? 700 : 400 }}
              onClick={() => { setActiveScreen(key); if (key === 'submissions') handleOpenSubmissions() }}
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
            <button
              className="avatarButton"
              type="button"
              onClick={() => { setIsAccountMenuOpen((s) => !s); setIsNotificationMenuOpen(false) }}
            >
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
            <h2 style={{ marginBottom: 16 }}>Instructor Overview</h2>
            <p>Welcome back, <strong>{currentUser?.fullName}</strong></p>
            {analytics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginTop: 16 }}>
                {[
                  ['Total Courses', analytics.totalCourses],
                  ['Published', analytics.publishedCourses],
                  ['Total Enrollments', analytics.totalEnrollments],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: 20, textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 28, fontWeight: 700, color: '#1e40af' }}>{value ?? '-'}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Course list */}
        {activeScreen === 'courses' && (
          <section>
            <div className="profileHeaderRow">
              <h2>My Courses</h2>
              <button type="button" className="primaryButton" onClick={openCreateCourse}>+ New Course</button>
            </div>
            {myCourses.length === 0
              ? <p className="noteText">No courses yet. Create one to get started.</p>
              : (
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['Title', 'Category', 'Status', 'Actions'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 13, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {myCourses.map((course) => (
                      <tr key={course.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px 14px', fontSize: 14 }}>{course.title}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13, color: '#666' }}>{course.categoryName || '-'}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13 }}>
                          <span style={{
                            background: course.publicationStatus === 'PUBLISHED' ? '#dcfce7' : course.publicationStatus === 'PENDING_REVIEW' ? '#fef9c3' : '#f3f4f6',
                            color: course.publicationStatus === 'PUBLISHED' ? '#15803d' : course.publicationStatus === 'PENDING_REVIEW' ? '#854d0e' : '#555',
                            borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600,
                          }}>
                            {course.publicationStatus || 'DRAFT'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button type="button" className="secondaryButton" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => openEditCourse(course)}>Edit</button>
                            <button type="button" className="secondaryButton" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => handleOpenLessons(course)}>Lessons</button>
                            <button type="button" className="secondaryButton" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => handleOpenCourseStudents(course)}>Students</button>
                            {(course.publicationStatus === 'DRAFT' || course.publicationStatus === 'REJECTED') && (
                              <button type="button" className="primaryButton small" onClick={() => handleSubmitForReview(course)}>Submit Review</button>
                            )}
                            <button type="button" style={{ fontSize: 12, padding: '4px 10px', background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 4, cursor: 'pointer' }} onClick={() => handleDeleteCourse(course)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </section>
        )}

        {/* Course form */}
        {activeScreen === 'courseForm' && (
          <section>
            <div className="profileHeaderRow">
              <h2>{courseForm.id ? 'Edit Course' : 'New Course'}</h2>
              <button type="button" className="secondaryButton" onClick={() => setActiveScreen('courses')}>Back</button>
            </div>
            <div className="dataBlock" style={{ maxWidth: 600 }}>
              <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 600 }}>
                  Title *
                  <input
                    value={courseForm.title}
                    onChange={(e) => setCourseForm((s) => ({ ...s, title: e.target.value }))}
                    required maxLength={500}
                    style={{ border: '1px solid #ccc', borderRadius: 4, padding: '7px 10px', fontSize: 14 }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 600 }}>
                  Description
                  <textarea
                    rows={4}
                    value={courseForm.description}
                    onChange={(e) => setCourseForm((s) => ({ ...s, description: e.target.value }))}
                    style={{ border: '1px solid #ccc', borderRadius: 4, padding: '7px 10px', fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 600 }}>
                  Category *
                  <select
                    value={courseForm.categoryId}
                    onChange={(e) => setCourseForm((s) => ({ ...s, categoryId: e.target.value }))}
                    required
                    style={{ border: '1px solid #ccc', borderRadius: 4, padding: '7px 10px', fontSize: 14 }}
                  >
                    <option value="">-- Select category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="primaryButton">Save</button>
                  <button type="button" className="secondaryButton" onClick={() => setActiveScreen('courses')}>Cancel</button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Lesson management */}
        {activeScreen === 'lessons' && selectedCourse && (
          <section>
            <div className="profileHeaderRow">
              <h2>Lessons - {selectedCourse.title}</h2>
              <button type="button" className="secondaryButton" onClick={() => setActiveScreen('courses')}>Back to Courses</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
              <div className="dataBlock">
                <h3>Lesson list ({selectedCourse.lessons?.length || 0})</h3>
                {(!selectedCourse.lessons || selectedCourse.lessons.length === 0)
                  ? <p className="noteText">No lessons yet.</p>
                  : (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                      {selectedCourse.lessons.map((lesson, idx) => (
                        <li key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <span style={{ color: '#888', fontSize: 12, minWidth: 24 }}>{idx + 1}.</span>
                          <span style={{ flex: 1, fontSize: 14 }}>{lesson.title}</span>
                          <button
                            type="button"
                            className="secondaryButton"
                            style={{ fontSize: 12, padding: '3px 9px' }}
                            onClick={() => { setLessonForm({ id: lesson.id, title: lesson.title, content: lesson.content || '', videoUrl: lesson.videoUrl || '' }) }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            style={{ fontSize: 12, padding: '3px 9px', background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 4, cursor: 'pointer' }}
                            onClick={() => handleDeleteLesson(lesson)}
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            className="secondaryButton"
                            style={{ fontSize: 12, padding: '3px 9px' }}
                            onClick={() => handleOpenAssignment(lesson)}
                          >
                            Assignment
                          </button>
                          <button
                            type="button"
                            className="secondaryButton"
                            style={{ fontSize: 12, padding: '3px 9px' }}
                            onClick={() => handleOpenQuiz(lesson)}
                          >
                            Quiz
                          </button>
                          <button
                            type="button"
                            className="secondaryButton"
                            style={{ fontSize: 12, padding: '3px 9px' }}
                            onClick={() => handleOpenAttachments(lesson)}
                          >
                            Attachments
                          </button>
                          <button
                            type="button"
                            className="secondaryButton"
                            style={{ fontSize: 12, padding: '3px 9px' }}
                            onClick={() => handleOpenDiscussions(lesson)}
                          >
                            Discussions
                          </button>
                        </li>
                      ))}
                    </ul>
                  )
                }
              </div>
              <div className="dataBlock">
                <h3>{lessonForm.id ? 'Edit Lesson' : 'Add Lesson'}</h3>
                <form onSubmit={handleSaveLesson} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 600 }}>
                    Title *
                    <input
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm((s) => ({ ...s, title: e.target.value }))}
                      required maxLength={500}
                      style={{ border: '1px solid #ccc', borderRadius: 4, padding: '6px 10px', fontSize: 14 }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 600 }}>
                    Content
                    <textarea
                      rows={5}
                      value={lessonForm.content}
                      onChange={(e) => setLessonForm((s) => ({ ...s, content: e.target.value }))}
                      style={{ border: '1px solid #ccc', borderRadius: 4, padding: '6px 10px', fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 600 }}>
                    Video URL (YouTube or direct)
                    <input
                      type="url"
                      value={lessonForm.videoUrl}
                      onChange={(e) => setLessonForm((s) => ({ ...s, videoUrl: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                      maxLength={2048}
                      style={{ border: '1px solid #ccc', borderRadius: 4, padding: '6px 10px', fontSize: 14 }}
                    />
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="primaryButton small">Save</button>
                    {lessonForm.id && (
                      <button type="button" className="secondaryButton" onClick={() => setLessonForm({ id: null, title: '', content: '', videoUrl: '' })}>Cancel Edit</button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {selectedLessonForAttachment && (
              <div className="dataBlock" style={{ marginTop: 20 }}>
                <h3>Attachments - {selectedLessonForAttachment.title}</h3>
                {lessonAttachments.length === 0
                  ? <p className="noteText">No attachments yet.</p>
                  : (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                      {lessonAttachments.map((att) => (
                        <li key={att.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 13, color: '#2563eb' }}>
                            {att.fileName}
                          </a>
                          <span style={{ fontSize: 12, color: '#888' }}>{att.fileType}</span>
                          {att.fileSize && <span style={{ fontSize: 12, color: '#888' }}>{(att.fileSize / 1024).toFixed(1)} KB</span>}
                          <button
                            type="button"
                            style={{ fontSize: 12, padding: '2px 8px', background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 4, cursor: 'pointer' }}
                            onClick={() => handleDeleteAttachment(att.id)}
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  )
                }
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {isUploadingAttachment ? 'Uploading...' : 'Upload file'}
                  <input
                    type="file"
                    style={{ fontSize: 13 }}
                    disabled={isUploadingAttachment}
                    onChange={handleUploadAttachment}
                  />
                </label>
              </div>
            )}
          </section>
        )}

        {/* Assignment form */}
        {activeScreen === 'lessons' && selectedLessonForAssignment && (
          <section>
            <div className="dataBlock" style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3>Assignment - {selectedLessonForAssignment.title}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  {assignmentData && (
                    <button type="button" style={{ fontSize: 12, padding: '3px 9px', background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 4, cursor: 'pointer' }} onClick={handleDeleteAssignment}>Delete Assignment</button>
                  )}
                  <button type="button" className="secondaryButton" style={{ fontSize: 12, padding: '3px 9px' }} onClick={() => setIsAssignmentFormOpen((v) => !v)}>
                    {assignmentData ? 'Edit Assignment' : 'Create Assignment'}
                  </button>
                </div>
              </div>
              {assignmentData && !isAssignmentFormOpen && (
                <div>
                  <strong style={{ fontSize: 14 }}>{assignmentData.title}</strong>
                  {assignmentData.description && <p style={{ fontSize: 13, color: '#555', marginTop: 3 }}>{assignmentData.description}</p>}
                  <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Max score: {assignmentData.maxScore}</p>
                  <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    Time: {assignmentData.startAt ? new Date(assignmentData.startAt).toLocaleString('vi-VN') : '-'} - {assignmentData.endAt ? new Date(assignmentData.endAt).toLocaleString('vi-VN') : '-'}
                  </p>
                </div>
              )}
              {isAssignmentFormOpen && (
                <form onSubmit={handleSaveAssignment} style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc', padding: 12, borderRadius: 6 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13, fontWeight: 600 }}>
                    Title *
                    <input value={assignmentForm.title} onChange={(e) => setAssignmentForm((s) => ({ ...s, title: e.target.value }))} required style={{ border: '1px solid #ccc', borderRadius: 4, padding: '5px 8px', fontSize: 13 }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13, fontWeight: 600 }}>
                    Description
                    <textarea rows={3} value={assignmentForm.description} onChange={(e) => setAssignmentForm((s) => ({ ...s, description: e.target.value }))} style={{ border: '1px solid #ccc', borderRadius: 4, padding: '5px 8px', fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13, fontWeight: 600, width: 140 }}>
                    Max Score
                    <input type="number" min={1} value={assignmentForm.maxScore} onChange={(e) => setAssignmentForm((s) => ({ ...s, maxScore: Number(e.target.value) }))} style={{ border: '1px solid #ccc', borderRadius: 4, padding: '5px 8px', fontSize: 13, width: 80 }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13, fontWeight: 600 }}>
                    Start Time
                    <input
                      type="datetime-local"
                      value={assignmentForm.startAt}
                      onChange={(e) => setAssignmentForm((s) => ({ ...s, startAt: e.target.value }))}
                      required
                      style={{ border: '1px solid #ccc', borderRadius: 4, padding: '5px 8px', fontSize: 13 }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13, fontWeight: 600 }}>
                    End Time
                    <input
                      type="datetime-local"
                      value={assignmentForm.endAt}
                      onChange={(e) => setAssignmentForm((s) => ({ ...s, endAt: e.target.value }))}
                      required
                      style={{ border: '1px solid #ccc', borderRadius: 4, padding: '5px 8px', fontSize: 13 }}
                    />
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="primaryButton small">Save</button>
                    <button type="button" className="secondaryButton" onClick={() => setIsAssignmentFormOpen(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </section>
        )}

        {/* Quiz builder */}
        {activeScreen === 'lessons' && selectedLessonForQuiz && (
          <section>
            <div className="dataBlock" style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3>Quiz - {selectedLessonForQuiz.title}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  {quizData && (
                    <button type="button" style={{ fontSize: 12, padding: '3px 9px', background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 4, cursor: 'pointer' }} onClick={handleDeleteQuiz}>Delete Quiz</button>
                  )}
                  <button type="button" className="secondaryButton" style={{ fontSize: 12, padding: '3px 9px' }} onClick={() => { setIsQuizFormOpen((v) => !v) }}>
                    {quizData ? 'Edit Quiz Info' : 'Create Quiz'}
                  </button>
                </div>
              </div>
              {isQuizFormOpen && (
                <form onSubmit={handleSaveQuiz} style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc', padding: 12, borderRadius: 6, marginBottom: 16 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13, fontWeight: 600 }}>
                    Title *
                    <input value={quizForm.title} onChange={(e) => setQuizForm((s) => ({ ...s, title: e.target.value }))} required style={{ border: '1px solid #ccc', borderRadius: 4, padding: '5px 8px', fontSize: 13 }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13, fontWeight: 600 }}>
                    Description
                    <textarea rows={2} value={quizForm.description} onChange={(e) => setQuizForm((s) => ({ ...s, description: e.target.value }))} style={{ border: '1px solid #ccc', borderRadius: 4, padding: '5px 8px', fontSize: 13, resize: 'none', fontFamily: 'inherit' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13, fontWeight: 600, width: 120 }}>
                    Pass Score
                    <input type="number" min={0} value={quizForm.passScore} onChange={(e) => setQuizForm((s) => ({ ...s, passScore: Number(e.target.value) }))} style={{ border: '1px solid #ccc', borderRadius: 4, padding: '5px 8px', fontSize: 13, width: 80 }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13, fontWeight: 600 }}>
                    Start Time
                    <input
                      type="datetime-local"
                      value={quizForm.startAt}
                      onChange={(e) => setQuizForm((s) => ({ ...s, startAt: e.target.value }))}
                      required
                      style={{ border: '1px solid #ccc', borderRadius: 4, padding: '5px 8px', fontSize: 13 }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13, fontWeight: 600 }}>
                    End Time
                    <input
                      type="datetime-local"
                      value={quizForm.endAt}
                      onChange={(e) => setQuizForm((s) => ({ ...s, endAt: e.target.value }))}
                      required
                      style={{ border: '1px solid #ccc', borderRadius: 4, padding: '5px 8px', fontSize: 13 }}
                    />
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="primaryButton small">Save</button>
                    <button type="button" className="secondaryButton" onClick={() => setIsQuizFormOpen(false)}>Cancel</button>
                  </div>
                </form>
              )}
              {quizData && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <strong style={{ fontSize: 14 }}>{quizData.title}</strong>
                    {quizData.description && <p style={{ fontSize: 13, color: '#555', marginTop: 3 }}>{quizData.description}</p>}
                    <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Pass score: {quizData.passScore}</p>
                    <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      Time: {quizData.startAt ? new Date(quizData.startAt).toLocaleString('vi-VN') : '-'} - {quizData.endAt ? new Date(quizData.endAt).toLocaleString('vi-VN') : '-'}
                    </p>
                  </div>
                  {quizData.questions?.length > 0 && (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                      {quizData.questions.map((q, idx) => (
                        <li key={q.questionId} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', background: '#fff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <strong style={{ fontSize: 13 }}>{idx + 1}. {q.questionText}</strong>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button type="button" className="secondaryButton" style={{ fontSize: 11, padding: '2px 7px' }} onClick={() => setQuestionForm({ id: q.questionId, questionText: q.questionText, optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD, correctOption: q.correctOption, point: q.point, orderIndex: q.orderIndex })}>Edit</button>
                              <button type="button" style={{ fontSize: 11, padding: '2px 7px', background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: 4, cursor: 'pointer' }} onClick={() => handleDeleteQuestion(q.questionId)}>Delete</button>
                            </div>
                          </div>
                          <ul style={{ listStyle: 'none', marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                            {['A', 'B', 'C', 'D'].map((opt) => (
                              <li key={opt} style={{ fontSize: 12, color: q.correctOption === opt ? '#16a34a' : '#444', fontWeight: q.correctOption === opt ? 700 : 400 }}>
                                {opt}. {q[`option${opt}`]}
                              </li>
                            ))}
                          </ul>
                          <span style={{ fontSize: 11, color: '#888', marginTop: 4, display: 'block' }}>{q.point} pt</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <form onSubmit={handleSaveQuestion} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 12, background: '#f8fafc' }}>
                    <strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>{questionForm.id ? 'Edit Question' : 'Add Question'}</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input placeholder="Question text *" value={questionForm.questionText} onChange={(e) => setQuestionForm((s) => ({ ...s, questionText: e.target.value }))} required style={{ border: '1px solid #ccc', borderRadius: 4, padding: '5px 8px', fontSize: 13 }} />
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <input key={opt} placeholder={`Option ${opt} *`} value={questionForm[`option${opt}`]} onChange={(e) => setQuestionForm((s) => ({ ...s, [`option${opt}`]: e.target.value }))} required style={{ border: '1px solid #ccc', borderRadius: 4, padding: '5px 8px', fontSize: 13 }} />
                      ))}
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <label style={{ fontSize: 13, fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}>
                          Correct:
                          <select value={questionForm.correctOption} onChange={(e) => setQuestionForm((s) => ({ ...s, correctOption: e.target.value }))} style={{ border: '1px solid #ccc', borderRadius: 4, padding: '4px 8px', fontSize: 13 }}>
                            {['A', 'B', 'C', 'D'].map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </label>
                        <label style={{ fontSize: 13, fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}>
                          Points:
                          <input type="number" min={1} value={questionForm.point} onChange={(e) => setQuestionForm((s) => ({ ...s, point: Number(e.target.value) }))} style={{ border: '1px solid #ccc', borderRadius: 4, padding: '4px 6px', fontSize: 13, width: 60 }} />
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" className="primaryButton small">Save</button>
                        {questionForm.id && <button type="button" className="secondaryButton" onClick={() => setQuestionForm({ id: null, questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', point: 1, orderIndex: 0 })}>Cancel</button>}
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>
          </section>
        )}

        {/* Students */}
        {activeScreen === 'students' && selectedCourse && (
          <section>
            <div className="profileHeaderRow">
              <h2>Students - {selectedCourse.title}</h2>
              <button type="button" className="secondaryButton" onClick={() => setActiveScreen('courses')}>Back</button>
            </div>
            <div className="dataBlock">
              <h3>Enrolled students ({courseStudents.length})</h3>
              {courseStudents.length === 0
                ? <p className="noteText">No students enrolled.</p>
                : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Name', 'Email', 'Status', 'Enrolled At'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '9px 12px', fontSize: 13, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {courseStudents.map((s) => (
                        <tr key={s.userId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '9px 12px', fontSize: 14 }}>{s.fullName}</td>
                          <td style={{ padding: '9px 12px', fontSize: 13, color: '#666' }}>{s.email}</td>
                          <td style={{ padding: '9px 12px', fontSize: 13 }}>{s.enrollmentStatus}</td>
                          <td style={{ padding: '9px 12px', fontSize: 13, color: '#666' }}>{formatDate(s.enrolledAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              }
            </div>
          </section>
        )}

        {/* Discussions */}
        {activeScreen === 'discussions' && (
          <section>
            <div className="profileHeaderRow">
              <h2>Discussions</h2>
              <button type="button" className="secondaryButton" onClick={() => setActiveScreen('lessons')}>Back to Lessons</button>
            </div>
            <div className="dataBlock">
              {discussions.length === 0
                ? <p className="noteText">No discussions yet.</p>
                : (
                  <ul className="discussionList" style={{ marginBottom: 16 }}>
                    {discussions.map((d) => (
                      <li key={d.id} className="discussionItem">
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                          <strong>{d.userFullName || 'User'}</strong>
                          {d.userRole && (
                            <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>
                              {d.userRole.replace('ROLE_', '')}
                            </span>
                          )}
                          <span className="discussionDate">{formatDate(d.createdAt)}</span>
                        </div>
                        <p style={{ margin: '4px 0 6px' }}>{d.content}</p>
                        <button
                          type="button"
                          style={{ fontSize: 12, background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0 }}
                          onClick={() => {
                            if (replyToId === d.id) { setReplyToId(null); setReplyContent('') }
                            else { setReplyToId(d.id); setReplyContent('') }
                          }}
                        >
                          {replyToId === d.id ? 'Cancel reply' : 'Reply'}
                        </button>
                        {replyToId === d.id && (
                          <form onSubmit={handlePostReply} style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                            <textarea
                              rows={2}
                              placeholder="Write a reply..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              required
                              style={{ flex: 1, border: '1px solid #ccc', borderRadius: 4, padding: '4px 8px', fontSize: 13, resize: 'none', fontFamily: 'inherit' }}
                            />
                            <button
                              type="submit"
                              className="primaryButton small"
                              disabled={isPostingReply || !replyContent.trim()}
                              style={{ alignSelf: 'flex-end' }}
                            >
                              {isPostingReply ? '...' : 'Post'}
                            </button>
                          </form>
                        )}
                        {d.replies && d.replies.length > 0 && (
                          <ul style={{ marginTop: 8, paddingLeft: 20, borderLeft: '2px solid #e5e7eb', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {d.replies.map((r) => (
                              <li key={r.id} className="discussionItem" style={{ background: '#f8fafc' }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                                  <strong>{r.userFullName || 'User'}</strong>
                                  {r.userRole && (
                                    <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>
                                      {r.userRole.replace('ROLE_', '')}
                                    </span>
                                  )}
                                  <span className="discussionDate">{formatDate(r.createdAt)}</span>
                                </div>
                                <p style={{ margin: '4px 0' }}>{r.content}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )
              }
              <form className="discussionForm" onSubmit={handlePostDiscussion}>
                <textarea
                  rows={3}
                  placeholder="Reply to students..."
                  value={newDiscussion}
                  onChange={(e) => setNewDiscussion(e.target.value)}
                  required
                />
                <button type="submit" className="primaryButton small" disabled={!newDiscussion.trim()}>Post reply</button>
              </form>
            </div>
          </section>
        )}

        {/* Submissions + grading */}
        {activeScreen === 'submissions' && (
          <section>
            <h2 style={{ marginBottom: 16 }}>Assignment Submissions</h2>
            {submissions.length === 0
              ? <p className="noteText">No submissions yet.</p>
              : (
                <div className="dataBlock">
                  {gradeForm.submissionId && (
                    <form onSubmit={handleGrade} style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end', background: '#eff6ff', padding: 14, borderRadius: 6 }}>
                      <strong style={{ width: '100%', fontSize: 14 }}>Grading submission #{gradeForm.submissionId}</strong>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13, fontWeight: 600 }}>
                        Score (0-100)
                        <input
                          type="number" min={0} max={100}
                          value={gradeForm.score}
                          onChange={(e) => setGradeForm((s) => ({ ...s, score: Number(e.target.value) }))}
                          style={{ border: '1px solid #ccc', borderRadius: 4, padding: '5px 8px', width: 80 }}
                        />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 13, fontWeight: 600, flex: 1 }}>
                        Feedback
                        <input
                          value={gradeForm.feedback}
                          onChange={(e) => setGradeForm((s) => ({ ...s, feedback: e.target.value }))}
                          style={{ border: '1px solid #ccc', borderRadius: 4, padding: '5px 8px', fontSize: 13 }}
                        />
                      </label>
                      <button type="submit" className="primaryButton small">Submit grade</button>
                      <button type="button" className="secondaryButton" onClick={() => setGradeForm({ submissionId: null, submissionType: '', score: 0, feedback: '' })}>Cancel</button>
                    </form>
                  )}
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Type', 'Student', 'Lesson', 'Score', 'Submitted', 'Action'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '9px 12px', fontSize: 13, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => (
                        <tr key={`${sub.submissionType}-${sub.submissionId}`} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '9px 12px', fontSize: 13 }}>{sub.submissionType}</td>
                          <td style={{ padding: '9px 12px', fontSize: 13 }}>{sub.studentName}</td>
                          <td style={{ padding: '9px 12px', fontSize: 13 }}>{sub.lessonId}</td>
                          <td style={{ padding: '9px 12px', fontSize: 13 }}>
                            {sub.score != null ? `${sub.score}/${sub.maxScore}` : <span style={{ color: '#888' }}>Not graded</span>}
                          </td>
                          <td style={{ padding: '9px 12px', fontSize: 13, color: '#666' }}>{formatDate(sub.submittedAt)}</td>
                          <td style={{ padding: '9px 12px' }}>
                            <button
                              type="button"
                              className="primaryButton small"
                              onClick={() => setGradeForm({ submissionId: sub.submissionId, submissionType: sub.submissionType, score: sub.score || 0, feedback: sub.feedback || '' })}
                            >
                              Grade
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </section>
        )}

        {confirmDialog.open && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div
              style={{
                width: 360,
                maxWidth: '90vw',
                background: '#fff',
                borderRadius: 8,
                padding: 18,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              }}
            >
              <h4 style={{ margin: 0, fontSize: 16 }}>Confirmation</h4>
              <p style={{ margin: '10px 0 16px', fontSize: 14, color: '#374151' }}>{confirmDialog.message}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="secondaryButton" onClick={handleConfirmDialogCancel}>Cancel</button>
                <button
                  type="button"
                  style={{ background: '#dc2626', color: '#fff', border: '1px solid #dc2626', borderRadius: 6, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  onClick={handleConfirmDialogOk}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <HomeFooter />
    </div>
  )
}
