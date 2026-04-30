import { requestJson, requestMultipart } from './http.js'

const BASE = '/api/courses'
const ADMIN_BASE = '/api/admin/courses'

// ---- Public / Instructor ----

export function listPublishedCourses() {
  return requestJson(BASE)
}

export function getCourseDetail(courseId) {
  return requestJson(`${BASE}/${courseId}`)
}

export function getLessonDetail(lessonId) {
  return requestJson(`${BASE}/lessons/${lessonId}`)
}

// courseData: { title, description, categoryId, instructorId, submitForReview? }
export function createCourse(courseData) {
  return requestJson(BASE, { method: 'POST', body: courseData })
}

// courseData: { title, description, categoryId, submitForReview? }
export function updateCourse(courseId, courseData) {
  return requestJson(`${BASE}/${courseId}`, { method: 'PUT', body: courseData })
}

export function deleteCourse(courseId) {
  return requestJson(`${BASE}/${courseId}`, { method: 'DELETE' })
}

// lessonData: { title, content? }
export function addLesson(courseId, lessonData) {
  return requestJson(`${BASE}/${courseId}/lessons`, { method: 'POST', body: lessonData })
}

// lessonData: { title, content? }
export function updateLesson(lessonId, lessonData) {
  return requestJson(`${BASE}/lessons/${lessonId}`, { method: 'PUT', body: lessonData })
}

export function deleteLesson(lessonId) {
  return requestJson(`${BASE}/lessons/${lessonId}`, { method: 'DELETE' })
}

// position: number (0-based)
export function reorderLesson(lessonId, position) {
  return requestJson(`${BASE}/lessons/${lessonId}/reorder`, { method: 'PATCH', body: { position } })
}

// Upload a document attachment to a lesson (file: File object)
// Returns: { id, lessonId, fileName, fileUrl, fileType, fileSize, createdAt }
export function uploadLessonAttachment(lessonId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return requestMultipart(`${BASE}/lessons/${lessonId}/attachments`, { formData })
}

export function deleteLessonAttachment(attachmentId) {
  return requestJson(`${BASE}/lessons/attachments/${attachmentId}`, { method: 'DELETE' })
}

// ---- Admin ----

export function listPendingCourses() {
  return requestJson(`${ADMIN_BASE}/pending`)
}

// statusData: { status: 'PUBLISHED' | 'REJECTED' | ..., reason? }
export function updateCourseStatus(courseId, statusData) {
  return requestJson(`${ADMIN_BASE}/${courseId}/status`, { method: 'PATCH', body: statusData })
}
