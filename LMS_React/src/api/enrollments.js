import { requestJson } from './http.js'

export function createEnrollment({ courseId }) {
  return requestJson('/api/enrollments', {
    method: 'POST',
    body: { courseId: Number(courseId) },
  })
}

export function listMyCourses() {
  return requestJson('/api/enrollments/my-courses')
}

export function listCourseStudents(courseId) {
  return requestJson(`/api/enrollments/course/${courseId}/students`)
}

export function getEnrollmentStats({ from, to }) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const query = params.toString()
  return requestJson(`/api/enrollments/stats${query ? `?${query}` : ''}`)
}
