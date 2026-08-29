'use client'

import { useMemo, useState } from 'react'
import AuthGuard from '@/components/auth-guard'
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Hospital,
  MapPin,
  ShoppingBag,
  Sparkles,
  TrainFront,
} from 'lucide-react'

import {
  Navbar,
  Footer,
} from '@/components/true-estate'

import {
  recommendLocalities,
  type RecommendationRequest,
} from '@/lib/api'

import type {
  City,
  Recommendation,
} from '@/lib/types'

const localityImages = [
  'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1565018054866-968e244671af?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=85',
]

const priorities = [
  {
    label: 'Metro Access',
    value: 'Transit',
    icon: TrainFront,
    subtitle: 'Transit priority',
  },
  {
    label: 'Schools',
    value: 'Schools',
    icon: GraduationCap,
    subtitle: 'Education priority',
  },
  {
    label: 'Hospitals',
    value: 'Hospitals',
    icon: Hospital,
    subtitle: 'Healthcare priority',
  },
  {
    label: 'Shopping & Malls',
    value: 'Malls',
    icon: ShoppingBag,
    subtitle: 'Convenience priority',
  },
  {
    label: 'Balanced',
    value: 'Balanced',
    icon: MapPin,
    subtitle: 'Equal importance',
  },
]

function sortRecommendations(
  items: Recommendation[],
  sort: string
) {
  return [...items].sort((a, b) => {
    if (sort === 'Lowest Estimated Rent') {
      return (
        a.estimatedRent -
        b.estimatedRent
      )
    }

    if (sort === 'Best Accessibility') {
      return (
        b.accessibility.score -
        a.accessibility.score
      )
    }

    return b.match - a.match
  })
}

function distance(km: number) {
  if (km < 0.1) return '< 100 m'
  return `${km.toFixed(1)} km`
}

function matchScore(item: Recommendation) {
  const raw = Number(item.match) || 0
  return raw > 10 ? raw / 10 : raw
}

