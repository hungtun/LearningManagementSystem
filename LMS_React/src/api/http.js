const TOKEN_KEY = 'lms_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY)
    return
  }
  localStorage.setItem(TOKEN_KEY, token)
}

export async function requestJson(path, { method = 'GET', body, token, withAuth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (withAuth) {
    const authToken = token ?? getToken()
    if (authToken) headers.Authorization = `Bearer ${authToken}`
  }

  const res = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const contentType = res.headers.get('content-type') || ''
  let data
  try {
    const text = await res.text()
    if (contentType.includes('application/json') || (text && text.startsWith('{'))) {
      data = JSON.parse(text)
    } else {
      data = text || null
    }
  } catch (_) {
    data = null
  }

  if (!res.ok) {
    const error = new Error('Request failed')
    error.status = res.status
    error.data = data
    throw error
  }

  if (data === null) return {}
  if (typeof data !== 'object') return {}

  if (Object.prototype.hasOwnProperty.call(data, 'data')) {
    return data.data ?? {}
  }

  return data
}

export async function uploadMultipart(path, formData, { method = 'POST', token, withAuth = true } = {}) {
  const headers = {}

  if (withAuth) {
    const authToken = token ?? getToken()
    if (authToken) headers.Authorization = `Bearer ${authToken}`
  }

  const res = await fetch(path, {
    method,
    headers,
    body: formData,
  })

  const contentType = res.headers.get('content-type') || ''
  let data
  try {
    const text = await res.text()
    if (contentType.includes('application/json') || (text && text.startsWith('{'))) {
      data = JSON.parse(text)
    } else {
      data = text || null
    }
  } catch (_) {
    data = null
  }

  if (!res.ok) {
    const error = new Error('Request failed')
    error.status = res.status
    error.data = data
    throw error
  }

  if (data === null) return {}
  if (typeof data !== 'object') return {}
  if (Object.prototype.hasOwnProperty.call(data, 'data')) {
    return data.data ?? {}
  }
  return data
}

