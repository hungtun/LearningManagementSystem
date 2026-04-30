import { getToken, requestJson } from './http.js'

export function getCourseProgress(courseId) {
  return requestJson(`/api/learnings/course/${courseId}/progress`)
}

export function getLessonProgresses(courseId) {
  return requestJson(`/api/learnings/course/${courseId}/lesson-progress`)
}

export function patchVideoProgress({ lessonId, progressPercent }) {
  return requestJson('/api/learnings/video', {
    method: 'PATCH',
    body: { lessonId: Number(lessonId), progressPercent: Number(progressPercent) },
  })
}

export function listDiscussions(lessonId) {
  return requestJson(`/api/learnings/discussions/${lessonId}`)
}

export function createDiscussion({ lessonId, content }) {
  return requestJson('/api/learnings/discussions', {
    method: 'POST',
    body: { lessonId: Number(lessonId), content },
  })
}

export function createReview({ courseId, rating, comment }) {
  return requestJson('/api/learnings/reviews', {
    method: 'POST',
    body: { courseId: Number(courseId), rating: Number(rating), comment: comment || '' },
  })
}

export function getCertificateUrl(courseId, format) {
  const token = getToken()
  const query = format ? `?format=${encodeURIComponent(format)}` : ''
  return `/api/learnings/certificate/${courseId}${query}?token=${encodeURIComponent(token || '')}`
}

export async function downloadCertificate(courseId) {
  const token = getToken()
  const res = await fetch(`/api/learnings/certificate/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const error = new Error('Certificate download failed')
    error.status = res.status
    throw error
  }
  const blob = await res.blob()
  const disposition = res.headers.get('content-disposition') || ''
  const match = disposition.match(/filename="?([^"]+)"?/)
  const filename = match ? match[1] : `certificate_${courseId}.pdf`
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
