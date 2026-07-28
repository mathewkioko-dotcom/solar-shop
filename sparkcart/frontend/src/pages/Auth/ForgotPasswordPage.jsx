import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import SiteLayout from '../../layouts/SiteLayout'
import '../../styles/auth.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const { showError, showSuccess, showWarning } = useToast()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submitRequest = async (event) => {
    event.preventDefault()
    const normalizedEmail = email.trim()

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setEmailError('Enter a valid email address.')
      showWarning('Valid Email Required', 'Enter a valid email address.')
      return
    }

    setSubmitting(true)
    try {
      const message = await forgotPassword(normalizedEmail)
      showSuccess('Reset Link Requested', message, 7000)
    } catch (error) {
      const backendError = error?.errors?.email
      setEmailError(Array.isArray(backendError) ? backendError[0] : backendError || '')
      showError('Reset Request Failed', error?.message || 'The reset request could not be completed.')
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
