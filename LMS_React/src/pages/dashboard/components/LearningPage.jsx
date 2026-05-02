import { useEffect, useState } from 'react'
import {
  downloadMyAssignmentSubmissionFile,
  getAssignmentByLessonForStudent,
  getQuizByLessonForStudent,
  submitAssignment,
  submitQuiz,
} from '../../../api/assessments.js'
import { getLessonDetail } from '../../../api/courses.js'
import {
  createDiscussion,
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
  } catch {
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
  const [replyToId, setReplyToId] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [isPostingReply, setIsPostingReply] = useState(false)

  const [lessonQuiz, setLessonQuiz] = useState(null)
  const [lessonAssignment, setLessonAssignment] = useState(null)
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false)
  const [quizResult, setQuizResult] = useState(null)
  const [isQuizStarted, setIsQuizStarted] = useState(false)
  const [assignmentFile, setAssignmentFile] = useState(null)
  const [assignmentNote, setAssignmentNote] = useState('')
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false)

  const [isDownloadingCert, setIsDownloadingCert] = useState(false)

  const [assessmentsExpanded, setAssessmentsExpanded] = useState(true)
  const [discussionsExpanded, setDiscussionsExpanded] = useState(true)

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

  useEffect(() => {
    if (!selectedLessonId) return
    setIsLoadingAssessments(true)
    setQuizResult(null)
    setIsQuizStarted(false)
    setQuizAnswers({})
    setAssignmentFile(null)
    setAssignmentNote('')
    Promise.all([
      getQuizByLessonForStudent(selectedLessonId).catch(() => null),
      getAssignmentByLessonForStudent(selectedLessonId).catch(() => null),
    ])
      .then(([quiz, assignment]) => {
        setLessonQuiz(quiz)
        setLessonAssignment(assignment)
      })
      .finally(() => setIsLoadingAssessments(false))
  }, [selectedLessonId])

  useEffect(() => {
    if (!lessonAssignment) return
    if (lessonAssignment.mySubmissionId) {
      setAssignmentNote(lessonAssignment.mySubmissionNote ?? '')
    } else {
      setAssignmentNote('')
    }
  }, [
    lessonAssignment?.lessonId,
    lessonAssignment?.mySubmissionId,
    lessonAssignment?.mySubmissionNote,
  ])

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

  async function refreshDiscussions() {
    const updated = await listDiscussions(selectedLessonId)
    const normalized = Array.isArray(updated) ? updated : []
    setDiscussions(normalized)
    setDiscussionCache((prev) => ({ ...prev, [selectedLessonId]: normalized }))
    return normalized
  }

  async function handlePostDiscussion(event) {
    event.preventDefault()
    const content = newDiscussion.trim()
    if (!content || !selectedLessonId) return
    setIsPostingDiscussion(true)
    try {
      await createDiscussion({ lessonId: selectedLessonId, content })
      await refreshDiscussions()
      setNewDiscussion('')
      onNotifySuccess?.('Comment posted successfully')
    } catch (error) {
      onNotifyError?.(error, 'Unable to post comment')
    } finally {
      setIsPostingDiscussion(false)
    }
  }

  async function handlePostReply(event) {
    event.preventDefault()
    const content = replyContent.trim()
    if (!content || !selectedLessonId || !replyToId) return
    setIsPostingReply(true)
    try {
      await createDiscussion({ lessonId: selectedLessonId, content, parentId: replyToId })
      await refreshDiscussions()
      setReplyToId(null)
      setReplyContent('')
      onNotifySuccess?.('Reply posted')
    } catch (error) {
      onNotifyError?.(error, 'Unable to post reply')
    } finally {
      setIsPostingReply(false)
    }
  }

  function openQuizFormWithPreviousAnswers() {
    const prev = {}
    if (lessonQuiz?.lastAttemptAnswers?.length) {
      lessonQuiz.lastAttemptAnswers.forEach((a) => {
        if (a.questionId != null && a.selectedOption) prev[a.questionId] = a.selectedOption
      })
    }
    setQuizAnswers(prev)
    setIsQuizStarted(true)
  }

  async function handleSubmitQuiz(event) {
    event.preventDefault()
    if (!lessonQuiz?.quizId) return
    const answers = (lessonQuiz.questions || [])
      .map((q) => ({
        questionId: q.questionId,
        selectedOption: quizAnswers[q.questionId],
      }))
      .filter((a) => a.selectedOption)
    if (answers.length === 0) {
      onNotifyError?.(null, 'Please answer at least one question before submitting')
      return
    }
    setIsSubmittingQuiz(true)
    try {
      const result = await submitQuiz({ quizId: lessonQuiz.quizId, answers })
      setQuizResult(result)
      setIsQuizStarted(false)
      const refreshedQuiz = await getQuizByLessonForStudent(selectedLessonId)
      setLessonQuiz(refreshedQuiz)
      onNotifySuccess?.('Quiz submitted')
    } catch (error) {
      onNotifyError?.(error, 'Unable to submit quiz')
    } finally {
      setIsSubmittingQuiz(false)
    }
  }

  async function handleSubmitAssignment(event) {
    event.preventDefault()
    if (!selectedLessonId) return
    const hasExistingSubmission = Boolean(lessonAssignment?.mySubmissionId)
    if (!hasExistingSubmission && !assignmentFile) {
      onNotifyError?.(null, 'Please choose a file to submit')
      return
    }
    setIsSubmittingAssignment(true)
    try {
      await submitAssignment(selectedLessonId, assignmentFile || null, assignmentNote)
      setAssignmentFile(null)
      const refreshedAssignment = await getAssignmentByLessonForStudent(selectedLessonId)
      setLessonAssignment(refreshedAssignment)
      onNotifySuccess?.('Assignment submitted')
    } catch (error) {
      onNotifyError?.(error, 'Unable to submit assignment')
    } finally {
      setIsSubmittingAssignment(false)
    }
  }

  async function handleDownloadMyAssignment() {
    if (!selectedLessonId) return
    try {
      await downloadMyAssignmentSubmissionFile(selectedLessonId)
      onNotifySuccess?.('Download started')
    } catch (error) {
      onNotifyError?.(error, 'Unable to download file')
    }
  }

  function handleRetakeQuiz() {
    setQuizResult(null)
    openQuizFormWithPreviousAnswers()
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
                {lessonDetail.videoUrl && (() => {
                  const url = lessonDetail.videoUrl
                  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be')
                  if (isYoutube) {
                    const videoId = url.includes('youtu.be/')
                      ? url.split('youtu.be/')[1]?.split('?')[0]
                      : new URLSearchParams(url.split('?')[1] || '').get('v')
                    const embedUrl = videoId
                      ? `https://www.youtube.com/embed/${videoId}`
                      : url
                    return (
                      <div className="videoWrapper" style={{ position: 'relative', paddingTop: '56.25%', marginBottom: 16 }}>
                        <iframe
                          src={embedUrl}
                          title="Lesson video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 6 }}
                        />
                      </div>
                    )
                  }
                  return (
                    <video
                      controls
                      src={url}
                      style={{ width: '100%', borderRadius: 6, marginBottom: 16 }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )
                })()}
                <div className="lessonContent">
                  {lessonDetail.content
                    ? lessonDetail.content.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))
                    : <p className="noteText">This lesson has no content yet.</p>
                  }
                </div>
                {lessonDetail.attachments && lessonDetail.attachments.length > 0 && (
                  <div style={{ marginTop: 12, marginBottom: 4 }}>
                    <strong style={{ fontSize: 14 }}>Attachments:</strong>
                    <ul style={{ listStyle: 'none', marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {lessonDetail.attachments.map((att) => (
                        <li key={att.id}>
                          <a
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 13, color: '#2563eb', textDecoration: 'underline' }}
                          >
                            {att.fileName}
                          </a>
                          {att.fileSize && (
                            <span style={{ fontSize: 12, color: '#888', marginLeft: 6 }}>
                              ({(att.fileSize / 1024).toFixed(1)} KB)
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  type="button"
                  className={`primaryButton${isSelectedLessonCompleted ? ' completedPrimaryButton' : ''}`}
                  onClick={handleMarkComplete}
                  disabled={isSelectedLessonCompleted}
                >
                  {isSelectedLessonCompleted ? 'Completed' : 'Mark as completed'}
                </button>
              </div>

              {/* Quiz & Assignment */}
              <div className="discussionBlock">
                <div className="collapsiblePanelHeading">
                  <h3>Quiz & Assignment</h3>
                  <button
                    type="button"
                    className="secondaryButton small"
                    onClick={() => setAssessmentsExpanded((v) => !v)}
                    aria-expanded={assessmentsExpanded}
                  >
                    {assessmentsExpanded ? 'Minimize' : 'Expand'}
                  </button>
                </div>
                <div hidden={!assessmentsExpanded}>
                {isLoadingAssessments ? (
                  <p className="loadingText">Loading assessments...</p>
                ) : (
                  <>
                    {!lessonQuiz && !lessonAssignment && (
                      <p className="noteText">No quiz or assignment for this lesson yet.</p>
                    )}

                    {lessonQuiz && (
                      <div style={{ marginBottom: 14, padding: 12, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}>
                        <h4 style={{ fontSize: 15, marginBottom: 6 }}>{lessonQuiz.title}</h4>
                        {lessonQuiz.description && <p className="noteText">{lessonQuiz.description}</p>}
                        <p className="noteText" style={{ marginBottom: 8 }}>
                          Pass score: {lessonQuiz.passScore} | Questions: {(lessonQuiz.questions || []).length}
                        </p>
                        <p className="noteText" style={{ marginBottom: 8 }}>
                          Attempts used: {lessonQuiz.attemptsUsed ?? 0} / {lessonQuiz.maxAttempts ?? 1}
                        </p>
                        <p className="noteText" style={{ marginBottom: 8 }}>
                          Time: {lessonQuiz.startAt ? new Date(lessonQuiz.startAt).toLocaleString('vi-VN') : '-'} - {lessonQuiz.endAt ? new Date(lessonQuiz.endAt).toLocaleString('vi-VN') : '-'}
                        </p>
                        {lessonQuiz.attemptsUsed > 0 && (lessonQuiz.lastAttemptAnswers?.length > 0 || lessonQuiz.lastAttemptScore != null) && (
                          <div style={{ marginBottom: 12, padding: 10, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                            <strong style={{ fontSize: 13 }}>Your latest quiz answers</strong>
                            {lessonQuiz.lastAttemptScore != null && (
                              <p className="noteText" style={{ marginTop: 6 }}>
                                Score: {lessonQuiz.lastAttemptScore}/{lessonQuiz.lastAttemptMaxScore ?? '-'}
                                {lessonQuiz.lastAttemptPassed != null && (
                                  <span>{lessonQuiz.lastAttemptPassed ? ' — Passed' : ' — Not passed'}</span>
                                )}
                              </p>
                            )}
                            <ul style={{ marginTop: 8, paddingLeft: 18, listStyle: 'disc' }}>
                              {(lessonQuiz.lastAttemptAnswers || []).map((ans) => {
                                const q = (lessonQuiz.questions || []).find((x) => x.questionId === ans.questionId)
                                const letter = ans.selectedOption
                                let label = ''
                                if (q && letter) {
                                  if (letter === 'A') label = q.optionA
                                  else if (letter === 'B') label = q.optionB
                                  else if (letter === 'C') label = q.optionC
                                  else if (letter === 'D') label = q.optionD
                                }
                                return (
                                  <li key={ans.questionId} className="noteText" style={{ marginBottom: 8 }}>
                                    <span style={{ fontWeight: 600 }}>{q ? q.questionText : `Question #${ans.questionId}`}</span>
                                    <div style={{ marginTop: 2 }}>
                                      Your answer: {letter || '-'}
                                      {label ? `. ${label}` : ''}
                                    </div>
                                  </li>
                                )
                              })}
                            </ul>
                            {lessonQuiz.canAttempt && (
                              <p className="noteText" style={{ marginTop: 6 }}>
                                Start Quiz or Try again below to edit answers before resubmitting.
                              </p>
                            )}
                          </div>
                        )}
                        {(() => {
                          const now = new Date()
                          const startAt = lessonQuiz.startAt ? new Date(lessonQuiz.startAt) : null
                          const endAt = lessonQuiz.endAt ? new Date(lessonQuiz.endAt) : null
                          const notStarted = startAt && now < startAt
                          const closed = endAt && now > endAt
                          const canDoQuiz = !notStarted && !closed
                          const mayTakeQuiz = lessonQuiz.canAttempt === true
                          return !isQuizStarted ? (
                            <>
                              {!canDoQuiz && (
                                <p className="noteText" style={{ marginBottom: 8, color: '#b45309' }}>
                                  {notStarted ? 'Quiz has not started yet.' : 'Quiz deadline has passed.'}
                                </p>
                              )}
                              {canDoQuiz && !mayTakeQuiz && (
                                <p className="noteText" style={{ marginBottom: 8, color: '#b45309' }}>
                                  You have used all allowed quiz attempts.
                                </p>
                              )}
                              {quizResult && (
                                <div style={{ marginBottom: 10 }}>
                                  <p className="noteText" style={{ marginBottom: 4 }}>
                                    Last attempt: {quizResult.score}/{quizResult.maxScore} - {quizResult.passed ? 'Passed' : 'Not passed'}
                                  </p>
                                  {quizResult.attemptsRemaining != null && (
                                    <p className="noteText">Attempts remaining after submit: {quizResult.attemptsRemaining}</p>
                                  )}
                                </div>
                              )}
                              {!quizResult && (
                                <button
                                  type="button"
                                  className="primaryButton small"
                                  disabled={!mayTakeQuiz}
                                  onClick={openQuizFormWithPreviousAnswers}
                                >
                                  Start Quiz
                                </button>
                              )}
                              {quizResult && mayTakeQuiz && canDoQuiz && (
                                <button type="button" className="primaryButton small" onClick={handleRetakeQuiz}>
                                  Try again
                                </button>
                              )}
                            </>
                          ) : (
                          <form onSubmit={handleSubmitQuiz} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {(lessonQuiz.questions || []).map((q, idx) => (
                              <div key={q.questionId} style={{ borderTop: '1px dashed #e5e7eb', paddingTop: 8 }}>
                                <p style={{ marginBottom: 6, fontWeight: 600 }}>{idx + 1}. {q.questionText}</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                  {[
                                    ['A', q.optionA],
                                    ['B', q.optionB],
                                    ['C', q.optionC],
                                    ['D', q.optionD],
                                  ].map(([opt, label]) => (
                                    <label key={`${q.questionId}-${opt}`} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <input
                                        type="radio"
                                        name={`question-${q.questionId}`}
                                        value={opt}
                                        checked={quizAnswers[q.questionId] === opt}
                                        onChange={() => setQuizAnswers((prev) => ({ ...prev, [q.questionId]: opt }))}
                                      />
                                      {opt}. {label}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button type="submit" className="primaryButton small" disabled={isSubmittingQuiz || !canDoQuiz}>
                                {isSubmittingQuiz ? 'Submitting...' : 'Submit quiz'}
                              </button>
                              <button
                                type="button"
                                className="secondaryButton"
                                onClick={() => {
                                  setIsQuizStarted(false)
                                  setQuizAnswers({})
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                          )
                        })()}
                      </div>
                    )}

                    {lessonAssignment && (
                      <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}>
                        <h4 style={{ fontSize: 15, marginBottom: 6 }}>{lessonAssignment.title}</h4>
                        {lessonAssignment.description && <p className="noteText">{lessonAssignment.description}</p>}
                        <p className="noteText" style={{ marginBottom: 4 }}>Max score: {lessonAssignment.maxScore}</p>
                        <p className="noteText" style={{ marginBottom: 8 }}>
                          Time: {lessonAssignment.startAt ? new Date(lessonAssignment.startAt).toLocaleString('vi-VN') : '-'} - {lessonAssignment.endAt ? new Date(lessonAssignment.endAt).toLocaleString('vi-VN') : '-'}
                        </p>
                        {(() => {
                          const now = new Date()
                          const startAt = lessonAssignment.startAt ? new Date(lessonAssignment.startAt) : null
                          const endAt = lessonAssignment.endAt ? new Date(lessonAssignment.endAt) : null
                          const notStarted = startAt && now < startAt
                          const closed = endAt && now > endAt
                          const canSubmit = !notStarted && !closed
                          const hasSubmission = Boolean(lessonAssignment.mySubmissionId)
                          const allowUpload = canSubmit && (!hasSubmission || lessonAssignment.myCanResubmit === true)
                          const graded = lessonAssignment.myGradedAt != null
                          return (
                            <>
                              {!canSubmit && (
                                <p className="noteText" style={{ marginBottom: 8, color: '#b45309' }}>
                                  {notStarted ? 'Assignment has not started yet.' : 'Assignment deadline has passed.'}
                                </p>
                              )}
                              {graded && (
                                <div style={{ marginBottom: 10, padding: 10, background: '#f0fdf4', borderRadius: 6, border: '1px solid #bbf7d0' }}>
                                  <p className="noteText" style={{ marginBottom: 4 }}>
                                    Graded score: {lessonAssignment.myScore != null ? lessonAssignment.myScore : '-'} / {lessonAssignment.maxScore}
                                  </p>
                                  {lessonAssignment.myFeedback && (
                                    <p className="noteText">Instructor feedback: {lessonAssignment.myFeedback}</p>
                                  )}
                                </div>
                              )}
                              {hasSubmission && !graded && (
                                <div style={{ marginBottom: 12, padding: 10, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                                  <strong style={{ fontSize: 13 }}>Your current submission</strong>
                                  {lessonAssignment.mySubmissionFilename && (
                                    <p className="noteText" style={{ marginTop: 8, marginBottom: 6 }}>
                                      File: {lessonAssignment.mySubmissionFilename}
                                      {' '}
                                      <button type="button" className="secondaryButton small" style={{ fontSize: 12 }} onClick={handleDownloadMyAssignment}>
                                        Download
                                      </button>
                                    </p>
                                  )}
                                  {lessonAssignment.mySubmittedAt && (
                                    <p className="noteText" style={{ marginBottom: 6 }}>
                                      Submitted at: {formatDate(lessonAssignment.mySubmittedAt)}
                                    </p>
                                  )}
                                  <p className="noteText" style={{ marginBottom: 4 }}>Your note (edit below)</p>
                                  {lessonAssignment.mySubmissionNote ? (
                                    <p className="noteText" style={{ whiteSpace: 'pre-wrap', padding: 8, background: '#fff', borderRadius: 4, border: '1px solid #e5e7eb' }}>
                                      {lessonAssignment.mySubmissionNote}
                                    </p>
                                  ) : (
                                    <p className="noteText" style={{ color: '#888' }}>(No note)</p>
                                  )}
                                  {lessonAssignment.myCanResubmit && canSubmit && (
                                    <p className="noteText" style={{ marginTop: 8 }}>
                                      You can replace the file and/or edit your note below before the deadline (not graded yet).
                                    </p>
                                  )}
                                </div>
                              )}
                              {hasSubmission && !lessonAssignment.myCanResubmit && !graded && (
                                <p className="noteText" style={{ marginBottom: 8, color: '#b45309' }}>
                                  You cannot change this submission anymore.
                                </p>
                              )}
                              {!graded && (
                              <form onSubmit={handleSubmitAssignment} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label className="noteText" style={{ fontWeight: 600 }}>
                                  {hasSubmission ? 'New file (optional — leave empty to keep current file)' : 'Upload file'}
                                </label>
                                <input
                                  type="file"
                                  onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
                                  required={allowUpload && !hasSubmission}
                                  disabled={!allowUpload}
                                />
                                <label className="noteText" style={{ fontWeight: 600 }}>Note for instructor</label>
                                <textarea
                                  rows={4}
                                  placeholder="Note for instructor (optional)"
                                  value={assignmentNote}
                                  onChange={(e) => setAssignmentNote(e.target.value)}
                                  disabled={!allowUpload}
                                  style={{ border: '1px solid #ccc', borderRadius: 4, padding: '6px 8px', fontSize: 13, fontFamily: 'inherit' }}
                                />
                                <button type="submit" className="primaryButton small" disabled={isSubmittingAssignment || !allowUpload}>
                                  {isSubmittingAssignment ? 'Submitting...' : (lessonAssignment.myCanResubmit ? 'Save changes / Replace submission' : 'Submit assignment')}
                                </button>
                              </form>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </>
                )}
                </div>
              </div>

              {/* Discussions */}
              <div className="discussionBlock">
                <div className="collapsiblePanelHeading">
                  <h3>Discussions ({discussions.length})</h3>
                  <button
                    type="button"
                    className="secondaryButton small"
                    onClick={() => setDiscussionsExpanded((v) => !v)}
                    aria-expanded={discussionsExpanded}
                  >
                    {discussionsExpanded ? 'Minimize' : 'Expand'}
                  </button>
                </div>
                <div hidden={!discussionsExpanded}>
                  {isLoadingDiscussions ? (
                    <p className="loadingText">Loading discussions...</p>
                  ) : discussions.length === 0 ? (
                    <p className="noteText">No discussions yet.</p>
                  ) : (
                  <ul className="discussionList">
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
              </div>
            </>
          ) : (
            <p className="noteText">Select a lesson to start learning.</p>
          )}

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
