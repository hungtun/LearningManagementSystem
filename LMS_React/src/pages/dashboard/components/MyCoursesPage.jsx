function getProgressPercent(course) {
  if (course.status === 'COMPLETED') return 100
  if (course.status === 'ACTIVE') return 35
  return 0
}

export default function MyCoursesPage({ myCourses, courseCatalog, onOpenCourse, onBackHome }) {
  const catalogById = new Map((courseCatalog || []).map((courseItem) => [courseItem.id, courseItem]))

  return (
    <section className="modulePanel myCoursesPage">
      <div className="profileHeaderRow">
        <h2>My Courses</h2>
        <button type="button" className="secondaryButton" onClick={onBackHome}>
          Quay lại trang học
        </button>
      </div>

      <div className="dataBlock myCoursesBlock">
        <h3>Danh sách khóa học đã đăng ký</h3>
        {myCourses.length === 0 ? (
          <p className="noteText">Bạn chưa đăng ký khóa học nào.</p>
        ) : (
          <ul className="myCourseCardGrid">
            {myCourses.map((course) => (
              <li
                key={course.enrollmentId}
                className="myCourseCard clickable"
                role="button"
                tabIndex={0}
                onClick={() => onOpenCourse(course.courseId)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onOpenCourse(course.courseId)
                  }
                }}
              >
                <div className="courseThumb">
                  <span className="courseLevelTag">Enrolled</span>
                </div>
                <h4>{course.courseTitle}</h4>
                <p className="cardMeta">Trạng thái: {course.status}</p>
                <p className="cardMeta">Ngày đăng ký: {new Date(course.enrolledAt).toLocaleDateString()}</p>
                <p className="cardMeta">
                  Danh mục: {catalogById.get(course.courseId)?.categoryName || 'No category'}
                </p>
                <div className="myCourseProgress">
                  <div
                    className="myCourseProgressFill"
                    style={{ width: `${getProgressPercent(course)}%` }}
                  />
                </div>
                <p className="myCourseProgressLabel">
                  Tiến độ học tập: {getProgressPercent(course)}%
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
