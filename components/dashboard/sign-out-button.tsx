'use client'

import { useState } from 'react'
import { Loader2, LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const [loading, setLoading] = useState(false)

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={async () => {
        setLoading(true)
        await authClient.signOut()
        window.location.href = '/'
      }}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      Sign out
    </Button>
  )
}
