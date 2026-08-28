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

    const redirectToSignup = () => {
      if (!mounted) return

      router.replace('/signup')

      window.setTimeout(() => {
        if (mounted && window.location.pathname !== '/signup') {
          window.location.replace('/signup')
        }
      }, 1000)
    }

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error('Supabase session error:', error)
          redirectToSignup()
          return
        }

        if (!session) {
          redirectToSignup()
          return
        }

        setCheckingAuth(false)
      } catch (error) {
        console.error('Unable to check Supabase session:', error)
        redirectToSignup()
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return

      if (session) {
        setCheckingAuth(false)
      } else {
        setCheckingAuth(true)
        redirectToSignup()
      }
    })

    const timeoutId = window.setTimeout(() => {
      if (mounted) {
        console.warn('Auth check timed out. Redirecting to signup.')
        redirectToSignup()
      }
    }, 6000)

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
