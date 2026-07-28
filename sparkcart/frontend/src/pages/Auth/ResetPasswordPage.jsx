import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import eyeIcon from '../../assets/icons/actions/eye.svg'
import eyeOffIcon from '../../assets/icons/actions/eye-off.svg'
import SvgIcon from '../../components/ui/SvgIcon'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import SiteLayout from '../../layouts/SiteLayout'
import '../../styles/auth.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { resetPassword } = useAuth()
  const { showError, showSuccess, showWarning } = useToast()
  const token = searchParams.get('token') || ''
  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    password: '',
    passwordConfirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const submitReset = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    const email = form.email.trim()

    if (!token) nextErrors.token = 'This reset link is missing its secure token.'
    if (!EMAIL_PATTERN.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (!STRONG_PASSWORD_PATTERN.test(form.password)) {
      nextErrors.password = 'Use 8+ characters with uppercase, lowercase, number, and symbol.'
    }
    if (form.passwordConfirmation !== form.password) {
      nextErrors.passwordConfirmation = 'Passwords must match.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      showWarning('Review Password Details', nextErrors.token || 'Review the highlighted fields.')
      return
    }

    setSubmitting(true)

    try {
      const message = await resetPassword({
        email,
        token,
        password: form.password,
        passwordConfirmation: form.passwordConfirmation,
      })
      showSuccess('Password Reset', message)
      window.setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (error) {
      const backendErrors = error?.errors || {}
      setErrors({
        email: Array.isArray(backendErrors.email) ? backendErrors.email[0] : backendErrors.email || '',
        password: Array.isArray(backendErrors.password) ? backendErrors.password[0] : backendErrors.password || '',
      })
      showError('Password Reset Failed', error?.message || 'Your password could not be reset.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SiteLayout>
      <main className="auth-page">
        <section className="auth-page__panel" aria-labelledby="reset-password-title">
          <div className="auth-page__intro">
            <p>Secure reset</p>
            <h1 id="reset-password-title">Choose a new password</h1>
            <span>Create a strong password you have not used for this account before.</span>
          </div>

          <form className="auth-page__form" noValidate onSubmit={submitReset}>
            <div className="auth-page__field">
              <label htmlFor="reset-email">Email address</label>
              <input id="reset-email" name="email" type="email" autoComplete="email" value={form.email} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'reset-email-error' : undefined} onChange={updateField} />
              {errors.email && <span id="reset-email-error">{errors.email}</span>}
            </div>

            <div className="auth-page__field">
              <label htmlFor="reset-password">New password</label>
              <div className="auth-page__password">
                <input id="reset-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'reset-password-error' : undefined} onChange={updateField} />
                <button type="button" aria-label={showPassword ? 'Hide passwords' : 'Show passwords'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
                  <SvgIcon src={showPassword ? eyeOffIcon : eyeIcon} size={19} />
                </button>
              </div>
              {errors.password && <span id="reset-password-error">{errors.password}</span>}
            </div>

            <div className="auth-page__field">
              <label htmlFor="reset-password-confirmation">Confirm new password</label>
              <input id="reset-password-confirmation" name="passwordConfirmation" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.passwordConfirmation} aria-invalid={Boolean(errors.passwordConfirmation)} aria-describedby={errors.passwordConfirmation ? 'reset-password-confirmation-error' : undefined} onChange={updateField} />
              {errors.passwordConfirmation && <span id="reset-password-confirmation-error">{errors.passwordConfirmation}</span>}
            </div>

            <button className="auth-page__submit" type="submit" disabled={submitting}>
              {submitting ? 'Resetting password...' : 'Reset Password'}
            </button>
          </form>

          <p className="auth-page__switch"><Link to="/login">Return to sign in</Link></p>
        </section>
      </main>
    </SiteLayout>
  )
}

export default ResetPasswordPage
