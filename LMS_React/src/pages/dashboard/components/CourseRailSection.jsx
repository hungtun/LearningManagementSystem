function CourseCard({ courseItem, selectedCourseId, onSelectCourse, tagLabel }) {
  return (
    <article
      className={selectedCourseId === courseItem.id ? 'courseCard active' : 'courseCard'}
      onClick={() => onSelectCourse(courseItem.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelectCourse(courseItem.id)
        }
      }}
    >
      <div className="courseThumb">
        <span className="courseLevelTag">{tagLabel}</span>
      </div>
      <h4>{courseItem.title}</h4>
      <p>{courseItem.description || 'Khóa học chưa có mô tả'}</p>
      <p className="cardMeta">Giảng viên: {courseItem.instructorName || 'Unknown instructor'}</p>
      {courseItem.categoryName ? <p className="cardMeta">Danh mục: {courseItem.categoryName}</p> : null}
      <p className="coursePrice">Free</p>
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
    <div className="dataBlock udemyCatalogBlock" ref={sectionRef}>
      <h3>{title}</h3>
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
