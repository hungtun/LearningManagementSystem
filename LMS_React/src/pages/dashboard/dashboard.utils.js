export function getMessage(error, fallback) {
  const errorData = error?.data
  if (typeof errorData === 'string' && errorData.trim()) return errorData
  if (errorData && typeof errorData === 'object') return errorData.message || errorData.error || fallback
  return fallback
}

export function getAccountLabel(currentUser) {
  const fullName = currentUser?.fullName?.trim()
  if (fullName) {
    const words = fullName.split(/\s+/).filter(Boolean)
    return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase()
  }
  const email = currentUser?.email || ''
  return email ? email[0].toUpperCase() : 'U'
}
