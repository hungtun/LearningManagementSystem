import { requestJson } from './http.js'

export function listInstructorSubmissions() {
  return requestJson('/api/assessments/instructor/submissions')
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
