'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  ArrowRight,
  Check,
  ChevronDown,
  GraduationCap,
  Hospital,
  House,
  Menu,
  LogOut,
  Search,
  ShoppingBag,
  Sparkles,
  Train,
  UserPlus,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LOCALITIES_BY_CITY } from '@/lib/localities'

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

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase()
    }
    if (parts.length === 1) {
      return parts[0][0].toUpperCase()
    }
  }
  if (email && email.trim()) {
    const emailPrefix = email.split('@')[0]
    const parts = emailPrefix.split(/[._-]/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return emailPrefix.substring(0, 2).toUpperCase()
  }
  return 'TE'
}

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setSigningOut(true)

    try {
      await supabase.auth.signOut()
      setOpen(false)
      setUserMenuOpen(false)
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

  const initials = getInitials(userName, userEmail)

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="relative mx-auto flex h-20 max-w-full items-center justify-between px-6 lg:px-12">
        <Link
          href="/"
          className="z-10 flex items-center gap-3 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          onClick={() => {
            setOpen(false)
            setUserMenuOpen(false)
          }}
        >
          <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 sm:size-12">
            <House className="size-6 sm:size-7" />
          </span>
          <span className="font-serif-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            TrueEstate
          </span>
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-4 lg:gap-8 md:flex">
          {links.map(([label, href]) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`text-base lg:text-lg font-semibold transition-all duration-200 ${
                  isActive
                    ? 'rounded-full bg-primary px-5 py-2.5 text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                    : 'rounded-full px-4 py-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="relative z-10 hidden items-center md:flex" ref={menuRef}>
          {!authLoading && userEmail ? (
            <>
              <button
                type="button"
                aria-label="User menu"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="grid size-11 cursor-pointer place-items-center rounded-full bg-primary font-bold text-base text-primary-foreground shadow-md ring-2 ring-primary/20 transition-all hover:scale-105 hover:ring-primary/50 select-none"
              >
                {initials}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-border/80 bg-card p-2 shadow-2xl backdrop-blur z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="border-b border-border/60 px-3.5 py-3">
                    <p className="truncate text-sm font-bold text-foreground">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>

                  <div className="pt-1.5 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false)
                        router.push('/signup')
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <UserPlus className="size-4 text-primary" />
                      <span>Add Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={signingOut}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                    >
                      <LogOut className="size-4" />
                      <span>{signingOut ? 'Signing out…' : 'Logout'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : !authLoading ? (
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
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
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-2 border-t border-border px-6 py-4 md:hidden">
          {links.map(([label, href]) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-base font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {label}
              </Link>
            )
          })}

          {!authLoading && userEmail ? (
            <div className="mt-3 border-t border-border pt-4">
              <div className="mb-4 flex items-center gap-3 px-3">
                <span className="grid size-11 place-items-center rounded-full bg-primary font-bold text-base text-primary-foreground shadow-md">
                  {initials}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-base font-bold">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    router.push('/signup')
                  }}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold transition hover:bg-muted"
                >
                  <UserPlus className="size-4 text-primary" />
                  Add Account
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={signingOut}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-60"
                >
                  <LogOut className="size-4" />
                  {signingOut ? 'Signing out…' : 'Logout'}
                </button>
              </div>
            </div>
          ) : !authLoading ? (
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
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
  eyebrow?: string
  title: string
  description: string
}) {
  return (
    <div className="mb-6 max-w-full">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
      )}

      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[42px] whitespace-nowrap">
        {title}
      </h1>

      <p className="mt-2 text-base sm:text-lg text-muted-foreground">
        {description}
      </p>
    </div>
  )
}


function formatDistance(km: number) {
  if (km < 0.1) {
    return '< 100 m'
  }

  return `${km.toFixed(2)} km`
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
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_14px_40px_-34px_rgba(23,77,58,.35)]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Accessibility</h2>
          <p className="mt-1 text-xs text-muted-foreground">Nearby essentials and transit</p>
        </div>
        <strong className="whitespace-nowrap text-2xl font-semibold tracking-tight text-primary">
          {data.score.toFixed(2)}
          <span className="ml-1 text-sm font-normal text-muted-foreground">/ 10</span>
        </strong>
      </div>

      <div className="grid gap-4">
        {items.map(([Icon, label, value]) => (
          <div key={label} className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f0f3ec] text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-0.5 text-base font-semibold text-foreground">{formatDistance(value)}</p>
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
  showTitle = true,
  onSubmit,
  submitLabel = 'Analyze Property',
}: {
  initial?: PropertyInput
  showAsking?: boolean
  showTitle?: boolean
  onSubmit: (property: PropertyInput) => void
  submitLabel?: string
}) {
  const [property, setProperty] = useState<PropertyInput>(initial)
  const [localityOpen, setLocalityOpen] = useState(false)
  const [localitySearch, setLocalitySearch] = useState('')

  const localities = LOCALITIES_BY_CITY[property.city] ?? []
  const filteredLocalities = localities.filter((locality) =>
    locality.toLowerCase().includes(localitySearch.trim().toLowerCase())
  )

  const update = (key: keyof PropertyInput, value: string | number) => {
    setProperty({ ...property, [key]: value })
  }

  const fieldClass = 'h-13 rounded-2xl border border-input bg-[#fffefa] px-4 text-base font-semibold transition focus:border-primary focus:ring-2 focus:ring-primary/10'

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(property)
      }}
      className="rounded-[28px] border border-border bg-card p-8 shadow-xl md:p-10"
    >
      {showTitle && (
        <h2 className="mb-6 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Property Details
        </h2>
      )}

      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        <label className="text-sm font-bold text-foreground">
          City
          <select
            className={fieldClass}
            value={property.city}
            onChange={(event) => {
              const nextCity = event.target.value as PropertyInput['city']
              setProperty((current) => ({
                ...current,
                city: nextCity,
                locality: LOCALITIES_BY_CITY[nextCity]?.[0] ?? '',
              }))
              setLocalitySearch('')
              setLocalityOpen(false)
            }}
          >
            <option>Bangalore</option>
            <option>Mumbai</option>
            <option>New Delhi</option>
          </select>
        </label>

        <label className="text-sm font-bold text-foreground">
          Locality
          <div
            className="relative"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setLocalityOpen(false)
                setLocalitySearch('')
              }
            }}
          >
            <button
              type="button"
              onClick={() => setLocalityOpen((current) => !current)}
              className={`${fieldClass} flex w-full items-center justify-between text-left`}
            >
              <span className="truncate">{property.locality || 'Select locality'}</span>
              <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${localityOpen ? 'rotate-180' : ''}`} />
            </button>

            {localityOpen && (
              <div className="absolute left-0 top-full z-[80] mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <div className="border-b border-border p-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      autoFocus
                      type="text"
                      value={localitySearch}
                      onChange={(event) => setLocalitySearch(event.target.value)}
                      placeholder={`Search ${property.city} localities...`}
                      className="h-10 w-full rounded-lg border border-input bg-[#fffefa] pl-9 pr-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {filteredLocalities.length > 0 ? filteredLocalities.map((locality) => (
                    <button
                      key={locality}
                      type="button"
                      onClick={() => {
                        update('locality', locality)
                        setLocalityOpen(false)
                        setLocalitySearch('')
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-muted ${property.locality === locality ? 'bg-primary/5 font-medium text-primary' : 'text-foreground'}`}
                    >
                      <span className="truncate">{locality}</span>
                      {property.locality === locality && <Check className="size-4 shrink-0" />}
                    </button>
                  )) : (
                    <p className="px-3 py-4 text-center text-sm text-muted-foreground">No localities found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </label>

        <label className="text-sm font-bold text-foreground">
          Property Type
          <select className={fieldClass} value={property.propertyType} onChange={(event) => update('propertyType', event.target.value as PropertyInput['propertyType'])}>
            <option>Flat</option><option>House</option><option>Villa</option>
          </select>
        </label>

        <label className="text-sm font-bold text-foreground">
          Area (sq ft)
          <input className={fieldClass} type="number" min="200" value={property.area} onChange={(event) => update('area', +event.target.value)} />
        </label>

        <label className="text-sm font-bold text-foreground">
          Bedrooms
          <select className={fieldClass} value={property.bedrooms} onChange={(event) => update('bedrooms', +event.target.value)}>
            <option>1</option><option>2</option><option>3</option><option>4</option>
          </select>
        </label>

        <label className="text-sm font-bold text-foreground">
          Bathrooms
          <select className={fieldClass} value={property.bathrooms} onChange={(event) => update('bathrooms', +event.target.value)}>
            <option>0</option><option>1</option><option>2</option><option>3</option><option>4</option>
          </select>
        </label>

        <label className="text-sm font-bold text-foreground">
          Balconies
          <select className={fieldClass} value={property.balconies} onChange={(event) => update('balconies', +event.target.value)}>
            <option>0</option><option>1</option><option>2</option><option>3</option>
          </select>
        </label>

        <label className="text-sm font-bold text-foreground sm:col-span-2">
          Furnishing
          <select className={fieldClass} value={property.furnishing} onChange={(event) => update('furnishing', event.target.value as PropertyInput['furnishing'])}>
            <option>Furnished</option><option>Semi-Furnished</option><option>Unfurnished</option>
          </select>
        </label>

        {showAsking && (
          <label className="text-sm font-bold text-foreground sm:col-span-2">
            Asking Rent (Monthly)
            <input className={fieldClass} type="number" min="1" value={property.askingRent ?? ''} onChange={(event) => update('askingRent', +event.target.value)} />
          </label>
        )}
      </div>

      <Button type="submit" className="mt-8 h-13 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-md transition hover:bg-[#123f30]">
        {submitLabel}<ArrowRight className="size-5" />
      </Button>
    </form>
  )
}


export function ExpectedRangeBar({
  evaluation,
}: {
  evaluation: Evaluation
}) {
  const span = Math.max(evaluation.upperBound - evaluation.lowerBound, 1)
  const clamp = (n: number) => Math.min(96, Math.max(4, n))
  const fairPosition = clamp(((evaluation.estimatedRent - evaluation.lowerBound) / span) * 100)
  const askingPosition = clamp(((evaluation.askingRent - evaluation.lowerBound) / span) * 100)
  const askingAboveFair = evaluation.askingRent > evaluation.estimatedRent

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_14px_40px_-34px_rgba(23,77,58,.35)]">
      <h2 className="text-lg font-semibold tracking-[-0.02em]">Expected Rent Range</h2>

      <div className="mt-7 grid grid-cols-3 text-sm">
        <div>
          <p className="font-semibold">{formatINR(evaluation.lowerBound)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Lower Bound</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">{formatINR(evaluation.estimatedRent)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Fair Rent</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{formatINR(evaluation.upperBound)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Upper Bound</p>
        </div>
      </div>

      <div className="relative mt-4 h-[86px]">
        <div className="absolute left-0 right-0 top-2 h-2 rounded-full bg-[#e8e9e3]" />
        <div className="absolute left-0 top-2 h-2 rounded-full bg-[#17613e] transition-[width] duration-700 ease-out" style={{ width: `${fairPosition}%` }} />
        {askingAboveFair ? (
          <div className="absolute top-2 h-2 rounded-r-full bg-[#df2b23] transition-all duration-700 ease-out" style={{ left: `${askingPosition}%`, right: 0 }} />
        ) : (
          <div className="absolute left-0 top-2 h-2 rounded-l-full bg-[#17613e] transition-all duration-700 ease-out" style={{ width: `${askingPosition}%` }} />
        )}

        <div className="absolute top-0 -translate-x-1/2 transition-all duration-700 ease-out" style={{ left: `${fairPosition}%` }}>
          <span className="block size-5 rounded-full border-[4px] border-card bg-[#17613e] shadow-[0_0_0_1px_rgba(23,97,62,.2)]" />
        </div>

        <div className="absolute top-0 -translate-x-1/2 transition-all duration-700 ease-out" style={{ left: `${askingPosition}%` }}>
          <div className="mx-auto h-12 border-l-2 border-dashed border-[#df2b23]" />
          <div className="mt-1 -translate-x-1/2 whitespace-nowrap text-center text-[#d8231a]">
            <p className="text-base font-bold">{formatINR(evaluation.askingRent)}</p>
            <p className="text-xs font-semibold">Asking Rent</p>
          </div>
        </div>
      </div>
    </section>
  )
}


export function ValueScoreCard({
  evaluation,
}: {
  evaluation: Evaluation
}) {
  const score = Math.max(0, Math.min(10, evaluation.valueScore))
  const labelTone = score >= 8 ? 'text-[#17613e]' : score >= 6 ? 'text-[#b77700]' : 'text-[#c9382d]'
  const description = evaluation.status === 'Above Expected Range'
    ? 'This listing is priced above the expected market range.'
    : evaluation.status === 'Below Expected Range'
      ? 'This listing is priced below the expected market range.'
      : 'This listing is priced close to the expected market range.'

  const metrics = [
    ['Price Fairness', evaluation.priceFairness, 'text-[#d92d20]'],
    ['Market Position', evaluation.marketPosition, 'text-[#b77700]'],
    ['Accessibility', evaluation.accessibility.score, 'text-[#17613e]'],
  ] as const

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_14px_40px_-34px_rgba(23,77,58,.35)]">
      <div className="p-6">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">Value Score</h2>

        <div className="mt-6 grid items-center gap-7 md:grid-cols-[190px_1fr]">
          <div className="flex justify-center">
            <div className="relative grid size-[166px] place-items-center rounded-full" style={{ background: 'conic-gradient(#17613e 0deg 108deg, #6f9a78 108deg 190deg, #a9c3ad 190deg 260deg, #f0d279 260deg 360deg)' }}>
              <div className="absolute inset-[12px] rounded-full bg-card" />
              <div className="relative text-center">
                <strong className="block text-4xl font-semibold tracking-[-0.04em] text-[#174d3a]">{score.toFixed(1)}</strong>
                <span className="text-base text-foreground">/10</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-xl font-semibold ${labelTone}`}>{evaluation.valueLabel}</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-foreground">{description}</p>

            <div className="mt-7">
              <div className="h-2 rounded-full bg-[#e7e7e2]">
                <div className="h-2 rounded-full bg-gradient-to-r from-[#e02016] via-[#e6b44b] to-[#17613e] transition-[width] duration-700" style={{ width: `${score * 10}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                <span>Poor 0</span><span>Average 5</span><span>Excellent 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-border bg-[#fffefa]">
        {metrics.map(([label, value, tone], index) => (
          <div key={label} className={`px-4 py-4 text-center ${index > 0 ? 'border-l border-border' : ''}`}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`mt-1 text-xl font-semibold ${tone}`}>{Number(value).toFixed(1)}<span className="ml-1 text-sm font-normal text-foreground">/ 10</span></p>
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

