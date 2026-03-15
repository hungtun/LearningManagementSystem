import { useId, useState } from 'react'
import { login } from '../api/auth.js'
import { setToken } from '../api/http.js'
import './LoginPage.css'

export default function LoginPage() {
  const emailId = useId()
  const passwordId = useId()

  const [form, setForm] = useState({ email: '', password: '' })
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
      const res = await login(form)
      if (res?.token) setToken(res.token)
      setSuccessMessage('Đăng nhập thành công')
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
          'Đăng nhập thất bại'
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
          <h1 className="loginTitle">ĐĂNG NHẬP</h1>
          <p className="loginSubtitle">
            Nếu bạn chưa có tài khoản, đăng ký{' '}
            <a className="loginLink" href="#">
              tại đây
            </a>
          </p>
        </header>

        <form className="loginForm" onSubmit={onSubmit}>
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
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <a className="forgotLink" href="#">
            Quên mật khẩu
          </a>

          <div className="dividerBlock" aria-hidden="true">
            <p className="dividerText">Hoặc đăng nhập bằng</p>
          </div>

          <div className="socialRow">
            <button className="socialButton facebook" type="button">
              <span className="socialMark" aria-hidden="true">
                f
              </span>
              <span className="socialLabel">Facebook</span>
            </button>
            <button className="socialButton google" type="button">
              <span className="socialMark" aria-hidden="true">
                G+
              </span>
              <span className="socialLabel">Google</span>
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

