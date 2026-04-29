import { useState } from 'react'
import { LEVEL_LABEL } from '../coursesData.js'
import './AdminPendingView.css'

function ConfirmModal({ course, action, onConfirm, onClose }) {
  const [reason, setReason] = useState('')
  const isReject = action === 'REJECTED'

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <h3>{isReject ? 'Từ chối khóa học' : 'Phê duyệt khóa học'}</h3>
          <button type="button" className="closeBtn" onClick={onClose}>x</button>
        </div>
        <div className="confirmBody">
          <p className="confirmCourse">"{course.title}"</p>
          {isReject && (
            <label className="confirmLabel">
              Lý do từ chối
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Nhập lý do từ chối (bắt buộc)"
              />
            </label>
          )}
          {!isReject && (
            <p className="confirmNote">Khóa học sẽ được duyệt và hiển thị công khai.</p>
          )}
        </div>
        <div className="modalFoot">
          <button type="button" className="btnSec" onClick={onClose}>Hủy</button>
          <button
            type="button"
            className={isReject ? 'btnDanger' : 'btnApprove'}
            disabled={isReject && !reason.trim()}
            onClick={() => onConfirm({ status: action, reason: reason.trim() || undefined })}
          >
            {isReject ? 'Xác nhận từ chối' : 'Phê duyệt'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPendingView({ courses, allCourses = [], onUpdateStatus, onViewDetail }) {
  const [confirmData, setConfirmData] = useState(null) // { course, action }

  const pendingCourses = courses.filter((c) => c.publicationStatus === 'PENDING_REVIEW')
  const recentlyReviewed = allCourses.filter(
    (c) => c.publicationStatus === 'PUBLISHED' || c.publicationStatus === 'REJECTED'
  ).slice(0, 5)

  async function handleConfirm({ status, reason }) {
    if (!confirmData) return
    try {
      await onUpdateStatus(confirmData.course.id, {
        status,
        reason: reason || undefined,
      })
    } catch {
      // error feedback could be added here
    } finally {
      setConfirmData(null)
    }
  }

  return (
    <div className="adminRoot">
      {/* Pending section */}
      <div className="adminSection">
        <div className="adminSectionHead">
          <h3>
            Khóa học chờ duyệt
            {pendingCourses.length > 0 && (
              <span className="pendingCount">{pendingCourses.length}</span>
            )}
          </h3>
        </div>

        {pendingCourses.length === 0 ? (
          <div className="emptyPending">
            <p>Không có khóa học nào đang chờ duyệt.</p>
          </div>
        ) : (
          <div className="pendingList">
            {pendingCourses.map((course) => (
              <div key={course.id} className="pendingCard">
                <div className="pendingInfo">
                  <button
                    type="button"
                    className="pendingTitle"
                    onClick={() => onViewDetail(course.id)}
                  >
                    {course.title}
                  </button>
                  <div className="pendingMeta">
                    <span>Giảng viên: {course.instructorName}</span>
                    <span>{course.categoryName}</span>
                    <span>{LEVEL_LABEL[course.level] || course.level}</span>
                    <span>{course.lessons?.length || 0} bài học</span>
                  </div>
                  {course.description && (
                    <p className="pendingDesc">{course.description}</p>
                  )}
                </div>
                <div className="pendingActions">
                  <button
                    type="button"
                    className="btnApprove"
                    onClick={() => setConfirmData({ course, action: 'PUBLISHED' })}
                  >
                    Phê duyệt
                  </button>
                  <button
                    type="button"
                    className="btnReject"
                    onClick={() => setConfirmData({ course, action: 'REJECTED' })}
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently reviewed */}
      {recentlyReviewed.length > 0 && (
        <div className="adminSection">
          <div className="adminSectionHead">
            <h3>Đã xử lý gần đây</h3>
          </div>
          <div className="iTableWrap">
            <table>
              <thead>
                <tr>
                  <th>Tên khóa học</th>
                  <th>Giảng viên</th>
                  <th>Trạng thái</th>
                  <th>Lý do từ chối</th>
                </tr>
              </thead>
              <tbody>
                {recentlyReviewed.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <button type="button" className="courseTitleBtn" onClick={() => onViewDetail(c.id)}>
                        {c.title}
                      </button>
                    </td>
                    <td>{c.instructorName}</td>
                    <td>
                      {c.publicationStatus === 'PUBLISHED' ? (
                        <span className="badge badgeGreen">Đã duyệt</span>
                      ) : (
                        <span className="badge badgeRed">Từ chối</span>
                      )}
                    </td>
                    <td className="rejectionReason">{c.rejectionReason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirmData && (
        <ConfirmModal
          course={confirmData.course}
          action={confirmData.action}
          onConfirm={handleConfirm}
          onClose={() => setConfirmData(null)}
        />
      )}
    </div>
  )
}
