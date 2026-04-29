export default function MyCoursesSection({ myCourses, sectionRef }) {
  return (
    <div className="dataBlock" ref={sectionRef}>
      <h3>Tiếp tục học</h3>
      {myCourses.length === 0 ? (
        <p className="noteText">Bạn chưa đăng ký khóa học nào.</p>
      ) : (
        <div className="continueGrid">
          {myCourses.slice(0, 3).map((course) => (
            <article key={course.enrollmentId} className="continueCard">
              <h4>{course.courseTitle}</h4>
              <p>Trạng thái: {course.status}</p>
              <p>Ngày đăng ký: {new Date(course.enrolledAt).toLocaleDateString()}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
