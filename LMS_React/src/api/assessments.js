import { requestJson, uploadMultipart, getToken } from './http.js'

export function listInstructorSubmissions() {
  return requestJson('/api/assessments/instructor/submissions')
}

export async function downloadAssignmentSubmissionFile(submissionId) {
  const token = getToken()
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`/api/assessments/instructor/submissions/assignment/${submissionId}/file`, { headers })
  if (!res.ok) {
    const err = new Error('Download failed')
    err.status = res.status
    throw err
  }
  const blob = await res.blob()
  const cd = res.headers.get('Content-Disposition') || ''
  let filename = 'assignment-submission'
  const m = cd.match(/filename="([^"]+)"/)
  if (m) filename = m[1]
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ---- Student assessment APIs ----

export function getQuizByLessonForStudent(lessonId) {
  return requestJson(`/api/assessments/quiz/lesson/${lessonId}`)
}

export function submitQuiz({ quizId, answers }) {
  return requestJson('/api/assessments/quiz/submit', {
    method: 'POST',
    body: { quizId: Number(quizId), answers },
  })
}

export function getAssignmentByLessonForStudent(lessonId) {
  return requestJson(`/api/assessments/assignment/lesson/${lessonId}`)
}

export async function downloadMyAssignmentSubmissionFile(lessonId) {
  const token = getToken()
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`/api/assessments/assignment/lesson/${lessonId}/my-submission/file`, { headers })
  if (!res.ok) {
    const err = new Error('Download failed')
    err.status = res.status
    throw err
  }
  const blob = await res.blob()
  const cd = res.headers.get('Content-Disposition') || ''
  let filename = 'assignment-submission'
  const m = cd.match(/filename="([^"]+)"/)
  if (m) filename = m[1]
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function submitAssignment(lessonId, file, note) {
  const formData = new FormData()
  formData.append('lessonId', String(Number(lessonId)))
  if (file) formData.append('file', file)
  formData.append('note', note != null && String(note).trim() !== '' ? String(note).trim() : '')
  return uploadMultipart('/api/assessments/assignments/submit', formData)
}

export function gradeSubmission({ submissionId, submissionType, score, feedback }) {
  return requestJson('/api/assessments/instructor/grade', {
    method: 'PATCH',
    body: {
      submissionId: Number(submissionId),
      submissionType,
      score: Number(score),
      feedback: feedback || '',
    },
  })
}

// ---- Instructor quiz CRUD ----

export function getQuizByLesson(lessonId) {
  return requestJson(`/api/assessments/instructor/quiz/lesson/${lessonId}`)
}

export function createQuiz({ lessonId, title, description, passScore, maxAttempts, startAt, endAt }) {
  return requestJson('/api/assessments/instructor/quiz', {
    method: 'POST',
    body: {
      lessonId: Number(lessonId),
      title,
      description: description || '',
      passScore: Number(passScore || 0),
      maxAttempts: Math.max(1, Number(maxAttempts || 1)),
      startAt: startAt || null,
      endAt: endAt || null,
    },
  })
}

export function updateQuiz(quizId, { title, description, passScore, maxAttempts, startAt, endAt }) {
  return requestJson(`/api/assessments/instructor/quiz/${quizId}`, {
    method: 'PUT',
    body: {
      title,
      description: description || '',
      passScore: Number(passScore || 0),
      maxAttempts: Math.max(1, Number(maxAttempts || 1)),
      startAt: startAt || null,
      endAt: endAt || null,
    },
  })
}

export function deleteQuiz(quizId) {
  return requestJson(`/api/assessments/instructor/quiz/${quizId}`, { method: 'DELETE' })
}

export function addQuestion(quizId, { questionText, optionA, optionB, optionC, optionD, correctOption, point, orderIndex }) {
  return requestJson(`/api/assessments/instructor/quiz/${quizId}/questions`, {
    method: 'POST',
    body: { questionText, optionA, optionB, optionC, optionD, correctOption, point: Number(point || 1), orderIndex: Number(orderIndex || 0) },
  })
}

export function updateQuestion(quizId, questionId, { questionText, optionA, optionB, optionC, optionD, correctOption, point, orderIndex }) {
  return requestJson(`/api/assessments/instructor/quiz/${quizId}/questions/${questionId}`, {
    method: 'PUT',
    body: { questionText, optionA, optionB, optionC, optionD, correctOption, point: Number(point || 1), orderIndex: Number(orderIndex || 0) },
  })
}

export function deleteQuestion(quizId, questionId) {
  return requestJson(`/api/assessments/instructor/quiz/${quizId}/questions/${questionId}`, { method: 'DELETE' })
}

// ---- Instructor assignment CRUD ----

export function getAssignmentByLesson(lessonId) {
  return requestJson(`/api/assessments/instructor/assignment/lesson/${lessonId}`)
}

export function createAssignment({ lessonId, title, description, maxScore, startAt, endAt }) {
  return requestJson('/api/assessments/instructor/assignment', {
    method: 'POST',
    body: {
      lessonId: Number(lessonId),
      title,
      description: description || '',
      maxScore: Number(maxScore || 100),
      startAt: startAt || null,
      endAt: endAt || null,
    },
  })
}

export function updateAssignment(assignmentId, { title, description, maxScore, startAt, endAt }) {
  return requestJson(`/api/assessments/instructor/assignment/${assignmentId}`, {
    method: 'PUT',
    body: {
      title,
      description: description || '',
      maxScore: Number(maxScore || 100),
      startAt: startAt || null,
      endAt: endAt || null,
    },
  })
}

export function deleteAssignment(assignmentId) {
  return requestJson(`/api/assessments/instructor/assignment/${assignmentId}`, { method: 'DELETE' })
}
