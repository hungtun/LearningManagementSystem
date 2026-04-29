import { requestJson } from './http.js'

const BASE = '/api/assessments'

// Get quiz detail by quizId
export function getQuiz(quizId) {
  return requestJson(`${BASE}/quiz/${quizId}`)
}

// submitData: { quizId, answers: [{ questionId, selectedOption: 'A'|'B'|'C'|'D' }] }
export function submitQuiz(submitData) {
  return requestJson(`${BASE}/quiz/submit`, { method: 'POST', body: submitData })
}

// Submit assignment as multipart form (file upload)
// params: { lessonId, file (File), note? }
export async function submitAssignment({ lessonId, file, note }) {
  const { getToken } = await import('./http.js')
  const formData = new FormData()
  formData.append('lessonId', String(lessonId))
  formData.append('file', file)
  if (note) formData.append('note', note)

  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}/assignments/submit`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!res.ok) {
    const error = new Error('Submit assignment failed')
    error.status = res.status
    throw error
  }

  const json = await res.json()
  return json?.data ?? json
}

// Instructor: list submissions
export function listSubmissions() {
  return requestJson(`${BASE}/instructor/submissions`)
}

// gradeData: { submissionType, submissionId, score, feedback? }
export function gradeSubmission(gradeData) {
  return requestJson(`${BASE}/instructor/grade`, { method: 'PATCH', body: gradeData })
}
