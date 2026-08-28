'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  House,
  MapPin,
  Star,
} from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [showPassword, setShowPassword] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isSignup = mode === 'signup'

  const handleGoogleAuth = async () => {
    setError('')
    setMessage('')

    const { error: authError } =
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })

    if (authError) {
      setError(authError.message)
    }
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const withTimeout = async <T,>(
      promise: Promise<T>,
      timeoutMs = 10000
    ): Promise<T> => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Authentication request timed out. Please try again.'))
        }, timeoutMs)
      })

      try {
        return await Promise.race([promise, timeoutPromise])
      } finally {
        if (timeoutId) clearTimeout(timeoutId)
      }
    }

    try {
      if (isSignup) {
        const { error: authError } = await withTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } },
          })
        )

        if (authError) throw authError

        setMessage(
          'Account created. Check your email to confirm your account, then sign in.'
        )
      } else {
        const {
          data,
          error: authError,
        } = await withTimeout(
          supabase.auth.signInWithPassword({
            email,
            password,
          })
        )

        if (authError) throw authError

        if (!data.session) {
          throw new Error('Sign in succeeded but no active session was returned.')
        }

        // Use a full page navigation so the homepage gets the fresh Supabase
        // session immediately instead of depending on a client router refresh.
        window.location.assign('/')
        return
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f2e8]">
      <div className="grid min-h-screen lg:grid-cols-[44%_56%]">

        <section className="relative hidden min-h-screen overflow-hidden bg-[#062f23] text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(213,183,103,0.07),transparent_28%),linear-gradient(180deg,#073327_0%,#05291f_100%)]" />

          <div className="relative z-20 flex items-center gap-3 px-12 pt-9">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-white text-[#0d4f3a] shadow-sm">
                <House className="size-5" />
              </span>

              <span className="text-[22px] font-semibold tracking-[-0.02em]">
                TrueEstate
              </span>
            </Link>
          </div>

          <div className="relative z-20 px-12 pt-14">
            <h1 className="max-w-[620px] text-[58px] font-semibold leading-[1.04] tracking-[-0.055em] xl:text-[68px]">
              A better home
              <br />
              starts with
              <br />
              a{' '}
              <span className="text-[#e0bd67]">
                better decision.
              </span>
            </h1>

            <div className="mt-7 h-[3px] w-28 rounded-full bg-[#e0bd67]" />

            <p className="mt-7 max-w-[540px] text-[19px] font-medium leading-8 text-white/88">
              Find a place that fits your life, your budget,
              and your future with clearer property insights
              before you move.
            </p>

            <div className="mt-9 grid max-w-[560px] grid-cols-3">
              <div className="pr-6">
                <BarChart3 className="size-11 text-[#e0bd67]" />
                <p className="mt-4 text-[16px] font-bold text-white">
                  Fair pricing
                </p>
                <p className="mt-1 text-[15px] font-medium leading-6 text-white/80">
                  you can trust
                </p>
              </div>

              <div className="border-l border-white/15 px-7">
                <MapPin className="size-11 text-[#e0bd67]" />
                <p className="mt-4 text-[16px] font-bold text-white">
                  Locality insights
                </p>
                <p className="mt-1 text-[15px] font-medium leading-6 text-white/80">
                  that matter
                </p>
              </div>

              <div className="border-l border-white/15 pl-7">
                <Star className="size-11 text-[#e0bd67]" />
                <p className="mt-4 text-[16px] font-bold text-white">
                  Better choices
                </p>
                <p className="mt-1 text-[15px] font-medium leading-6 text-white/80">
                  for your future
                </p>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 h-[43%] overflow-hidden">
            <img
              src="/trueestate_auth_property_v2.png"
              alt="Modern residential property"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#062f23] via-transparent to-black/10" />
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-[#f7f2e8] px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-[540px]">
            <Link
              href="/"
              className="mb-10 flex items-center gap-2 lg:hidden"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <House className="size-4" />
              </span>
              <span className="text-lg font-semibold">
                TrueEstate
              </span>
            </Link>

            <div className="mb-10 grid grid-cols-2 border-b border-[#d9d1c1]">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`relative pb-4 text-lg font-semibold transition ${
                  isSignup
                    ? 'text-[#0d4f3a]'
                    : 'text-[#8e8a82]'
                }`}
              >
                Create Account

                {isSignup && (
                  <span className="absolute inset-x-0 -bottom-px h-[3px] bg-[#0d4f3a]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`relative pb-4 text-lg font-semibold transition ${
                  !isSignup
                    ? 'text-[#0d4f3a]'
                    : 'text-[#8e8a82]'
                }`}
              >
                Sign In

                {!isSignup && (
                  <span className="absolute inset-x-0 -bottom-px h-[3px] bg-[#0d4f3a]" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              className="flex h-16 w-full items-center justify-center gap-3 rounded-xl border border-[#d8cebb] bg-[#fbf7ef] text-[17px] font-semibold text-[#111111] transition hover:bg-[#f2eadc]"
            >
              <svg
                className="size-6 shrink-0"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018v2.509h3.232c1.891-1.741 2.982-4.309 2.982-7.35Z"
                />
                <path
                  fill="#34A853"
                  d="M12 22c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.041.955-3.386.955-2.605 0-4.809-1.759-5.596-4.123H3.064v2.591A9.997 9.997 0 0 0 12 22Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.404 13.9A6.01 6.01 0 0 1 6.091 12c0-.659.114-1.3.313-1.9V7.509h-3.34A9.997 9.997 0 0 0 2 12c0 1.614.386 3.141 1.064 4.491L6.404 13.9Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C16.959 2.991 14.695 2 12 2a9.997 9.997 0 0 0-8.936 5.509l3.34 2.591C7.191 7.736 9.395 5.977 12 5.977Z"
                />
              </svg>

              {isSignup
                ? 'Sign up with Google'
                : 'Continue with Google'}
            </button>

            <div className="my-9 flex items-center gap-5">
              <div className="h-px flex-1 bg-[#d9d1c1]" />
              <span className="text-sm font-medium uppercase tracking-[0.12em] text-[#8d877d]">
                {isSignup
                  ? 'or use email'
                  : 'or continue with email'}
              </span>
              <div className="h-px flex-1 bg-[#d9d1c1]" />
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {isSignup && (
                <label className="block">
                  <span className="mb-2.5 block text-[15px] font-semibold text-[#302f2b]">
                    Full name
                  </span>

                  <input
                    type="text"
                    required
                    value={name}
                    placeholder="Your name"
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    className="h-16 w-full rounded-xl border border-[#d8cebb] bg-[#fbf7ef] px-5 text-base outline-none transition placeholder:text-[#9b968d] focus:border-[#0d4f3a] focus:ring-2 focus:ring-[#0d4f3a]/10"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2.5 block text-[15px] font-semibold text-[#302f2b]">
                  Email address
                </span>

                <input
                  type="email"
                  required
                  value={email}
                  placeholder="you@example.com"
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  className="h-16 w-full rounded-xl border border-[#d8cebb] bg-[#fbf7ef] px-5 text-base outline-none transition placeholder:text-[#9b968d] focus:border-[#0d4f3a] focus:ring-2 focus:ring-[#0d4f3a]/10"
                />
              </label>

              <label className="block">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-[#302f2b]">
                    Password
                  </span>

                  {!isSignup && (
                    <button
                      type="button"
                      className="text-sm font-medium text-[#0d4f3a] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    placeholder={
                      isSignup
                        ? 'Create a password'
                        : 'Enter your password'
                    }
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    className="h-16 w-full rounded-xl border border-[#d8cebb] bg-[#fbf7ef] px-5 pr-14 text-base outline-none transition placeholder:text-[#9b968d] focus:border-[#0d4f3a] focus:ring-2 focus:ring-[#0d4f3a]/10"
                  />

                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#6e6b64] transition hover:text-[#302f2b]"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>

                {isSignup && (
                  <p className="mt-2.5 text-sm text-[#8d877d]">
                    Use at least 6 characters.
                  </p>
                )}
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-16 w-full items-center justify-center gap-3 rounded-xl bg-[#064c38] text-base font-semibold text-white shadow-sm transition hover:bg-[#043f2f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? 'Please wait...'
                  : isSignup
                    ? 'Create Account'
                    : 'Sign In'}

                <ArrowRight className="size-5" />
              </button>
            </form>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                {message}
              </div>
            )}

            <p className="mt-8 text-center text-base text-[#5f5a51]">
              {isSignup
                ? 'Already have an account? '
                : 'New to TrueEstate? '}

              <button
                type="button"
                onClick={() =>
                  setMode(
                    isSignup
                      ? 'signin'
                      : 'signup'
                  )
                }
                className="font-semibold text-[#0d4f3a] hover:underline"
              >
                {isSignup
                  ? 'Sign in'
                  : 'Create an account'}
              </button>
            </p>

            <p className="mt-10 text-center text-sm leading-6 text-[#8d877d]">
              {isSignup
                ? 'By creating an account, you agree to TrueEstate’s Terms of Service and Privacy Policy.'
                : 'By continuing, you agree to TrueEstate’s Terms of Service and Privacy Policy.'}
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
