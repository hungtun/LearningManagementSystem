import { requestJson } from './http.js'

export function listPublishedCourses() {
  return requestJson('/api/courses')
}

export function getPublishedCourseDetail(courseId) {
  return requestJson(`/api/courses/${courseId}`)
}

export function getLessonDetail(lessonId) {
  return requestJson(`/api/courses/lessons/${lessonId}`)
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

export function addLesson(courseId, { title, content }) {
  return requestJson(`/api/courses/${courseId}/lessons`, {
    method: 'POST',
    body: { title, content: content || '' },
  })
}

export function updateLesson(lessonId, { title, content }) {
  return requestJson(`/api/courses/lessons/${lessonId}`, {
    method: 'PUT',
    body: { title, content: content || '' },
  })
}

export function deleteLesson(lessonId) {
  return requestJson(`/api/courses/lessons/${lessonId}`, { method: 'DELETE' })
}