function Ring({
  score,
}: {
  score: number
}) {
  const safe = Math.max(
    0,
    Math.min(10, score)
  )

  return (
    <div
      className="relative grid size-[78px] place-items-center rounded-full"
      style={{
        background: `conic-gradient(#17613e ${safe * 10}%, #dce6dd 0)`,
      }}
    >
      <div className="grid size-[62px] place-items-center rounded-full bg-[#fcfbf7] text-center">
        <div>
          <strong className="text-[21px] leading-none text-primary">
            {safe.toFixed(1)}
          </strong>
          <p className="mt-0.5 text-[9px] text-[#6a756f]">
            /10
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RecommendPage() {
  const [results, setResults] =
    useState<Recommendation[]>([])

  const [sort, setSort] =
    useState('Best Match')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [city, setCity] =
    useState<City>('Bangalore')

  const [budgetMin, setBudgetMin] =
    useState(40000)

  const [budgetMax, setBudgetMax] =
    useState(60000)

  const [area, setArea] =
    useState(1200)

  const [bedrooms, setBedrooms] =
    useState(2)

  const [priority, setPriority] =
    useState('Balanced')

  const [topN, setTopN] =
    useState(5)

  const submit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (budgetMin > budgetMax) {
      setError(
        'Minimum budget cannot be greater than maximum budget.'
      )
      return
    }

    setLoading(true)
    setError(null)

    try {
      const request: RecommendationRequest = {
        city,
        budgetMin,
        budgetMax,
        area,
        bedrooms,
        priority,
        topN,
      }

      const response =
        await recommendLocalities(request)

      const mapped: Recommendation[] =
        response.recommendations.map(
          (item: any) => ({
            locality: item.locality,
            match: Math.round(
              item.match_score * 10
            ),
            estimatedRent:
              item.estimated_monthly_rent,
            rate:
              item.estimated_rate_per_sqft,
            accessibility: {
              score:
                item.accessibility_score,
              hospital:
                item.distances.hospital_km,
              school:
                item.distances.school_km,
              mall:
                item.distances.mall_km,
              transit:
                item.distances.station_km,
            },
            budgetFit:
              item.budget_fit_score,
            priorityScore:
              item.priority_score,
            specificity:
              item.data_specificity_score,
            source: item.rate_source,
            reasons:
              item.reasons ?? [],
          })
        )

      setResults(
        sortRecommendations(mapped, sort)
      )
    } catch (err) {
      setResults([])
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load locality recommendations.'
      )
    } finally {
      setLoading(false)
    }
  }

  const changeSort = (
    nextSort: string
  ) => {
    setSort(nextSort)
    setResults(
      sortRecommendations(
        results,
        nextSort
      )
    )
  }

  const best = useMemo(
    () => results[0] ?? null,
    [results]
  )

  return (
    <AuthGuard>
      <>
        <Navbar />

        <main className="min-h-screen bg-[#f7f5ef] pb-16">
          <section className="mx-auto max-w-[1380px] px-5 pt-8 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl px-1 pb-7 pt-4">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Recommendations
                </p>

                <h1 className="font-serif-display mt-4 max-w-xl text-4xl font-semibold tracking-[-0.035em] text-[#17231e] md:text-[44px] md:leading-[1.08]">
                  Discover localities that fit your
                  lifestyle and budget
                </h1>

                <p className="mt-4 max-w-lg text-sm leading-6 text-[#59645e]">
                  AI-powered locality recommendations
                  based on rent trends,
                  accessibility, and your
                  preferences.
                </p>
              </div>

              <div className="pointer-events-none absolute right-8 top-2 hidden h-[170px] w-[350px] lg:block">
                <div className="absolute bottom-3 left-0 right-0 h-14 rounded-[50%] bg-[#e2eadc]" />
                <div className="absolute bottom-7 left-8 h-14 w-12 rounded-t-lg border border-[#91ad8a] bg-[#d3e3cd]" />
                <div className="absolute bottom-7 right-10 h-16 w-14 rounded-t-lg border border-[#91ad8a] bg-[#d3e3cd]" />
                <MapPin className="absolute right-[125px] top-0 size-20 fill-primary text-primary drop-shadow-sm" />
              </div>
            </div>

            <form
              onSubmit={submit}
              className="rounded-2xl border border-[#dfddd3] bg-[#fcfbf7] p-5 shadow-[0_16px_45px_-38px_rgba(34,48,40,.45)] md:p-6"
            >
              <h2 className="text-sm font-semibold text-[#17231e]">
                Your Preferences
              </h2>

              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1.1fr_.8fr_auto]">
                <label className="gap-1.5 text-[10px] text-[#65716a]">
                  City
                  <select
                    value={city}
                    onChange={(event) =>
                      setCity(
                        event.target
                          .value as City
                      )
                    }
                    className="h-10 text-xs"
                  >
                    <option>Bangalore</option>
                    <option>Mumbai</option>
                    <option>New Delhi</option>
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="gap-1.5 text-[10px] text-[#65716a]">
                    Budget Min
                    <input
                      type="number"
                      min={0}
                      value={budgetMin}
                      onChange={(event) =>
                        setBudgetMin(
                          Number(
                            event.target.value
                          )
                        )
                      }
                      className="h-10 text-xs"
                    />
                  </label>

                  <label className="gap-1.5 text-[10px] text-[#65716a]">
                    Budget Max
                    <input
                      type="number"
                      min={1}
                      value={budgetMax}
                      onChange={(event) =>
                        setBudgetMax(
                          Number(
                            event.target.value
                          )
                        )
                      }
                      className="h-10 text-xs"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="gap-1.5 text-[10px] text-[#65716a]">
                    BHK
                    <select
                      value={bedrooms}
                      onChange={(event) =>
                        setBedrooms(
                          Number(
                            event.target.value
                          )
                        )
                      }
                      className="h-10 text-xs"
                    >
                      {[1, 2, 3, 4, 5].map(
                        (n) => (
                          <option
                            key={n}
                            value={n}
                          >
                            {n} BHK
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label className="gap-1.5 text-[10px] text-[#65716a]">
                    Area
                    <input
                      type="number"
                      min={200}
                      value={area}
                      onChange={(event) =>
                        setArea(
                          Number(
                            event.target.value
                          )
                        )
                      }
                      className="h-10 text-xs"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#103d2e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? 'Finding…'
                    : 'Find Recommendations'}
                  {!loading && (
                    <ArrowRight className="size-3.5" />
                  )}
                </button>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {priorities.map(
                  ({
                    label,
                    value,
                    icon: Icon,
                    subtitle,
                  }) => {
                    const active =
                      priority === value

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setPriority(value)
                        }
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                          active
                            ? 'border-[#9fbdab] bg-[#e8f0ea]'
                            : 'border-[#e0ded5] bg-[#fffefa] hover:border-[#bfd0c2]'
                        }`}
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#edf3ee] text-primary">
                          <Icon className="size-4" />
                        </span>

                        <span>
                          <strong className="block text-[11px] font-semibold text-[#2d3932]">
                            {label}
                          </strong>
                          <span className="mt-0.5 block text-[9px] text-[#78827c]">
                            {active
                              ? 'Selected'
                              : subtitle}
                          </span>
                        </span>
                      </button>
                    )
                  }
                )}
              </div>

              <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-[#68756e]">
                <span>Show</span>
                <select
                  value={topN}
                  onChange={(event) =>
                    setTopN(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="h-7 w-auto px-2 text-[10px]"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>
                    10
                  </option>
                </select>
                <span>recommendations</span>
              </div>

              {error && (
                <div className="mt-4 rounded-lg border border-[#e6bbb4] bg-[#faece9] p-3 text-xs text-[#a54438]">
                  {error}
                </div>
              )}
            </form>

            <div className="mt-5">
              {results.length > 0 ? (
                <>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-sm font-semibold text-[#17231e]">
                      Top Recommended Localities
                    </h2>

                    <label className="flex flex-row items-center gap-2 text-[10px] text-[#68756e]">
                      Sort by
                      <select
                        value={sort}
                        onChange={(event) =>
                          changeSort(
                            event.target.value
                          )
                        }
                        className="h-8 w-auto px-2 text-[10px]"
                      >
                        <option>
                          Best Match
                        </option>
                        <option>
                          Lowest Estimated Rent
                        </option>
                        <option>
                          Best Accessibility
                        </option>
                      </select>
                    </label>
                  </div>

                  <div className="flex flex-col gap-3">
                    {results.map(
                      (item, index) => {
                        const score =
                          matchScore(item)

                        return (
                          <article
                            key={`${item.locality}-${index}`}
                            className="grid gap-4 rounded-2xl border border-[#dfddd3] bg-[#fcfbf7] p-3 shadow-[0_16px_45px_-42px_rgba(34,48,40,.45)] md:grid-cols-[150px_1fr_auto] md:items-center"
                          >
                            <div className="relative h-36 overflow-hidden rounded-xl md:h-32">
                              <img
                                src={
                                  localityImages[
                                    index %
                                      localityImages.length
                                  ]
                                }
                                alt=""
                                className="h-full w-full object-cover"
                              />

                              <span className="absolute left-2 top-2 grid size-7 place-items-center rounded-lg bg-primary text-xs font-semibold text-white shadow">
                                {index + 1}
                              </span>
                            </div>

                            <div className="min-w-0 px-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#17231e]">
                                  {item.locality}
                                </h3>

                                {index === 0 && (
                                  <span className="rounded-full bg-[#e6f0e7] px-2.5 py-1 text-[9px] font-semibold text-primary">
                                    Best Match
                                  </span>
                                )}
                              </div>

                              <p className="mt-0.5 text-[10px] text-[#7a847e]">
                                {city}
                              </p>

                              <div className="mt-4 grid grid-cols-2 gap-y-3 sm:grid-cols-4">
                                <div className="border-r border-[#e8e6df] pr-3">
                                  <strong className="text-sm text-primary">
                                    ₹
                                    {Math.round(
                                      item.estimatedRent
                                    ).toLocaleString(
                                      'en-IN'
                                    )}
                                  </strong>
                                  <p className="mt-0.5 text-[9px] text-[#7a847e]">
                                    Est. Rent (
                                    {bedrooms} BHK)
                                  </p>
                                </div>

                                <div className="border-r border-[#e8e6df] px-3">
                                  <strong className="text-sm text-[#34413a]">
                                    {item.accessibility.score.toFixed(
                                      2
                                    )}{' '}
                                    / 10
                                  </strong>
                                  <p className="mt-0.5 text-[9px] text-[#7a847e]">
                                    Accessibility
                                  </p>
                                </div>

                                <div className="border-r border-[#e8e6df] px-3">
                                  <strong className="text-sm text-[#23724d]">
                                    {distance(
                                      item.accessibility
                                        .transit
                                    )}
                                  </strong>
                                  <p className="mt-0.5 text-[9px] text-[#7a847e]">
                                    Nearest Metro
                                  </p>
                                </div>

                                <div className="pl-3">
                                  <strong className="text-sm text-[#34413a]">
                                    {Number(
                                      item.priorityScore
                                    ).toFixed(
                                      1
                                    )}{' '}
                                    / 10
                                  </strong>
                                  <p className="mt-0.5 text-[9px] text-[#7a847e]">
                                    Priority Score
                                  </p>
                                </div>
                              </div>

                              <p className="mt-4 line-clamp-2 text-[10px] leading-5 text-[#68756e]">
                                {item.reasons?.[0] ??
                                  'Strong balance of rent, connectivity and daily conveniences.'}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-4 border-t border-[#eceae2] pt-3 md:block md:border-l md:border-t-0 md:pl-5 md:pr-3 md:pt-0">
                              <Ring score={score} />

                              <button
                                type="button"
                                className="mt-0 inline-flex h-8 items-center justify-center rounded-lg border border-[#9fbdab] px-3 text-[10px] font-semibold text-primary transition hover:bg-[#edf4ef] md:mt-3 md:w-full"
                              >
                                View Details
                              </button>
                            </div>
                          </article>
                        )
                      }
                    )}
                  </div>

                  {best && (
                    <section className="mt-4 flex flex-col gap-4 rounded-xl bg-primary px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10">
                          <Sparkles className="size-4" />
                        </span>

                        <div>
                          <p className="text-sm font-semibold">
                            {best.locality} is your
                            strongest match based on
                            the selected preferences.
                          </p>
                          <p className="mt-1 text-[10px] text-white/70">
                            {best.reasons?.[0] ??
                              'Strong accessibility, balanced rent and good market-data coverage.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 text-[10px] font-semibold text-primary"
                      >
                        View {best.locality} Details
                        <ArrowRight className="size-3" />
                      </button>
                    </section>
                  )}
                </>
              ) : (
                <div className="grid min-h-[320px] place-items-center rounded-2xl border border-dashed border-[#d4d2ca] bg-[#fcfbf7]/60 p-8 text-center">
                  <div>
                    <Building2 className="mx-auto size-7 text-primary/60" />
                    <p className="mt-3 text-sm font-semibold">
                      Your recommended localities will
                      appear here
                    </p>
                    <p className="mt-2 max-w-md text-xs leading-5 text-[#68756e]">
                      Choose your city, budget, BHK and
                      priority above, then run the
                      recommendation engine.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </>
    </AuthGuard>
  )
}
