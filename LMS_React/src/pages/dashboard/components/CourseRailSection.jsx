function getCourseThumbClass(id) {
  return `courseThumb courseThumb-${(id || 0) % 8}`
}

function CourseCard({ courseItem, selectedCourseId, onSelectCourse, tagLabel }) {
  const isActive = selectedCourseId === courseItem.id
  const lessonCount = courseItem.lessonCount ?? courseItem.lessons?.length ?? 0

  return (
    <article
      className={`courseCard${isActive ? ' active' : ''}`}
      onClick={() => onSelectCourse(courseItem.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelectCourse(courseItem.id)
        }
      }}
      aria-pressed={isActive}
    >
      <div className={getCourseThumbClass(courseItem.id)}>
        {tagLabel && (
          <span className={`courseLevelTag${tagLabel !== 'Bestseller' ? ` ${tagLabel.toLowerCase()}` : ''}`}>
            {tagLabel === 'trending' ? 'Trending' : tagLabel === 'recommended' ? 'Recommended' : tagLabel}
          </span>
        )}
      </div>
      <div className="courseCardBody">
        <h4 className="courseCardTitle">{courseItem.title}</h4>
        <p className="courseCardInstructor">
          {courseItem.instructorName || 'Unknown instructor'}
        </p>
        <div className="courseCardFooter">
          <span className="courseCardMeta">
            {lessonCount > 0 ? `${lessonCount} lessons` : courseItem.categoryName || ''}
          </span>
          <span className="courseCardPrice">Free</span>
        </div>
      </div>
    </article>
  )
}

export default function CourseRailSection({
  title,
  courses,
  selectedCourseId,
  onSelectCourse,
  tagLabel,
  sectionRef,
}) {
  if (!courses || courses.length === 0) return null

  return (
    <div className="courseRailBlock" ref={sectionRef}>
      <div className="courseRailHeader">
        <h3 className="courseRailTitle">{title}</h3>
      </div>
      <div className="courseRail">
        {courses.map((courseItem) => (
          <CourseCard
            key={courseItem.id}
            courseItem={courseItem}
            selectedCourseId={selectedCourseId}
            onSelectCourse={onSelectCourse}
            tagLabel={tagLabel}
          />
        ))}
      </div>
    </div>
  )
}
