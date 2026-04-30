import { useState } from 'react'
import {
  createAssignment,
  deleteAssignment,
  getInstructorAssignmentByLesson,
  updateAssignment,
} from '../../../api/assessmentsApi.js'
import './AssignmentBuilderView.css'

// Convert ISO string to local datetime-local input value
function isoToInputValue(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AssignmentBuilderView() {
  const [lessonIdInput, setLessonIdInput] = useState('')
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ title: '', description: '', deadline: '' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // Track mode: 'view' | 'create'
  const [mode, setMode] = useState(null)

  async function handleLoad() {
    const id = parseInt(lessonIdInput, 10)
    if (!id) { setError('Nhap Lesson ID hop le'); return }
    setLoading(true)
    setError('')
    setAssignment(null)
    setSaveMsg('')
    setDeleteConfirm(false)
    setMode(null)
    try {
      const data = await getInstructorAssignmentByLesson(id)
      setAssignment(data)
      setForm({
        title: data.title || '',
        description: data.description || '',
        deadline: isoToInputValue(data.deadline),
      })
      setMode('view')
    } catch (e) {
      if (e?.status === 404) {
        setError(`Chua co bai tap cho lesson ${id}. Tao moi ben duoi.`)
        setForm({ title: '', description: '', deadline: '' })
        setMode('create')
      } else {
        setError('Khong tai duoc bai tap. Kiem tra Lesson ID va quyen truy cap.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!form.title.trim()) { setSaveMsg('Tieu de la bat buoc'); return }
    setSaving(true)
    setSaveMsg('')
    try {
      const data = await createAssignment({
        lessonId: parseInt(lessonIdInput, 10),
        title: form.title.trim(),
        description: form.description || null,
        deadline: form.deadline ? new Date(form.deadline).toISOString().replace('Z', '') : null,
      })
      setAssignment(data)
      setMode('view')
      setSaveMsg('Da tao bai tap.')
    } catch (e) {
      if (e?.status === 409) {
        setSaveMsg('Da ton tai bai tap cho lesson nay. Tai lai de xem.')
      } else {
        setSaveMsg('Tao that bai. Thu lai.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate() {
    if (!form.title.trim()) { setSaveMsg('Tieu de la bat buoc'); return }
    setSaving(true)
    setSaveMsg('')
    try {
      const data = await updateAssignment(assignment.id, {
        title: form.title.trim(),
        description: form.description || null,
        deadline: form.deadline ? new Date(form.deadline).toISOString().replace('Z', '') : null,
      })
      setAssignment(data)
      setSaveMsg('Da luu thay doi.')
    } catch {
      setSaveMsg('Luu that bai. Thu lai.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteAssignment(assignment.id)
      setAssignment(null)
      setDeleteConfirm(false)
      setMode(null)
      setError(`Da xoa bai tap cho lesson ${lessonIdInput}.`)
    } catch {
      setSaveMsg('Xoa that bai.')
    }
  }

  const isCreateMode = mode === 'create'

  return (
    <div className="abContainer">
      <h2 className="abTitle">Quan ly Bai tap (Assignment)</h2>

      <div className="abLessonRow">
        <label className="abLabel">Lesson ID</label>
        <input
          type="number"
          className="abInput"
          placeholder="Nhap ID bai hoc..."
          value={lessonIdInput}
          onChange={e => setLessonIdInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLoad()}
        />
        <button type="button" className="abBtn abBtnPrimary" onClick={handleLoad} disabled={loading}>
          {loading ? 'Dang tai...' : 'Tai Bai tap'}
        </button>
      </div>

      {error && <p className="abError">{error}</p>}

      {(mode === 'view' || mode === 'create') && (
        <div className="abCard">
          <h3 className="abCardTitle">{isCreateMode ? 'Tao Bai tap moi' : 'Thong tin Bai tap'}</h3>

          <div className="abField">
            <label className="abLabel">Tieu de *</label>
            <input
              type="text"
              className="abInput"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="abField">
            <label className="abLabel">Mo ta / Yeu cau</label>
            <textarea
              className="abTextarea"
              rows={5}
              placeholder="Mo ta yeu cau, huong dan lam bai..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="abField">
            <label className="abLabel">Deadline (tuy chon)</label>
            <input
              type="datetime-local"
              className="abInput abInputDeadline"
              value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
            />
          </div>

          {saveMsg && <p className={`abMsg ${saveMsg.includes('that bai') ? 'abMsgError' : ''}`}>{saveMsg}</p>}

          <div className="abActions">
            {isCreateMode ? (
              <button type="button" className="abBtn abBtnPrimary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Dang tao...' : 'Tao Bai tap'}
              </button>
            ) : (
              <>
                <button type="button" className="abBtn abBtnPrimary" onClick={handleUpdate} disabled={saving}>
                  {saving ? 'Dang luu...' : 'Luu thay doi'}
                </button>
                {!deleteConfirm ? (
                  <button type="button" className="abBtn abBtnDanger" onClick={() => setDeleteConfirm(true)}>
                    Xoa Bai tap
                  </button>
                ) : (
                  <span className="abConfirmRow">
                    <span className="abConfirmText">Xac nhan xoa?</span>
                    <button type="button" className="abBtn abBtnDanger" onClick={handleDelete}>Co, xoa</button>
                    <button type="button" className="abBtn abBtnSecondary" onClick={() => setDeleteConfirm(false)}>Huy</button>
                  </span>
                )}
              </>
            )}
          </div>

          {!isCreateMode && assignment && (
            <div className="abInfo">
              <span className="abInfoItem">ID: {assignment.id}</span>
              <span className="abInfoItem">Lesson: {assignment.lessonId}</span>
              {assignment.deadline && (
                <span className="abInfoItem">
                  Han nop: {new Date(assignment.deadline).toLocaleDateString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
