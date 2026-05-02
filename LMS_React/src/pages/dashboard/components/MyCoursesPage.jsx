function getProgressPercent(course, courseProgressById) {
  const courseId = Number(course?.courseId);
  const apiPercent = courseProgressById?.[courseId]?.completionPercent;
  if (typeof apiPercent === "number" && Number.isFinite(apiPercent)) {
    return Math.max(0, Math.min(100, Math.round(apiPercent)));
  }
  if (course.status === "COMPLETED") return 100;
  if (course.status === "ACTIVE") return 35;
  return 0;
}

export default function MyCoursesPage({
  myCourses,
  courseCatalog,
  courseProgressById,
  onOpenCourse,
  onBackHome,
}) {
  const catalogById = new Map(
    (courseCatalog || []).map((courseItem) => [courseItem.id, courseItem]),
  );

  return (
    <section className="modulePanel myCoursesPage">
      <div className="profileHeaderRow">
        <h2>My Courses</h2>
        <button type="button" className="secondaryButton" onClick={onBackHome}>
          Back to learning page
        </button>
      </div>

      <div className="dataBlock myCoursesBlock">
        <h3>Enrolled courses</h3>
        {myCourses.length === 0 ? (
          <p className="noteText">You have not enrolled in any courses yet.</p>
        ) : (
          <ul className="myCourseCardGrid">
            {myCourses.map((course) => {
              const progressPercent = getProgressPercent(
                course,
                courseProgressById,
              );
              return (
                <li
                  key={course.enrollmentId}
                  className="myCourseCard clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenCourse(course.courseId)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onOpenCourse(course.courseId);
                    }
                  }}
                >
                  <div className="courseThumb">
                    <span className="courseLevelTag">Enrolled</span>
                  </div>
                  <h4>{course.courseTitle}</h4>
                  <p className="cardMeta">Status: {course.status}</p>
                  <p className="cardMeta">
                    Enrollment date:{" "}
                    {new Date(course.enrolledAt).toLocaleDateString()}
                  </p>
                  <p className="cardMeta">
                    Category:{" "}
                    {catalogById.get(course.courseId)?.categoryName ||
                      "No category"}
                  </p>
                  <div className="myCourseProgress">
                    <div
                      className="myCourseProgressFill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="myCourseProgressLabel">
                    Learning progress: {progressPercent}%
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
