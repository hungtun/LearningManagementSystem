function getCourseThumbClass(id) {
  return `courseThumb courseThumb-${(id || 0) % 8}`
}

function resolveProgressPercent(course, courseProgressById) {
  const courseId = Number(course?.courseId)
  const apiPercent = courseProgressById?.[courseId]?.completionPercent
  if (typeof apiPercent === 'number' && Number.isFinite(apiPercent)) {
    return Math.max(0, Math.min(100, Math.round(apiPercent)))
  }
  if (course.status === 'COMPLETED') return 100
  if (course.status === 'ACTIVE') return 35
  return 0
}

export default function MyCoursesSection({ myCourses, courseProgressById, onOpenCourse }) {
  if (!myCourses || myCourses.length === 0) return null

  return (
    <div className="myCoursesContinue">
      <h3>Continue learning</h3>
      <div className="continueGrid">
        {myCourses.slice(0, 3).map((course) => {
          const progress = resolveProgressPercent(course, courseProgressById)
          return (
            <article
              key={course.enrollmentId}
              className="continueCard"
              onClick={() => onOpenCourse?.(course.courseId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpenCourse?.(course.courseId)
                }
              }}
            >
              <div className={getCourseThumbClass(course.courseId)} style={{ height: 100, borderRadius: 6, marginBottom: 12 }} />
              <h4>{course.courseTitle}</h4>
              <p className="continueCardMeta">
                {new Date(course.enrolledAt).toLocaleDateString('vi-VN')}
              </p>
              <div className="progressBar">
                <div className="progressBarFill" style={{ width: `${progress}%` }} />
              </div>
              <p className="progressLabel">{progress}% completed</p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
