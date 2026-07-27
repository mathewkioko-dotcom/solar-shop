import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog, FieldError, FormSection, LoadingState, PageHeader } from '../../components/AdminUI'
import { useAdminNotifications } from '../../components/AdminNotifications'
import { adminBrands, clearAdminCatalogCache } from '../../services/adminApi'

const initial = { name: '', slug: '', description: '', website_url: '', is_active: true, display_order: 0 }
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function BrandFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useAdminNotifications()
  const [form, setForm] = useState(initial)
  const [logo, setLogo] = useState(null)
  const [logoUrl, setLogoUrl] = useState('')
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [slugManual, setSlugManual] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    adminBrands.get(id, controller.signal).then((payload) => { const brand = payload.data || payload; setForm({ ...initial, ...brand }); setLogoUrl(brand.logo_url || ''); setLoading(false) }).catch((nextError) => { setError(nextError.message); setLoading(false) })
    return () => controller.abort()
  }, [id])
  const update = (event) => {
    const { checked, name, type, value } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value, ...(!id && name === 'name' && !slugManual ? { slug: slugify(value) } : {}) }))
    if (name === 'slug') setSlugManual(true)
    setErrors((current) => ({ ...current, [name]: '' }))
  }
  const chooseLogo = (event) => {
    const file = event.target.files[0]
    if (!file) return
    if (!['image/svg+xml', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) setError('Logo must be SVG, PNG or WEBP and no larger than 2 MB.')
    else { setLogo(file); setError('') }
  }
  const submit = async (event) => {
    event.preventDefault(); if (saving) return
    setSaving(true); setError(''); setErrors({})
    try {
      const payload = await adminBrands.save(id, { ...form, display_order: Number(form.display_order) }, logo)
      const brand = payload.data || payload
      clearAdminCatalogCache(); notify(id ? 'Brand saved successfully.' : 'Brand created successfully.')
      navigate(`/admin/brands/${brand.id}/edit`, { replace: true })
      setLogoUrl(brand.logo_url || ''); setLogo(null)
    } catch (nextError) { setErrors(nextError.errors || {}); setError(nextError.message) } finally { setSaving(false) }
  }
  if (loading) return <LoadingState />
  return <form className="admin-page" onSubmit={submit} noValidate><PageHeader eyebrow={id ? 'Brand editor' : 'New manufacturer'} title={id ? `Edit ${form.name}` : 'Add brand'} description="Control manufacturer details and how the brand appears across the storefront." actions={<><Link className="admin-button admin-button--secondary" to="/admin/brands">Cancel</Link><button className="admin-button" disabled={saving}>{saving ? 'Saving…' : 'Save Brand'}</button></>} />{error && <div className="admin-form-error" role="alert">{error}</div>}
    <FormSection title="Brand information"><label><span>Name</span><input name="name" value={form.name} onChange={update} required /><FieldError error={errors.name} /></label><label><span>Slug</span><input name="slug" value={form.slug} onChange={update} required /><FieldError error={errors.slug} /></label><label className="admin-span-2"><span>Description</span><textarea name="description" rows="6" value={form.description || ''} onChange={update} /></label><label><span>Website URL</span><input name="website_url" type="url" value={form.website_url || ''} onChange={update} placeholder="https://" /><FieldError error={errors.website_url} /></label><label><span>Display order</span><input name="display_order" type="number" min="0" value={form.display_order} onChange={update} /></label><label className="admin-check"><input name="is_active" type="checkbox" checked={form.is_active} onChange={update} /><span>Active on storefront</span></label></FormSection>
    <FormSection title="Brand logo" description="SVG, PNG or WEBP, up to 2 MB."><div className="admin-logo-editor">{logoUrl ? <img src={logoUrl} alt={`${form.name} logo`} /> : <span>No logo uploaded</span>}<label className="admin-file-drop"><input type="file" accept=".svg,.png,.webp" onChange={chooseLogo} /><span>{logo ? logo.name : logoUrl ? 'Replace logo' : 'Choose logo'}</span></label>{logoUrl && <button type="button" className="admin-button admin-button--danger" onClick={() => setRemoveOpen(true)}>Remove logo</button>}</div></FormSection>
    <ConfirmDialog open={removeOpen} title="Remove brand logo?" message="The current logo file will be permanently removed." destructive confirmLabel="Remove logo" onClose={() => setRemoveOpen(false)} onConfirm={async () => { setRemoveOpen(false); try { const payload = await adminBrands.removeLogo(id); setLogoUrl((payload.data || payload).logo_url || ''); notify('Brand logo removed.') } catch (nextError) { notify(nextError.message, 'error') } }} />
  </form>
}
