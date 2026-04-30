import { useId, useState } from 'react'
import { login, register } from '../api/auth.js'
import { setToken } from '../api/http.js'
import './LoginPage.css'

export default function LoginPage({ onLoginSuccess }) {
  const emailId = useId()
  const passwordId = useId()
  const fullNameId = useId()

  const [authMode, setAuthMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    setFormErrors({})
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const res =
        authMode === 'login'
          ? await login({ email: form.email, password: form.password })
          : await register({ email: form.email, password: form.password, fullName: form.fullName })
      if (res?.token) setToken(res.token)
      onLoginSuccess?.(res?.user ?? null)
      setSuccessMessage(authMode === 'login' ? 'Login successful' : 'Registration successful')
    } catch (err) {
      const data = err?.data
      let message = ''
      let errors = {}

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        errors = data.errors && typeof data.errors === 'object' ? data.errors : {}
        message =
          errors.message ||
          data.message ||
          (typeof errors.general === 'string' ? errors.general : null) ||
          (Object.keys(errors).length > 0 ? Object.values(errors)[0] : '') ||
          (authMode === 'login' ? 'Login failed' : 'Registration failed')
      } else if (typeof data === 'string' && data.trim()) {
        message = data.trim()
      } else {
        message = 'Unable to connect to server. Please ensure backend is running at http://localhost:8090'
      }

      setFormErrors(errors)
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function switchMode() {
    setAuthMode(authMode === 'login' ? 'register' : 'login')
    setFormErrors({})
    setErrorMessage('')
    setSuccessMessage('')
    setForm({ email: '', password: '', fullName: '' })
  }

  return (
    <div className="loginRoot">
      <aside className="loginBrand">
        <div className="loginBrandContent">
          <div className="loginLogo">LearnHub</div>
          <h2 className="loginBrandHeadline">Upgrade your skills with thousands of high quality courses</h2>
          <p className="loginBrandSub">
            Learn at your own pace. Start any course for free.
          </p>
          <ul className="loginFeatureList">
            <li>Courses taught by expert instructors</li>
            <li>Learn anytime, anywhere, on any device</li>
            <li>Course completion certificates</li>
            <li>Content updated regularly</li>
          </ul>
        </div>
      </aside>

      <main className="loginFormSide">
        <div className="loginCard">
          <div className="loginCardHeader">
            <h1 className="loginCardTitle">
              {authMode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="loginCardSub">
              {authMode === 'login'
                ? 'Sign in to continue learning'
                : 'Join the learning community today'}
            </p>
          </div>

          <form className="loginForm" onSubmit={onSubmit} noValidate>
            {authMode === 'register' && (
              <div className="formGroup">
                <label className="formLabel" htmlFor={fullNameId}>
                  Full name
                </label>
                <input
                  id={fullNameId}
                  className={`formInput${formErrors.fullName ? ' formInputError' : ''}`}
                  type="text"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                  required
                />
                {formErrors.fullName && (
                  <p className="formFieldError" role="alert">
                    {formErrors.fullName}
                  </p>
                )}
              </div>
            )}

            <div className="formGroup">
              <label className="formLabel" htmlFor={emailId}>
                Email
              </label>
              <input
                id={emailId}
                className={`formInput${formErrors.email ? ' formInputError' : ''}`}
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                autoComplete="email"
                required
              />
              {formErrors.email && (
                <p className="formFieldError" role="alert">
                  {formErrors.email}
                </p>
              )}
            </div>

            <div className="formGroup">
              <label className="formLabel" htmlFor={passwordId}>
                Password
              </label>
              <input
                id={passwordId}
                className={`formInput${formErrors.password ? ' formInputError' : ''}`}
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                required
              />
              {formErrors.password && (
                <p className="formFieldError" role="alert">
                  {formErrors.password}
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="formAlert formAlertError" role="alert">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="formAlert formAlertSuccess" role="status">
                {successMessage}
              </div>
            )}

            <button
              className="loginSubmitBtn"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? authMode === 'login'
                  ? 'Signing in...'
                  : 'Creating account...'
                : authMode === 'login'
                  ? 'Sign in'
                  : 'Register for free'}
            </button>
          </form>

          <p className="loginSwitchText">
            {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button type="button" className="loginSwitchBtn" onClick={switchMode}>
              {authMode === 'login' ? ' Register now' : ' Sign in'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
