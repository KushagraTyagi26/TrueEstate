'use client'

import { useState } from 'react'
import AuthGuard from '@/components/auth-guard'
import { Navbar, Footer, PageHeader, PropertyForm, AccessibilityPanel } from '@/components/true-estate'
import { predictRent, analyzeLocation } from '@/lib/api'
import type { Prediction, PropertyInput } from '@/lib/types'
import { Building2 } from 'lucide-react'

export default function PredictPage() {
  const [result, setResult] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (property: PropertyInput) => {
    setLoading(true); setError(null)
    try {
      const [predictionResponse, locationResponse] = await Promise.all([
        predictRent(property), analyzeLocation(property.city, property.locality),
      ])
      const location = locationResponse.location_intelligence
      setResult({
        estimatedRent: predictionResponse.predicted_monthly_rent,
        predictedRate: predictionResponse.predicted_rate_per_sqft,
        localityRate: predictionResponse.locality_market_rate,
        bedroomRate: predictionResponse.locality_bed_market_rate,
        accessibility: {
          score: predictionResponse.accessibility_score,
          hospital: location?.hospital_km ?? 0,
          school: location?.school_km ?? 0,
          mall: location?.mall_km ?? 0,
          transit: location?.station_km ?? 0,
        },
      })
    } catch (err) {
      setResult(null); setError(err instanceof Error ? err.message : 'Unable to estimate rent.')
    } finally { setLoading(false) }
  }

  const lower = result ? Math.round(result.estimatedRent * .9) : 0
  const upper = result ? Math.round(result.estimatedRent * 1.1) : 0

  return (
    <AuthGuard>
      <>
        <Navbar />
        <main className="mx-auto max-w-[1536px] px-6 py-6 lg:px-12 lg:py-8">
          <PageHeader
            title="Find the fair monthly rent for a property."
            description="Enter the details and get AI-powered rent estimate along with market & accessibility insights."
          />
          <div className="grid items-start gap-8 lg:grid-cols-[460px_1fr]">
            <div>
              <PropertyForm
                showAsking={false}
                onSubmit={submit}
                submitLabel={loading ? 'Estimating…' : 'Estimate Monthly Rent'}
              />
              {error && (
                <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm font-semibold text-destructive">
                  {error}
                </div>
              )}
            </div>

            {result ? (
              <div className="flex flex-col gap-6">
                <section className="relative overflow-hidden rounded-3xl bg-[#0f5132] p-8 text-white shadow-xl md:p-10">
                  <Building2 className="absolute -bottom-4 right-6 size-36 text-white/[.045]" />
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-base font-semibold text-white/85">
                        Estimated Monthly Rent
                      </p>
                      <p className="mt-3 text-5xl font-extrabold tracking-tight md:text-6xl">
                        ₹{result.estimatedRent.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span className="rounded-xl bg-[#5f8e4f] px-4 py-2 text-sm font-bold shadow-sm">
                      Fair Value
                    </span>
                  </div>
                  <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-white/65">Expected Range</p>
                      <p className="mt-1 text-lg font-bold">
                        ₹{lower.toLocaleString('en-IN')} – ₹{upper.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs text-white/65">Predicted Rate</p>
                      <p className="mt-1 text-lg font-bold">
                        ₹{result.predictedRate} / sq ft
                      </p>
                    </div>
                  </div>
                </section>

                <div className="grid gap-5 sm:grid-cols-3">
                  {[
                    ['Locality Market Rate', `₹${result.localityRate} / sq ft`],
                    ['Locality + BHK Rate', `₹${result.bedroomRate} / sq ft`],
                    ['Accessibility Score', `${result.accessibility.score.toFixed(2)} / 10`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                    >
                      <p className="text-sm font-medium text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-2 text-2xl font-extrabold text-primary">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
                <AccessibilityPanel data={result.accessibility} />
              </div>
            ) : (
              <div className="grid min-h-[580px] place-items-center rounded-3xl border-2 border-dashed border-border bg-card/70 p-10 text-center shadow-sm">
                <div>
                  <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-primary/10 text-2xl font-extrabold text-primary shadow-sm">
                    ₹
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Your estimate will appear here
                  </h2>
                  <p className="mt-3 max-w-md text-base sm:text-lg leading-relaxed text-muted-foreground">
                    Enter property details to see fair rent, market rates, and accessibility.
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
