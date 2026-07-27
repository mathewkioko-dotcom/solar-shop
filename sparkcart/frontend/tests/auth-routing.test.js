import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveAdminAccess } from '../src/admin/utils/adminAccess.js'
import { normalizeAuthenticatedUser } from '../src/services/authUser.js'
import { getAssignableBrands } from '../src/admin/utils/brandOptions.js'

const profile = {
  id: 11,
  first_name: 'James',
  last_name: 'Kioko',
  name: 'James Kioko',
  email: 'admin@example.com',
  role: 'admin',
  created_at: '2026-07-26T10:00:00.000Z',
}

test('login response normalization preserves the nested admin role', () => {
  const user = normalizeAuthenticatedUser({ user: profile, token: 'plain-text-token' })
  assert.equal(user.role, 'admin')
  assert.equal(user.first_name, 'James')
  assert.equal(user.firstName, 'James')
})

test('current-user response normalization preserves customer role', () => {
  const user = normalizeAuthenticatedUser({ user: { ...profile, role: 'customer' } })
  assert.equal(user.role, 'customer')
})

test('direct current-user payload is normalized consistently', () => {
  assert.deepEqual(
    normalizeAuthenticatedUser(profile),
    normalizeAuthenticatedUser({ user: profile }),
  )
})

test('invalid or missing roles are rejected rather than silently treated as customers', () => {
  assert.equal(normalizeAuthenticatedUser({ user: { ...profile, role: undefined } }), null)
  assert.equal(normalizeAuthenticatedUser({ user: { ...profile, role: 'owner' } }), null)
})

test('AdminRoute access decision permits admin and redirects customer', () => {
  assert.equal(resolveAdminAccess({ role: 'admin' }), 'allow')
  assert.equal(resolveAdminAccess({ role: 'customer' }), 'account')
  assert.equal(resolveAdminAccess(null), 'login')
})

test('product brand options show active brands and retain only the assigned inactive brand', () => {
  const brands = [
    { id: 1, name: 'Active', is_active: true, archived_at: null },
    { id: 2, name: 'Assigned inactive', is_active: false, archived_at: null },
    { id: 3, name: 'Other inactive', is_active: false, archived_at: null },
    { id: 4, name: 'Archived', is_active: true, archived_at: '2026-07-26T10:00:00Z' },
  ]

  assert.deepEqual(getAssignableBrands(brands, 2).map((brand) => brand.id), [1, 2])
  assert.deepEqual(getAssignableBrands(brands).map((brand) => brand.id), [1])
})
