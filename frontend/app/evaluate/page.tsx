'use client'

import { useState } from 'react'
import AuthGuard from '@/components/auth-guard'

import {
  Navbar,
  Footer,
  PropertyForm,
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

  const statusStyle = result
    ? result.status === 'Above Expected Range'
      ? 'bg-[#fde7e2] text-[#d92d20]'
      : result.status === 'Below Expected Range'
        ? 'bg-[#e2f0e7] text-[#17613e]'
        : 'bg-[#e3ede7] text-[#17613e]'
    : ''

  return (
    <AuthGuard>
      <>
        <Navbar />

        <main className="mx-auto max-w-[1500px] px-5 pb-16 pt-8 lg:px-8 lg:pb-20 lg:pt-10">
          <div className="mb-7 max-w-full">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              
            </p>

            <h1
              className="mt-4 whitespace-nowrap text-[40px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#17231e] md:text-[48px] lg:text-[54px]"
              style={{
                fontFamily:
                  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Is this property actually worth the asking rent?
            </h1>

            <p className="mt-4 whitespace-nowrap text-sm leading-6 text-[#59645e]">
              
            </p>
          </div>

          <div className="grid items-start gap-5 xl:grid-cols-[408px_minmax(0,1fr)_370px]">
            <div>
              <PropertyForm
                onSubmit={submit}
                submitLabel={loading ? 'Evaluating…' : 'Evaluate Listing'}
              />

              {error && (
                <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>

            {result ? (
              <>
                <div className="flex min-w-0 flex-col gap-5">
                  <section className="rounded-2xl border border-border bg-card p-6 shadow-[0_14px_40px_-34px_rgba(23,77,58,.35)]">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-sm text-foreground">Fair Rent (Estimated)</p>
                        <p className="mt-2 text-[34px] font-semibold leading-none tracking-[-0.035em] text-primary">
                          ₹{result.estimatedRent.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <span className={`rounded-xl px-3 py-1.5 text-sm font-medium ${statusStyle}`}>
                        {result.status === 'Above Expected Range'
                          ? 'Overpriced'
                          : result.status === 'Below Expected Range'
                            ? 'Good Deal'
                            : 'Within Expected Range'}
                      </span>
                    </div>

                    <div className="mt-7 grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-xs text-muted-foreground">Expected Range</p>
                        <p className="mt-2 text-base font-semibold">
                          ₹{result.lowerBound.toLocaleString('en-IN')} – ₹{result.upperBound.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Difference</p>
                        <p className={`mt-2 text-base font-semibold ${result.difference > 0 ? 'text-[#d92d20]' : 'text-[#17613e]'}`}>
                          {differenceValue} ({result.differencePercent >= 0 ? '+' : ''}{result.differencePercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  </section>

                  <ValueScoreCard evaluation={result} />
                  <ExpectedRangeBar evaluation={result} />
                </div>

                <div className="flex min-w-0 flex-col gap-5">
                  <AccessibilityPanel data={result.accessibility} />

                  <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_14px_40px_-34px_rgba(23,77,58,.35)]">
                    <div className="border-b border-border px-6 py-5">
                      <h2 className="text-lg font-semibold tracking-[-0.02em]">Market Intelligence</h2>
                    </div>

                    <div className="grid grid-cols-2">
                      {[
                        ['Predicted Rate', `₹${result.predictedRate} / sq ft`, ''],
                        ['Asking Rate', `₹${result.askingRate} / sq ft`, ''],
                        ['Locality Market Rate', `₹${result.localityRate} / sq ft`, ''],
                        ['Locality + BHK Rate', `₹${result.bedroomRate} / sq ft`, ''],
                        ['Accessibility Score', `${result.accessibility.score.toFixed(2)} / 10`, 'text-[#17613e]'],
                        ['Price Position', result.status === 'Above Expected Range' ? 'Overpriced' : result.status === 'Below Expected Range' ? 'Good Deal' : 'Within Expected Range', result.status === 'Above Expected Range' ? 'text-[#e02219]' : 'text-[#17613e]'],
                      ].map(([label, value, tone], index) => (
                        <div key={label} className={`min-h-[92px] px-6 py-5 ${index >= 2 ? 'border-t border-border' : ''} ${index % 2 === 1 ? 'border-l border-border' : ''}`}>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className={`mt-2 text-base font-semibold leading-5 ${tone}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </>
            ) : (
              <div className="xl:col-span-2 grid min-h-[560px] place-items-center rounded-2xl border border-dashed border-border bg-card/55 p-8 text-center">
                <div>
                  <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-accent text-primary">₹</div>
                  <h2 className="font-medium">Your valuation dashboard will appear here</h2>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                    Add the asking rent to unlock the full TrueEstate analysis.
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
