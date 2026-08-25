'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      if (!session) {
        router.replace('/signup')
        return
      }

      setCheckingAuth(false)
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/signup')
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  if (checkingAuth) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">
          Loading TrueEstate...
        </p>
      </div>
    )
  }

  return <>{children}</>
}
