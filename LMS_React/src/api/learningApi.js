import { requestBlob, requestJson } from './http.js'

const BASE = '/api/learnings'

// progressData: { lessonId, progressPercent (0-100) }
export function updateVideoProgress(progressData) {
  return requestJson(`${BASE}/video`, { method: 'PATCH', body: progressData })
}

// Returns: { courseId, completionPercent, completedLessons, totalLessons }
export function getCourseProgress(courseId) {
  return requestJson(`${BASE}/course/${courseId}/progress`)
}

// discussionData: { lessonId, content, parentId? }
// parentId is optional - when provided, creates a reply to the given discussion
export function createDiscussion(discussionData) {
  return requestJson(`${BASE}/discussions`, { method: 'POST', body: discussionData })
}

// Returns array of root discussions, each with a `replies` array
// Shape: { id, userId, userFullName, userRole, lessonId, parentId, content, createdAt, replies[] }
export function listDiscussions(lessonId) {
  return requestJson(`${BASE}/discussions/${lessonId}`)
}

// reviewData: { courseId, rating (1-5), comment? }
export function createReview(reviewData) {
  return requestJson(`${BASE}/reviews`, { method: 'POST', body: reviewData })
}

// Download certificate as blob, then trigger browser download
// format: optional string (e.g. 'PDF')
export async function downloadCertificate(courseId, format) {
  const url = format
    ? `${BASE}/certificate/${courseId}?format=${encodeURIComponent(format)}`
    : `${BASE}/certificate/${courseId}`

  const { blob, filename } = await requestBlob(url)

  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename || `certificate-${courseId}`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}
