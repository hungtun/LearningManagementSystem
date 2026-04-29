import { useMemo, useState } from 'react'
import './StudentProgressView.css'

// Mock data representing multiple students' enrollments visible to instructor/admin
const MOCK_STUDENT_PROGRESS = [
  {
    studentId: 10,
    studentName: 'Nguyen Van An',
    email: 'an.nv@student.lms',
    courseId: 1,
    courseTitle: 'Java Spring Boot Cơ bản',
    enrolledAt: '2026-03-01',
    status: 'ACTIVE',
    completedLessons: 2,
    totalLessons: 4,
    progressPercent: 50,
    lastActivity: '2026-04-28T14:00:00',
  },
  {
    studentId: 11,
    studentName: 'Tran Thi Bich',
    email: 'bich.tt@student.lms',
    courseId: 1,
    courseTitle: 'Java Spring Boot Cơ bản',
    enrolledAt: '2026-03-05',
    status: 'COMPLETED',
    completedLessons: 4,
    totalLessons: 4,
    progressPercent: 100,
    lastActivity: '2026-04-20T10:00:00',
  },
  {
    studentId: 12,
    studentName: 'Le Minh Quan',
    email: 'quan.lm@student.lms',
    courseId: 1,
    courseTitle: 'Java Spring Boot Cơ bản',
    enrolledAt: '2026-03-10',
    status: 'ACTIVE',
    completedLessons: 1,
    totalLessons: 4,
    progressPercent: 25,
    lastActivity: '2026-04-15T09:00:00',
  },
  {
    studentId: 10,
    studentName: 'Nguyen Van An',
    email: 'an.nv@student.lms',
    courseId: 2,
    courseTitle: 'React Frontend Thực chiến',
    enrolledAt: '2026-03-15',
    status: 'ACTIVE',
    completedLessons: 3,
    totalLessons: 5,
    progressPercent: 60,
    lastActivity: '2026-04-29T11:00:00',
  },
  {
    studentId: 13,
    studentName: 'Pham Thi Dao',
    email: 'dao.pt@student.lms',
    courseId: 2,
    courseTitle: 'React Frontend Thực chiến',
    enrolledAt: '2026-03-20',
    status: 'ACTIVE',
    completedLessons: 0,
    totalLessons: 5,
    progressPercent: 0,
    lastActivity: '2026-03-20T08:00:00',
  },
  {
    studentId: 14,
    studentName: 'Hoang Van Em',
    email: 'em.hv@student.lms',
    courseId: 2,
    courseTitle: 'React Frontend Thực chiến',
    enrolledAt: '2026-03-18',
    status: 'COMPLETED',
    completedLessons: 5,
    totalLessons: 5,
    progressPercent: 100,
    lastActivity: '2026-04-25T16:00:00',
  },
]

function ProgressBar({ percent }) {
  const color = percent === 100 ? '#16a34a' : percent >= 50 ? '#2563eb' : '#f59e0b'
  return (
    <div className="spProgressTrack">
      <div className="spProgressFill" style={{ width: `${percent}%`, background: color }} />
    </div>
  )
}

function StatusBadge({ status }) {
  if (status === 'COMPLETED') return <span className="spBadge completed">Hoàn thành</span>
  return <span className="spBadge active">Đang học</span>
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN')
}

export default function StudentProgressView() {
  const [filterCourse, setFilterCourse] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [search, setSearch] = useState('')

  const courses = [...new Set(MOCK_STUDENT_PROGRESS.map((r) => r.courseTitle))]

  const rows = useMemo(() => {
    return MOCK_STUDENT_PROGRESS.filter((r) => {
      if (filterCourse !== 'ALL' && r.courseTitle !== filterCourse) return false
      if (filterStatus === 'COMPLETED' && r.status !== 'COMPLETED') return false
      if (filterStatus === 'ACTIVE' && r.status !== 'ACTIVE') return false
      if (search && !r.studentName.toLowerCase().includes(search.toLowerCase()) &&
          !r.email.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [filterCourse, filterStatus, search])

  // Summary stats
  const totalEnrollments = MOCK_STUDENT_PROGRESS.length
  const uniqueStudents = new Set(MOCK_STUDENT_PROGRESS.map((r) => r.studentId)).size
  const completedCount = MOCK_STUDENT_PROGRESS.filter((r) => r.status === 'COMPLETED').length
  const avgProgress = Math.round(
    MOCK_STUDENT_PROGRESS.reduce((sum, r) => sum + r.progressPercent, 0) / totalEnrollments
  )

  return (
    <div className="spPage">
      {/* Summary cards */}
      <div className="spSummaryGrid">
        <div className="spSummaryCard">
          <span className="spSummaryNum">{uniqueStudents}</span>
          <span className="spSummaryLabel">Học viên</span>
        </div>
        <div className="spSummaryCard">
          <span className="spSummaryNum">{totalEnrollments}</span>
          <span className="spSummaryLabel">Lượt đăng ký</span>
        </div>
        <div className="spSummaryCard green">
          <span className="spSummaryNum">{completedCount}</span>
          <span className="spSummaryLabel">Hoàn thành</span>
        </div>
        <div className="spSummaryCard blue">
          <span className="spSummaryNum">{avgProgress}%</span>
          <span className="spSummaryLabel">Tiến độ TB</span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="spToolbar">
        <input
          className="spSearch"
          type="text"
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="spSelect" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
          <option value="ALL">Tất cả khóa học</option>
          {courses.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="spSelect" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang học</option>
          <option value="COMPLETED">Hoàn thành</option>
        </select>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="spEmpty">Không tìm thấy học viên nào.</div>
      ) : (
        <div className="spTable">
          <div className="spTableHead">
            <span>Học viên</span>
            <span>Khóa học</span>
            <span>Tiến độ</span>
            <span>Trạng thái</span>
            <span>Ngày đăng ký</span>
            <span>Hoạt động gần nhất</span>
          </div>
          {rows.map((r, idx) => (
            <div key={idx} className="spTableRow">
              <div className="spCell studentCell">
                <span className="spAvatar">
                  {r.studentName.split(' ').pop()[0]}
                </span>
                <div>
                  <p className="spStudentName">{r.studentName}</p>
                  <p className="spStudentEmail">{r.email}</p>
                </div>
              </div>
              <div className="spCell">
                <span className="spCourseTitle">{r.courseTitle}</span>
              </div>
              <div className="spCell progressCell">
                <ProgressBar percent={r.progressPercent} />
                <span className="spProgressText">
                  {r.completedLessons}/{r.totalLessons} bài ({r.progressPercent}%)
                </span>
              </div>
              <div className="spCell">
                <StatusBadge status={r.status} />
              </div>
              <div className="spCell">
                <span className="spDate">{formatDate(r.enrolledAt)}</span>
              </div>
              <div className="spCell">
                <span className="spDate">{formatDate(r.lastActivity)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
