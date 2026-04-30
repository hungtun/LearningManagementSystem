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

// ---- Instructor quiz CRUD ----

// Get quiz for a lesson (instructor view with correctOption)
export function getInstructorQuizByLesson(lessonId) {
  return requestJson(`${BASE}/instructor/quiz/lesson/${lessonId}`)
}

// Create quiz: { lessonId, title, description?, passScore }
export function createQuiz(data) {
  return requestJson(`${BASE}/instructor/quiz`, { method: 'POST', body: data })
}

// Update quiz settings: { title, description?, passScore }
export function updateQuiz(quizId, data) {
  return requestJson(`${BASE}/instructor/quiz/${quizId}`, { method: 'PUT', body: data })
}

// Delete quiz (soft)
export function deleteQuiz(quizId) {
  return requestJson(`${BASE}/instructor/quiz/${quizId}`, { method: 'DELETE' })
}

// Add question to quiz: { questionText, optionA, optionB, optionC, optionD, correctOption, point }
export function addQuestion(quizId, data) {
  return requestJson(`${BASE}/instructor/quiz/${quizId}/questions`, { method: 'POST', body: data })
}

// Update a question
export function updateQuestion(quizId, questionId, data) {
  return requestJson(`${BASE}/instructor/quiz/${quizId}/questions/${questionId}`, { method: 'PUT', body: data })
}

// Delete a question (returns updated quiz)
export function deleteQuestion(quizId, questionId) {
  return requestJson(`${BASE}/instructor/quiz/${quizId}/questions/${questionId}`, { method: 'DELETE' })
}

// ---- Instructor assignment CRUD ----

// Get assignment config for a lesson
export function getInstructorAssignmentByLesson(lessonId) {
  return requestJson(`${BASE}/instructor/assignment/lesson/${lessonId}`)
}

// Create assignment: { lessonId, title, description?, deadline? }
export function createAssignment(data) {
  return requestJson(`${BASE}/instructor/assignment`, { method: 'POST', body: data })
}

// Update assignment: { title, description?, deadline? }
export function updateAssignment(assignmentId, data) {
  return requestJson(`${BASE}/instructor/assignment/${assignmentId}`, { method: 'PUT', body: data })
}

// Delete assignment (soft)
export function deleteAssignment(assignmentId) {
  return requestJson(`${BASE}/instructor/assignment/${assignmentId}`, { method: 'DELETE' })
}
