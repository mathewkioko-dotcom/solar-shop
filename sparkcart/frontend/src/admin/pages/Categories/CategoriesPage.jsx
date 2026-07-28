import { useEffect, useState } from 'react'
import { ConfirmDialog, EmptyState, ErrorState, FieldError, LoadingState, PageHeader, StatusBadge } from '../../components/AdminUI'
import { useToast } from '../../../hooks/useToast'
import { adminCategories, clearAdminCatalogCache } from '../../services/adminApi'

const empty = { name: '', slug: '', description: '', is_active: true, display_order: 0 }
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function CategoriesPage() {
  const [state, setState] = useState({ status: 'loading', items: [], error: '', retry: 0 })
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [archive, setArchive] = useState(null)
  const { showError, showSuccess } = useToast()
  useEffect(() => {
    const controller = new AbortController()
    adminCategories.list({ per_page: 100 }, controller.signal).then((payload) => setState((current) => ({ ...current, status: 'success', items: payload.data || [] }))).catch((error) => { if (error.name !== 'AbortError') { setState((current) => ({ ...current, status: 'error', error: error.message })); showError('Categories Unavailable', error.message) } })
    return () => controller.abort()
  }, [showError, state.retry])
  const update = (event) => {
    const { checked, name, type, value } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value, ...(!editing && name === 'name' ? { slug: slugify(value) } : {}) }))
  }
  const save = async (event) => {
    event.preventDefault(); setErrors({})
    try {
      const body = { ...form, display_order: Number(form.display_order) }
      if (editing) await adminCategories.update(editing.id, body); else await adminCategories.create(body)
      clearAdminCatalogCache(); showSuccess(editing ? 'Category Updated' : 'Category Created', editing ? 'Category updated successfully.' : 'Category created successfully.')
      setEditing(null); setForm(empty); setState((current) => ({ ...current, retry: current.retry + 1 }))
    } catch (error) { setErrors(error.errors || {}); showError('Category Save Failed', error.message) }
  }
  return <div className="admin-page"><PageHeader eyebrow="Catalogue organisation" title="Categories" description="Manage customer-facing product groupings without changing existing filter URLs." />
    <div className="admin-split"><section className="admin-panel"><header><div><span>Structure</span><h2>All categories</h2></div></header>{state.status === 'loading' ? <LoadingState /> : state.status === 'error' ? <ErrorState message={state.error} onRetry={() => setState((current) => ({ ...current, retry: current.retry + 1 }))} /> : state.items.length ? <div className="admin-category-list">{state.items.map((category) => <article key={category.id}><div><strong>{category.name}</strong><small>/{category.slug} · {category.products_count || 0} products</small></div><StatusBadge active={category.is_active} /><div className="admin-row-actions"><button type="button" onClick={() => { setEditing(category); setForm(category) }}>Edit</button><button type="button" className="is-danger" onClick={() => setArchive(category)}>Archive</button></div></article>)}</div> : <EmptyState title="No categories yet" message="Create the first category using the form." />}</section>
      <form className="admin-panel admin-category-form" onSubmit={save}><header><div><span>{editing ? 'Update structure' : 'New grouping'}</span><h2>{editing ? `Edit ${editing.name}` : 'Add category'}</h2></div></header><label><span>Name</span><input name="name" value={form.name} onChange={update} required /><FieldError error={errors.name} /></label><label><span>Slug</span><input name="slug" value={form.slug} onChange={update} required /><FieldError error={errors.slug} /></label><label><span>Description</span><textarea name="description" rows="5" value={form.description || ''} onChange={update} /></label><label><span>Display order</span><input name="display_order" type="number" min="0" value={form.display_order} onChange={update} /></label><label className="admin-check"><input name="is_active" type="checkbox" checked={form.is_active} onChange={update} /><span>Active on storefront</span></label><div><button className="admin-button">Save Category</button>{editing && <button className="admin-button admin-button--secondary" type="button" onClick={() => { setEditing(null); setForm(empty) }}>Cancel</button>}</div></form>
    </div><ConfirmDialog open={Boolean(archive)} title="Archive category?" message="Categories with assigned products cannot be archived. This action will hide an empty category from the storefront." destructive confirmLabel="Archive category" onClose={() => setArchive(null)} onConfirm={async () => { const target = archive; setArchive(null); try { await adminCategories.archive(target.id); clearAdminCatalogCache(); showSuccess('Category Archived', 'Category archived successfully.'); setState((current) => ({ ...current, retry: current.retry + 1 })) } catch (error) { showError('Category Archive Failed', error.message) } }} />
  </div>
}
