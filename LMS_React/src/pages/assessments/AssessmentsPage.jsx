import { useEffect, useState } from 'react'
import {
  getQuiz,
  gradeSubmission,
  listSubmissions,
  submitAssignment,
  submitQuiz,
} from '../../api/assessmentsApi.js'
import { MOCK_ASSIGNMENTS, MOCK_QUIZZES } from './assessmentsData.js'
import AssessmentListView from './views/AssessmentListView.jsx'
import AssignmentSubmitView from './views/AssignmentSubmitView.jsx'
import InstructorSubmissionsView from './views/InstructorSubmissionsView.jsx'
import QuizPlayerView from './views/QuizPlayerView.jsx'
import './AssessmentsPage.css'

// Normalize quiz from API: ensure questionId & option fields exist
function normalizeQuiz(data) {
  if (!data) return null
  return {
    ...data,
    quizId: data.quizId ?? data.id,
    duration: data.duration ?? data.durationMinutes ?? 20,
    passScore: data.passScore ?? 60,
    questions: (data.questions || []).map((q) => ({
      ...q,
      questionId: q.questionId ?? q.id,
      optionA: q.optionA ?? (q.options?.[0]),
      optionB: q.optionB ?? (q.options?.[1]),
      optionC: q.optionC ?? (q.options?.[2]),
      optionD: q.optionD ?? (q.options?.[3]),
      // correctAnswer may be included by backend
      correctAnswer: q.correctAnswer ?? q.correctOption ?? null,
    })),
  }
}

// Normalize submission from API: handle different field name variants
function normalizeSubmission(s) {
  if (!s) return s
  return {
    ...s,
    submissionId: s.submissionId ?? s.id,
    submissionType: s.submissionType ?? s.type ?? 'QUIZ',
    quizId: s.quizId ?? s.quiz?.id ?? null,
    studentName: s.studentName ?? s.studentFullName ?? s.student?.fullName ?? 'Học viên',
    courseTitle: s.courseTitle ?? s.course?.title ?? '',
    assessmentTitle: s.assessmentTitle ?? s.assessmentName ?? s.title ?? '',
    score: s.score ?? null,
    feedback: s.feedback ?? '',
    submittedAt: s.submittedAt ?? s.createdAt ?? null,
    gradedAt: s.gradedAt ?? null,
    answers: s.answers ?? null,
    originalFilename: s.originalFilename ?? s.fileName ?? null,
  }
}

/**
 * Internal routing for Assessments module:
 *   list        → quiz + assignment list (student)
 *   quiz        → quiz player (quizId in context)
 *   assignment  → assignment submit (assignmentId in context)
 *   submissions → instructor grading panel
 */
