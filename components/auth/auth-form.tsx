'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ROLE_LABEL, ROLE_HOME, type Role } from '@/lib/roles'
import { MOCK_COOKIE, serialiseMockSession, type MockSessionData } from '@/lib/mock-session'

type Mode = 'login' | 'signup'
type Errors = Partial<Record<'name' | 'email' | 'password' | 'form', string>>

const DEMO: Record<Role, { email: string; password: string; name: string }> = {
  customer: { email: 'customer@zerowaste.demo', password: 'Customer123!', name: 'Demo Customer' },
  merchant: { email: 'merchant@zerowaste.demo', password: 'Merchant123!', name: 'Demo Merchant' },
  admin:    { email: 'admin@zerowaste.demo',    password: 'Admin123!',    name: 'Demo Admin' },
}

function validate(mode: Mode, values: { name: string; email: string; password: string }): Errors {
  const errors: Errors = {}
  if (mode === 'signup' && values.name.trim().length < 2)
    errors.name = 'Please enter your name (at least 2 letters).'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = 'Please enter a valid email address.'
  if (values.password.length < 8)
    errors.password = 'Password must be at least 8 characters.'
  return errors
}

function setMockSessionCookie(data: MockSessionData) {
  const value = serialiseMockSession(data)
  // Session cookie — expires when browser closes; change max-age for persistence
  document.cookie = `${MOCK_COOKIE}=${value}; path=/; max-age=86400; SameSite=Lax`
}

export function AuthForm({ mode, role }: { mode: Mode; role?: Role }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Role>(role ?? 'customer')
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)

  const update = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const found = validate(mode, values)
    setErrors(found)
    if (Object.keys(found).length) return

    setLoading(true)

    // Simulate a short network delay for realism
    await new Promise((r) => setTimeout(r, 600))

    // Build the mock session
    const session: MockSessionData = {
      id: `mock_${Date.now()}`,
      name: mode === 'signup' ? values.name.trim() : (DEMO[selected]?.name ?? values.email),
      email: values.email.trim(),
      role: selected,
    }

    setMockSessionCookie(session)
    setLoading(false)

    // Hard-navigate so the server component re-reads the cookie
    window.location.href = ROLE_HOME[selected]
  }

  function useDemo() {
    setValues((v) => ({ ...v, ...DEMO[selected] }))
    setErrors({})
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {/* Role selector — shown on both login and signup */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">I am a</legend>
        <div role="radiogroup" className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={selected === r}
              onClick={() => setSelected(r)}
              className={cn(
                'rounded-lg px-2 py-2 text-sm font-medium transition-all',
                selected === r
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {r === 'admin' ? 'Admin' : ROLE_LABEL[r]}
            </button>
          ))}
        </div>
      </fieldset>

      {mode === 'signup' && (
        <Field id="name" label="Full name" error={errors.name}>
          <Input
            id="name"
            autoComplete="name"
            value={values.name}
            onChange={update('name')}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
        </Field>
      )}

      <Field id="email" label="Email" error={errors.email}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={update('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
      </Field>

      <Field id="password" label="Password" error={errors.password}>
        <Input
          id="password"
          type="password"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          value={values.password}
          onChange={update('password')}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
      </Field>

      {errors.form && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.form}
        </p>
      )}

      <Button type="submit" disabled={loading} className="h-11 rounded-full text-base">
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {mode === 'signup' ? 'Create account' : `Log in as ${ROLE_LABEL[selected]}`}
      </Button>

      {/* Demo credentials helper */}
      <div className="rounded-xl border border-dashed bg-muted/50 p-4 text-sm">
        <p className="font-medium">Trying the demo?</p>
        <p className="mt-1 text-muted-foreground">
          Use the sample {ROLE_LABEL[selected].toLowerCase()} account:{' '}
          <span className="font-mono">{DEMO[selected].email}</span>
        </p>
        <button type="button" onClick={useDemo} className="mt-2 font-medium text-primary hover:underline">
          Fill in demo details
        </button>
      </div>

      {mode === 'login' ? (
        <p className="text-center text-sm text-muted-foreground">
          New here?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create a customer account
          </Link>
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      )}
    </form>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
