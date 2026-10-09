import 'server-only'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { type Role, ROLE_HOME, isRole } from '@/lib/roles'

export type SessionUser = { id: string; name: string; email: string; role: Role }

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return null

    // Always read role from DB so an admin role change takes effect immediately
    const [row] = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, session.user.id))

    const role = row && isRole(row.role) ? row.role : 'customer'
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role,
    }
  } catch {
    // DB not reachable or no session — fail gracefully
    return null
  }
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
