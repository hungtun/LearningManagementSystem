import { CATEGORY_COLORS, calcProgressFromLessons } from '../learningData.js'
import './MyCoursesView.css'

function ProgressBar({ percent }) {
  return (
    <div className="progressTrack">
      <div
        className={percent === 100 ? 'progressFill fillGreen' : 'progressFill fillBlue'}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export default function MyCoursesView({ enrollments, onOpenLesson, onOpenCertificate }) {
  const totalCompleted = enrollments.filter((e) => e.status === 'COMPLETED').length
  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + calcProgressFromLessons(e.lessons || []), 0) / enrollments.length)
      : 0
  const totalLessonsCompleted = enrollments.reduce(
    (sum, e) => sum + (e.lessons || []).filter((l) => l.completed).length, 0
  )

  return (
    <div className="myCoursesRoot">
      {/* Summary row */}
      <div className="summaryRow">
        <div className="summaryCard">
          <p className="summaryNum">{enrollments.length}</p>
          <p className="summaryLabel">Khóa học đã đăng ký</p>
        </div>
        <div className="summaryCard">
          <p className="summaryNum">{totalCompleted}</p>
          <p className="summaryLabel">Hoàn thành</p>
        </div>
        <div className="summaryCard">
          <p className="summaryNum">{totalLessonsCompleted}</p>
          <p className="summaryLabel">Bài đã học</p>
        </div>
        <div className="summaryCard">
          <p className="summaryNum">{avgProgress}%</p>
          <p className="summaryLabel">Tiến độ trung bình</p>
        </div>
      </div>

      {/* Course list */}
      {enrollments.length === 0 ? (
        <div className="emptyEnroll">
          <p>Bạn chưa đăng ký khóa học nào.</p>
        </div>
      ) : (
        <div className="enrollGrid">
          {enrollments.map((enr) => {
            const lessons = enr.lessons || []
            const progress = calcProgressFromLessons(lessons)
            const color = CATEGORY_COLORS[enr.category] || '#64748b'
            const nextLesson = lessons.find((l) => !l.completed) || lessons[lessons.length - 1]
            const isCompleted = enr.status === 'COMPLETED'

            return (
              <article key={enr.id} className="enrollCard">
                {/* Thumbnail */}
                <div
                  className="enrollThumb"
                  style={{ background: `linear-gradient(135deg, ${color}cc, ${color})` }}
                >
                  <span className="enrollThumbCat">{enr.category}</span>
                  {isCompleted && <span className="completedStamp">Hoàn thành</span>}
                </div>

                {/* Body */}
                <div className="enrollBody">
                  <h3 className="enrollTitle">{enr.courseTitle}</h3>
                  <p className="enrollInstructor">{enr.instructor}</p>

                  {/* Progress */}
                  <div className="progressBlock">
                    <div className="progressLabelRow">
                      <span>{lessons.filter((l) => l.completed).length}/{lessons.length} bài</span>
                      <span className="progressPct">{progress}%</span>
                    </div>
                    <ProgressBar percent={progress} />
                  </div>

                  {/* Lesson list */}
                  <ul className="miniLessonList">
                    {lessons.map((l) => (
                      <li key={l.id} className={l.completed ? 'miniLesson done' : 'miniLesson'}>
                        <span className="miniCheck">{l.completed ? '✓' : '○'}</span>
                        <span className="miniTitle">{l.title}</span>
                        {l.progressPercent > 0 && l.progressPercent < 100 && (
                          <span className="miniInProgress">{l.progressPercent}%</span>
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* Actions */}
                  <div className="enrollActions">
                    {isCompleted ? (
                      <button
                        type="button"
                        className="btnCertificate"
                        onClick={() => onOpenCertificate(enr.courseId)}
                      >
                        Nhận chứng chỉ
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btnContinue"
                        onClick={() => onOpenLesson(enr.id, nextLesson?.id)}
                      >
                        {progress === 0 ? 'Bắt đầu học' : 'Tiếp tục học'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btnReview"
                      onClick={() => onOpenLesson(enr.id, lessons[0]?.id)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
