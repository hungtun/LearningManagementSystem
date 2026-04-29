import { requestJson } from './http.js'

export function listPublishedCourses() {
  return requestJson('/api/courses')
}

export function getPublishedCourseDetail(courseId) {
  return requestJson(`/api/courses/${courseId}`)
}
