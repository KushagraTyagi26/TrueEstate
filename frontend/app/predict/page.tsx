'use client'

import { useState } from 'react'
import AuthGuard from '@/components/auth-guard'

import {
  Navbar,
  Footer,
  PageHeader,
  PropertyForm,
  MetricCard,
  AccessibilityPanel,
} from '@/components/true-estate'

import {
  predictRent,
  analyzeLocation,
} from '@/lib/api'

import type {
  Prediction,
  PropertyInput,
} from '@/lib/types'


export default function PredictPage() {
  const [result, setResult] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (property: PropertyInput) => {
    setLoading(true)
    setError(null)

    try {
      const [predictionResponse, locationResponse] =
        await Promise.all([
          predictRent(property),
          analyzeLocation(
            property.city,
            property.locality
          ),
        ])

      const location =
        locationResponse.location_intelligence

      const mappedResult: Prediction = {
        estimatedRent:
          predictionResponse.predicted_monthly_rent,

        predictedRate:
          predictionResponse.predicted_rate_per_sqft,

        localityRate:
          predictionResponse.locality_market_rate,

        bedroomRate:
          predictionResponse.locality_bed_market_rate,

        accessibility: {
          score:
            predictionResponse.accessibility_score,

          hospital:
            location?.hospital_km ?? 0,

          school:
            location?.school_km ?? 0,

          mall:
            location?.mall_km ?? 0,

          transit:
            location?.station_km ?? 0,
        },
      }

      setResult(mappedResult)
    } catch (err) {
      setResult(null)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to estimate rent.'
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
          eyebrow="Estimate rent"
          title="Find the fair monthly rent for a property."
          description="Start with the basics. TrueEstate uses property, locality, and accessibility signals to create a grounded rental estimate."
        />

        <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr]">
          <div>
            <PropertyForm
              showAsking={false}
              onSubmit={submit}
              submitLabel={
                loading
                  ? 'Estimating…'
                  : 'Estimate Monthly Rent'
              }
            />

            {error && (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              TrueEstate estimates are decision-support insights
              based on historical property and market data.
            </p>
          </div>

          {result ? (
            <div className="flex flex-col gap-5">
              <MetricCard
                label="Estimated monthly rent"
                value={`₹${result.estimatedRent.toLocaleString(
                  'en-IN'
                )}`}
                detail="Your strongest starting point"
                accent
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard
                  label="Predicted rate"
                  value={`₹${result.predictedRate}/sqft`}
                />

                <MetricCard
                  label="Locality market rate"
                  value={`₹${result.localityRate}/sqft`}
                />

                <MetricCard
                  label="Locality + BHK rate"
                  value={`₹${result.bedroomRate}/sqft`}
                />
              </div>

              <AccessibilityPanel
                data={result.accessibility}
              />
            </div>
          ) : (
            <div className="grid min-h-[360px] place-items-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
              <div>
                <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-muted text-primary">
                  ₹
                </div>

                <h2 className="font-medium">
                  Your estimate will appear here
                </h2>

                <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                  Enter property details to see fair rent,
                  market rates, and accessibility.
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
