'use client'

import { useState } from 'react'
import AuthGuard from '@/components/auth-guard'
import {
  Check,
  Plus,
  Trash2,
} from 'lucide-react'

import {
  Navbar,
  Footer,
  PageHeader,
  PropertyForm,
  MetricCard,
  AccessibilityPanel,
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
  ComparisonProperty,
  PropertyInput,
} from '@/lib/types'


type Winner = {
  propertyId: number
  city: string
  locality: string
  valueScore: number
  valueLabel: string
  reasons: string[]
}


export default function ComparePage() {
  const [items, setItems] =
    useState<PropertyInput[]>([
      {
        ...defaultProperty,
        locality: 'Andheri East',
        city: 'Mumbai',
        area: 1000,
        askingRent: 60000,
      },
      {
        ...defaultProperty,
        locality: 'Whitefield',
        city: 'Bangalore',
        area: 1200,
        askingRent: 45000,
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


  const add = () => {
    if (items.length >= 3) {
      return
    }

    setItems([
      ...items,
      {
        ...defaultProperty,
        city: 'New Delhi',
        locality: 'Saket',
        area: 1200,
        bedrooms: 3,
        bathrooms: 3,
        balconies: 2,
        askingRent: 45000,
      },
    ])

    setResults(null)
    setWinner(null)
  }


  const remove = (
    index: number
  ) => {
    if (items.length <= 2) {
      return
    }

    setItems(
      items.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    )

    setResults(null)
    setWinner(null)
  }


  const saveProperty = (
    index: number,
    property: PropertyInput
  ) => {
    setItems(
      items.map(
        (item, itemIndex) =>
          itemIndex === index
            ? property
            : item
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

      const mappedResults:
        ComparisonProperty[] =
        response.comparison.map(
          (
            item: any,
            index: number
          ) => {
            const original =
              items[
                item.property_id - 1
              ]

            const location =
              locationResponses[
                index
              ]?.location_intelligence

            return {
              ...original,

              propertyId:
                item.property_id,

              rank:
                item.comparison_rank,

              city:
                item.city,

              locality:
                item.locality,

              area:
                item.area,

              bedrooms:
                item.beds,

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
                  item.expected_range
                    .lower
                )} – ${formatINR(
                  item.expected_range
                    .upper
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
            }
          }
        )

      setResults(mappedResults)

      setWinner({
        propertyId:
          response.best_choice
            .property_id,

        city:
          response.best_choice.city,

        locality:
          response.best_choice.locality,

        valueScore:
          response.best_choice
            .value_score,

        valueLabel:
          response.best_choice
            .value_label,

        reasons:
          response.best_choice
            .reasons,
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


  return (
    <AuthGuard>
      <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <PageHeader
          eyebrow="Compare properties"
          title="Put the shortlist side by side."
          description="Compare fair rent, price position, accessibility, and overall value before you choose."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {items.map(
            (item, index) => (
              <div
                key={index}
                className="relative"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Property {index + 1}
                  </p>

                  {items.length > 2 && (
                    <button
                      type="button"
                      aria-label={`Remove property ${
                        index + 1
                      }`}
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        remove(index)
                      }
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                <PropertyForm
                  initial={item}
                  onSubmit={(property) =>
                    saveProperty(
                      index,
                      property
                    )
                  }
                  submitLabel="Save Property"
                />
              </div>
            )
          )}

          {items.length < 3 && (
            <button
              type="button"
              onClick={add}
              className="flex min-h-40 items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <Plus className="size-4" />
              Add Property
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={compare}
          disabled={loading}
          className="mt-8 h-11 w-full rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? 'Comparing Properties…'
            : `Compare ${items.length} Properties`}
        </button>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {results && winner && (
          <section className="mt-16">
            <div className="mb-8 rounded-2xl bg-primary p-7 text-primary-foreground md:p-10">
              <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
                Best overall choice
              </p>

              <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight">
                    {winner.locality},{' '}
                    {winner.city}
                  </h2>

                  <p className="mt-2 text-sm text-primary-foreground/75">
                    Ranked #1 by TrueEstate's
                    value-for-money analysis
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <strong className="text-4xl">
                    {winner.valueScore.toFixed(
                      2
                    )}
                  </strong>

                  <span className="ml-1 text-sm text-primary-foreground/70">
                    / 10
                  </span>

                  <p className="text-xs text-primary-foreground/75">
                    {winner.valueLabel}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 text-sm text-primary-foreground/80">
                {winner.reasons.map(
                  (reason) => (
                    <p
                      key={reason}
                      className="flex gap-2"
                    >
                      <Check className="size-4 shrink-0" />
                      {reason}
                    </p>
                  )
                )}
              </div>
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className="p-4 font-medium text-muted-foreground">
                      Metric
                    </th>

                    {results.map(
                      (property) => (
                        <th
                          key={
                            property.propertyId
                          }
                          className={`p-4 font-medium ${
                            property.rank === 1
                              ? 'text-primary'
                              : ''
                          }`}
                        >
                          {property.locality}
                          <br />
                          <span className="text-xs font-normal text-muted-foreground">
                            Rank #
                            {property.rank}
                          </span>
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {[
                    [
                      'Asking Rent',
                      (
                        property:
                          ComparisonProperty
                      ) =>
                        formatINR(
                          property.askingRent ??
                            0
                        ),
                    ],
                    [
                      'Fair Rent',
                      (
                        property:
                          ComparisonProperty
                      ) =>
                        formatINR(
                          property.fairRent
                        ),
                    ],
                    [
                      'Expected Range',
                      (
                        property:
                          ComparisonProperty
                      ) =>
                        property.expectedRange,
                    ],
                    [
                      'Price Status',
                      (
                        property:
                          ComparisonProperty
                      ) =>
                        property.status,
                    ],
                    [
                      'Predicted ₹/sqft',
                      (
                        property:
                          ComparisonProperty
                      ) =>
                        `₹${property.predictedRate}`,
                    ],
                    [
                      'Locality Market Rate',
                      (
                        property:
                          ComparisonProperty
                      ) =>
                        `₹${property.localityRate}`,
                    ],
                    [
                      'Accessibility',
                      (
                        property:
                          ComparisonProperty
                      ) =>
                        `${property.accessibility.score}/10`,
                    ],
                    [
                      'Value Score',
                      (
                        property:
                          ComparisonProperty
                      ) =>
                        `${property.valueScore}/10`,
                    ],
                    [
                      'Price Fairness',
                      (
                        property:
                          ComparisonProperty
                      ) =>
                        `${property.priceFairness}/10`,
                    ],
                    [
                      'Market Position',
                      (
                        property:
                          ComparisonProperty
                      ) =>
                        `${property.marketPosition}/10`,
                    ],
                    [
                      'Overall Rank',
                      (
                        property:
                          ComparisonProperty
                      ) =>
                        `#${property.rank}`,
                    ],
                  ].map(
                    ([label, getValue]) => (
                      <tr
                        key={label as string}
                        className="border-b border-border last:border-0"
                      >
                        <td className="p-4 text-muted-foreground">
                          {label as string}
                        </td>

                        {results.map(
                          (property) => (
                            <td
                              key={
                                property.propertyId
                              }
                              className={`p-4 ${
                                property.rank ===
                                1
                                  ? 'font-semibold text-primary'
                                  : ''
                              }`}
                            >
                              {(
                                getValue as (
                                  property:
                                    ComparisonProperty
                                ) => string
                              )(property)}
                            </td>
                          )
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 md:hidden">
              {results.map(
                (property) => (
                  <div
                    key={
                      property.propertyId
                    }
                    className={`rounded-xl border bg-card p-5 ${
                      property.rank === 1
                        ? 'border-primary/40'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">
                          #{property.rank}{' '}
                          ·{' '}
                          {
                            property.locality
                          }
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {property.city}
                        </p>
                      </div>

                      <span className="text-primary">
                        {
                          property.valueScore
                        }
                        /10
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                      <MetricCard
                        label="Asking rent"
                        value={formatINR(
                          property.askingRent ??
                            0
                        )}
                      />

                      <MetricCard
                        label="Fair rent"
                        value={formatINR(
                          property.fairRent
                        )}
                        accent
                      />

                      <MetricCard
                        label="Accessibility"
                        value={`${property.accessibility.score}/10`}
                      />

                      <MetricCard
                        label="Price status"
                        value={
                          property.status
                        }
                      />
                    </div>

                    <div className="mt-4">
                      <AccessibilityPanel
                        data={
                          property.accessibility
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
      </>
    </AuthGuard>
  )
}
