'use client'

import { useState } from 'react'
import { Loader2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOCK_COOKIE } from '@/lib/mock-session'

export function SignOutButton() {
  const [loading, setLoading] = useState(false)

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={() => {
        setLoading(true)
        // Clear the mock session cookie
        document.cookie = `${MOCK_COOKIE}=; path=/; max-age=0; SameSite=Lax`
        window.location.href = '/'
      }}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      Sign out
    </Button>
  )
}
