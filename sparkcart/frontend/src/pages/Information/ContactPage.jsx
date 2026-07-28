import { useState } from 'react'
import mailIcon from '../../assets/icons/common/mail.svg'
import mapPinIcon from '../../assets/icons/common/map-pin.svg'
import phoneIcon from '../../assets/icons/common/phone.svg'
import infoIcon from '../../assets/icons/status/info.svg'
import whatsappIcon from '../../assets/icons/social/whatsapp.svg'
import InformationPageLayout from '../../components/information/InformationPageLayout'
import SvgIcon from '../../components/ui/SvgIcon'
import { businessInfo } from '../../config/businessInfo'
import { useToast } from '../../hooks/useToast'
import { submitContactRequest } from '../../services/contactService'
import { emptyContactForm, validateContactForm } from '../../utils/contactValidation'

const contactMethods = [
  { label: 'Call support', value: businessInfo.phone, href: `tel:${businessInfo.phone.replace(/\s/g, '')}`, icon: phoneIcon },
  { label: 'Email support', value: businessInfo.supportEmail, href: `mailto:${businessInfo.supportEmail}`, icon: mailIcon },
  { label: 'WhatsApp', value: businessInfo.whatsapp, href: `https://wa.me/${businessInfo.whatsapp.replace(/\D/g, '')}`, icon: whatsappIcon, external: true },
  { label: 'Visit or collect', value: businessInfo.address, icon: mapPinIcon },
  { label: 'Business hours', value: businessInfo.businessHours, icon: infoIcon },
]

function ContactField({ error, id, label, ...inputProps }) {
  const InputComponent = inputProps.multiline ? 'textarea' : 'input'
  const props = { ...inputProps }
  delete props.multiline

  return (
    <label className="information-form__field" htmlFor={id}>
      <span>{label}</span>
      <InputComponent
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <small id={`${id}-error`}>{error}</small>}
    </label>
  )
}

function ContactPage() {
  const { showError, showSuccess, showWarning } = useToast()
  const [form, setForm] = useState(emptyContactForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const submit = async (event) => {
    event.preventDefault()
    if (submitting) return

    const nextErrors = validateContactForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      showWarning('Review Contact Details', 'Please correct the highlighted fields before continuing.')
      return
    }

    setSubmitting(true)
    try {
      const result = await submitContactRequest({
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      })
      if (!result?.accepted || result.delivery !== 'local-mock') {
        throw new Error('The contact request could not be prepared.')
      }

      setForm(emptyContactForm)
      showSuccess(
        'Message Prepared',
        'Your contact request has been recorded locally. Email delivery will be connected before production.',
        8000,
      )
    } catch (error) {
      showError('Message Not Prepared', error?.message || 'Your contact request could not be prepared. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <InformationPageLayout
      title="Contact Us"
      introduction="Talk to our team about product selection, order support, delivery arrangements, returns, or warranty questions."
      description="Contact Baraka Solar Shop for product guidance, order support, delivery questions, returns, and warranty assistance."
    >
      <section className="information-page__lead">
        <h2>How can we help?</h2>
        <p>Choose the most convenient contact method or prepare a request using the form. Contact details below are centrally configured and should be verified before production launch.</p>
      </section>

      <div className="contact-methods">
        {contactMethods.map((method) => {
          const content = (
            <>
              <span><SvgIcon src={method.icon} size={21} /></span>
              <div><strong>{method.label}</strong><small>{method.value}</small></div>
            </>
          )
          return method.href ? (
            <a href={method.href} key={method.label} target={method.external ? '_blank' : undefined} rel={method.external ? 'noreferrer' : undefined}>{content}</a>
          ) : <div key={method.label}>{content}</div>
        })}
      </div>

      <section className="information-form-card" aria-labelledby="contact-form-title">
        <div>
          <p>Send a request</p>
          <h2 id="contact-form-title">Tell us what you need</h2>
          <span>This form currently prepares a local development request. It does not send email yet.</span>
        </div>

        <form className="information-form" noValidate onSubmit={submit}>
          <div className="information-form__grid">
            <ContactField id="contact-name" name="fullName" label="Full name" autoComplete="name" value={form.fullName} error={errors.fullName} onChange={updateField} required />
            <ContactField id="contact-email" name="email" label="Email address" type="email" autoComplete="email" value={form.email} error={errors.email} onChange={updateField} required />
            <ContactField id="contact-phone" name="phone" label="Phone number" type="tel" autoComplete="tel" value={form.phone} error={errors.phone} onChange={updateField} placeholder="+254 700 000 000" required />
            <ContactField id="contact-subject" name="subject" label="Subject" value={form.subject} error={errors.subject} onChange={updateField} required />
          </div>
          <ContactField id="contact-message" name="message" label="Message" multiline rows="6" value={form.message} error={errors.message} onChange={updateField} required />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Preparing request…' : 'Prepare Contact Request'}
          </button>
        </form>
      </section>
    </InformationPageLayout>
  )
}

export default ContactPage
