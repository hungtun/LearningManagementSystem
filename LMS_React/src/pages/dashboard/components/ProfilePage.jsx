import { useEffect, useRef, useState } from 'react'

export default function ProfilePage({
  currentUser,
  avatarUrl,
  onAvatarSelected,
  onSaveProfile,
  onBackHome,
}) {
  const [fullName, setFullName] = useState(currentUser?.fullName || '')
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setFullName(currentUser?.fullName || '')
  }, [currentUser])

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    try {
      await onSaveProfile({ fullName: fullName.trim() })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="modulePanel">
      <div className="profileHeaderRow">
        <h2>My Profile</h2>
        <button type="button" className="secondaryButton" onClick={onBackHome}>
          Back to learning page
        </button>
      </div>

      <div className="profileCard">
        <div className="profileAvatarWrap">
          <div className="profileAvatarFrame">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="profileAvatarImage" />
            ) : (
              <span className="profileAvatarFallback">No Avatar</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hiddenFileInput"
            onChange={onAvatarSelected}
          />
          <button
            type="button"
            className="secondaryButton"
            onClick={() => fileInputRef.current?.click()}
          >
            Change avatar
          </button>
        </div>

        <form className="profileInfoForm" onSubmit={handleSubmit}>
          <label>
            Email
            <input value={currentUser?.email || ''} disabled />
          </label>
          <label>
            Full name
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              maxLength={100}
            />
          </label>
          <button type="submit" className="primaryButton small" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>
    </section>
  )
}
