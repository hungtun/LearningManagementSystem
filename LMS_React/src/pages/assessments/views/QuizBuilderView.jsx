import { useState } from 'react'
import {
  addQuestion,
  createQuiz,
  deleteQuestion,
  deleteQuiz,
  getInstructorQuizByLesson,
  updateQuestion,
  updateQuiz,
} from '../../../api/assessmentsApi.js'
import './QuizBuilderView.css'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

function emptyQuestionForm() {
  return {
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    point: 1,
  }
}

export default function QuizBuilderView() {
  const [lessonIdInput, setLessonIdInput] = useState('')
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Quiz settings form
  const [settingsForm, setSettingsForm] = useState({ title: '', description: '', passScore: 60 })
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsMsg, setSettingsMsg] = useState('')

  // Create quiz form (shown when no quiz exists)
  const [createForm, setCreateForm] = useState({ title: '', description: '', passScore: 60 })
  const [creating, setCreating] = useState(false)

  // Question form state
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm())
  const [editingQuestionId, setEditingQuestionId] = useState(null)
  const [questionSaving, setQuestionSaving] = useState(false)
  const [questionMsg, setQuestionMsg] = useState('')
  const [showQuestionForm, setShowQuestionForm] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  // 'none' | 'create' | 'edit'
  const [mode, setMode] = useState('none')

  async function handleLoadQuiz() {
    const id = parseInt(lessonIdInput, 10)
    if (!id) { setError('Nhap Lesson ID hop le'); return }
    setLoading(true)
    setError('')
    setQuiz(null)
    setMode('none')
    setSettingsMsg('')
    setQuestionMsg('')
    setShowQuestionForm(false)
    setDeleteConfirm(false)
    try {
      const data = await getInstructorQuizByLesson(id)
      setQuiz(data)
      setMode('edit')
      setSettingsForm({
        title: data.title || '',
        description: data.description || '',
        passScore: data.passScore ?? 60,
      })
    } catch (e) {
      if (e?.status === 404) {
        setMode('create')
        setCreateForm({ title: '', description: '', passScore: 60 })
      } else {
        setError('Khong tai duoc quiz. Kiem tra Lesson ID va quyen truy cap.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateQuiz() {
    if (!createForm.title.trim()) { setError('Tieu de quiz la bat buoc'); return }
    setCreating(true)
    setError('')
    try {
      const data = await createQuiz({
        lessonId: parseInt(lessonIdInput, 10),
        title: createForm.title.trim(),
        description: createForm.description || null,
        passScore: Number(createForm.passScore),
      })
      setQuiz(data)
      setMode('edit')
      setSettingsForm({ title: data.title, description: data.description || '', passScore: data.passScore })
    } catch (e) {
      if (e?.status === 409) {
        setError('Da ton tai quiz cho lesson nay. Tai lai de xem.')
        setMode('none')
      } else {
        setError('Tao quiz that bai.')
      }
    } finally {
      setCreating(false)
    }
  }

  async function handleSaveSettings() {
    if (!settingsForm.title.trim()) { setSettingsMsg('Tieu de la bat buoc'); return }
    setSettingsSaving(true)
    setSettingsMsg('')
    try {
      const data = await updateQuiz(quiz.id, {
        title: settingsForm.title.trim(),
        description: settingsForm.description || null,
        passScore: Number(settingsForm.passScore),
      })
      setQuiz(data)
      setSettingsMsg('Da luu thong tin quiz.')
    } catch {
      setSettingsMsg('Luu that bai. Thu lai.')
    } finally {
      setSettingsSaving(false)
    }
  }

  async function handleDeleteQuiz() {
    try {
      await deleteQuiz(quiz.id)
      setQuiz(null)
      setMode('none')
      setDeleteConfirm(false)
    } catch {
      setSettingsMsg('Xoa that bai.')
    }
  }

  function openAddQuestion() {
    setEditingQuestionId(null)
    setQuestionForm(emptyQuestionForm())
    setQuestionMsg('')
    setShowQuestionForm(true)
  }

  function openEditQuestion(q) {
    setEditingQuestionId(q.id)
    setQuestionForm({
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption || 'A',
      point: q.point ?? 1,
    })
    setQuestionMsg('')
    setShowQuestionForm(true)
  }

  async function handleSaveQuestion() {
    if (!questionForm.questionText.trim()) { setQuestionMsg('Noi dung cau hoi la bat buoc'); return }
    if (OPTION_LABELS.some(l => !questionForm[`option${l}`].trim())) {
      setQuestionMsg('Tat ca 4 lua chon la bat buoc')
      return
    }
    setQuestionSaving(true)
    setQuestionMsg('')
    const payload = {
      questionText: questionForm.questionText.trim(),
      optionA: questionForm.optionA.trim(),
      optionB: questionForm.optionB.trim(),
      optionC: questionForm.optionC.trim(),
      optionD: questionForm.optionD.trim(),
      correctOption: questionForm.correctOption,
      point: Number(questionForm.point),
    }
    try {
      let updated
      if (editingQuestionId) {
        updated = await updateQuestion(quiz.id, editingQuestionId, payload)
      } else {
        updated = await addQuestion(quiz.id, payload)
      }
      setQuiz(updated)
      setShowQuestionForm(false)
      setEditingQuestionId(null)
      setQuestionMsg('')
    } catch {
      setQuestionMsg('Luu cau hoi that bai. Thu lai.')
    } finally {
      setQuestionSaving(false)
    }
  }

  async function handleDeleteQuestion(questionId) {
    try {
      const updated = await deleteQuestion(quiz.id, questionId)
      setQuiz(updated)
    } catch {
      setQuestionMsg('Xoa cau hoi that bai.')
    }
  }

  return (
    <div className="qbContainer">
      <h2 className="qbTitle">Quan ly Quiz bai hoc</h2>

      {/* Lesson selector */}
      <div className="qbLessonRow">
        <label className="qbLabel">Lesson ID</label>
        <input
          type="number"
          className="qbInput"
          placeholder="Nhap ID bai hoc..."
          value={lessonIdInput}
          onChange={e => setLessonIdInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLoadQuiz()}
        />
        <button type="button" className="qbBtn qbBtnPrimary" onClick={handleLoadQuiz} disabled={loading}>
          {loading ? 'Dang tai...' : 'Tai Quiz'}
        </button>
      </div>

      {error && <p className="qbError">{error}</p>}

      {/* Create quiz form (shown when lesson has no quiz yet) */}
      {mode === 'create' && !quiz && !loading && (
        <div className="qbCard">
          <h3 className="qbCardTitle">Tao Quiz moi</h3>
          <div className="qbField">
            <label className="qbLabel">Tieu de *</label>
            <input
              type="text"
              className="qbInput"
              value={createForm.title}
              onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="qbField">
            <label className="qbLabel">Mo ta</label>
            <textarea
              className="qbTextarea"
              rows={3}
              value={createForm.description}
              onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="qbField">
            <label className="qbLabel">Diem qua (0–100)</label>
            <input
              type="number"
              className="qbInput qbInputSmall"
              min={0}
              max={100}
              value={createForm.passScore}
              onChange={e => setCreateForm(f => ({ ...f, passScore: e.target.value }))}
            />
          </div>
          <button
            type="button"
            className="qbBtn qbBtnPrimary"
            onClick={handleCreateQuiz}
            disabled={creating}
          >
            {creating ? 'Dang tao...' : 'Tao Quiz'}
          </button>
        </div>
      )}

      {/* Quiz editor */}
      {quiz && mode === 'edit' && (
        <>
          {/* Settings card */}
          <div className="qbCard">
            <h3 className="qbCardTitle">Thong tin Quiz</h3>
            <div className="qbField">
              <label className="qbLabel">Tieu de *</label>
              <input
                type="text"
                className="qbInput"
                value={settingsForm.title}
                onChange={e => setSettingsForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="qbField">
              <label className="qbLabel">Mo ta</label>
              <textarea
                className="qbTextarea"
                rows={3}
                value={settingsForm.description}
                onChange={e => setSettingsForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="qbField">
              <label className="qbLabel">Diem qua (0–100)</label>
              <input
                type="number"
                className="qbInput qbInputSmall"
                min={0}
                max={100}
                value={settingsForm.passScore}
                onChange={e => setSettingsForm(f => ({ ...f, passScore: e.target.value }))}
              />
            </div>
            {settingsMsg && <p className="qbMsg">{settingsMsg}</p>}
            <div className="qbActions">
              <button
                type="button"
                className="qbBtn qbBtnPrimary"
                onClick={handleSaveSettings}
                disabled={settingsSaving}
              >
                {settingsSaving ? 'Dang luu...' : 'Luu thay doi'}
              </button>
              {!deleteConfirm ? (
                <button
                  type="button"
                  className="qbBtn qbBtnDanger"
                  onClick={() => setDeleteConfirm(true)}
                >
                  Xoa Quiz
                </button>
              ) : (
                <span className="qbConfirmRow">
                  <span className="qbConfirmText">Xac nhan xoa?</span>
                  <button type="button" className="qbBtn qbBtnDanger" onClick={handleDeleteQuiz}>Co, xoa</button>
                  <button type="button" className="qbBtn qbBtnSecondary" onClick={() => setDeleteConfirm(false)}>Huy</button>
                </span>
              )}
            </div>
          </div>

          {/* Questions card */}
          <div className="qbCard">
            <div className="qbCardHeader">
              <h3 className="qbCardTitle">Cau hoi ({(quiz.questions || []).length})</h3>
              <button type="button" className="qbBtn qbBtnPrimary qbBtnSm" onClick={openAddQuestion}>
                + Them cau hoi
              </button>
            </div>

            {(quiz.questions || []).length === 0 && !showQuestionForm && (
              <p className="qbEmpty">Chua co cau hoi. Nhan "+ Them cau hoi" de bat dau.</p>
            )}

            <div className="qbQuestionList">
              {(quiz.questions || []).map((q, idx) => (
                <div key={q.id} className="qbQuestionItem">
                  <div className="qbQuestionHeader">
                    <span className="qbQuestionIndex">Cau {idx + 1}</span>
                    <span className="qbQuestionPoint">{q.point} diem</span>
                    <button type="button" className="qbBtn qbBtnSecondary qbBtnXs" onClick={() => openEditQuestion(q)}>Sua</button>
                    <button type="button" className="qbBtn qbBtnDanger qbBtnXs" onClick={() => handleDeleteQuestion(q.id)}>Xoa</button>
                  </div>
                  <p className="qbQuestionText">{q.questionText}</p>
                  <div className="qbOptionGrid">
                    {OPTION_LABELS.map(l => (
                      <div key={l} className={`qbOption ${q.correctOption === l ? 'qbOptionCorrect' : ''}`}>
                        <span className="qbOptionLabel">{l}.</span>
                        <span>{q[`option${l}`]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Question form (add/edit) */}
            {showQuestionForm && (
              <div className="qbQuestionForm">
                <h4 className="qbQuestionFormTitle">{editingQuestionId ? 'Sua cau hoi' : 'Them cau hoi moi'}</h4>
                <div className="qbField">
                  <label className="qbLabel">Noi dung cau hoi *</label>
                  <textarea
                    className="qbTextarea"
                    rows={3}
                    value={questionForm.questionText}
                    onChange={e => setQuestionForm(f => ({ ...f, questionText: e.target.value }))}
                  />
                </div>
                {OPTION_LABELS.map(l => (
                  <div key={l} className="qbField qbFieldInline">
                    <label className={`qbLabel qbLabelOption ${questionForm.correctOption === l ? 'qbLabelCorrect' : ''}`}>
                      <input
                        type="radio"
                        name="correctOption"
                        value={l}
                        checked={questionForm.correctOption === l}
                        onChange={() => setQuestionForm(f => ({ ...f, correctOption: l }))}
                      />
                      {' '}{l}.
                    </label>
                    <input
                      type="text"
                      className="qbInput"
                      placeholder={`Lua chon ${l}`}
                      value={questionForm[`option${l}`]}
                      onChange={e => setQuestionForm(f => ({ ...f, [`option${l}`]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="qbField">
                  <label className="qbLabel">Diem (1–10)</label>
                  <input
                    type="number"
                    className="qbInput qbInputSmall"
                    min={1}
                    max={10}
                    value={questionForm.point}
                    onChange={e => setQuestionForm(f => ({ ...f, point: e.target.value }))}
                  />
                </div>
                {questionMsg && <p className="qbMsg qbMsgError">{questionMsg}</p>}
                <div className="qbActions">
                  <button
                    type="button"
                    className="qbBtn qbBtnPrimary"
                    onClick={handleSaveQuestion}
                    disabled={questionSaving}
                  >
                    {questionSaving ? 'Dang luu...' : 'Luu cau hoi'}
                  </button>
                  <button
                    type="button"
                    className="qbBtn qbBtnSecondary"
                    onClick={() => { setShowQuestionForm(false); setEditingQuestionId(null) }}
                  >
                    Huy
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
