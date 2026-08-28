

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
    let authenticated = false

    const redirectToSignup = () => {
      if (!mounted) return
      router.replace('/signup')
    }

    const timeoutId = window.setTimeout(() => {
      if (mounted && !authenticated) {
        console.warn('Auth check timed out. Redirecting to signup.')
        redirectToSignup()
      }
    }, 8000)

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error('Supabase session error:', error)
          window.clearTimeout(timeoutId)
          redirectToSignup()
          return
        }

        if (!session) {
          window.clearTimeout(timeoutId)
          redirectToSignup()
          return
        }

        authenticated = true
        window.clearTimeout(timeoutId)
        setCheckingAuth(false)
      } catch (error) {
        if (!mounted) return
        console.error('Unable to check Supabase session:', error)
        window.clearTimeout(timeoutId)
        redirectToSignup()
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      if (session) {
        authenticated = true
        window.clearTimeout(timeoutId)
        setCheckingAuth(false)
        return
      }

      if (event === 'SIGNED_OUT') {
        authenticated = false
        setCheckingAuth(true)
        redirectToSignup()
      }
    })

    return () => {
      mounted = false
      window.clearTimeout(timeoutId)
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
