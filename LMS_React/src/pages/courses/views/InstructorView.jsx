import { useState } from 'react'
import { getLessonDetail, uploadLessonAttachment, deleteLessonAttachment } from '../../../api/coursesApi.js'
import { CATEGORIES, LEVELS, LEVEL_LABEL, PUBLICATION_STATUSES, PUBLICATION_STATUS_LABEL, emptyCoursForm, emptyLessonForm } from '../coursesData.js'
import './InstructorView.css'

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ----- Status badge -----
function StatusBadge({ status }) {
  const map = {
    PUBLISHED:     { label: 'Đã duyệt',    cls: 'sGreen' },
    DRAFT:         { label: 'Bản nháp',    cls: 'sGray' },
    PENDING_REVIEW:{ label: 'Chờ duyệt',   cls: 'sYellow' },
    REJECTED:      { label: 'Từ chối',     cls: 'sRed' },
  }
  const { label, cls } = map[status] || { label: status, cls: 'sGray' }
  return <span className={`statusBadge ${cls}`}>{label}</span>
}

// ----- Course Form Modal -----
function CourseFormModal({ initial, onSave, saving, saveError, onClose }) {
  const [form, setForm] = useState({ ...initial })

  function change(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  function submit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave(form)
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <h3>{initial.id ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}</h3>
          <button type="button" className="closeBtn" onClick={onClose}>x</button>
        </div>
        <form className="cForm" onSubmit={submit}>
          <label>Tên khóa học *<input name="title" value={form.title} onChange={change} required /></label>
          <label>Mô tả<textarea name="description" value={form.description} onChange={change} rows={3} /></label>
          <div className="formRow">
            <label>Danh mục
              <select name="categoryName" value={form.categoryName || ''} onChange={change}>
                <option value="">-- Chọn --</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>Trình độ
              <select name="level" value={form.level} onChange={change}>
                {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
              </select>
            </label>
          </div>
          <label>Trạng thái
            <select name="publicationStatus" value={form.publicationStatus} onChange={change}>
              {PUBLICATION_STATUSES.map((s) => <option key={s} value={s}>{PUBLICATION_STATUS_LABEL[s] || s}</option>)}
            </select>
          </label>
          {saveError && <p className="formErrMsg">{saveError}</p>}
          <div className="modalFoot">
            <button type="button" className="btnSec" onClick={onClose}>Hủy</button>
            <button type="submit" className="btnPri" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ----- Lesson Manager Panel -----
function LessonManager({ course, onUpdateCourse, onClose }) {
  const [lessons, setLessons] = useState(
    [...(course.lessons || [])].sort((a, b) => a.orderIndex - b.orderIndex)
  )
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [lessonForm, setLessonForm] = useState(emptyLessonForm())

  function saveToParent(newLessons) {
    onUpdateCourse({ ...course, lessons: newLessons })
  }

  function openAdd() {
    setEditingLesson(null)
    setLessonForm(emptyLessonForm())
    setShowLessonForm(true)
  }

  const [editingAttachments, setEditingAttachments] = useState([])
  const [attachUploading, setAttachUploading] = useState(false)
  const [attachError, setAttachError] = useState(null)

  async function openEdit(lesson) {
    setEditingLesson(lesson)
    setLessonForm({ title: lesson.title, content: lesson.content || '', videoUrl: lesson.videoUrl || '' })
    setAttachError(null)
    // Load current attachments for existing lessons (real id, not Date.now())
    if (lesson.id && lesson.id < 1e12) {
      try {
        const detail = await getLessonDetail(lesson.id)
        setEditingAttachments(detail?.attachments || [])
      } catch {
        setEditingAttachments([])
      }
    } else {
      setEditingAttachments([])
    }
    setShowLessonForm(true)
  }

  async function handleUploadAttachment(e) {
    const file = e.target.files?.[0]
    if (!file || !editingLesson) return
    setAttachUploading(true)
    setAttachError(null)
    try {
      const created = await uploadLessonAttachment(editingLesson.id, file)
      setEditingAttachments((prev) => [...prev, created])
    } catch {
      setAttachError('Upload thất bại. Kiểm tra định dạng và dung lượng file (tối đa 50 MB).')
    } finally {
      setAttachUploading(false)
      e.target.value = ''
    }
  }

  async function handleDeleteAttachment(attachmentId) {
    try {
      await deleteLessonAttachment(attachmentId)
      setEditingAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
    } catch {
      setAttachError('Xóa tài liệu thất bại.')
    }
  }

  function saveLesson(e) {
    e.preventDefault()
    if (!lessonForm.title.trim()) return
    let updated
    if (editingLesson) {
      updated = lessons.map((l) =>
        l.id === editingLesson.id ? { ...l, ...lessonForm } : l
      )
    } else {
      updated = [
        ...lessons,
        { id: Date.now(), ...lessonForm, orderIndex: lessons.length, duration: '30 phút' },
      ]
    }
    setLessons(updated)
    saveToParent(updated)
    setShowLessonForm(false)
    setEditingLesson(null)
  }

  function deleteLesson(lessonId) {
    const updated = lessons
      .filter((l) => l.id !== lessonId)
      .map((l, i) => ({ ...l, orderIndex: i }))
    setLessons(updated)
    saveToParent(updated)
  }

  function moveLesson(idx, direction) {
    const newLessons = [...lessons]
    const swapIdx = idx + direction
    if (swapIdx < 0 || swapIdx >= newLessons.length) return
    ;[newLessons[idx], newLessons[swapIdx]] = [newLessons[swapIdx], newLessons[idx]]
    const reindexed = newLessons.map((l, i) => ({ ...l, orderIndex: i }))
    setLessons(reindexed)
    saveToParent(reindexed)
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modalXl" onClick={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div>
            <h3>Quản lý bài học</h3>
            <p className="modalSub">{course.title}</p>
          </div>
          <button type="button" className="closeBtn" onClick={onClose}>x</button>
        </div>

        <div className="lessonMgrBody">
          <div className="lessonMgrToolbar">
            <span className="lessonCount">{lessons.length} bài học</span>
            <button type="button" className="btnPri" onClick={openAdd}>+ Thêm bài học</button>
          </div>

          {lessons.length === 0 ? (
            <p className="emptyNote">Chưa có bài học nào. Nhấn "+ Thêm bài học" để bắt đầu.</p>
          ) : (
            <ul className="lessonMgrList">
              {lessons.map((lesson, idx) => (
                <li key={lesson.id} className="lessonMgrItem">
                  <div className="lessonMgrOrder">
                    <button type="button" className="orderBtn" onClick={() => moveLesson(idx, -1)} disabled={idx === 0}>
                      ▲
                    </button>
                    <span className="orderNum">{idx + 1}</span>
                    <button type="button" className="orderBtn" onClick={() => moveLesson(idx, 1)} disabled={idx === lessons.length - 1}>
                      ▼
                    </button>
                  </div>
                  <div className="lessonMgrInfo">
                    <p className="lessonMgrTitle">{lesson.title}</p>
                    <p className="lessonMgrMeta">{lesson.duration || 'N/A'}</p>
                  </div>
                  <div className="lessonMgrActions">
                    <button type="button" className="btnSmPri" onClick={() => openEdit(lesson)}>Sửa</button>
                    <button type="button" className="btnSmDanger" onClick={() => deleteLesson(lesson.id)}>Xóa</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {showLessonForm && (
          <div className="lessonFormPanel">
            <h4>{editingLesson ? 'Sửa bài học' : 'Thêm bài học mới'}</h4>
            <form onSubmit={saveLesson} className="cForm">
              <label>Tiêu đề bài học *
                <input
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </label>
              <label>Video URL (YouTube, Vimeo...)
                <input
                  type="url"
                  value={lessonForm.videoUrl || ''}
                  onChange={(e) => setLessonForm((p) => ({ ...p, videoUrl: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>
              <label>Nội dung / Ghi chú
                <textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm((p) => ({ ...p, content: e.target.value }))}
                  rows={4}
                  placeholder="Nội dung bài học, ghi chú..."
                />
              </label>
              <div className="modalFoot">
                <button type="button" className="btnSec" onClick={() => setShowLessonForm(false)}>Hủy</button>
                <button type="submit" className="btnPri">Lưu bài học</button>
              </div>
            </form>

            {/* Attachment management - only available for existing (saved) lessons */}
            {editingLesson && editingLesson.id && editingLesson.id < 1e12 && (
              <div className="attachSection">
                <p className="attachSectionTitle">Tài liệu bài học</p>

                {editingAttachments.length > 0 && (
                  <ul className="attachList">
                    {editingAttachments.map((a) => (
                      <li key={a.id} className="attachItem">
                        <a href={a.fileUrl} target="_blank" rel="noreferrer" className="attachLink">
                          {a.fileName}
                        </a>
                        <span className="attachSize">{formatBytes(a.fileSize)}</span>
                        <button
                          type="button"
                          className="btnSmDanger"
                          onClick={() => handleDeleteAttachment(a.id)}
                        >
                          Xoa
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <label className="attachUploadLabel">
                  {attachUploading ? 'Dang tai len...' : '+ Them tai lieu (PDF, Word, PPT, Excel...)'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                    onChange={handleUploadAttachment}
                    disabled={attachUploading}
                    style={{ display: 'none' }}
                  />
                </label>
                {attachError && <p className="formErrMsg">{attachError}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ----- Main InstructorView -----
export default function InstructorView({ courses, role, onViewDetail, onAddCourse, onUpdateCourse, onDeleteCourse, onReload }) {
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [managingLessons, setManagingLessons] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  async function saveCourse(data) {
    setSaving(true)
    setSaveError(null)
    try {
      if (data.id) await onUpdateCourse(data.id, data)
      else await onAddCourse(data)
      setShowCourseForm(false)
      setEditingCourse(null)
    } catch {
      setSaveError('Lưu thất bại. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(courseId) {
    if (!window.confirm('Xác nhận xóa khóa học này?')) return
    try {
      await onDeleteCourse(courseId)
    } catch {
      alert('Xóa thất bại.')
    }
  }

  function openEdit(course) {
    setEditingCourse(course)
    setShowCourseForm(true)
  }

  return (
    <div className="instructorRoot">
      <div className="instructorToolbar">
        <h3 className="instructorTitle">Khóa học của tôi</h3>
        <button type="button" className="btnPri" onClick={() => { setEditingCourse(null); setShowCourseForm(true) }}>
          + Tạo khóa học mới
        </button>
      </div>

      {/* Stats */}
      <div className="instructorStats">
        <div className="iStatCard">
          <p className="iStatNum">{courses.length}</p>
          <p className="iStatLabel">Tổng khóa học</p>
        </div>
        <div className="iStatCard">
          <p className="iStatNum">{courses.filter((c) => c.publicationStatus === 'PUBLISHED').length}</p>
          <p className="iStatLabel">Đã xuất bản</p>
        </div>
        <div className="iStatCard">
          <p className="iStatNum">{courses.filter((c) => c.publicationStatus === 'PENDING_REVIEW').length}</p>
          <p className="iStatLabel">Chờ duyệt</p>
        </div>
        <div className="iStatCard">
          <p className="iStatNum">{courses.reduce((s, c) => s + (c.learners ?? 0), 0).toLocaleString()}</p>
          <p className="iStatLabel">Học viên</p>
        </div>
      </div>

      {/* Course table */}
      <div className="iTableWrap">
        <table>
          <thead>
            <tr>
              <th>Tên khóa học</th>
              <th>Danh mục</th>
              <th>Trình độ</th>
              <th>Trạng thái</th>
              <th>Bài học</th>
              <th>Học viên</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan={7} className="emptyCell">Chưa có khóa học nào.</td></tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id}>
                  <td>
                    <button type="button" className="courseTitleBtn" onClick={() => onViewDetail(c.id)}>
                      {c.title}
                    </button>
                  </td>
                  <td>{c.categoryName}</td>
                  <td>{LEVEL_LABEL[c.level] || c.level}</td>
                  <td><StatusBadge status={c.publicationStatus} /></td>
                  <td>{c.lessons?.length || 0}</td>
                  <td>{(c.learners ?? 0).toLocaleString()}</td>
                  <td>
                    <div className="actionBtns">
                      <button type="button" className="btnSmSec" onClick={() => setManagingLessons(c)}>
                        Bài học
                      </button>
                      <button type="button" className="btnSmPri" onClick={() => openEdit(c)}>
                        Sửa
                      </button>
                      {role === 'ADMIN' && (
                        <button type="button" className="btnSmDanger" onClick={() => handleDelete(c.id)}>
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCourseForm && (
        <CourseFormModal
          initial={editingCourse || emptyCoursForm()}
          onSave={saveCourse}
          saving={saving}
          saveError={saveError}
          onClose={() => { setShowCourseForm(false); setEditingCourse(null); setSaveError(null) }}
        />
      )}

      {managingLessons && (
        <LessonManager
          course={managingLessons}
          onUpdateCourse={(updated) => { onUpdateCourse(updated.id, updated); setManagingLessons(updated) }}
          onClose={() => { setManagingLessons(null); if (onReload) onReload() }}
        />
      )}
    </div>
  )
}
