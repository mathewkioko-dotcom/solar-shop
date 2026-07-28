const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const KENYAN_PHONE_PATTERN = /^(?:\+254|254|0)(?:7\d{8}|1\d{8})$/

export const emptyContactForm = {
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

export function normalizePhone(value) {
  return String(value || '').replace(/[\s()-]/g, '')
}

export function validateContactForm(values) {
  const errors = {}

  if (!values.fullName.trim()) errors.fullName = 'Enter your full name.'
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email address.'
  if (!KENYAN_PHONE_PATTERN.test(normalizePhone(values.phone))) {
    errors.phone = 'Enter a valid Kenyan phone number, such as +254 700 000 000.'
  }
  if (!values.subject.trim()) errors.subject = 'Enter a subject for your request.'
  if (!values.message.trim()) errors.message = 'Tell us how we can help.'

  return errors
}
