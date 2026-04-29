import { requestJson } from './http.js'

const BASE = '/api/enrollments'

// Enroll in a course
// body: { courseId }
export function enrollCourse(courseId) {
  return requestJson(BASE, { method: 'POST', body: { courseId } })
}

// Get my enrolled courses
// Returns: List<MyCourseItemResponse>
// { enrollmentId, courseId, courseTitle, status, enrolledAt }
export function listMyCourses() {
  return requestJson(`${BASE}/my-courses`)
}

// Get students enrolled in a course (instructor/admin)
export function listCourseStudents(courseId) {
  return requestJson(`${BASE}/course/${courseId}/students`)
}

// Enrollment stats (admin)
// from, to: optional ISO date strings (YYYY-MM-DD)
export function getEnrollmentStats({ from, to } = {}) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const qs = params.toString()
  return requestJson(`${BASE}/stats${qs ? `?${qs}` : ''}`)
}
