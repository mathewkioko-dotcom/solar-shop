import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog, FieldError, FormSection, LoadingState, PageHeader } from '../../components/AdminUI'
import { useToast } from '../../../hooks/useToast'
import { adminProducts, getAdminCatalogs } from '../../services/adminApi'
import { getAssignableBrands } from '../../utils/brandOptions'

const emptyProduct = {
  name: '', slug: '', sku: '', model_number: '', brand_id: '', category_id: '',
  short_description: '', description: '', price: '', compare_at_price: '', stock: 0,
  low_stock_threshold: 5, wattage: '', voltage: '', capacity_ah: '', warranty: '',
  is_active: true, is_featured: false, seo_title: '', seo_description: '', specifications: [],
}
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const unwrap = (payload) => payload?.data || payload
const nullable = (value) => value === '' ? null : value

function Input({ label, name, form, errors, onChange, type = 'text', ...props }) {
  const errorId = `${name}-error`
  return <label className={props.className || ''}><span>{label}</span><input {...props} name={name} type={type} value={form[name] ?? ''} min={type === 'number' ? 0 : props.min} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? errorId : undefined} onChange={onChange} /><FieldError id={errorId} error={errors[name]} /></label>
}

export default function ProductFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const { showError, showSuccess, showWarning } = useToast()
  const [form, setForm] = useState(emptyProduct)
  const [catalogs, setCatalogs] = useState({ brands: [], categories: [] })
  const [images, setImages] = useState([])
  const [pendingImages, setPendingImages] = useState([])
  const [datasheet, setDatasheet] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [slugManual, setSlugManual] = useState(false)
  const [leaveTo, setLeaveTo] = useState('')
  const [removeTarget, setRemoveTarget] = useState(null)
  const [removeDatasheetOpen, setRemoveDatasheetOpen] = useState(false)
  const previewUrls = useRef([])

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      getAdminCatalogs(controller.signal),
      editing ? adminProducts.get(id, controller.signal) : Promise.resolve(null),
    ]).then(([nextCatalogs, payload]) => {
      setCatalogs(nextCatalogs)
      if (payload) {
        const product = unwrap(payload)
        setForm({ ...emptyProduct, ...product, brand_id: product.brand_id || '', category_id: product.category_id || '', specifications: product.specifications || [] })
        setImages(product.images || [])
      }
      setLoading(false)
    }).catch((error) => { if (error.name !== 'AbortError') { showError('Product Load Failed', error.message); setLoading(false) } })
    return () => controller.abort()
  }, [editing, id, showError])

  useEffect(() => {
    const warn = (event) => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    const intercept = (event) => {
      if (!dirty || event.defaultPrevented || event.button !== 0) return
      const anchor = event.target.closest('a[href]')
      if (!anchor || anchor.target || anchor.origin !== window.location.origin) return
      event.preventDefault()
      setLeaveTo(`${anchor.pathname}${anchor.search}${anchor.hash}`)
    }
    window.addEventListener('beforeunload', warn)
    document.addEventListener('click', intercept, true)
    return () => { window.removeEventListener('beforeunload', warn); document.removeEventListener('click', intercept, true) }
  }, [dirty])

  useEffect(() => {
    previewUrls.current = pendingImages.map((item) => item.preview)
  }, [pendingImages])
  useEffect(() => () => previewUrls.current.forEach((url) => URL.revokeObjectURL(url)), [])

  const update = (event) => {
    const { checked, name, type, value } = event.target
    setForm((current) => {
      const next = { ...current, [name]: type === 'checkbox' ? checked : value }
      if (!editing && name === 'name' && !slugManual) next.slug = slugify(value)
      return next
    })
    if (name === 'slug') setSlugManual(true)
    setErrors((current) => ({ ...current, [name]: '' }))
    setDirty(true)
  }

  const updateSpec = (index, field, value) => {
    setForm((current) => ({ ...current, specifications: current.specifications.map((spec, specIndex) => specIndex === index ? { ...spec, [field]: value } : spec) }))
    setDirty(true)
  }
  const moveSpec = (index, offset) => {
    setForm((current) => {
      const specifications = [...current.specifications]
      const [item] = specifications.splice(index, 1)
      specifications.splice(index + offset, 0, item)
      return { ...current, specifications: specifications.map((spec, display_order) => ({ ...spec, display_order })) }
    })
    setDirty(true)
  }

  const selectImages = (event) => {
    const next = []
    const rejected = []
    Array.from(event.target.files).forEach((file) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) rejected.push(file.name)
      else next.push({ file, preview: URL.createObjectURL(file), alt_text: form.name, display_order: images.length + pendingImages.length + next.length })
    })
    if (rejected.length) showError('Invalid Image Upload', `${rejected.join(', ')}: use JPG, PNG or WEBP up to 5 MB.`)
    setPendingImages((current) => [...current, ...next])
    if (next.length) setDirty(true)
    event.target.value = ''
  }
  const selectDatasheet = (event) => {
    const file = event.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf' || file.size > 15 * 1024 * 1024) showError('Invalid Datasheet', 'Datasheet must be a PDF no larger than 15 MB.')
    else { setDatasheet(file); setDirty(true) }
    event.target.value = ''
  }

  const payload = useMemo(() => ({
    ...form,
    brand_id: form.brand_id ? Number(form.brand_id) : null,
    category_id: Number(form.category_id),
    price: form.price,
    compare_at_price: nullable(form.compare_at_price),
    stock: Number(form.stock),
    low_stock_threshold: Number(form.low_stock_threshold),
    wattage: form.wattage === '' ? null : Number(form.wattage),
    capacity_ah: form.capacity_ah === '' ? null : Number(form.capacity_ah),
    specifications: form.specifications.map((spec, index) => ({ name: spec.name, value: spec.value, unit: nullable(spec.unit), display_order: index })),
  }), [form])
  const brandOptions = useMemo(
    () => getAssignableBrands(catalogs.brands, form.brand_id),
    [catalogs.brands, form.brand_id],
  )

  const save = async (event, viewAfter = false) => {
    event.preventDefault()
    if (saving) return
    setSaving(true); setErrors({})
    try {
      const result = editing ? await adminProducts.update(id, payload) : await adminProducts.create(payload)
      const product = unwrap(result)
      const uploadErrors = []
      for (const item of pendingImages) {
        try { await adminProducts.uploadImage(product.id, item.file, item) } catch (error) { uploadErrors.push(`${item.file.name}: ${error.message}`) }
      }
      if (datasheet) {
        try { await adminProducts.uploadDatasheet(product.id, datasheet) } catch (error) { uploadErrors.push(`Datasheet: ${error.message}`) }
      }
      setDirty(false)
      showSuccess(editing ? 'Product Saved' : 'Product Created', editing ? 'Product saved successfully.' : 'Product created successfully.')
      if (uploadErrors.length) showWarning('Upload Partially Completed', `Product saved, but some uploads failed: ${uploadErrors.join(' ')}`, 8000)
      if (viewAfter) window.location.assign(`/products/${product.slug}`)
      else if (!editing) navigate(`/admin/products/${product.id}/edit`, { replace: true })
      else {
        const refreshed = unwrap(await adminProducts.get(product.id))
        setForm({ ...emptyProduct, ...refreshed, brand_id: refreshed.brand_id || '', category_id: refreshed.category_id || '', specifications: refreshed.specifications || [] })
        setImages(refreshed.images || []); setPendingImages([]); setDatasheet(null)
      }
    } catch (error) {
      setErrors(error.errors || {})
      showError('Product Save Failed', error.message || 'Product could not be saved.')
    } finally { setSaving(false) }
  }

  const removeImage = async () => {
    const image = removeTarget; setRemoveTarget(null)
    try { await adminProducts.removeImage(id, image.id); setImages((current) => current.filter((item) => item.id !== image.id)); showSuccess('Image Removed', 'The product image was removed.') } catch (error) { showError('Image Removal Failed', error.message) }
  }
  const makePrimary = async (image) => {
    try { const product = unwrap(await adminProducts.setPrimaryImage(id, image.id)); setImages(product.images || []); showSuccess('Primary Image Updated', 'The storefront primary image was updated.') } catch (error) { showError('Image Update Failed', error.message) }
  }
  const updateExistingImage = async (image) => {
    try {
      const payload = await adminProducts.updateImage(id, image.id, { alt_text: image.alt_text || null, display_order: Number(image.display_order) || 0 })
      const updated = unwrap(payload)
      setImages((current) => current.map((item) => item.id === image.id ? updated : item))
      showSuccess('Image Details Updated', 'Image details were saved successfully.')
    } catch (error) { showError('Image Update Failed', error.message) }
  }

  if (loading) return <LoadingState rows={9} />
  return <form className="admin-page admin-product-form" onSubmit={save} noValidate>
    <PageHeader eyebrow={editing ? 'Product editor' : 'New catalogue item'} title={editing ? `Edit ${form.name || 'product'}` : 'Add product'} description="Manage customer-facing product information, availability, media and technical details." actions={<><Link className="admin-button admin-button--secondary" to="/admin/products">Cancel</Link><button className="admin-button" disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button></>} />
    <FormSection title="Basic information" description="The core details customers use to identify this product."><Input label="Product name" name="name" form={form} errors={errors} onChange={update} required /><Input label="Slug" name="slug" form={form} errors={errors} onChange={update} required /><Input label="SKU" name="sku" form={form} errors={errors} onChange={update} /><Input label="Model number" name="model_number" form={form} errors={errors} onChange={update} /><label><span>Brand</span><select name="brand_id" value={form.brand_id} onChange={update}><option value="">Unassigned</option>{brandOptions.map((brand) => <option value={brand.id} key={brand.id}>{brand.name}{brand.is_active ? '' : ' (inactive — currently assigned)'}</option>)}</select><FieldError error={errors.brand_id} /></label><label><span>Category</span><select name="category_id" value={form.category_id} onChange={update} required><option value="">Select category</option>{catalogs.categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select><FieldError error={errors.category_id} /></label><label className="admin-span-2"><span>Short description</span><textarea name="short_description" rows="3" value={form.short_description || ''} onChange={update} /><FieldError error={errors.short_description} /></label><label className="admin-span-2"><span>Full description</span><textarea name="description" rows="7" value={form.description || ''} onChange={update} /><FieldError error={errors.description} /></label></FormSection>
    <div className="admin-form-columns"><FormSection title="Pricing"><Input label="Price (KSh)" name="price" type="number" step="0.01" form={form} errors={errors} onChange={update} required /><Input label="Compare-at price (KSh)" name="compare_at_price" type="number" step="0.01" form={form} errors={errors} onChange={update} /></FormSection><FormSection title="Inventory"><Input label="Stock quantity" name="stock" type="number" form={form} errors={errors} onChange={update} /><Input label="Low-stock threshold" name="low_stock_threshold" type="number" form={form} errors={errors} onChange={update} /></FormSection></div>
    <FormSection title="Technical details"><Input label="Wattage" name="wattage" type="number" form={form} errors={errors} onChange={update} /><Input label="Voltage" name="voltage" form={form} errors={errors} onChange={update} /><Input label="Battery capacity (Ah)" name="capacity_ah" type="number" form={form} errors={errors} onChange={update} /><Input label="Warranty" name="warranty" form={form} errors={errors} onChange={update} /></FormSection>
    <FormSection title="Status"><label className="admin-check"><input name="is_active" type="checkbox" checked={form.is_active} onChange={update} /><span>Active and visible on the storefront</span></label><label className="admin-check"><input name="is_featured" type="checkbox" checked={form.is_featured} onChange={update} /><span>Featured on the homepage</span></label></FormSection>
    <FormSection title="Search visibility"><Input label="SEO title" name="seo_title" form={form} errors={errors} onChange={update} /><label><span>SEO description</span><textarea name="seo_description" rows="4" value={form.seo_description || ''} onChange={update} /></label></FormSection>
    <FormSection title="Specifications" description="Add structured technical details in the order customers should see them."><div className="admin-span-2 admin-spec-list">{form.specifications.map((spec, index) => <div className="admin-spec-row" key={spec.id || index}><input aria-label={`Specification ${index + 1} name`} placeholder="Name" value={spec.name} onChange={(event) => updateSpec(index, 'name', event.target.value)} /><input aria-label={`Specification ${index + 1} value`} placeholder="Value" value={spec.value} onChange={(event) => updateSpec(index, 'value', event.target.value)} /><input aria-label={`Specification ${index + 1} unit`} placeholder="Unit" value={spec.unit || ''} onChange={(event) => updateSpec(index, 'unit', event.target.value)} /><button type="button" disabled={index === 0} onClick={() => moveSpec(index, -1)}>↑</button><button type="button" disabled={index === form.specifications.length - 1} onClick={() => moveSpec(index, 1)}>↓</button><button type="button" aria-label={`Remove specification ${index + 1}`} onClick={() => { setForm((current) => ({ ...current, specifications: current.specifications.filter((_, itemIndex) => itemIndex !== index) })); setDirty(true) }}>×</button></div>)}<button className="admin-button admin-button--secondary" type="button" onClick={() => { setForm((current) => ({ ...current, specifications: [...current.specifications, { name: '', value: '', unit: '', display_order: current.specifications.length }] })); setDirty(true) }}>Add specification</button></div></FormSection>
    <FormSection title="Product images" description="JPG, PNG or WEBP. Maximum 5 MB per image."><label className="admin-file-drop admin-span-2"><input type="file" multiple accept=".jpg,.jpeg,.png,.webp" onChange={selectImages} /><span>Choose product images</span></label><div className="admin-span-2 admin-gallery">{images.map((image) => <article key={image.id || image.url}><img src={image.url} alt={image.alt_text || form.name} /><div><span>{image.is_primary ? 'Primary image' : `Order ${image.display_order}`}</span>{image.id && <><input aria-label="Image alt text" value={image.alt_text || ''} placeholder="Alt text" onChange={(event) => setImages((current) => current.map((item) => item.id === image.id ? { ...item, alt_text: event.target.value } : item))} /><input aria-label="Image display order" type="number" min="0" value={image.display_order} onChange={(event) => setImages((current) => current.map((item) => item.id === image.id ? { ...item, display_order: event.target.value } : item))} /><button type="button" onClick={() => updateExistingImage(image)}>Save image details</button><button type="button" disabled={image.is_primary} onClick={() => makePrimary(image)}>Set primary</button><button type="button" onClick={() => images.length === 1 ? showWarning('Last Product Image', 'Add a replacement before removing the final image, or confirm removal from this screen.') : setRemoveTarget(image)}>Remove</button></>}</div></article>)}{pendingImages.map((image) => <article key={image.preview}><img src={image.preview} alt="Upload preview" /><div><span>Ready to upload</span><input aria-label="New image alt text" value={image.alt_text} placeholder="Alt text" onChange={(event) => setPendingImages((current) => current.map((item) => item === image ? { ...item, alt_text: event.target.value } : item))} /><input aria-label="New image display order" type="number" min="0" value={image.display_order} onChange={(event) => setPendingImages((current) => current.map((item) => item === image ? { ...item, display_order: event.target.value } : item))} /><button type="button" onClick={() => { URL.revokeObjectURL(image.preview); setPendingImages((current) => current.filter((item) => item !== image)) }}>Remove</button></div></article>)}</div></FormSection>
    <FormSection title="PDF datasheet" description="PDF only, up to 15 MB."><div className="admin-span-2 admin-datasheet">{form.datasheet_url && <a href={form.datasheet_url} target="_blank" rel="noreferrer">Open current datasheet</a>}<label className="admin-file-drop"><input type="file" accept=".pdf,application/pdf" onChange={selectDatasheet} /><span>{datasheet ? datasheet.name : form.datasheet_url ? 'Replace datasheet' : 'Choose PDF datasheet'}</span></label>{form.datasheet_url && <button className="admin-button admin-button--danger" type="button" onClick={() => setRemoveDatasheetOpen(true)}>Remove datasheet</button>}</div></FormSection>
    <footer className="admin-form-footer"><button type="submit" className="admin-button" disabled={saving}>{saving ? 'Saving product…' : 'Save Product'}</button><button type="button" className="admin-button admin-button--secondary" disabled={saving} onClick={(event) => save(event, true)}>Save and View Storefront</button></footer>
    <ConfirmDialog open={Boolean(leaveTo)} title="Discard unsaved changes?" message="Changes made on this page have not been saved." destructive confirmLabel="Discard changes" onClose={() => setLeaveTo('')} onConfirm={() => { const target = leaveTo; setDirty(false); setLeaveTo(''); navigate(target) }} />
    <ConfirmDialog open={Boolean(removeTarget)} title="Remove product image?" message="This image will be permanently removed from the product gallery." destructive confirmLabel="Remove image" onClose={() => setRemoveTarget(null)} onConfirm={removeImage} />
    <ConfirmDialog open={removeDatasheetOpen} title="Remove datasheet?" message="The PDF will be permanently removed from this product." destructive confirmLabel="Remove datasheet" onClose={() => setRemoveDatasheetOpen(false)} onConfirm={async () => { setRemoveDatasheetOpen(false); try { const product = unwrap(await adminProducts.removeDatasheet(id)); setForm((current) => ({ ...current, datasheet_url: product.datasheet_url })); showSuccess('Datasheet Removed', 'The product datasheet was removed.') } catch (error) { showError('Datasheet Removal Failed', error.message) } }} />
  </form>
}
