'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  ArrowRight,
  Check,
  GraduationCap,
  Hospital,
  House,
  Menu,
  LogOut,
  ShoppingBag,
  Sparkles,
  Train,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

import {
  defaultProperty,
  formatINR,
} from '@/lib/types'

import type {
  Accessibility,
  Evaluation,
  PropertyInput,
  Recommendation,
} from '@/lib/types'


export function Navbar() {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  const links = [
    ['Estimate Rent', '/predict'],
    ['Evaluate Listing', '/evaluate'],
    ['Recommendations', '/recommend'],
    ['Compare', '/compare'],
  ]

  useEffect(() => {
    let mounted = true

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!mounted) return

      if (user) {
        const fullName =
          typeof user.user_metadata?.full_name === 'string'
            ? user.user_metadata.full_name
            : null

        setUserName(fullName)
        setUserEmail(user.email ?? null)
      } else {
        setUserName(null)
        setUserEmail(null)
      }

      setAuthLoading(false)
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user

      if (user) {
        const fullName =
          typeof user.user_metadata?.full_name === 'string'
            ? user.user_metadata.full_name
            : null

        setUserName(fullName)
        setUserEmail(user.email ?? null)
      } else {
        setUserName(null)
        setUserEmail(null)
      }

      setAuthLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    setSigningOut(true)

    try {
      await supabase.auth.signOut()
      setOpen(false)
      router.replace('/signup')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  const displayName =
    userName?.trim() ||
    userEmail?.split('@')[0] ||
    'Account'

  const initial =
    displayName.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
          onClick={() => setOpen(false)}
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <House className="size-4" />
          </span>
          <span className="text-lg">TrueEstate</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!authLoading && userEmail ? (
            <>
              <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5">
                <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initial}
                </span>

                <div className="max-w-[140px] leading-tight">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {displayName}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={signingOut}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="size-4" />
                {signingOut ? 'Signing out…' : 'Logout'}
              </button>
            </>
          ) : !authLoading ? (
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign In
            </Link>
          ) : null}
        </div>

        <button
          type="button"
          className="md:hidden"
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-5 py-4 md:hidden">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-sm hover:bg-muted"
            >
              {label}
            </Link>
          ))}

          {!authLoading && userEmail ? (
            <div className="mt-3 border-t border-border pt-3">
              <div className="mb-3 flex items-center gap-3 px-3">
                <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {initial}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={signingOut}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border text-sm font-medium transition hover:bg-muted disabled:opacity-60"
              >
                <LogOut className="size-4" />
                {signingOut ? 'Signing out…' : 'Logout'}
              </button>
            </div>
          ) : !authLoading ? (
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Sign In
            </Link>
          ) : null}
        </nav>
      )}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <span className="grid size-6 place-items-center rounded bg-primary text-primary-foreground">
              <House className="size-3" />
            </span>
            TrueEstate
          </div>
          <p>Rental intelligence powered by machine learning.</p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            ['Home', '/'],
            ['Estimate Rent', '/predict'],
            ['Evaluate Listing', '/evaluate'],
            ['Recommendations', '/recommend'],
            ['Compare', '/compare'],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="hover:text-foreground"
            >
              {label}
            </Link>
          ))}

          <span>GitHub</span>
        </div>
      </div>
    </footer>
  )
}


export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </p>

      <h1 className="text-balance text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
        {title}
      </h1>

      <p className="mt-4 text-pretty leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}


