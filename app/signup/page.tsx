import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthShell } from '@/components/auth/auth-shell'
import { getSessionUser } from '@/lib/session'
import { ROLE_HOME } from '@/lib/roles'

export const metadata: Metadata = { title: 'Get started — ZeroWaste' }

export default async function SignupPage() {
  const current = await getSessionUser()
  if (current) redirect(ROLE_HOME[current.role])

  return (
    <AuthShell
      title="Create your account"
      text="New accounts start as customers. An administrator can give store managers merchant access."
    >
      <AuthForm mode="signup" />
    </AuthShell>
  )
}
