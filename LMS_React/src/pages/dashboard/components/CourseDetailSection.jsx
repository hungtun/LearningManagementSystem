export default function CourseDetailSection({
  selectedCourseId,
  isLoadingCourseDetail,
  selectedCourseDetail,
  onEnroll,
  isSelectedCourseEnrolled,
  onStartLearning,
  onBackHome,
}) {
  return (
    <div className="dataBlock udemyDetailBlock">
      <div className="profileHeaderRow">
        <h3>Chi tiết khóa học</h3>
        {onBackHome ? (
          <button type="button" className="secondaryButton" onClick={onBackHome}>
            Quay lại trang học
          </button>
        ) : null}
      </div>
      {selectedCourseId === null ? (
        <p className="noteText">Chọn một card khóa học để xem chi tiết và đăng ký.</p>
      ) : isLoadingCourseDetail ? (
        <p className="noteText">Đang tải chi tiết khóa học...</p>
      ) : selectedCourseDetail ? (
        <div className="courseDetailPanel">
          <div className="courseDetailHero">
            <div className="courseDetailHeroBody">
              <p className="courseDetailEyebrow">Course overview</p>
              <h4>{selectedCourseDetail.title}</h4>
              <p>{selectedCourseDetail.description || 'Khóa học chưa có mô tả'}</p>
              <div className="courseMetaChips">
                <span className="metaChip">Giảng viên: {selectedCourseDetail.instructorName || 'Unknown instructor'}</span>
                <span className="metaChip">Danh mục: {selectedCourseDetail.categoryName || 'No category'}</span>
                <span className="metaChip">Tổng bài học: {selectedCourseDetail.lessons?.length || 0}</span>
              </div>
              <div className="instructorInfoCard">
                <div className="instructorAvatarFrame">
                  {selectedCourseDetail.instructorAvatarUrl ? (
                    <img
                      src={selectedCourseDetail.instructorAvatarUrl}
                      alt={selectedCourseDetail.instructorName || 'Instructor avatar'}
                      className="instructorAvatarImage"
                    />
                  ) : (
                    <span className="instructorAvatarFallback">No photo</span>
                  )}
                </div>
                <div className="instructorMeta">
                  <p className="instructorLabel">Giảng viên</p>
                  <h5>{selectedCourseDetail.instructorName || 'Unknown instructor'}</h5>
                </div>
              </div>
            </div>
            <aside className="enrollSidebar">
              <p className="enrollPrice">Free Course</p>
              <p className="enrollSubText">Truy cập trọn đời, học mọi lúc trên mọi thiết bị.</p>
              {isSelectedCourseEnrolled ? (
                <button className="primaryButton fullWidth" type="button" onClick={onStartLearning}>
                  Vào học ngay
                </button>
              ) : (
                <form className="inlineEnrollForm" onSubmit={onEnroll}>
                  <button className="primaryButton fullWidth" type="submit">
                    Đăng ký khóa học này
                  </button>
                </form>
              )}
            </aside>
          </div>
          <div className="curriculumBlock">
            <h5>Nội dung khóa học</h5>
            <ul className="lessonList">
              {(selectedCourseDetail.lessons || []).length === 0 ? (
                <li className="lessonEmpty">Chưa có bài học nào cho khóa học này.</li>
              ) : (
                (selectedCourseDetail.lessons || []).map((lesson, index) => (
                  <li key={lesson.id}>
                    <span className="lessonIndex">{String(index + 1).padStart(2, '0')}</span>
                    <span className="lessonTitle">{lesson.title}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : (
        <p className="noteText">Không có dữ liệu chi tiết.</p>
      )}
    </div>
  )
}
