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
          : await register({
              email: form.email,
              password: form.password,
              fullName: form.fullName,
            })
      if (res?.token) setToken(res.token)
      onLoginSuccess?.(res?.user ?? null)
      setSuccessMessage(authMode === 'login' ? 'Đăng nhập thành công' : 'Đăng ký thành công')
    } catch (err) {
      const data = err?.data
      let message = ''
      let errors = {}

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        errors = (data.errors && typeof data.errors === 'object') ? data.errors : {}
        message =
          errors.message ||
          data.message ||
          (typeof errors.general === 'string' ? errors.general : null) ||
          (Object.keys(errors).length > 0 ? Object.values(errors)[0] : '') ||
          (authMode === 'login' ? 'Đăng nhập thất bại' : 'Đăng ký thất bại')
      } else if (typeof data === 'string' && data.trim()) {
        message = data.trim()
      } else {
        message = 'Không thể kết nối máy chủ. Kiểm tra backend đang chạy tại http://localhost:8090'
      }

      setFormErrors(errors)
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="loginScreen">
      <section className="loginCard" aria-label="Login">
        <header className="loginHeader">
          <h1 className="loginTitle">{authMode === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}</h1>
          <p className="loginSubtitle">
            {authMode === 'login' ? 'Nếu bạn chưa có tài khoản' : 'Nếu bạn đã có tài khoản'}
            <button
              className="loginLinkButton"
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login')
                setFormErrors({})
                setErrorMessage('')
                setSuccessMessage('')
              }}
            >
              {authMode === 'login' ? ' Đăng ký tại đây' : ' Đăng nhập tại đây'}
            </button>
          </p>
        </header>

        <form className="loginForm" onSubmit={onSubmit}>
          {authMode === 'register' ? (
            <div className="field">
              <label className="srOnly" htmlFor={fullNameId}>
                Họ tên
              </label>
              <input
                id={fullNameId}
                className="input"
                type="text"
                placeholder="Họ và tên"
                value={form.fullName}
                onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                required
              />
              {formErrors.fullName ? (
                <p className="fieldError" role="alert">
                  {formErrors.fullName}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="field">
            <label className="srOnly" htmlFor={emailId}>
              Email
            </label>
            <input
              id={emailId}
              className="input"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              autoComplete="email"
              required
            />
            {formErrors.email ? (
              <p className="fieldError" role="alert">
                {formErrors.email}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label className="srOnly" htmlFor={passwordId}>
              Mật khẩu
            </label>
            <input
              id={passwordId}
              className="input"
              type="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={(e) =>
                setForm((s) => ({ ...s, password: e.target.value }))
              }
              autoComplete="current-password"
              required
            />
            {formErrors.password ? (
              <p className="fieldError" role="alert">
                {formErrors.password}
              </p>
            ) : null}
          </div>

          {errorMessage ? (
            <p className="formError" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {successMessage ? (
            <p className="formSuccess" role="status">
              {successMessage}
            </p>
          ) : null}

          <button className="primaryButton" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? authMode === 'login'
                ? 'Đang đăng nhập...'
                : 'Đang đăng ký...'
              : authMode === 'login'
                ? 'Đăng nhập'
                : 'Đăng ký'}
          </button>
        </form>
      </section>
    </main>
  )
}

