import { requestJson, uploadMultipart } from './http.js'

export function listPublishedCourses() {
  return requestJson('/api/courses')
}

export function getPublishedCourseDetail(courseId) {
  return requestJson(`/api/courses/${courseId}`)
}

export function getMyCourseDetail(courseId) {
  return requestJson(`/api/courses/my/${courseId}`)
}

export function getLessonDetail(lessonId) {
  return requestJson(`/api/courses/lessons/${lessonId}`)
}

export function getMyLessonDetail(lessonId) {
  return requestJson(`/api/courses/my/lessons/${lessonId}`)
}

export function listMyInstructorCourses() {
  return requestJson('/api/courses/my')
}

export function createCourse({ title, description, categoryId, instructorId, submitForReview }) {
  return requestJson('/api/courses', {
    method: 'POST',
    body: { title, description, categoryId: Number(categoryId), instructorId: Number(instructorId), submitForReview: Boolean(submitForReview) },
  })
}

export function updateCourse(courseId, { title, description, categoryId, submitForReview }) {
  return requestJson(`/api/courses/${courseId}`, {
    method: 'PUT',
    body: { title, description, categoryId: Number(categoryId), submitForReview: Boolean(submitForReview) },
  })
}

export function deleteCourse(courseId) {
  return requestJson(`/api/courses/${courseId}`, { method: 'DELETE' })
}

export function addLesson(courseId, { title, content, videoUrl }) {
  return requestJson(`/api/courses/${courseId}/lessons`, {
    method: 'POST',
    body: { title, content: content || '', videoUrl: videoUrl || null },
  })
}

export function updateLesson(lessonId, { title, content, videoUrl }) {
  return requestJson(`/api/courses/lessons/${lessonId}`, {
    method: 'PUT',
    body: { title, content: content || '', videoUrl: videoUrl || null },
  })
}

export function deleteLesson(lessonId) {
  return requestJson(`/api/courses/lessons/${lessonId}`, { method: 'DELETE' })
}

export function uploadLessonAttachment(lessonId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return uploadMultipart(`/api/courses/lessons/${lessonId}/attachments`, formData)
}

export function deleteLessonAttachment(attachmentId) {
  return requestJson(`/api/courses/lessons/attachments/${attachmentId}`, { method: 'DELETE' })
}

export function listPendingReviewCourses() {
  return requestJson('/api/admin/courses/pending')
}

export function getAdminCourseDetail(courseId) {
  return requestJson(`/api/admin/courses/${courseId}`)
}

export function getAdminLessonDetail(lessonId) {
  return requestJson(`/api/admin/courses/lessons/${lessonId}`)
}

export function updateAdminCourseStatus(courseId, { status, reason }) {
  return requestJson(`/api/admin/courses/${courseId}/status`, {
    method: 'PATCH',
    body: { status, reason: reason || null },
  })
}
