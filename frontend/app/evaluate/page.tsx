'use client'

import { useState } from 'react'
import AuthGuard from '@/components/auth-guard'

import {
  Navbar,
  Footer,
  PageHeader,
  PropertyForm,
  MetricCard,
  ExpectedRangeBar,
  ValueScoreCard,
  AccessibilityPanel,
} from '@/components/true-estate'

import {
  evaluateProperty,
  analyzeLocation,
} from '@/lib/api'

import type {
  Evaluation,
  PropertyInput,
} from '@/lib/types'


function buildInterpretation(result: Evaluation) {
  const pricePart =
    result.status === 'Above Expected Range'
      ? 'This listing is priced above TrueEstate’s expected market range.'
      : result.status === 'Below Expected Range'
        ? 'This listing is priced below TrueEstate’s expected market range.'
        : 'This listing is priced within TrueEstate’s expected market range.'

  const accessibilityPart =
    result.accessibility.score >= 9
      ? 'Accessibility is excellent.'
      : result.accessibility.score >= 8
        ? 'Accessibility is strong.'
        : 'Accessibility is moderate.'

  const marketPart =
    result.marketPosition >= 8
      ? 'The asking rate compares favorably with the locality benchmark.'
      : result.marketPosition >= 5
        ? 'The asking rate is reasonably aligned with the locality benchmark.'
        : 'The asking rate is expensive relative to the locality benchmark.'

  return `${pricePart} ${accessibilityPart} ${marketPart}`
}


export default function EvaluatePage() {
  const [result, setResult] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (property: PropertyInput) => {
    if (property.askingRent === undefined) {
      setError('Please enter the asking rent.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [evaluationResponse, locationResponse] =
        await Promise.all([
          evaluateProperty(property),
          analyzeLocation(
            property.city,
            property.locality
          ),
        ])

      const valuation = evaluationResponse.valuation
      const market = evaluationResponse.market_intelligence
      const value = evaluationResponse.value_analysis
      const location =
        locationResponse.location_intelligence

      const mappedResult: Evaluation = {
        estimatedRent:
          valuation.fair_rent,

        predictedRate:
          market.predicted_rate_per_sqft,

        localityRate:
          market.locality_market_rate,

        bedroomRate:
          market.locality_bed_market_rate,

        accessibility: {
          score:
            market.accessibility_score,

          hospital:
            location?.hospital_km ?? 0,

          school:
            location?.school_km ?? 0,

          mall:
            location?.mall_km ?? 0,

          transit:
            location?.station_km ?? 0,
        },

        askingRent:
          valuation.asking_rent,

        difference:
          valuation.price_difference,

        differencePercent:
          valuation.price_difference_pct,

        status:
          valuation.price_status,

        lowerBound:
          valuation.expected_range.lower,

        upperBound:
          valuation.expected_range.upper,

        valueScore:
          value.value_score,

        valueLabel:
          value.value_label,

        priceFairness:
          value.components.price_fairness,

        marketPosition:
          value.components.market_position,

        askingRate:
          value.asking_rate_per_sqft,

        interpretation: '',
      }

      mappedResult.interpretation =
        buildInterpretation(mappedResult)

      setResult(mappedResult)
    } catch (err) {
      setResult(null)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to evaluate this property.'
      )
    } finally {
      setLoading(false)
    }
  }

  const differenceValue = result
    ? `${result.difference >= 0 ? '+' : '-'}₹${Math.abs(
        result.difference
      ).toLocaleString('en-IN')}`
    : ''

  const differenceDetail = result
    ? `${result.differencePercent >= 0 ? '+' : ''}${result.differencePercent.toFixed(
        2
      )}% ${
        result.differencePercent >= 0
          ? 'above estimate'
          : 'below estimate'
      }`
    : ''

  return (
    <AuthGuard>
      <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <PageHeader
          eyebrow="Evaluate a listing"
          title="Is this property actually worth the asking rent?"
          description="Get the full picture before you negotiate or commit: fair rent, expected range, value-for-money, and locality intelligence."
        />

        <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr]">
          <div>
            <PropertyForm
              onSubmit={submit}
              submitLabel={
                loading
                  ? 'Evaluating…'
                  : 'Evaluate Listing'
              }
            />

            {error && (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              We never replace your judgment. We make the
              signals behind it easier to understand.
            </p>
          </div>

          {result ? (
            <div className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard
                  label="Asking rent"
                  value={`₹${result.askingRent.toLocaleString(
                    'en-IN'
                  )}`}
                />

                <MetricCard
                  label="TrueEstate fair rent"
                  value={`₹${result.estimatedRent.toLocaleString(
                    'en-IN'
                  )}`}
                  accent
                />

                <MetricCard
                  label="Difference"
                  value={differenceValue}
                  detail={differenceDetail}
                />
              </div>

              <ExpectedRangeBar
                evaluation={result}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <ValueScoreCard
                  evaluation={result}
                />

                <AccessibilityPanel
                  data={result.accessibility}
                />
              </div>

              <section className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm font-medium">
                  Market intelligence
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                  {[
                    [
                      'Predicted rate',
                      `₹${result.predictedRate}/sqft`,
                    ],
                    [
                      'Asking rate',
                      `₹${result.askingRate}/sqft`,
                    ],
                    [
                      'Locality market',
                      `₹${result.localityRate}/sqft`,
                    ],
                    [
                      'Locality + BHK',
                      `₹${result.bedroomRate}/sqft`,
                    ],
                    [
                      'Accessibility',
                      `${result.accessibility.score}/10`,
                    ],
                    [
                      'Position',
                      result.status,
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-1 font-medium">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="border-l-2 border-primary/50 px-5 py-1 text-sm leading-7 text-muted-foreground">
                {result.interpretation}
              </div>
            </div>
          ) : (
            <div className="grid min-h-[520px] place-items-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
              <div>
                <h2 className="font-medium">
                  Your valuation dashboard will appear here
                </h2>

                <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                  Add the asking rent to unlock the full
                  TrueEstate analysis.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      </>
    </AuthGuard>
  )
}
