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
              <h1 className="max-w-[640px] text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-6xl">
                Know the fair rent.<br />
                <span className="font-normal italic text-primary">Before you sign the lease.</span>
              </h1>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-[680px]">
                {[
                  [BrainCircuit, 'AI-Powered', 'Predictions'],
                  [Building2, 'Market & Locality', 'Intelligence'],
                  [MapPin, 'Accessibility', 'Analysis'],
                  [ShieldCheck, 'Comprehensive', 'Insights'],
                ].map(([Icon, a, b]: any) => (
                  <div
                    key={a}
                    className="group flex items-center gap-4 rounded-2xl border border-primary/20 bg-card/90 p-4 sm:p-5 shadow-[0_4px_20px_-10px_rgba(23,77,58,0.1)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card hover:shadow-[0_8px_25px_-10px_rgba(23,77,58,0.2)]"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-6" />
                    </span>
                    <div>
                      <p className="text-base sm:text-lg font-bold leading-tight text-foreground">
                        {a} {b}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-property-image relative min-h-[460px] lg:min-h-full">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,#f7f5ef_0%,rgba(247,245,239,.72)_10%,rgba(247,245,239,0)_32%)]" />
            </div>
          </div>

          <div className="grid border-t border-border bg-card/95 lg:grid-cols-[1.35fr_repeat(4,1fr)] md:grid-cols-[1.2fr_repeat(2,1fr)]">
            <div className="flex flex-col justify-center border-b border-border bg-primary/5 px-8 py-8 sm:px-10 sm:py-10 lg:border-b-0 lg:border-r">
              <p className="text-xl sm:text-2xl font-extrabold leading-snug tracking-tight text-foreground">
                Everything you need to make smarter rental decisions
              </p>
            </div>
            {capabilities.map(({ icon: Icon, title, text, href }) => (
              <Link
                key={title}
                href={href}
                className="group border-t border-border px-7 py-8 sm:px-8 sm:py-10 transition-all duration-300 hover:bg-muted/70 md:border-l md:border-t-0"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
                  <Icon className="size-6" />
                </span>
                <h2 className="mt-5 text-lg sm:text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                  {title}
                </h2>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
