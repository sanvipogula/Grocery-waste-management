import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { ROLE_HOME } from '@/lib/roles'

export default async function DashboardRedirect() {
  const current = await getSessionUser()
  redirect(current ? ROLE_HOME[current.role] : '/login')
}