export function AccessibilityPanel({
  data,
}: {
  data: Accessibility
}) {
  const items = [
    [Hospital, 'Hospital', data.hospital],
    [GraduationCap, 'School', data.school],
    [ShoppingBag, 'Mall', data.mall],
    [Train, 'Transit', data.transit],
  ] as const

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium">Accessibility</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Nearby essentials and transit
          </p>
        </div>

        <strong className="text-2xl tracking-tight text-primary">
          {data.score.toFixed(2)}
          <span className="text-sm font-normal text-muted-foreground">
            {' '}/ 10
          </span>
        </strong>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map(([Icon, label, value]) => (
          <div
            key={label}
            className="flex items-center gap-3"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-muted text-primary">
              <Icon className="size-4" />
            </span>

            <div>
              <p className="text-xs text-muted-foreground">
                {label}
              </p>
              <p className="text-sm font-medium">
                {value.toFixed(2)} km
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}


export function MetricCard({
  label,
  value,
  detail,
  accent = false,
}: {
  label: string
  value: string
  detail?: string
  accent?: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-semibold tracking-tight ${
          accent ? 'text-primary' : 'text-foreground'
        }`}
      >
        {value}
      </p>

      {detail && (
        <p className="mt-1 text-xs text-muted-foreground">
          {detail}
        </p>
      )}
    </div>
  )
}


export function PropertyForm({
  initial = defaultProperty,
  showAsking = true,
  onSubmit,
  submitLabel = 'Analyze Property',
}: {
  initial?: PropertyInput
  showAsking?: boolean
  onSubmit: (property: PropertyInput) => void
  submitLabel?: string
}) {
  const [property, setProperty] =
    useState<PropertyInput>(initial)

  const update = (
    key: keyof PropertyInput,
    value: string | number
  ) => {
    setProperty({
      ...property,
      [key]: value,
    })
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(property)
      }}
      className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 md:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          City
          <select
            value={property.city}
            onChange={(event) =>
              update(
                'city',
                event.target.value as PropertyInput['city']
              )
            }
          >
            <option>Bangalore</option>
            <option>Mumbai</option>
            <option>New Delhi</option>
          </select>
        </label>

        <label>
          Locality
          <input
            value={property.locality}
            onChange={(event) =>
              update('locality', event.target.value)
            }
          />
        </label>

        <label>
          Area in sqft
          <input
            type="number"
            min="200"
            value={property.area}
            onChange={(event) =>
              update('area', +event.target.value)
            }
          />
        </label>

        <label>
          Bedrooms
          <select
            value={property.bedrooms}
            onChange={(event) =>
              update('bedrooms', +event.target.value)
            }
          >
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
          </select>
        </label>

        <label>
          Bathrooms
          <select
            value={property.bathrooms}
            onChange={(event) =>
              update('bathrooms', +event.target.value)
            }
          >
            <option>0</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
          </select>
        </label>

        <label>
          Balconies
          <select
            value={property.balconies}
            onChange={(event) =>
              update('balconies', +event.target.value)
            }
          >
            <option>0</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
          </select>
        </label>

        <label>
          Furnishing
          <select
            value={property.furnishing}
            onChange={(event) =>
              update(
                'furnishing',
                event.target.value as PropertyInput['furnishing']
              )
            }
          >
            <option>Furnished</option>
            <option>Semi-Furnished</option>
            <option>Unfurnished</option>
          </select>
        </label>

        <label>
          Property Type
          <select
            value={property.propertyType}
            onChange={(event) =>
              update(
                'propertyType',
                event.target.value as PropertyInput['propertyType']
              )
            }
          >
            <option>Flat</option>
            <option>House</option>
            <option>Villa</option>
          </select>
        </label>

        {showAsking && (
          <label>
            Asking Rent
            <input
              type="number"
              min="1"
              value={property.askingRent ?? ''}
              onChange={(event) =>
                update(
                  'askingRent',
                  +event.target.value
                )
              }
            />
          </label>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
      >
        {submitLabel}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  )
}


export function ExpectedRangeBar({
  evaluation,
}: {
  evaluation: Evaluation
}) {
  const span = Math.max(
    evaluation.upperBound - evaluation.lowerBound,
    1
  )

  const position = Math.min(
    94,
    Math.max(
      6,
      (
        (evaluation.askingRent - evaluation.lowerBound)
        / span
      ) * 100
    )
  )

  return (
    <div className="rounded-xl border border-border bg-card p-5 md:p-6">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            Expected rent range
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Based on validation-calibrated market signals
          </p>
        </div>

        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {evaluation.status}
        </span>
      </div>

      <div className="relative pt-5">
        <div className="h-2 rounded-full bg-secondary">
          <div className="h-2 w-[58%] rounded-full bg-primary/70" />
        </div>

        <div
          className="absolute top-0 -translate-x-1/2"
          style={{
            left: `${position}%`,
          }}
        >
          <div className="mx-auto size-3 rounded-full border-2 border-card bg-primary ring-2 ring-primary/20" />
          <p className="mt-2 whitespace-nowrap text-xs font-semibold">
            Asking {formatINR(evaluation.askingRent)}
          </p>
        </div>
      </div>

      <div className="mt-12 flex justify-between text-xs text-muted-foreground">
        <span>
          {formatINR(evaluation.lowerBound)}
          <br />
          <span className="text-[10px]">
            Lower bound
          </span>
        </span>

        <span className="text-center">
          {formatINR(evaluation.estimatedRent)}
          <br />
          <span className="text-[10px]">
            Fair rent
          </span>
        </span>

        <span className="text-right">
          {formatINR(evaluation.upperBound)}
          <br />
          <span className="text-[10px]">
            Upper bound
          </span>
        </span>
      </div>
    </div>
  )
}


export function ValueScoreCard({
  evaluation,
}: {
  evaluation: Evaluation
}) {
  const scores = [
    [
      'Price Fairness',
      evaluation.priceFairness,
      '55%',
    ],
    [
      'Accessibility',
      evaluation.accessibility.score,
      '25%',
    ],
    [
      'Market Position',
      evaluation.marketPosition,
      '20%',
    ],
  ] as const

  return (
    <section className="rounded-xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium">
            Value for money
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            A weighted decision score
          </p>
        </div>

        <div className="text-right">
          <strong className="text-3xl tracking-tight text-primary">
            {evaluation.valueScore.toFixed(1)}
          </strong>
          <span className="text-sm text-muted-foreground">
            {' '}/ 10
          </span>
          <p className="text-xs text-muted-foreground">
            {evaluation.valueLabel}
          </p>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-5">
        {scores.map(([label, score, weight]) => (
          <div key={label}>
            <div className="mb-2 flex justify-between text-xs">
              <span>{label}</span>
              <span className="text-muted-foreground">
                {Number(score).toFixed(2)}
                <span className="ml-2 text-[10px]">
                  {weight}
                </span>
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-secondary">
              <div
                className="h-1.5 rounded-full bg-primary"
                style={{
                  width: `${Math.min(
                    Number(score) * 10,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}


export function PropertyPreview() {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-5 shadow-[0_24px_80px_-40px_rgba(20,35,25,0.35)] md:p-7">
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Property valuation
          </p>
          <h2 className="mt-2 text-xl font-medium">
            Whitefield, Bangalore
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            2 BHK · 1,200 sqft · Semi-Furnished
          </p>
        </div>

        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Fair Value
        </span>
      </div>

      <div className="grid grid-cols-2 gap-5 border-y border-border py-5">
        <div>
          <p className="text-xs text-muted-foreground">
            Asking rent
          </p>
          <p className="mt-1 text-xl font-semibold">
            ₹55,000
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            TrueEstate estimate
          </p>
          <p className="mt-1 text-xl font-semibold text-primary">
            ₹45,661
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Expected range
          </p>
          <p className="mt-1 text-sm font-medium">
            ₹31,024 – ₹60,247
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-foreground">
            Value score
          </p>
          <p className="mt-1 text-lg font-semibold text-primary">
            6.7
            <span className="text-xs font-normal text-muted-foreground">
              {' '}/ 10
            </span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-primary" />
        Accessibility intelligence included
        <strong className="ml-auto font-semibold text-foreground">
          9.44 / 10
        </strong>
      </div>
    </div>
  )
}


export function RecommendationCard({
  item,
  index,
}: {
  item: Recommendation
  index: number
}) {
  const specificityLabel =
    item.source === 'locality_bed'
      ? 'High Data Specificity'
      : item.source === 'locality'
        ? 'Medium Data Specificity'
        : 'Fallback Estimate'

  return (
    <article
      className={`rounded-xl border bg-card p-5 ${
        index === 0
          ? 'border-primary/40 shadow-sm'
          : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-muted text-sm font-semibold text-primary">
            #{index + 1}
          </span>

          <div>
            <h3 className="font-medium">
              {item.locality}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.match}% match · {specificityLabel}
            </p>
          </div>
        </div>

        <div className="text-right">
          <strong className="text-xl text-primary">
            {item.match}%
          </strong>
          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Match Score
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-y border-border py-4 text-sm">
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">
            Est. rent
          </p>
          <p className="mt-1 font-medium">
            {formatINR(item.estimatedRent)}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase text-muted-foreground">
            Rate
          </p>
          <p className="mt-1 font-medium">
            ₹{item.rate}/sqft
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase text-muted-foreground">
            Access
          </p>
          <p className="mt-1 font-medium">
            {item.accessibility.score.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          'Fits Budget',
          item.accessibility.score > 9
            ? 'Excellent Accessibility'
            : 'Good Accessibility',
          specificityLabel,
        ].map((label) => (
          <span
            key={label}
            className="rounded-full bg-muted px-2.5 py-1 text-[10px] text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
        {item.reasons.map((reason) => (
          <li
            key={reason}
            className="flex gap-2"
          >
            <Check className="size-3.5 shrink-0 text-primary" />
            {reason}
          </li>
        ))}
      </ul>
    </article>
  )
}


export {
  defaultProperty,
  formatINR,
}
