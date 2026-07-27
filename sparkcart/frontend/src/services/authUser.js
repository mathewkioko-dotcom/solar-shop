const cleanText = (value) => (
  typeof value === 'string' ? value.trim() : ''
)

export const normalizeAuthenticatedUser = (payload) => {
  const candidate = payload?.user ?? payload?.data?.user ?? payload?.data ?? payload
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null

  const id = candidate.id
  const email = cleanText(candidate.email)
  const firstName = cleanText(candidate.first_name ?? candidate.firstName)
  const lastName = cleanText(candidate.last_name ?? candidate.lastName)
  const fullName = cleanText(candidate.name)
    || [firstName, lastName].filter(Boolean).join(' ')
  const role = cleanText(candidate.role).toLowerCase()
  const createdAt = cleanText(candidate.created_at ?? candidate.createdAt)

  if (
    (!Number.isInteger(id) && !cleanText(id))
    || !email
    || !fullName
    || !['admin', 'customer'].includes(role)
  ) {
    return null
  }

  return {
    id,
    first_name: firstName,
    last_name: lastName,
    name: fullName,
    email,
    role,
    created_at: createdAt,
    // Retain established frontend aliases while keeping the API profile shape intact.
    firstName: firstName || fullName.split(/\s+/)[0],
    lastName,
    createdAt,
  }
}
