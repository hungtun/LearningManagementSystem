import { formatDeadline, formatDuration } from '../assessmentsData.js'
import './AssessmentListView.css'

function QuizCard({ quiz, onStart }) {
  const attempted = false // replace with real state when integrating API

  return (
    <div className="assessCard">
      <div className="assessCardHeader">
        <span className="assessTypeBadge quiz">Quiz</span>
        <span className={`assessStatusBadge ${quiz.status === 'PUBLISHED' ? 'open' : 'closed'}`}>
          {quiz.status === 'PUBLISHED' ? 'Đang mở' : 'Đã đóng'}
        </span>
      </div>
      <div className="assessCardBody">
        <p className="assessCourseName">{quiz.courseTitle}</p>
        <h3 className="assessTitle">{quiz.title}</h3>
        <p className="assessDesc">{quiz.description}</p>
        <div className="assessMeta">
          <span>
            <span className="metaIcon">&#8987;</span>
            {formatDuration(quiz.duration)}
          </span>
          <span>
            <span className="metaIcon">&#10003;</span>
            {quiz.questions.length} câu hỏi
          </span>
          <span>
            <span className="metaIcon">&#128175;</span>
            Điểm đạt: {quiz.passScore}/100
          </span>
        </div>
      </div>
      <div className="assessCardFoot">
        <button
          type="button"
          className={attempted ? 'btnRetake' : 'btnStart'}
          onClick={() => onStart(quiz.id)}
          disabled={quiz.status !== 'PUBLISHED'}
        >
          {attempted ? 'Làm lại' : 'Bắt đầu làm bài'}
        </button>
      </div>
    </div>
  )
}

function AssignmentCard({ assignment, onOpen }) {
  const submitted = Boolean(assignment.submission)
  const graded = submitted && assignment.submission.score !== null
  const deadline = new Date(assignment.deadline)
  const overdue = !submitted && deadline < new Date()

  return (
    <div className={`assessCard ${overdue ? 'overdue' : ''}`}>
      <div className="assessCardHeader">
        <span className="assessTypeBadge assignment">Bài tập</span>
        {graded && (
          <span className="assessStatusBadge graded">
            {assignment.submission.score}/100
          </span>
        )}
        {submitted && !graded && <span className="assessStatusBadge submitted">Đã nộp</span>}
        {!submitted && overdue && <span className="assessStatusBadge overdue">Quá hạn</span>}
        {!submitted && !overdue && <span className="assessStatusBadge open">Chờ nộp</span>}
      </div>
      <div className="assessCardBody">
        <p className="assessCourseName">{assignment.courseTitle}</p>
        <h3 className="assessTitle">{assignment.title}</h3>
        <p className="assessDesc">{assignment.description}</p>
        <div className="assessMeta">
          <span>
            <span className="metaIcon">&#128197;</span>
            Hạn nộp: {formatDeadline(assignment.deadline)}
          </span>
        </div>
        {graded && (
          <div className="gradedFeedback">
            <strong>Nhận xét:</strong> {assignment.submission.feedback || 'Chưa có nhận xét.'}
          </div>
        )}
      </div>
      <div className="assessCardFoot">
        {!submitted ? (
          <button type="button" className="btnStart" onClick={() => onOpen(assignment.id)}>
            Nộp bài
          </button>
        ) : !graded ? (
          <button type="button" className="btnRetake" onClick={() => onOpen(assignment.id)}>
            Xem / Nộp lại
          </button>
        ) : (
          <span className="txtGraded">Đã chấm điểm</span>
        )}
      </div>
    </div>
  )
}

export default function AssessmentListView({ quizzes, assignments, onStartQuiz, onOpenAssignment }) {
  return (
    <div className="assessListPage">
      <div className="assessSection">
        <h2 className="assessSectionTitle">Bài kiểm tra trắc nghiệm</h2>
        {quizzes.length === 0 ? (
          <p className="emptyText">Chưa có bài kiểm tra nào.</p>
        ) : (
          <div className="assessGrid">
            {quizzes.map((q) => (
              <QuizCard key={q.id} quiz={q} onStart={onStartQuiz} />
            ))}
          </div>
        )}
      </div>

      <div className="assessSection">
        <h2 className="assessSectionTitle">Bài tập tự luận</h2>
        {assignments.length === 0 ? (
          <p className="emptyText">Chưa có bài tập nào.</p>
        ) : (
          <div className="assessGrid">
            {assignments.map((a) => (
              <AssignmentCard key={a.id} assignment={a} onOpen={onOpenAssignment} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
