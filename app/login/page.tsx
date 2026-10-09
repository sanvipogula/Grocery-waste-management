import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthShell } from '@/components/auth/auth-shell'
import { getSessionUser } from '@/lib/session'
import { ROLE_HOME, isRole } from '@/lib/roles'

export const metadata: Metadata = { title: 'Log in — ZeroWaste' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const current = await getSessionUser()
  if (current) redirect(ROLE_HOME[current.role])
  const { role } = await searchParams

  return (
    <AuthShell title="Welcome back" text="Choose who you are and log in to your space.">
      <AuthForm mode="login" role={isRole(role) ? role : undefined} />
    </AuthShell>
  )
}
