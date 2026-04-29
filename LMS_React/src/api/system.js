import { requestJson } from './http.js'

export function listCategories() {
  return requestJson('/api/system/categories')
}

export function createCategory({ name, description }) {
  return requestJson('/api/admin/system/categories', {
    method: 'POST',
    body: { name, description },
  })
}

export function updateCategory(categoryId, { name, description }) {
  return requestJson(`/api/admin/system/categories/${categoryId}`, {
    method: 'PUT',
    body: { name, description },
  })
}

export function deleteCategory(categoryId) {
  return requestJson(`/api/admin/system/categories/${categoryId}`, {
    method: 'DELETE',
  })
}

export function listNotifications() {
  return requestJson('/api/system/notifications')
}

export function broadcastNotification({ title, content }) {
  return requestJson('/api/admin/system/notifications/broadcast', {
    method: 'POST',
    body: { title, content },
  })
}

export function getInstructorAnalytics() {
  return requestJson('/api/system/analytics/instructor')
}

export function getAdminAnalytics() {
  return requestJson('/api/system/analytics/admin')
}
