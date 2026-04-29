import { useEffect, useState } from 'react'
import { getQuiz } from '../../../api/assessmentsApi.js'
import { formatDeadline } from '../assessmentsData.js'
import './InstructorSubmissionsView.css'

const OPTIONS = ['A', 'B', 'C', 'D']

// Normalize quiz from API (same as AssessmentsPage)
function normalizeQuiz(data) {
  if (!data) return null
  return {
    ...data,
    quizId: data.quizId ?? data.id,
    questions: (data.questions || []).map((q) => ({
      ...q,
      questionId: q.questionId ?? q.id,
      optionA: q.optionA ?? q.options?.[0],
      optionB: q.optionB ?? q.options?.[1],
      optionC: q.optionC ?? q.options?.[2],
      optionD: q.optionD ?? q.options?.[3],
      correctAnswer: q.correctAnswer ?? q.correctOption ?? null,
    })),
  }
}

// Fetch quiz from API and show student answers vs correct answers
function QuizAnswerReview({ submission }) {
  const [quiz, setQuiz] = useState(submission.quizId ? undefined : null)

  useEffect(() => {
    if (!submission.quizId) return
    getQuiz(submission.quizId)
      .then((data) => setQuiz(normalizeQuiz(data)))
      .catch(() => setQuiz(null))
  }, [submission.quizId])

  if (quiz === undefined) return <p className="isvNoAnswers">Đang tải đề thi...</p>
  if (!quiz) return <p className="isvNoAnswers">Không tìm được đề thi (ID: {submission.quizId ?? '?'}).</p>
  if (!submission.answers) return <p className="isvNoAnswers">Học viên chưa có dữ liệu đáp án.</p>

  const answers = submission.answers
  const hasCorrectAnswers = quiz.questions.some((q) => q.correctAnswer)
  const correctCount = hasCorrectAnswers
    ? quiz.questions.filter((q) => answers[q.questionId] === q.correctAnswer).length
    : null

  return (
    <div className="isvAnswerReview">
      <p className="isvAnswerNote">
        Tổng {quiz.questions.length} câu
        {correctCount !== null && (
          <> — <strong>{correctCount}</strong> câu đúng</>
        )}
        {!hasCorrectAnswers && (
          <em style={{ color: '#64748b', fontSize: 12 }}> (đáp án đúng không được cung cấp)</em>
        )}
      </p>
      <div className="isvAnswerList">
        {quiz.questions.map((q, i) => {
          const chosen = answers[q.questionId]
          const correct = q.correctAnswer
          const isRight = correct ? chosen === correct : null
          return (
            <div
              key={q.questionId}
              className={`isvAnswerRow ${isRight === true ? 'right' : isRight === false ? 'wrong' : ''}`}
            >
              <div className="isvARowHead">
                <span className="isvARowNum">Câu {i + 1}</span>
                {isRight !== null && (
                  <span className={`isvARowMark ${isRight ? 'right' : 'wrong'}`}>
                    {isRight ? '✓ Đúng' : '✗ Sai'}
                  </span>
                )}
              </div>
              <p className="isvARowQuestion">{q.questionText}</p>
              <div className="isvARowOptions">
                {OPTIONS.map((opt) => {
                  const text = q[`option${opt}`]
                  if (!text) return null
                  const isChosen = chosen === opt
                  const isCorrect = correct ? correct === opt : false
                  let cls = 'isvOpt'
                  if (isCorrect) cls += ' correct'
                  else if (isChosen && !isCorrect) cls += ' wrong'
                  return (
                    <div key={opt} className={cls}>
                      <span className="isvOptLabel">{opt}</span>
                      <span className="isvOptText">{text}</span>
                      {isChosen && !isCorrect && <span className="isvOptTag student">Học viên chọn</span>}
                      {isCorrect && <span className="isvOptTag correct">Đáp án đúng</span>}
                      {isChosen && !correct && <span className="isvOptTag student">Đã chọn</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GradeModal({ submission, onSave, onClose }) {
  const [activeTab, setActiveTab] = useState(submission.submissionType === 'QUIZ' ? 'answers' : 'grade')
  const [score, setScore] = useState(submission.score ?? '')
  const [feedback, setFeedback] = useState(submission.feedback ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    const parsed = Number(score)
    if (isNaN(parsed) || parsed < 0 || parsed > 100) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 400))
    onSave(submission.submissionId, parsed, feedback)
    setSaving(false)
    onClose()
  }

  return (
    <div className="isvOverlay" onClick={onClose}>
      <div className="isvModal wide" onClick={(e) => e.stopPropagation()}>
        <div className="isvModalHeader">
          <div>
            <p className="isvModalStudent">{submission.studentName}</p>
            <h3 className="isvModalTitle">{submission.assessmentTitle}</h3>
          </div>
          <button type="button" className="isvModalClose" onClick={onClose}>&#10005;</button>
        </div>

        {/* Tabs — quiz has both "answers" and "grade" tabs */}
        {submission.submissionType === 'QUIZ' && (
          <div className="isvModalTabs">
            <button
              type="button"
              className={activeTab === 'answers' ? 'isvModalTab active' : 'isvModalTab'}
              onClick={() => setActiveTab('answers')}
            >
              Xem đáp án học viên
            </button>
            <button
              type="button"
              className={activeTab === 'grade' ? 'isvModalTab active' : 'isvModalTab'}
              onClick={() => setActiveTab('grade')}
            >
              Chấm điểm
            </button>
          </div>
        )}

        {/* Quiz answer review tab */}
        {activeTab === 'answers' && submission.submissionType === 'QUIZ' && (
          <QuizAnswerReview submission={submission} />
        )}

        {/* Grade tab (or assignment default) */}
        {(activeTab === 'grade' || submission.submissionType === 'ASSIGNMENT') && (
          <>
            {submission.submissionType === 'ASSIGNMENT' && submission.originalFilename && (
              <div className="isvFileRow">
                <span className="isvFileIcon">&#128196;</span>
                <span className="isvFileName">{submission.originalFilename}</span>
                <a
                  href="#download-placeholder"
                  className="isvDownloadLink"
                  onClick={(e) => e.preventDefault()}
                >
                  Tải xuống
                </a>
              </div>
            )}
            <form className="isvGradeForm" onSubmit={handleSave}>
              <div className="isvFormRow">
                <label className="isvLabel" htmlFor="gradeScore">Điểm số (0 – 100)</label>
                <input
                  id="gradeScore"
                  type="number"
                  min={0}
                  max={100}
                  className="isvScoreInput"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Nhập điểm..."
                  required
                />
              </div>
              <div className="isvFormRow">
                <label className="isvLabel" htmlFor="gradeFeedback">Nhận xét</label>
                <textarea
                  id="gradeFeedback"
                  className="isvFeedbackArea"
                  rows={4}
                  placeholder="Nhận xét chi tiết cho học viên..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
              <div className="isvModalActions">
                <button type="button" className="isvCancelBtn" onClick={onClose}>Huỷ</button>
                <button type="submit" className="isvSaveBtn" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu điểm'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function InstructorSubmissionsView({ submissions, onGrade }) {
  const [filterType, setFilterType] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterCourse, setFilterCourse] = useState('ALL')
  const [grading, setGrading] = useState(null)

  const courses = [...new Set(submissions.map((s) => s.courseTitle).filter(Boolean))]

  const filtered = submissions.filter((s) => {
    if (filterType !== 'ALL' && s.submissionType !== filterType) return false
    if (filterStatus === 'PENDING' && s.score != null) return false
    if (filterStatus === 'GRADED' && s.score == null) return false
    if (filterCourse !== 'ALL' && s.courseTitle !== filterCourse) return false
    return true
  })

  const pendingCount = submissions.filter((s) => s.score == null).length

  return (
    <div className="isvPage">
      <div className="isvTopBar">
        <div>
          <h2 className="isvPageTitle">Bài đã nộp</h2>
          {pendingCount > 0 && (
            <p className="isvPendingNote">{pendingCount} bài chờ chấm điểm</p>
          )}
        </div>
        <div className="isvFilters">
          <select className="isvSelect" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
            <option value="ALL">Tất cả khóa học</option>
            {courses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="isvSelect" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="ALL">Tất cả loại</option>
            <option value="QUIZ">Quiz</option>
            <option value="ASSIGNMENT">Bài tập</option>
          </select>
          <select className="isvSelect" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ chấm</option>
            <option value="GRADED">Đã chấm</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="isvEmpty">Không có bài nộp nào phù hợp.</div>
      ) : (
        <div className="isvTable">
          <div className="isvTableHead">
            <span>Học viên</span>
            <span>Bài kiểm tra</span>
            <span>Loại</span>
            <span>Nộp lúc</span>
            <span>Điểm</span>
            <span></span>
          </div>
          {filtered.map((s) => {
            const graded = s.score != null
            return (
              <div key={s.submissionId} className={`isvTableRow ${graded ? '' : 'pending'}`}>
                <div className="isvCell">
                  <span className="isvAvatar">
                    {(s.studentName || '?').split(' ').pop()[0]}
                  </span>
                  <div>
                    <p className="isvStudentName">{s.studentName}</p>
                    <p className="isvCourseName">{s.courseTitle}</p>
                  </div>
                </div>
                <div className="isvCell">
                  <div>
                    <span className="isvAssessTitle">{s.assessmentTitle}</span>
                    {s.submissionType === 'ASSIGNMENT' && s.originalFilename && (
                      <span className="isvFileChip">&#128196; {s.originalFilename}</span>
                    )}
                  </div>
                </div>
                <div className="isvCell">
                  <span className={`isvTypeBadge ${s.submissionType === 'QUIZ' ? 'quiz' : 'assignment'}`}>
                    {s.submissionType === 'QUIZ' ? 'Quiz' : 'Bài tập'}
                  </span>
                </div>
                <div className="isvCell">
                  <span className="isvDate">{formatDeadline(s.submittedAt)}</span>
                </div>
                <div className="isvCell">
                  {graded ? (
                    <span className={`isvScore ${(s.score ?? 0) >= 60 ? 'pass' : 'fail'}`}>
                      {s.score}/100
                    </span>
                  ) : (
                    <span className="isvNeedGrade">Chờ chấm</span>
                  )}
                </div>
                <div className="isvCell">
                  <button
                    type="button"
                    className={graded ? 'isvEditBtn' : 'isvGradeBtn'}
                    onClick={() => setGrading(s)}
                  >
                    {s.submissionType === 'QUIZ'
                      ? (graded ? 'Xem lại' : 'Xem bài')
                      : (graded ? 'Sửa điểm' : 'Chấm điểm')}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {grading && (
        <GradeModal
          submission={grading}
          onSave={onGrade}
          onClose={() => setGrading(null)}
        />
      )}
    </div>
  )
}
