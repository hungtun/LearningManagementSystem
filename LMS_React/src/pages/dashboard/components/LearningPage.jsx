import { useEffect, useState } from 'react'
import { getLessonDetail } from '../../../api/courses.js'
import {
  createDiscussion,
  createReview,
  downloadCertificate,
  getCourseProgress,
  getLessonProgresses,
  listDiscussions,
  patchVideoProgress,
} from '../../../api/learnings.js'

function formatDate(dateString) {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('vi-VN')
  } catch (_) {
    return dateString
  }
}

export default function LearningPage({
  courseDetail,
  onBack,
  onNotifyError,
  onNotifySuccess,
  onCourseProgressUpdated,
}) {
  const [selectedLessonId, setSelectedLessonId] = useState(
    courseDetail?.lessons?.[0]?.id ?? null
  )
  const [lessonDetail, setLessonDetail] = useState(null)
  const [isLoadingLesson, setIsLoadingLesson] = useState(false)
  const [lessonDetailCache, setLessonDetailCache] = useState({})

  const [courseProgress, setCourseProgress] = useState(null)
  const [lessonProgressById, setLessonProgressById] = useState({})
  const [discussions, setDiscussions] = useState([])
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(false)
  const [discussionCache, setDiscussionCache] = useState({})
  const [newDiscussion, setNewDiscussion] = useState('')
  const [isPostingDiscussion, setIsPostingDiscussion] = useState(false)

  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [isPostingReview, setIsPostingReview] = useState(false)
  const [isDownloadingCert, setIsDownloadingCert] = useState(false)

  const lessons = courseDetail?.lessons || []

  useEffect(() => {
    if (!courseDetail?.id) return
    Promise.all([
      getCourseProgress(courseDetail.id).catch(() => null),
      getLessonProgresses(courseDetail.id).catch(() => []),
    ]).then(([courseProgressData, lessonProgressList]) => {
      setCourseProgress(courseProgressData)
      const byId = Object.fromEntries(
        (Array.isArray(lessonProgressList) ? lessonProgressList : []).map((item) => [
          Number(item.lessonId),
          item,
        ])
      )
      setLessonProgressById(byId)
    })
  }, [courseDetail?.id])

  useEffect(() => {
    if (!selectedLessonId) return
    const cachedLessonDetail = lessonDetailCache[selectedLessonId]
    if (cachedLessonDetail) {
      setLessonDetail(cachedLessonDetail)
      setIsLoadingLesson(false)
    } else {
      setIsLoadingLesson(true)
      getLessonDetail(selectedLessonId)
        .then((data) => {
          setLessonDetail(data)
          if (data) {
            setLessonDetailCache((prev) => ({ ...prev, [selectedLessonId]: data }))
          }
        })
        .catch(() => setLessonDetail(null))
        .finally(() => setIsLoadingLesson(false))
    }

    const cachedDiscussions = discussionCache[selectedLessonId]
    if (cachedDiscussions) {
      setDiscussions(cachedDiscussions)
      setIsLoadingDiscussions(false)
    } else {
      setIsLoadingDiscussions(true)
      listDiscussions(selectedLessonId)
        .then((data) => {
          const normalized = Array.isArray(data) ? data : []
          setDiscussions(normalized)
          setDiscussionCache((prev) => ({ ...prev, [selectedLessonId]: normalized }))
        })
        .catch(() => setDiscussions([]))
        .finally(() => setIsLoadingDiscussions(false))
    }
  }, [selectedLessonId, lessonDetailCache, discussionCache])

  async function handleMarkComplete() {
    if (!selectedLessonId) return
    try {
      await patchVideoProgress({ lessonId: selectedLessonId, progressPercent: 100 })
      const [updatedCourseProgress, updatedLessonProgresses] = await Promise.all([
        getCourseProgress(courseDetail.id),
        getLessonProgresses(courseDetail.id),
      ])
      setCourseProgress(updatedCourseProgress)
      onCourseProgressUpdated?.(updatedCourseProgress)
      setLessonProgressById(
        Object.fromEntries(
          (Array.isArray(updatedLessonProgresses) ? updatedLessonProgresses : []).map((item) => [
            Number(item.lessonId),
            item,
          ])
        )
      )
      onNotifySuccess?.('Lesson marked as completed')
    } catch (error) {
      onNotifyError?.(error, 'Unable to update progress')
    }
  }

  async function handlePostDiscussion(event) {
    event.preventDefault()
    const content = newDiscussion.trim()
    if (!content || !selectedLessonId) return
    setIsPostingDiscussion(true)
    try {
      await createDiscussion({ lessonId: selectedLessonId, content })
      const updated = await listDiscussions(selectedLessonId)
      const normalized = Array.isArray(updated) ? updated : []
      setDiscussions(normalized)
      setDiscussionCache((prev) => ({ ...prev, [selectedLessonId]: normalized }))
      setNewDiscussion('')
      onNotifySuccess?.('Comment posted successfully')
    } catch (error) {
      onNotifyError?.(error, 'Unable to post comment')
    } finally {
      setIsPostingDiscussion(false)
    }
  }

  async function handlePostReview(event) {
    event.preventDefault()
    setIsPostingReview(true)
    try {
      await createReview({ courseId: courseDetail.id, rating: reviewRating, comment: reviewComment })
      setReviewComment('')
      setReviewRating(5)
      onNotifySuccess?.('Course review submitted')
    } catch (error) {
      onNotifyError?.(error, 'Unable to submit review')
    } finally {
      setIsPostingReview(false)
    }
  }

  async function handleDownloadCertificate() {
    setIsDownloadingCert(true)
    try {
      await downloadCertificate(courseDetail.id)
      onNotifySuccess?.('Downloading certificate...')
    } catch (error) {
      onNotifyError?.(error, 'Unable to download certificate')
    } finally {
      setIsDownloadingCert(false)
    }
  }

  const completionPercent = courseProgress?.completionPercent ?? 0
  const completedLessons = courseProgress?.completedLessons ?? 0
  const totalLessons = courseProgress?.totalLessons ?? lessons.length
  const selectedLessonProgress = lessonProgressById[Number(selectedLessonId)]
  const isSelectedLessonCompleted =
    selectedLessonProgress?.status === 'COMPLETED' ||
    Number(selectedLessonProgress?.progressPercent || 0) >= 100

  return (
    <div className="learningPage">
      {/* Top bar with back button and course info */}
      <div className="learningTopBar">
        <button type="button" className="secondaryButton" onClick={onBack}>
          &larr; Back to course details
        </button>
        <div className="learningCourseTitle">
          <strong>{courseDetail.title}</strong>
        </div>
        <div className="learningProgressSummary">
          Progress: {completedLessons}/{totalLessons} lessons ({Math.round(completionPercent)}%)
        </div>
      </div>

      {/* Progress bar */}
      <div className="learningProgressBar">
        <div
          className="learningProgressFill"
          style={{ width: `${Math.min(completionPercent, 100)}%` }}
        />
      </div>

      <div className="learningLayout">
        {/* Left sidebar: lesson list */}
        <aside className="learningSidebar">
          <h4>Lesson list</h4>
          <ul className="lessonNavList">
            {lessons.map((lesson, index) => (
              (() => {
                const lessonProgress = lessonProgressById[Number(lesson.id)]
                const isCompleted =
                  lessonProgress?.status === 'COMPLETED' ||
                  Number(lessonProgress?.progressPercent || 0) >= 100
                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      className={`lessonNavItem${selectedLessonId === lesson.id ? ' active' : ''}${
                        isCompleted ? ' completed' : ''
                      }`}
                      onClick={() => setSelectedLessonId(lesson.id)}
                    >
                      <span className="lessonNavIndex">{index + 1}.</span>
                      <span className="lessonNavTitle">{lesson.title}</span>
                    </button>
                  </li>
                )
              })()
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <main className="learningMain">
          {isLoadingLesson ? (
            <p className="loadingText">Loading lesson...</p>
          ) : lessonDetail ? (
            <>
              <div className="lessonContentBlock">
                <h2>{lessonDetail.title}</h2>
                <p className="lessonMeta">Lesson {lessonDetail.orderIndex}</p>
                <div className="lessonContent">
                  {lessonDetail.content
                    ? lessonDetail.content.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))
                    : <p className="noteText">This lesson has no content yet.</p>
                  }
                </div>
                <button
                  type="button"
                  className={`primaryButton${isSelectedLessonCompleted ? ' completedPrimaryButton' : ''}`}
                  onClick={handleMarkComplete}
                  disabled={isSelectedLessonCompleted}
                >
                  {isSelectedLessonCompleted ? 'Completed' : 'Mark as completed'}
                </button>
              </div>

              {/* Discussions */}
              <div className="discussionBlock">
                <h3>Discussions ({discussions.length})</h3>
                {isLoadingDiscussions ? (
                  <p className="loadingText">Loading discussions...</p>
                ) : discussions.length === 0 ? (
                  <p className="noteText">No discussions yet.</p>
                ) : (
                  <ul className="discussionList">
                    {discussions.map((d) => (
                      <li key={d.id} className="discussionItem">
                        <strong>{d.userFullName || 'User'}</strong>
                        <span className="discussionDate">{formatDate(d.createdAt)}</span>
                        <p>{d.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
                <form className="discussionForm" onSubmit={handlePostDiscussion}>
                  <textarea
                    rows={3}
                    placeholder="Write your comment..."
                    value={newDiscussion}
                    onChange={(e) => setNewDiscussion(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="primaryButton small"
                    disabled={isPostingDiscussion || !newDiscussion.trim()}
                  >
                    {isPostingDiscussion ? 'Posting...' : 'Post comment'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <p className="noteText">Select a lesson to start learning.</p>
          )}

          {/* Review section (always visible) */}
          <div className="reviewBlock">
            <h3>Course review</h3>
            <form className="reviewForm" onSubmit={handlePostReview}>
              <label>
                Rating (1-5):
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} stars</option>
                  ))}
                </select>
              </label>
              <label>
                Comment:
                <textarea
                  rows={3}
                  placeholder="Write your feedback..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </label>
              <button
                type="submit"
                className="primaryButton small"
                disabled={isPostingReview}
              >
                {isPostingReview ? 'Submitting...' : 'Submit review'}
              </button>
            </form>
          </div>

          {/* Certificate download */}
          {completionPercent >= 100 && (
            <div className="certificateBlock">
              <h3>Completion certificate</h3>
              <p>You completed this course. Download your certificate now!</p>
              <button
                type="button"
                className="primaryButton"
                onClick={handleDownloadCertificate}
                disabled={isDownloadingCert}
              >
                {isDownloadingCert ? 'Downloading...' : 'Download certificate'}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
