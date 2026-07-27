import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import eyeIcon from '../../assets/icons/actions/eye.svg'
import eyeOffIcon from '../../assets/icons/actions/eye-off.svg'
import SvgIcon from '../../components/ui/SvgIcon'
import { useAuth } from '../../hooks/useAuth'
import SiteLayout from '../../layouts/SiteLayout'
import '../../styles/auth.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const getFieldMessage = (error, field) => {
  const message = error?.errors?.[field]
  return Array.isArray(message) ? message[0] : message || ''
}

const getSafeDestination = (value) => (
  typeof value === 'string'
  && value.startsWith('/')
  && !value.startsWith('//')
  && !value.includes('\\')
    ? value
    : '/account'
)

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const errorRef = useRef(null)
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (submitError) errorRef.current?.focus()
  }, [submitError])

  const updateField = (event) => {
    const { checked, name, type, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setSubmitError('')
  }

  const submitLogin = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    const email = form.email.trim()

    if (!EMAIL_PATTERN.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (!form.password) nextErrors.password = 'Enter your password.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setSubmitError('')

    try {
      await login({ email, password: form.password, remember: form.remember })
      navigate(getSafeDestination(location.state?.from), { replace: true })
    } catch (error) {
      setErrors({
        email: getFieldMessage(error, 'email'),
        password: getFieldMessage(error, 'password'),
      })
      setSubmitError(error?.message || 'Sign in could not be completed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SiteLayout>
      <main className="auth-page">
        <section className="auth-page__panel" aria-labelledby="login-title">
          <div className="auth-page__intro">
            <p>Customer account</p>
            <h1 id="login-title">Welcome back</h1>
            <span>Sign in to manage your Baraka Solar Shop account.</span>
          </div>

          <form className="auth-page__form" noValidate onSubmit={submitLogin}>
            {submitError && (
              <div className="auth-page__error" ref={errorRef} role="alert" tabIndex="-1">
                {submitError}
              </div>
            )}

            <div className="auth-page__field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                onChange={updateField}
              />
              {errors.email && <span id="login-email-error">{errors.email}</span>}
            </div>

            <div className="auth-page__field">
              <label htmlFor="login-password">Password</label>
              <div className="auth-page__password">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  onChange={updateField}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  <SvgIcon src={showPassword ? eyeOffIcon : eyeIcon} size={19} />
                </button>
              </div>
              {errors.password && <span id="login-password-error">{errors.password}</span>}
            </div>

            <div className="auth-page__form-options">
              <label>
                <input
                  name="remember"
                  type="checkbox"
                  checked={form.remember}
                  onChange={updateField}
                />
                Remember me
              </label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button className="auth-page__submit" type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-page__switch">
            New to Baraka Solar Shop? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </main>
    </SiteLayout>
  )
}

export default LoginPage
