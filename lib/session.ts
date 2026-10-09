import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { type Role, ROLE_HOME } from '@/lib/roles'
import { MOCK_COOKIE, parseMockSession } from '@/lib/mock-session'

export type SessionUser = { id: string; name: string; email: string; role: Role }

/** Reads the mock session cookie set by the auth form. No database needed. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies()
  const raw = store.get(MOCK_COOKIE)?.value
  const data = parseMockSession(raw)
  if (!data) return null
  return { id: data.id, name: data.name, email: data.email, role: data.role }
}

export async function requireRole(role: Role): Promise<SessionUser> {
  const current = await getSessionUser()
  if (!current) redirect(`/login?role=${role}`)
  if (current.role !== role) redirect(`${ROLE_HOME[current.role]}?denied=1`)
  return current
}

export async function assertRole(role: Role): Promise<SessionUser> {
  const current = await getSessionUser()
  if (!current || current.role !== role) throw new Error('Not allowed')
  return current
}
