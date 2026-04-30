function getCourseThumbClass(id) {
  return `courseThumb courseThumb-${(id || 0) % 8}`
}

export default function CourseDetailSection({
  selectedCourseId,
  isLoadingCourseDetail,
  selectedCourseDetail,
  onEnroll,
  isSelectedCourseEnrolled,
  onStartLearning,
  onBackHome,
}) {
  if (selectedCourseId === null) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Select a course to view details.
      </div>
    )
  }

  if (isLoadingCourseDetail) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Loading course details...
      </div>
    )
  }

  if (!selectedCourseDetail) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        No detail data available.
      </div>
    )
  }

  const lessonCount = selectedCourseDetail.lessons?.length || 0

  return (
    <div className="courseDetailPage">
      {/* Dark hero band */}
      <div className="courseDetailHeroBand">
        <div className="courseDetailHeroInner">
          <div>
            <button className="courseDetailBackBtn" type="button" onClick={onBackHome}>
              &larr; Back
            </button>
            <p className="courseDetailEyebrow">Course</p>
            <h1 className="courseDetailHeroTitle">{selectedCourseDetail.title}</h1>
            <p className="courseDetailHeroDesc">
              {selectedCourseDetail.description || 'This course has no description yet.'}
            </p>

            <div className="courseMetaChips">
              {selectedCourseDetail.categoryName && (
                <span className="metaChip">{selectedCourseDetail.categoryName}</span>
              )}
              <span className="metaChip">{lessonCount} lessons</span>
              <span className="metaChip">Free</span>
            </div>

            <div className="instructorInfoCard">
              <div className="instructorAvatarFrame">
                {selectedCourseDetail.instructorAvatarUrl ? (
                  <img
                    src={selectedCourseDetail.instructorAvatarUrl}
                    alt={selectedCourseDetail.instructorName}
                    className="instructorAvatarImage"
                  />
                ) : (
                  (selectedCourseDetail.instructorName || 'G').charAt(0).toUpperCase()
                )}
              </div>
              <div className="instructorMeta">
                <p className="instructorLabel">Instructor</p>
                <h5>{selectedCourseDetail.instructorName || 'Unknown instructor'}</h5>
              </div>
            </div>
          </div>

          {/* Enroll sidebar inside hero */}
          <aside className="enrollSidebar">
            <div className={getCourseThumbClass(selectedCourseId)}
              style={{ height: 160, borderRadius: 6, marginBottom: 16 }} />
            <p className="enrollPrice">Free</p>
            <p className="enrollSubText">Lifetime access. Learn anytime, anywhere.</p>

            {isSelectedCourseEnrolled ? (
              <button className="primaryButton fullWidth" type="button" onClick={onStartLearning}>
                Start learning
              </button>
            ) : (
              <form onSubmit={onEnroll} className="inlineEnrollForm">
                <button className="primaryButton fullWidth" type="submit">
                  Enroll in this course
                </button>
              </form>
            )}

            <ul className="enrollSidebarDetails">
              <li>
                <span>Lessons</span>
                <strong>{lessonCount}</strong>
              </li>
              <li>
                <span>Level</span>
                <strong>All levels</strong>
              </li>
              <li>
                <span>Format</span>
                <strong>Online</strong>
              </li>
              <li>
                <span>Price</span>
                <strong style={{ color: '#16a34a' }}>Free</strong>
              </li>
            </ul>
          </aside>
        </div>
      </div>

      {/* Curriculum */}
      <div className="courseDetailMain">
        <div className="courseDetailContent">
          <div className="curriculumBlock">
            <div className="curriculumHeader">
              <h5>Course content</h5>
              <span className="curriculumStats">{lessonCount} lessons</span>
            </div>
            <ul className="lessonList">
              {lessonCount === 0 ? (
                <li className="lessonEmpty">No lessons available for this course yet.</li>
              ) : (
                selectedCourseDetail.lessons.map((lesson, index) => (
                  <li key={lesson.id} className="lessonItem">
                    <span className="lessonIndex">{String(index + 1).padStart(2, '0')}</span>
                    <span className="lessonTitle">{lesson.title}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Empty column for grid alignment on desktop */}
        <div />
      </div>
    </div>
  )
}
