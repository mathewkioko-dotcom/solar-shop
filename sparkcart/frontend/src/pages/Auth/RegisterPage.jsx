import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import eyeIcon from '../../assets/icons/actions/eye.svg'
import eyeOffIcon from '../../assets/icons/actions/eye-off.svg'
import SvgIcon from '../../components/ui/SvgIcon'
import { useAuth } from '../../hooks/useAuth'
import SiteLayout from '../../layouts/SiteLayout'
import '../../styles/auth.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

const getFieldMessage = (error, field) => {
  const message = error?.errors?.[field]
  return Array.isArray(message) ? message[0] : message || ''
}

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const errorRef = useRef(null)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (submitError) errorRef.current?.focus()
  }, [submitError])

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setSubmitError('')
  }

  const submitRegistration = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const email = form.email.trim()

    if (!firstName) nextErrors.firstName = 'Enter your first name.'
    if (!lastName) nextErrors.lastName = 'Enter your last name.'
    if (!EMAIL_PATTERN.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (!STRONG_PASSWORD_PATTERN.test(form.password)) {
      nextErrors.password = 'Use 8+ characters with uppercase, lowercase, number, and symbol.'
    }
    if (form.passwordConfirmation !== form.password) {
      nextErrors.passwordConfirmation = 'Passwords must match.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setSubmitError('')

    try {
      await register({
        firstName,
        lastName,
        email,
        password: form.password,
        passwordConfirmation: form.passwordConfirmation,
      })
      navigate('/account', { replace: true })
    } catch (error) {
      setErrors({
        firstName: getFieldMessage(error, 'first_name'),
        lastName: getFieldMessage(error, 'last_name'),
        email: getFieldMessage(error, 'email'),
        password: getFieldMessage(error, 'password'),
        passwordConfirmation: getFieldMessage(error, 'password_confirmation'),
      })
      setSubmitError(error?.message || 'Your account could not be created.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SiteLayout>
      <main className="auth-page">
        <section className="auth-page__panel auth-page__panel--wide" aria-labelledby="register-title">
          <div className="auth-page__intro">
            <p>Join Baraka Solar Shop</p>
            <h1 id="register-title">Create your account</h1>
            <span>Set up a secure customer account for a faster shopping experience.</span>
          </div>

          <form className="auth-page__form" noValidate onSubmit={submitRegistration}>
            {submitError && (
              <div className="auth-page__error" ref={errorRef} role="alert" tabIndex="-1">
                {submitError}
              </div>
            )}

            <div className="auth-page__field-grid">
              <div className="auth-page__field">
                <label htmlFor="register-first-name">First name</label>
                <input id="register-first-name" name="firstName" autoComplete="given-name" value={form.firstName} aria-invalid={Boolean(errors.firstName)} aria-describedby={errors.firstName ? 'register-first-name-error' : undefined} onChange={updateField} />
                {errors.firstName && <span id="register-first-name-error">{errors.firstName}</span>}
              </div>
              <div className="auth-page__field">
                <label htmlFor="register-last-name">Last name</label>
                <input id="register-last-name" name="lastName" autoComplete="family-name" value={form.lastName} aria-invalid={Boolean(errors.lastName)} aria-describedby={errors.lastName ? 'register-last-name-error' : undefined} onChange={updateField} />
                {errors.lastName && <span id="register-last-name-error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="auth-page__field">
              <label htmlFor="register-email">Email address</label>
              <input id="register-email" name="email" type="email" autoComplete="email" value={form.email} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} onChange={updateField} />
              {errors.email && <span id="register-email-error">{errors.email}</span>}
            </div>

            <div className="auth-page__field">
              <label htmlFor="register-password">Password</label>
              <div className="auth-page__password">
                <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} aria-invalid={Boolean(errors.password)} aria-describedby={`register-password-help${errors.password ? ' register-password-error' : ''}`} onChange={updateField} />
                <button type="button" aria-label={showPassword ? 'Hide passwords' : 'Show passwords'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
                  <SvgIcon src={showPassword ? eyeOffIcon : eyeIcon} size={19} />
                </button>
              </div>
              <small id="register-password-help">At least 8 characters with uppercase, lowercase, number, and symbol.</small>
              {errors.password && <span id="register-password-error">{errors.password}</span>}
            </div>

            <div className="auth-page__field">
              <label htmlFor="register-password-confirmation">Confirm password</label>
              <input id="register-password-confirmation" name="passwordConfirmation" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.passwordConfirmation} aria-invalid={Boolean(errors.passwordConfirmation)} aria-describedby={errors.passwordConfirmation ? 'register-password-confirmation-error' : undefined} onChange={updateField} />
              {errors.passwordConfirmation && <span id="register-password-confirmation-error">{errors.passwordConfirmation}</span>}
            </div>

            <button className="auth-page__submit" type="submit" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-page__switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </section>
      </main>
    </SiteLayout>
  )
}

export default RegisterPage
