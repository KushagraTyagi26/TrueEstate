'use client'

import { useMemo, useState } from 'react'
import AuthGuard from '@/components/auth-guard'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CirclePlus,
  Hospital,
  Landmark,
  MapPin,
  School,
  TrainFront,
  Trash2,
} from 'lucide-react'

import {
  Navbar,
  Footer,
} from '@/components/true-estate'

import {
  compareProperties,
  analyzeLocation,
} from '@/lib/api'

import {
  defaultProperty,
  formatINR,
} from '@/lib/types'

import type {
  City,
  ComparisonProperty,
  PropertyInput,
} from '@/lib/types'

import { LOCALITIES_BY_CITY } from '@/lib/localities'

type Winner = {
  propertyId: number
  city: string
  locality: string
  valueScore: number
  valueLabel: string
  reasons: string[]
}


const cities: City[] = ['Bangalore', 'Mumbai', 'New Delhi']

function statusStyle(status: string) {
  const normalized = status.toLowerCase()

  if (
    normalized.includes('over') ||
    normalized.includes('above')
  ) {
    return {
      text: 'text-[#b43d32]',
      badge:
        'border-[#efc8c2] bg-[#fae7e3] text-[#a83d33]',
      panel: 'bg-[#fff0eb]',
    }
  }

  if (
    normalized.includes('under') ||
    normalized.includes('below')
  ) {
    return {
      text: 'text-[#17613e]',
      badge:
        'border-[#c6dfcf] bg-[#e3f0e7] text-[#17613e]',
      panel: 'bg-[#edf5ef]',
    }
  }

  return {
    text: 'text-[#17613e]',
    badge:
      'border-[#c7decf] bg-[#e5f0e8] text-[#17613e]',
    panel: 'bg-[#eef4e9]',
  }
}

function formatDistance(km: number) {
  if (km < 0.1) return '< 100 m'
  return `${km.toFixed(1)} km`
}

