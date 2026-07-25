import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import SiteLayout from '../../layouts/SiteLayout'
import '../../styles/auth.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const messageRef = useRef(null)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status.message) messageRef.current?.focus()
  }, [status])

  const submitRequest = async (event) => {
    event.preventDefault()
    const normalizedEmail = email.trim()

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setEmailError('Enter a valid email address.')
      return
    }

    setSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const message = await forgotPassword(normalizedEmail)
      setStatus({ type: 'success', message })
    } catch (error) {
      const backendError = error?.errors?.email
      setEmailError(Array.isArray(backendError) ? backendError[0] : backendError || '')
      setStatus({ type: 'error', message: error?.message || 'The reset request could not be completed.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SiteLayout>
      <main className="auth-page">
        <section className="auth-page__panel" aria-labelledby="forgot-password-title">
          <div className="auth-page__intro">
            <p>Account recovery</p>
            <h1 id="forgot-password-title">Forgot your password?</h1>
            <span>Enter your account email and we will send you a secure reset link.</span>
          </div>

          <form className="auth-page__form" noValidate onSubmit={submitRequest}>
            {status.message && (
              <div className={`auth-page__message auth-page__message--${status.type}`} ref={messageRef} role={status.type === 'error' ? 'alert' : 'status'} tabIndex="-1">
                {status.message}
              </div>
            )}

            <div className="auth-page__field">
              <label htmlFor="forgot-email">Email address</label>
              <input id="forgot-email" type="email" autoComplete="email" value={email} aria-invalid={Boolean(emailError)} aria-describedby={emailError ? 'forgot-email-error' : undefined} onChange={(event) => { setEmail(event.target.value); setEmailError('') }} />
              {emailError && <span id="forgot-email-error">{emailError}</span>}
            </div>

            <button className="auth-page__submit" type="submit" disabled={submitting}>
              {submitting ? 'Sending reset link...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="auth-page__switch"><Link to="/login">Return to sign in</Link></p>
        </section>
      </main>
    </SiteLayout>
  )
}

export default ForgotPasswordPage