export default function AssessmentsPage({ role }) {
  // Student quiz/assignment list — no list API endpoint; keep mock data
  const [quizzes, setQuizzes] = useState(MOCK_QUIZZES)
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS)

  // Instructor submissions — loaded from API
  const [submissions, setSubmissions] = useState([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)

  const isInstructor = role === 'INSTRUCTOR' || role === 'ADMIN'

  const [view, setView] = useState(isInstructor ? 'submissions' : 'list')
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [activeQuizLoading, setActiveQuizLoading] = useState(false)
  const [activeAssignmentId, setActiveAssignmentId] = useState(null)

  // Load submissions for instructor on mount
  useEffect(() => {
    if (!isInstructor) return
    setSubmissionsLoading(true)
    listSubmissions()
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setSubmissions(list.map(normalizeSubmission))
      })
      .catch(() => setSubmissions([]))
      .finally(() => setSubmissionsLoading(false))
  }, [isInstructor])

  async function openQuiz(quizId) {
    setActiveQuizLoading(true)
    setView('quiz')
    try {
      const data = await getQuiz(quizId)
      setActiveQuiz(normalizeQuiz(data))
    } catch {
      // Fallback to mock
      const mock = MOCK_QUIZZES.find((q) => q.quizId === quizId || q.id === quizId)
      setActiveQuiz(mock ? normalizeQuiz(mock) : null)
    } finally {
      setActiveQuizLoading(false)
    }
  }

  function openAssignment(assignmentId) { setActiveAssignmentId(assignmentId); setView('assignment') }
  function backToList() { setView('list'); setActiveQuiz(null); setActiveAssignmentId(null) }

  // Returns API result (score etc.) or null — passed to QuizPlayerView for result screen
  async function handleQuizSubmit(submitData) {
    try {
      const result = await submitQuiz(submitData)
      // Mark quiz as submitted in the list
      setQuizzes((prev) =>
        prev.map((q) => (q.quizId === submitData.quizId || q.id === submitData.quizId)
          ? { ...q, submitted: true, score: result?.score ?? null }
          : q
        )
      )
      return result
    } catch {
      return null
    }
  }

  async function handleAssignmentSubmit(assignmentId, file, note) {
    const assignment = assignments.find((a) => a.id === assignmentId)
    try {
      const result = await submitAssignment({ lessonId: assignment?.lessonId, file, note })
      setAssignments((prev) =>
        prev.map((a) => a.id === assignmentId ? { ...a, submission: result } : a)
      )
    } catch {
      // Ignore submit error and return to list
    }
    backToList()
  }

  async function handleGrade(submissionId, score, feedback) {
    const sub = submissions.find((s) => s.submissionId === submissionId)
    try {
      await gradeSubmission({
        submissionType: sub?.submissionType,
        submissionId,
        score,
        feedback,
      })
    } catch {
      // Keep local graded state even if API fails
    }
    setSubmissions((prev) =>
      prev.map((s) =>
        s.submissionId === submissionId
          ? { ...s, score, feedback, gradedAt: new Date().toISOString() }
          : s
      )
    )
  }

  const activeAssignment = assignments.find((a) => a.id === activeAssignmentId) || null

  return (
    <>
      <div className="assessModuleNav">
        {/* Only students see the quiz/assignment list tab */}
        {!isInstructor && (
          <button
            type="button"
            className={view === 'list' || view === 'quiz' || view === 'assignment' ? 'assessNavBtn active' : 'assessNavBtn'}
            onClick={backToList}
          >
            Bài kiểm tra
          </button>
        )}
        {isInstructor && (
          <button
            type="button"
            className={view === 'submissions' ? 'assessNavBtn active' : 'assessNavBtn'}
            onClick={() => setView('submissions')}
          >
            Bài đã nộp
            {submissions.filter((s) => s.score == null).length > 0 && (
              <span className="pendingBadge">
                {submissions.filter((s) => s.score == null).length}
              </span>
            )}
          </button>
        )}
      </div>

      {view === 'list' && (
        <AssessmentListView
          quizzes={quizzes}
          assignments={assignments}
          onStartQuiz={openQuiz}
          onOpenAssignment={openAssignment}
        />
      )}

      {view === 'quiz' && (
        activeQuizLoading
          ? <div className="assessLoading">Đang tải đề thi...</div>
          : activeQuiz
          ? <QuizPlayerView quiz={activeQuiz} onBack={backToList} onSubmitQuiz={handleQuizSubmit} />
          : <div className="assessLoading">Không tìm thấy đề thi.</div>
      )}

      {view === 'assignment' && activeAssignment && (
        <AssignmentSubmitView
          assignment={activeAssignment}
          onBack={backToList}
          onSubmit={(file, note) => handleAssignmentSubmit(activeAssignmentId, file, note)}
        />
      )}

      {view === 'submissions' && (
        submissionsLoading
          ? <div className="assessLoading">Đang tải danh sách bài nộp...</div>
          : <InstructorSubmissionsView
              submissions={submissions}
              onGrade={handleGrade}
            />
      )}
    </>
  )
}
