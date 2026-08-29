'use client'

import { useState } from 'react'
import AuthGuard from '@/components/auth-guard'
import { Navbar, Footer, PropertyForm, AccessibilityPanel } from '@/components/true-estate'
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
    <AuthGuard><><Navbar />
      <main className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8 lg:py-12">
        <div className="mb-7 max-w-full">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Estimate Rent
          </p>

          <h1
            className="mt-4 whitespace-nowrap text-[40px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#17231e] md:text-[48px] lg:text-[54px]"
            style={{
              fontFamily:
                'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            Find the fair monthly rent for a property.
          </h1>

          <p className="mt-4 whitespace-nowrap text-sm leading-6 text-[#59645e]">
            Enter the details and get AI-powered rent estimate along with market & accessibility insights.
          </p>
        </div>
        <div className="grid items-start gap-7 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <div className="mb-3 text-sm font-semibold">Property Details</div>
            <PropertyForm showAsking={false} onSubmit={submit} submitLabel={loading ? 'Estimating…' : 'Estimate Monthly Rent'} />
            {error && <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
            <p className="mt-5 text-[11px] leading-5 text-muted-foreground">* Estimates are based on historical data and ML models.<br />Actual prices may vary.</p>
          </div>

          {result ? (
            <div className="flex flex-col gap-5">
              <section className="relative overflow-hidden rounded-2xl bg-[#0f5132] p-6 text-white shadow-[0_18px_45px_-30px_rgba(15,81,50,.7)] md:p-7">
                <Building2 className="absolute -bottom-4 right-6 size-28 text-white/[.045]" />
                <div className="flex items-start justify-between gap-5">
                  <div><p className="text-sm font-medium text-white/85">Estimated Monthly Rent</p><p className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">₹{result.estimatedRent.toLocaleString('en-IN')}</p></div>
                  <span className="rounded-lg bg-[#5f8e4f] px-3 py-1.5 text-xs font-semibold">Fair Value</span>
                </div>
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div><p className="text-[11px] text-white/65">Expected Range</p><p className="mt-1 text-base font-semibold">₹{lower.toLocaleString('en-IN')} – ₹{upper.toLocaleString('en-IN')}</p></div>
                  <div className="sm:text-right"><p className="text-[11px] text-white/65">Predicted Rate</p><p className="mt-1 text-base font-semibold">₹{result.predictedRate} / sq ft</p></div>
                </div>
              </section>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ['Locality Market Rate', `₹${result.localityRate} / sq ft`],
                  ['Locality + BHK Rate', `₹${result.bedroomRate} / sq ft`],
                  ['Accessibility Score', `${result.accessibility.score.toFixed(2)} / 10`],
                ].map(([label,value]) => <div key={label} className="rounded-xl border border-border bg-card p-5"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-lg font-semibold text-primary">{value}</p></div>)}
              </div>
              <AccessibilityPanel data={result.accessibility} />
            </div>
          ) : (
            <div className="grid min-h-[430px] place-items-center rounded-2xl border border-dashed border-border bg-card/55 p-8 text-center"><div><div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-muted text-primary">₹</div><h2 className="font-semibold">Your estimate will appear here</h2><p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">Enter property details to see fair rent, market rates, and accessibility.</p></div></div>
          )}
        </div>
      </main><Footer /></></AuthGuard>
  )
}
