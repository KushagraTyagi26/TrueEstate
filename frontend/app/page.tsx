'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowRight, BrainCircuit, Building2, GitCompare, MapPin, ShieldCheck } from 'lucide-react'
import { Navbar, Footer } from '@/components/true-estate'
import { Button } from '@/components/ui/button'

const capabilities = [
  { icon: BrainCircuit, title: 'Estimate Rent', text: 'Get the fair monthly rent prediction for any property.', href: '/predict' },
  { icon: ShieldCheck, title: 'Evaluate Listing', text: 'Check whether a listing is fairly priced or overpriced.', href: '/evaluate' },
  { icon: MapPin, title: 'Recommendations', text: 'Find localities that fit your budget and preferences.', href: '/recommend' },
  { icon: GitCompare, title: 'Compare Properties', text: 'Compare up to 3 properties side by side.', href: '/compare' },
]

export default function Home() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    let mounted = true
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      if (!session) { router.replace('/signup'); return }
      setCheckingAuth(false)
    }
    checkSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/signup')
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [router])

  if (checkingAuth) {
    return <div className="grid min-h-screen place-items-center bg-background"><p className="text-sm text-muted-foreground">Loading TrueEstate...</p></div>
  }

  return (
    <>
      <Navbar />
      <main>
        <section className="hero-shell mx-auto max-w-[1280px] overflow-hidden border-x border-b border-border/70 lg:rounded-b-2xl">
          <div className="grid min-h-[520px] lg:grid-cols-[1.05fr_.95fr]">
            <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14 lg:py-16">
              <h1 className="max-w-[620px] font-serif-display text-[44px] font-semibold leading-[1.04] tracking-[-0.035em] text-foreground sm:text-6xl">
                Know the fair rent.<br />
                <span className="font-normal italic text-primary">Before you sign the lease.</span>
              </h1>
              <p className="mt-7 max-w-md text-[17px] leading-7 text-muted-foreground">AI-powered rental intelligence for the Indian housing market.</p>

              <div className="mt-9 grid max-w-[640px] grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                {[
                  [BrainCircuit, 'AI-Powered', 'Predictions'],
                  [Building2, 'Market & Locality', 'Intelligence'],
                  [MapPin, 'Accessibility', 'Analysis'],
                  [ShieldCheck, 'Comprehensive', 'Insights'],
                ].map(([Icon, a, b]: any) => (
                  <div key={a} className="flex items-start gap-2.5">
                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p className="text-[11px] font-semibold leading-4 text-foreground">{a}<br />{b}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-11 rounded-lg px-6"><Link href="/predict">Estimate Rent <ArrowRight className="size-4" /></Link></Button>
                <Button asChild size="lg" variant="outline" className="h-11 rounded-lg border-primary/35 bg-card px-6 text-primary hover:bg-muted"><Link href="/evaluate">Evaluate a Listing</Link></Button>
              </div>
            </div>

            <div className="hero-property-image relative min-h-[460px] lg:min-h-full">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,#f7f5ef_0%,rgba(247,245,239,.72)_10%,rgba(247,245,239,0)_32%)]" />
              <div className="absolute bottom-16 right-6 w-[255px] overflow-hidden rounded-2xl border border-white/30 bg-[#0f5132] shadow-[0_20px_55px_-20px_rgba(15,81,50,.55)] sm:right-10 lg:right-12">
                <div className="p-5 text-white">
                  <p className="text-xs font-medium text-white/80">Estimated Monthly Rent</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">₹45,661</p>
                  <p className="mt-5 text-[11px] text-white/70">Expected Range</p>
                  <p className="mt-1 text-sm font-semibold">₹41,000 – ₹51,000</p>
                </div>
                <div className="bg-[#fcfbf7] px-5 py-3.5"><span className="inline-flex items-center gap-2 rounded-full bg-[#e3ede7] px-3 py-1 text-xs font-semibold text-primary"><ShieldCheck className="size-3.5" /> Fair Value</span></div>
              </div>
            </div>
          </div>

          <div className="grid border-t border-border bg-card/95 md:grid-cols-[1.08fr_repeat(4,1fr)]">
            <div className="flex items-center px-7 py-7"><p className="max-w-[170px] text-sm font-semibold leading-5">Everything you need to make smarter rental decisions</p></div>
            {capabilities.map(({ icon: Icon, title, text, href }) => (
              <Link key={title} href={href} className="group border-t border-border px-6 py-6 transition hover:bg-muted/60 md:border-l md:border-t-0">
                <span className="grid size-8 place-items-center rounded-full bg-[#e3ede7] text-primary"><Icon className="size-4" /></span>
                <h2 className="mt-4 text-sm font-semibold">{title}</h2>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
