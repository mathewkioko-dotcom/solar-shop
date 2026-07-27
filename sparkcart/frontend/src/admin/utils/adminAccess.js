export const resolveAdminAccess = (user) => {
  if (!user) return 'login'
  return user?.role === 'admin' ? 'allow' : 'account'
}
