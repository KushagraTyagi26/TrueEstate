'use client'

import { useState } from 'react'
import AuthGuard from '@/components/auth-guard'
import { ArrowUpDown } from 'lucide-react'

import {
  Navbar,
  Footer,
  PageHeader,
  RecommendationCard,
} from '@/components/true-estate'

import {
  recommendLocalities,
  type RecommendationRequest,
} from '@/lib/api'

import type {
  City,
  Recommendation,
} from '@/lib/types'


function sortRecommendations(
  items: Recommendation[],
  sort: string
) {
  return [...items].sort((a, b) => {
    if (sort === 'Lowest Estimated Rent') {
      return a.estimatedRent - b.estimatedRent
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
    useState(30000)

  const [budgetMax, setBudgetMax] =
    useState(50000)

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
            locality:
              item.locality,

            match:
              Math.round(
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

            source:
              item.rate_source,

            reasons:
              item.reasons,
          })
        )

      setResults(
        sortRecommendations(
          mapped,
          sort
        )
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


  return (
    <AuthGuard>
      <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <PageHeader
          eyebrow="Find your locality"
          title="Discover where your budget works hardest."
          description="Tell us what matters in your next neighbourhood. We’ll rank localities using rent, accessibility, and market data specificity."
        />

        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <form
              onSubmit={submit}
              className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 md:p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                <label>
                  City
                  <select
                    value={city}
                    onChange={(event) =>
                      setCity(
                        event.target.value as City
                      )
                    }
                  >
                    <option>Bangalore</option>
                    <option>Mumbai</option>
                    <option>New Delhi</option>
                  </select>
                </label>

                <label>
                  Minimum Budget
                  <input
                    type="number"
                    min="0"
                    value={budgetMin}
                    onChange={(event) =>
                      setBudgetMin(
                        Number(
                          event.target.value
                        )
                      )
                    }
                  />
                </label>

                <label>
                  Maximum Budget
                  <input
                    type="number"
                    min="1"
                    value={budgetMax}
                    onChange={(event) =>
                      setBudgetMax(
                        Number(
                          event.target.value
                        )
                      )
                    }
                  />
                </label>

                <label>
                  Approximate Area
                  <input
                    type="number"
                    min="200"
                    value={area}
                    onChange={(event) =>
                      setArea(
                        Number(
                          event.target.value
                        )
                      )
                    }
                  />
                </label>

                <label>
                  Bedrooms
                  <select
                    value={bedrooms}
                    onChange={(event) =>
                      setBedrooms(
                        Number(
                          event.target.value
                        )
                      )
                    }
                  >
                    <option value={1}>
                      1
                    </option>

                    <option value={2}>
                      2
                    </option>

                    <option value={3}>
                      3
                    </option>

                    <option value={4}>
                      4
                    </option>
                  </select>
                </label>

                <label>
                  Priority
                  <select
                    value={priority}
                    onChange={(event) =>
                      setPriority(
                        event.target.value
                      )
                    }
                  >
                    <option>
                      Balanced
                    </option>

                    <option>
                      Transit
                    </option>

                    <option>
                      Hospitals
                    </option>

                    <option>
                      Schools
                    </option>

                    <option>
                      Malls
                    </option>
                  </select>
                </label>

                <label>
                  Number of Results
                  <select
                    value={topN}
                    onChange={(event) =>
                      setTopN(
                        Number(
                          event.target.value
                        )
                      )
                    }
                  >
                    <option value={3}>
                      3
                    </option>

                    <option value={5}>
                      5
                    </option>

                    <option value={10}>
                      10
                    </option>
                  </select>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? 'Finding Localities…'
                  : 'Find Suitable Localities'}
              </button>
            </form>

            {error && (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <div>
            {results.length > 0 ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {results.length}{' '}
                    localities matched your profile
                  </p>

                  <label className="flex flex-row items-center gap-2 text-xs">
                    <ArrowUpDown className="size-3.5" />

                    <select
                      className="h-8 w-auto border-0 bg-transparent p-0 text-xs"
                      value={sort}
                      onChange={(event) =>
                        changeSort(
                          event.target.value
                        )
                      }
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

                <div className="flex flex-col gap-4">
                  {results.map(
                    (item, index) => (
                      <RecommendationCard
                        key={`${item.locality}-${index}`}
                        item={item}
                        index={index}
                      />
                    )
                  )}
                </div>
              </>
            ) : (
              <div className="grid min-h-[420px] place-items-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                <div>
                  <p className="text-sm font-medium">
                    Your shortlist will appear here
                  </p>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                    Set your priorities and budget
                    to see ranked locality
                    recommendations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      </>
    </AuthGuard>
  )
}
