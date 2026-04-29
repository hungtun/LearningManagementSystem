import { useState } from 'react'
import { enrollCourse } from '../../../api/enrollmentsApi.js'
import { CATEGORY_COLORS, LEVEL_LABEL } from '../coursesData.js'
import './CourseDetailView.css'

function InstructorInitials({ name }) {
  const initials = name
    ? name.trim().split(/\s+/).slice(-2).map((w) => w[0]).join('').toUpperCase()
    : 'U'
  return <span className="instructorInitials">{initials}</span>
}

export default function CourseDetailView({ course, role, onBack }) {
  const [enrolled, setEnrolled] = useState(false)
  const [enrollMsg, setEnrollMsg] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [expandedLesson, setExpandedLesson] = useState(null)

  const color = CATEGORY_COLORS[course.categoryName] || '#64748b'
  const lessons = course.lessons || []

  async function handleEnroll() {
    setEnrolling(true)
    try {
      await enrollCourse(course.id)
      setEnrolled(true)
      setEnrollMsg('Đăng ký khóa học thành công! Chuyển đến trang Học tập để học.')
    } catch (err) {
      // Already enrolled or other error
      const msg = err?.data?.message || err?.data?.error || ''
      if (err?.status === 409 || msg.toLowerCase().includes('already')) {
        setEnrolled(true)
        setEnrollMsg('Bạn đã đăng ký khóa học này trước đó.')
      } else {
        setEnrollMsg('Đăng ký thất bại. Vui lòng thử lại.')
      }
    } finally {
      setEnrolling(false)
    }
  }

  const totalMinutes = lessons.reduce((sum, l) => {
    const match = (l.duration || '').match(/(\d+)/)
    return sum + (match ? Number(match[1]) : 0)
  }, 0)

  return (
    <div className="detailRoot">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <button type="button" className="breadcrumbLink" onClick={onBack}>
          Danh mục khóa học
        </button>
        <span className="breadcrumbSep">/</span>
        <span className="breadcrumbCurrent">{course.title}</span>
      </nav>

      {/* Hero */}
      <div className="detailHero" style={{ background: `linear-gradient(135deg, #0f172a 0%, #1e293b 60%, ${color}88 100%)` }}>
        <div className="detailHeroBody">
          <span className="detailCategory" style={{ borderColor: `${color}88`, color: '#fff' }}>
            {course.categoryName}
          </span>
          <h1 className="detailTitle">{course.title}</h1>
          <p className="detailDesc">{course.description}</p>

          <div className="detailMeta">
            <span className="metaChip">
              {LEVEL_LABEL[course.level] || course.level}
            </span>
            <span className="metaChip">
              {lessons.length} bài học
            </span>
            <span className="metaChip">
              {totalMinutes} phút
            </span>
            {(course.learners ?? 0) > 0 && (
              <span className="metaChip">
                {course.learners?.toLocaleString()} học viên
              </span>
            )}
          </div>

          <div className="detailInstructor">
            {course.instructorAvatarUrl ? (
              <img className="instructorAvatar" src={course.instructorAvatarUrl} alt={course.instructorName} />
            ) : (
              <div className="instructorAvatarBox">
                <InstructorInitials name={course.instructorName} />
              </div>
            )}
            <div>
              <p className="instructorRole">Giảng viên</p>
              <p className="instructorName">{course.instructorName}</p>
            </div>
          </div>
        </div>

        {/* Enroll sidebar — only students can enroll */}
        <div className="enrollSidebar">
          {role === 'STUDENT' && (
            <>
              {enrollMsg ? (
                <p className="enrollSuccess">{enrollMsg}</p>
              ) : enrolled ? (
                <button type="button" className="btnEnrolled" disabled>
                  Đã đăng ký
                </button>
              ) : (
                <button type="button" className="btnEnroll" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? 'Đang đăng ký...' : 'Đăng ký ngay'}
                </button>
              )}
            </>
          )}
          <ul className="enrollFeatures">
            <li>Truy cập trọn đời</li>
            <li>{lessons.length} bài học ({totalMinutes} phút)</li>
            <li>Chứng chỉ hoàn thành</li>
            {course.rating > 0 && <li>Đánh giá {course.rating}/5</li>}
          </ul>
        </div>
      </div>

      {/* Curriculum */}
      <div className="curriculumSection">
        <h2>Nội dung khóa học</h2>
        <p className="curriculumMeta">
          {lessons.length} bài học · {totalMinutes} phút tổng thời lượng
        </p>

        {lessons.length === 0 ? (
          <p className="emptyNote">Khóa học chưa có bài học nào.</p>
        ) : (
          <div className="lessonList">
            {lessons
              .slice()
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className={expandedLesson === lesson.id ? 'lessonRow expanded' : 'lessonRow'}
                >
                  <button
                    type="button"
                    className="lessonToggle"
                    onClick={() =>
                      setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)
                    }
                  >
                    <span className="lessonIndex">{idx + 1}</span>
                    <span className="lessonTitle">{lesson.title}</span>
                    <span className="lessonDuration">{lesson.duration}</span>
                    <span className="lessonChevron">
                      {expandedLesson === lesson.id ? '▲' : '▼'}
                    </span>
                  </button>
                  {expandedLesson === lesson.id && (
                    <div className="lessonContent">
                      {enrolled || role === 'INSTRUCTOR' || role === 'ADMIN' ? (
                        <p>{lesson.content || 'Nội dung bài học sẽ hiển thị ở đây.'}</p>
                      ) : (
                        <p className="lockedNote">Đăng ký khóa học để xem nội dung bài học này.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
