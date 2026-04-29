import { getToken, requestJson } from './http.js'

export function getCurrentUser() {
  return requestJson('/api/users/me')
}

export function updateCurrentUser({ fullName, avatarUrl }) {
  return requestJson('/api/users/me', {
    method: 'PUT',
    body: { fullName, avatarUrl },
  })
}

export async function uploadCurrentUserAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/users/me/avatar', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  })

  let data = null
  try {
    data = await response.json()
  } catch (_) {
    data = null
  }

  if (!response.ok) {
    const error = new Error('Avatar upload failed')
    error.status = response.status
    error.data = data
    throw error
  }

  if (data && Object.prototype.hasOwnProperty.call(data, 'data')) {
    return data.data ?? {}
  }

  return data ?? {}
}

export function listAdminUsers() {
  return requestJson('/api/admin/users')
}

export function createAdminUser({ email, password, fullName, roleName }) {
  return requestJson('/api/admin/users', {
    method: 'POST',
    body: { email, password, fullName, roleName },
  })
}

export function updateAdminUser(userId, { fullName }) {
  return requestJson(`/api/admin/users/${userId}`, {
    method: 'PUT',
    body: { fullName },
  })
}

export function patchAdminUserRole(userId, { roleName }) {
  return requestJson(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: { roleName },
  })
}

export function disableAdminUser(userId) {
  return requestJson(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  })
}
