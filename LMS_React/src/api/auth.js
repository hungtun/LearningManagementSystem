import { requestJson } from './http.js'

export function login({ email, password }) {
  return requestJson('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    withAuth: false,
  })
}

export function register({ email, password, fullName }) {
  return requestJson('/api/auth/register', {
    method: 'POST',
    body: { email, password, fullName },
    withAuth: false,
  })
}

export function logout() {
  return requestJson('/api/auth/logout')
}
