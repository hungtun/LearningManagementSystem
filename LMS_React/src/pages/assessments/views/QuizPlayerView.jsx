import { useCallback, useEffect, useRef, useState } from 'react'
import './QuizPlayerView.css'

const OPTIONS = ['A', 'B', 'C', 'D']

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function QuestionPanel({ question, index, total, answer, onSelect }) {
  return (
    <div className="qpQuestion">
      <div className="qpQuestionNum">Câu {index + 1} / {total}</div>
      <p className="qpQuestionText">{question.questionText}</p>
      <div className="qpOptions">
        {OPTIONS.map((opt) => {
          const text = question[`option${opt}`]
          if (!text) return null
          return (
            <button
              key={opt}
              type="button"
              className={`qpOption ${answer === opt ? 'selected' : ''}`}
              onClick={() => onSelect(opt)}
            >
              <span className="qpOptLabel">{opt}</span>
              <span className="qpOptText">{text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * apiResult: { score, correctCount, totalQuestions } from server after submit.
 * Each question may have `correctAnswer` from the quiz API for per-question review.
 */
function ResultScreen({ questions, answers, apiResult, passScore, onBack }) {
  const total = questions.length

  // Prefer server-calculated values; fall back to local if questions have correctAnswer
  const hasCorrectAnswers = questions.some((q) => q.correctAnswer)
  const localCorrect = hasCorrectAnswers
    ? questions.filter((q) => answers[q.questionId] === q.correctAnswer).length
    : null
  const correct = apiResult?.correctCount ?? localCorrect ?? null
  const score = apiResult?.score ?? (correct !== null && total > 0 ? Math.round((correct / total) * 100) : null)
  const threshold = passScore ?? 60
  const passed = score !== null ? score >= threshold : null

  return (
    <div className="qpResult">
      <div className="qpResultCard">
        {score !== null ? (
          <>
            <div className={`qpScore ${passed ? 'pass' : 'fail'}`}>{score}</div>
            <p className="qpScoreLabel">/ 100 điểm</p>
            <p className={`qpVerdict ${passed ? 'pass' : 'fail'}`}>
              {passed ? 'Đạt' : 'Chưa đạt'}
            </p>
          </>
        ) : (
          <>
            <div className="qpScore pass">—</div>
            <p className="qpScoreLabel">Đã nộp bài</p>
            <p className="qpVerdict pass">Chờ giảng viên chấm điểm</p>
          </>
        )}
        {correct !== null && (
          <p className="qpCorrectInfo">
            Đúng <strong>{correct}</strong> / {total} câu
          </p>
        )}

        {/* Per-question review — only when correct answers are available */}
        {hasCorrectAnswers && (
          <div className="qpResultDetail">
            {questions.map((q, i) => {
              const chosen = answers[q.questionId]
              const correctAns = q.correctAnswer
              const isRight = chosen === correctAns
              return (
                <div key={q.questionId} className={`qpResultRow ${isRight ? 'right' : 'wrong'}`}>
                  <span className="qpResultIdx">Câu {i + 1}</span>
                  <span className="qpResultQText">{q.questionText}</span>
                  <span className="qpResultAns">
                    Bạn: <strong>{chosen || '—'}</strong>
                    {!isRight && correctAns && <> | Đúng: <strong>{correctAns}</strong></>}
                  </span>
                  <span className={`qpResultMark ${isRight ? 'right' : 'wrong'}`}>
                    {isRight ? '✓' : '✗'}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Basic answer summary when no correct answers available */}
        {!hasCorrectAnswers && (
          <div className="qpResultDetail">
            {questions.map((q, i) => {
              const chosen = answers[q.questionId]
              return (
                <div key={q.questionId} className="qpResultRow right">
                  <span className="qpResultIdx">Câu {i + 1}</span>
                  <span className="qpResultQText">{q.questionText}</span>
                  <span className="qpResultAns">
                    Bạn: <strong>{chosen || '—'}</strong>
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <button type="button" className="qpBackBtn" onClick={onBack}>
          Quay lại danh sách
        </button>
      </div>
    </div>
  )
}

export default function QuizPlayerView({ quiz, onBack, onSubmitQuiz }) {
  const totalSeconds = (quiz.duration ?? 20) * 60
  const [remaining, setRemaining] = useState(totalSeconds)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [apiResult, setApiResult] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const timerRef = useRef(null)

  const handleSubmit = useCallback(async () => {
    clearInterval(timerRef.current)
    setShowConfirm(false)
    if (onSubmitQuiz) {
      const answerList = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId: Number(questionId),
        selectedOption,
      }))
      try {
        const result = await onSubmitQuiz({ quizId: quiz.quizId ?? quiz.id, answers: answerList })
        setApiResult(result ?? null)
      } catch {
        setApiResult(null)
      }
    }
    setSubmitted(true)
  }, [answers, quiz, onSubmitQuiz])

  // Start countdown
  useEffect(() => {
    if (submitted) return
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [submitted, handleSubmit])

  function selectAnswer(opt) {
    if (submitted) return
    const qId = quiz.questions[currentIndex].questionId
    setAnswers((prev) => ({ ...prev, [qId]: opt }))
  }

  const question = quiz.questions[currentIndex]
  const answered = Object.keys(answers).length
  const urgent = !submitted && remaining <= 60

  if (submitted) {
    return (
      <ResultScreen
        questions={quiz.questions}
        answers={answers}
        apiResult={apiResult}
        passScore={quiz.passScore}
        onBack={onBack}
      />
    )
  }

  return (
    <div className="qpPage">
      {/* Header bar */}
      <div className="qpHeader">
        <button type="button" className="qpBackLink" onClick={onBack}>
          Thoát
        </button>
        <h2 className="qpTitle">{quiz.title}</h2>
        <div className={`qpTimer ${urgent ? 'urgent' : ''}`}>
          {formatTime(remaining)}
        </div>
      </div>

      <div className="qpBody">
        {/* Sidebar navigation */}
        <aside className="qpSidebar">
          <p className="qpSidebarLabel">Câu hỏi ({answered}/{quiz.questions.length})</p>
          <div className="qpNavGrid">
            {quiz.questions.map((q, i) => (
              <button
                key={q.questionId}
                type="button"
                className={`qpNavBtn ${i === currentIndex ? 'current' : ''} ${answers[q.questionId] ? 'done' : ''}`}
                onClick={() => setCurrentIndex(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="qpSubmitSide"
            onClick={() => setShowConfirm(true)}
          >
            Nộp bài ({answered}/{quiz.questions.length})
          </button>
        </aside>

        {/* Question area */}
        <div className="qpMain">
          <QuestionPanel
            question={question}
            index={currentIndex}
            total={quiz.questions.length}
            answer={answers[question.questionId]}
            onSelect={selectAnswer}
          />

          <div className="qpNav">
            <button
              type="button"
              className="qpNavArrow"
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={currentIndex === 0}
            >
              Câu trước
            </button>
            {currentIndex < quiz.questions.length - 1 ? (
              <button
                type="button"
                className="qpNavArrow primary"
                onClick={() => setCurrentIndex((i) => i + 1)}
              >
                Câu tiếp
              </button>
            ) : (
              <button
                type="button"
                className="qpNavArrow primary"
                onClick={() => setShowConfirm(true)}
              >
                Nộp bài
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm submit modal */}
      {showConfirm && (
        <div className="qpOverlay" onClick={() => setShowConfirm(false)}>
          <div className="qpModal" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận nộp bài</h3>
            <p>
              Bạn đã trả lời <strong>{answered}</strong> / {quiz.questions.length} câu.
              {answered < quiz.questions.length && (
                <span className="qpWarnUnanswered">
                  {' '}Còn {quiz.questions.length - answered} câu chưa trả lời!
                </span>
              )}
            </p>
            <div className="qpModalActions">
              <button type="button" className="qpModalCancel" onClick={() => setShowConfirm(false)}>
                Tiếp tục làm bài
              </button>
              <button type="button" className="qpModalConfirm" onClick={handleSubmit}>
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