function CompactPropertyEditor({
  property,
  index,
  onChange,
  onRemove,
  removable,
}: {
  property: PropertyInput
  index: number
  onChange: (next: PropertyInput) => void
  onRemove: () => void
  removable: boolean
}) {
  const localities =
    LOCALITIES_BY_CITY[property.city] ?? []

  const set = <K extends keyof PropertyInput>(
    key: K,
    value: PropertyInput[K]
  ) => {
    onChange({
      ...property,
      [key]: value,
    })
  }

  const changeCity = (city: City) => {
    const nextLocalities =
      LOCALITIES_BY_CITY[city] ?? []

    onChange({
      ...property,
      city,
      locality:
        nextLocalities[0] ??
        defaultProperty.locality,
    })
  }

  return (
    <div className="relative min-w-0 rounded-2xl border border-[#d8d6cc] bg-[#fffefa] p-6 shadow-[0_10px_30px_-28px_rgba(34,48,40,.45)]" >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[15px] font-bold text-[#17231e]">
          Property {index + 1}
        </p>

        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md p-1 text-[#8a938d] transition hover:bg-[#f4f1e9] hover:text-[#a54438]"
            aria-label={`Remove property ${index + 1}`}
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>

      <div className="grid gap-2">
        <select
          value={property.city}
          onChange={(event) =>
            changeCity(
              event.target.value as City
            )
          }
          className="h-11 rounded-xl px-3 text-sm font-medium"
        >
          {cities.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>

        <select
          value={property.locality}
          onChange={(event) =>
            set('locality', event.target.value)
          }
          className="h-11 rounded-xl px-3 text-sm font-medium"
        >
          {localities.map((locality) => (
            <option key={locality} value={locality}>
              {locality}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-3 gap-2">
          <label className="gap-2 text-[11px] font-bold text-[#17231e]">
            Area
            <input
              type="number"
              min={200}
              value={property.area}
              onChange={(event) =>
                set(
                  'area',
                  Number(event.target.value)
                )
              }
              className="h-10 rounded-lg px-3 text-sm font-medium"
            />
          </label>

          <label className="gap-2 text-[11px] font-bold text-[#17231e]">
            BHK
            <select
              value={property.bedrooms}
              onChange={(event) =>
                set(
                  'bedrooms',
                  Number(event.target.value)
                )
              }
              className="h-10 rounded-lg px-3 text-sm font-medium"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label className="gap-2 text-[11px] font-bold text-[#17231e]">
            Rent
            <input
              type="number"
              min={0}
              value={property.askingRent ?? 0}
              onChange={(event) =>
                set(
                  'askingRent',
                  Number(event.target.value)
                )
              }
              className="h-10 rounded-lg px-3 text-sm font-medium"
            />
          </label>
        </div>

        <details className="group mt-1">
          <summary className="cursor-pointer text-[11px] font-bold text-primary" >
            More property details
          </summary>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="gap-2 text-[11px] font-bold text-[#17231e]">
              Bathrooms
              <select
                value={property.bathrooms}
                onChange={(event) =>
                  set(
                    'bathrooms',
                    Number(event.target.value)
                  )
                }
                className="h-10 rounded-lg px-3 text-sm font-medium"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <label className="gap-2 text-[11px] font-bold text-[#17231e]">
              Balconies
              <select
                value={property.balconies}
                onChange={(event) =>
                  set(
                    'balconies',
                    Number(event.target.value)
                  )
                }
                className="h-10 rounded-lg px-3 text-sm font-medium"
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <label className="col-span-2 gap-2 text-[11px] font-bold text-[#17231e]">
              Furnishing
              <select
                value={property.furnishing}
                onChange={(event) =>
                  set(
                    'furnishing',
                    event.target
                      .value as PropertyInput['furnishing']
                  )
                }
                className="h-10 rounded-lg px-3 text-sm font-medium"
              >
                <option>Unfurnished</option>
                <option>Semi-Furnished</option>
                <option>Furnished</option>
              </select>
            </label>
          </div>
        </details>
      </div>
    </div>
  )
}

export default function ComparePage() {
  const [items, setItems] =
    useState<PropertyInput[]>([
      {
        ...defaultProperty,
        city: 'Bangalore',
        locality: 'Whitefield',
        area: 1200,
        bedrooms: 2,
        bathrooms: 2,
        balconies: 1,
        askingRent: 55000,
      },
      {
        ...defaultProperty,
        city: 'Bangalore',
        locality: 'HSR Layout',
        area: 1100,
        bedrooms: 2,
        bathrooms: 2,
        balconies: 1,
        askingRent: 52000,
      },
      {
        ...defaultProperty,
        city: 'Bangalore',
        locality: 'Koramangala',
        area: 1150,
        bedrooms: 2,
        bathrooms: 2,
        balconies: 1,
        askingRent: 65000,
      },
    ])

  const [results, setResults] =
    useState<ComparisonProperty[] | null>(null)

  const [winner, setWinner] =
    useState<Winner | null>(null)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const update = (
    index: number,
    property: PropertyInput
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? property : item
      )
    )
    setResults(null)
    setWinner(null)
  }

  const add = () => {
    if (items.length >= 3) return

    const city: City = 'Bangalore'
    const locality =
      LOCALITIES_BY_CITY[city]?.[0] ??
      'Whitefield'

    setItems((current) => [
      ...current,
      {
        ...defaultProperty,
        city,
        locality,
        askingRent: 45000,
      },
    ])
    setResults(null)
    setWinner(null)
  }

  const remove = (index: number) => {
    if (items.length <= 2) return
    setItems((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    )
    setResults(null)
    setWinner(null)
  }

  const compare = async () => {
    setLoading(true)
    setError(null)

    try {
      const response =
        await compareProperties(items)

      const locationResponses =
        await Promise.all(
          response.comparison.map(
            (item: any) =>
              analyzeLocation(
                item.city,
                item.locality
              )
          )
        )

      const mappedResults: any[] =
        response.comparison.map(
          (item: any, index: number) => {
            const original =
              items[item.property_id - 1]

            const location =
              locationResponses[index]
                ?.location_intelligence

            return {
              ...original,
              propertyId:
                item.property_id,
              rank:
                item.comparison_rank,
              city: item.city,
              locality: item.locality,
              area: item.area,
              bedrooms: item.beds,
              askingRent:
                item.asking_rent,
              fairRent:
                item.fair_rent,
              valueScore:
                item.value_score,
              valueLabel:
                item.value_label,
              priceFairness:
                item.value_components
                  .price_fairness,
              marketPosition:
                item.value_components
                  .market_position,
              status:
                item.price_status,
              expectedRange:
                `${formatINR(
                  item.expected_range.lower
                )} – ${formatINR(
                  item.expected_range.upper
                )}`,
              accessibility: {
                score:
                  item.accessibility_score,
                hospital:
                  location?.hospital_km ?? 0,
                school:
                  location?.school_km ?? 0,
                mall:
                  location?.mall_km ?? 0,
                transit:
                  location?.station_km ?? 0,
              },
              predictedRate:
                item.predicted_rate_per_sqft,
              localityRate:
                item.locality_market_rate,
              difference:
                item.asking_rent -
                item.fair_rent,
              differencePercent:
                item.fair_rent
                  ? ((item.asking_rent -
                      item.fair_rent) /
                      item.fair_rent) *
                    100
                  : 0,
            }
          }
        )

      setResults(
        mappedResults as ComparisonProperty[]
      )

      setWinner({
        propertyId:
          response.best_choice.property_id,
        city:
          response.best_choice.city,
        locality:
          response.best_choice.locality,
        valueScore:
          response.best_choice.value_score,
        valueLabel:
          response.best_choice.value_label,
        reasons:
          response.best_choice.reasons ?? [],
      })
    } catch (err) {
      setResults(null)
      setWinner(null)
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to compare these properties.'
      )
    } finally {
      setLoading(false)
    }
  }

  const bestIndex = useMemo(() => {
    if (!results || !winner) return -1
    return results.findIndex(
      (property: any) =>
        property.propertyId ===
        winner.propertyId
    )
  }, [results, winner])

  return (
    <AuthGuard>
      <>
        <Navbar />

        <main className="min-h-screen bg-[#f7f5ef] pb-16">
          <section className="mx-auto max-w-[1380px] px-5 pt-8 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl px-1 pb-7 pt-4">
              <div className="max-w-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  
                </p>

                <h1
                  className="mt-4 whitespace-nowrap text-[42px] font-semibold leading-[1.04] tracking-[-0.045em] text-[#17231e] md:text-[52px] lg:text-[58px]"
                  style={{
                    fontFamily:
                      'Arial Rounded MT Bold, Inter, ui-sans-serif, system-ui, sans-serif',
                  }}
                >
                  Compare properties side-by-side
                </h1>

                <p className="mt-4 whitespace-nowrap text-sm leading-6 text-[#59645e]">
                  
                </p>
              </div>
            </div>

            <section className="rounded-[24px] border border-[#d8d6cc] bg-[#fcfbf7] p-7 shadow-[0_20px_55px_-38px_rgba(34,48,40,.45)] md:p-9" >
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#17231e]">
                  Select Properties to Compare
                </h2>

                <button
                  type="button"
                  onClick={compare}
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-bold text-white shadow-sm transition hover:bg-[#103d2e] disabled:cursor-not-allowed disabled:opacity-60" 
                >
                  {loading
                    ? 'Comparing…'
                    : 'Compare Now'}
                  {!loading && (
                    <ArrowRight className="size-3.5" />
                  )}
                </button>
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                {items.map((item, index) => (
                  <CompactPropertyEditor
                    key={index}
                    property={item}
                    index={index}
                    onChange={(next) =>
                      update(index, next)
                    }
                    onRemove={() =>
                      remove(index)
                    }
                    removable={
                      items.length > 2
                    }
                  />
                ))}

                {items.length < 3 && (
                  <button
                    type="button"
                    onClick={add}
                    className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#c9c7bc] bg-[#fffefa] text-sm font-bold text-[#17231e] transition hover:border-primary hover:bg-[#f4f7f2] hover:text-primary" 
                  >
                    <CirclePlus className="size-5" />
                    Add Property
                  </button>
                )}
              </div>

              {error && (
                <div className="mt-4 rounded-lg border border-[#e6bbb4] bg-[#faece9] p-3 text-xs text-[#a54438]">
                  {error}
                </div>
              )}
            </section>

            {results && winner ? (
              <div className="mt-5">
                <div className="grid gap-4 md:grid-cols-3">
                  {results.map(
                    (property: any, index) => {
                      const style =
                        statusStyle(
                          property.status
                        )

                      return (
                        <article
                          key={
                            property.propertyId
                          }
                          className={`rounded-[22px] border bg-[#fcfbf7] shadow-[0_16px_45px_-40px_rgba(34,48,40,.5)] ${
                            index === bestIndex
                              ? 'border-[#9fbd9f]'
                              : 'border-[#dfddd3]'
                          }`}
                        >
                          <div className="p-6">
                            <div className="mb-5 flex items-center justify-between gap-3">
                              <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-white shadow-sm">
                                {index + 1}
                              </span>

                              {index === bestIndex && (
                                <span className="rounded-full bg-[#e6f0e7] px-3 py-1.5 text-[10px] font-bold text-primary">
                                  Best Overall
                                </span>
                              )}
                            </div>

                            <h3 className="text-[22px] font-bold tracking-[-0.02em] text-[#17231e]">
                              {property.locality},{' '}
                              {property.city}
                            </h3>

                            <p className="mt-1 text-[11px] font-medium text-[#68756e]">
                              {
                                property.bedrooms
                              }{' '}
                              BHK · {property.area}{' '}
                              sq ft
                            </p>

                            <p className="mt-4 text-[24px] font-bold text-[#17231e]">
                              {formatINR(
                                property.askingRent ??
                                  0
                              )}
                            </p>
                            <p className="text-[11px] font-semibold text-[#68756e]">
                              Asking Rent
                            </p>

                            <div
                              className={`mt-5 flex items-end justify-between gap-4 rounded-2xl p-4 ${style.panel}`}
                            >
                              <div>
                                <p className="text-[15px] font-bold text-primary">
                                  {formatINR(
                                    property.fairRent
                                  )}
                                </p>
                                <p className="text-[10px] font-medium text-[#68756e]">
                                  Fair Rent (Est.)
                                </p>
                              </div>

                              <span
                                className={`text-right text-[9px] font-semibold ${style.text}`}
                              >
                                {property.status}
                              </span>
                            </div>
                          </div>
                        </article>
                      )
                    }
                  )}
                </div>

                <section className="mt-5 overflow-hidden rounded-2xl border border-[#dfddd3] bg-[#fcfbf7] shadow-[0_16px_45px_-42px_rgba(34,48,40,.45)]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left text-[12px]" >
                      <thead>
                        <tr className="border-b border-[#e4e2d9] bg-[#faf9f4]">
                          <th className="w-[27%] px-5 py-4 text-[14px] font-bold text-[#17231e]" >
                            Comparison Overview
                          </th>

                          {results.map(
                            (
                              property: any
                            ) => (
                              <th
                                key={
                                  property.propertyId
                                }
                                className="px-5 py-4 text-[13px] font-bold text-primary"
                              >
                                {
                                  property.locality
                                }
                              </th>
                            )
                          )}
                        </tr>
                      </thead>

                      <tbody>
                        {[
                          {
                            label:
                              'Asking Rent',
                            icon: Building2,
                            value: (
                              p: any
                            ) =>
                              formatINR(
                                p.askingRent ??
                                  0
                              ),
                          },
                          {
                            label:
                              'Fair Rent (Estimated)',
                            icon: Landmark,
                            value: (
                              p: any
                            ) =>
                              formatINR(
                                p.fairRent
                              ),
                          },
                          {
                            label:
                              'Difference',
                            icon: MapPin,
                            value: (
                              p: any
                            ) => {
                              const diff =
                                p.difference ??
                                (p.askingRent ??
                                  0) -
                                  p.fairRent
                              const pct =
                                p.differencePercent ??
                                (p.fairRent
                                  ? (diff /
                                      p.fairRent) *
                                    100
                                  : 0)

                              return `${diff >= 0 ? '+' : ''}${formatINR(
                                diff
                              )} (${pct >= 0 ? '+' : ''}${pct.toFixed(
                                2
                              )}%)`
                            },
                            semantic: true,
                          },
                          {
                            label:
                              'Predicted Rate',
                            icon: Landmark,
                            value: (
                              p: any
                            ) =>
                              `₹${Number(
                                p.predictedRate
                              ).toFixed(
                                2
                              )} / sq ft`,
                          },
                          {
                            label:
                              'Accessibility Score',
                            icon: Hospital,
                            value: (
                              p: any
                            ) =>
                              `${Number(
                                p.accessibility
                                  .score
                              ).toFixed(
                                2
                              )} / 10`,
                          },
                          {
                            label:
                              'Value Score',
                            icon: CheckCircle2,
                            value: (
                              p: any
                            ) =>
                              `${Number(
                                p.valueScore
                              ).toFixed(
                                1
                              )} / 10`,
                          },
                          {
                            label:
                              'Price Position',
                            icon: Landmark,
                            value: (
                              p: any
                            ) => p.status,
                            status: true,
                          },
                          {
                            label:
                              'Nearest Metro (approx.)',
                            icon: TrainFront,
                            value: (
                              p: any
                            ) =>
                              formatDistance(
                                p.accessibility
                                  .transit
                              ),
                          },
                        ].map((row) => (
                          <tr
                            key={row.label}
                            className="border-b border-[#eceae2] last:border-0"
                          >
                            <td className="px-5 py-4 font-semibold text-[#2f3c35]">
                              <span className="flex items-center gap-2">
                                <row.icon className="size-3.5 text-primary" />
                                {row.label}
                              </span>
                            </td>

                            {results.map(
                              (
                                property: any
                              ) => {
                                const value =
                                  row.value(
                                    property
                                  )
                                const style =
                                  statusStyle(
                                    property.status
                                  )

                                return (
                                  <td
                                    key={
                                      property.propertyId
                                    }
                                    className={`px-5 py-4 font-semibold ${
                                      row.status
                                        ? style.text
                                        : row.semantic &&
                                            property.difference >
                                              0
                                          ? 'text-[#b43d32]'
                                          : 'text-[#17231e]'
                                    }`}
                                  >
                                    {value}
                                  </td>
                                )
                              }
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="m-3 flex items-center gap-3 rounded-xl border border-[#c9ddcf] bg-[#eef5ef] px-4 py-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#ddebe0] text-primary">
                      <CheckCircle2 className="size-4" />
                    </span>

                    <p className="text-xs text-[#274a3a]">
                      <strong>
                        {winner.locality}
                      </strong>{' '}
                      offers the strongest overall
                      combination of value and
                      accessibility in this comparison.
                    </p>
                  </div>
                </section>

                {winner.reasons.length > 0 && (
                  <section className="mt-6 rounded-[28px] bg-primary px-8 py-7 text-white shadow-[0_20px_50px_-30px_rgba(23,77,58,.65)]">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[18px] font-bold">
                          Why {winner.locality} ranks first
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                          {winner.reasons
                            .slice(0, 3)
                            .map((reason) => (
                              <span
                                key={reason}
                                className="flex items-center gap-1.5 text-[10px] text-white/75"
                              >
                                <CheckCircle2 className="size-3" />
                                {reason}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="shrink-0 text-left md:text-right">
                        <strong className="text-2xl">
                          {winner.valueScore.toFixed(
                            1
                          )}
                        </strong>
                        <span className="text-xs text-white/70">
                          {' '}
                          / 10
                        </span>
                        <p className="text-[10px] text-white/70">
                          {winner.valueLabel}
                        </p>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <div className="mt-5 grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-[#d4d2ca] bg-[#fcfbf7]/60 p-8 text-center">
                <div>
                  <Building2 className="mx-auto size-7 text-primary/60" />
                  <p className="mt-3 text-sm font-semibold">
                    Your property comparison will
                    appear here
                  </p>
                  <p className="mt-2 max-w-md text-xs leading-5 text-[#68756e]">
                    Configure two or three properties
                    above, then click Compare Now to
                    see fair-rent, value and
                    accessibility differences.
                  </p>
                </div>
              </div>
            )}
          </section>
        </main>

        <Footer />
      </>
    </AuthGuard>
  )
}
