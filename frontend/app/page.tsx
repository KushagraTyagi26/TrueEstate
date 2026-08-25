'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowRight, BarChart3, Compass, GitCompare, LineChart, ShieldCheck } from 'lucide-react'
import { Navbar, Footer, PropertyPreview } from '@/components/true-estate'
import { Button } from '@/components/ui/button'
const capabilities = [{icon:LineChart,title:'Fair Rent Estimation',text:'Estimate expected monthly rent and ₹/sqft using local market signals.'},{icon:ShieldCheck,title:'Listing Evaluation',text:'See whether asking rent is fair, inflated, or an opportunity.'},{icon:Compass,title:'Smart Locality Recommendations',text:'Discover areas that fit your budget, needs, and daily priorities.'},{icon:GitCompare,title:'Property Comparison',text:'Compare two or three properties on the metrics that matter.'}]
export default function Home(){
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      if (!session) {
        router.replace('/signup')
        return
      }

      setCheckingAuth(false)
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/signup')
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  if (checkingAuth) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">
          Loading TrueEstate...
        </p>
      </div>
    )
  }

  return <><Navbar/><main><section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:pb-28 lg:pt-24"><div><p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Rental decision intelligence</p><h1 className="max-w-xl text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.06em] md:text-7xl">Know what a property is <span className="text-primary">really worth.</span></h1><p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">TrueEstate combines machine learning, locality market intelligence, and accessibility data to help you estimate rent, evaluate listings, discover better localities, and compare properties with confidence.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button asChild size="lg"><Link href="/evaluate">Evaluate a Property <ArrowRight data-icon="inline-end"/></Link></Button><Button asChild size="lg" variant="outline"><Link href="/recommend">Find the Right Locality</Link></Button></div><p className="mt-5 text-xs text-muted-foreground">Decision support built for the Indian rental market.</p></div><PropertyPreview/></section><section className="border-y border-border bg-card"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 md:grid-cols-2 lg:grid-cols-4 lg:px-8">{capabilities.map(({icon:Icon,title,text})=><div key={title} className="group"><Icon className="mb-5 size-5 text-primary"/><h2 className="font-medium">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div></section><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="mb-12 max-w-xl"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">How it works</p><h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-4xl">From property details to a confident decision.</h2></div><div className="grid gap-0 border-l border-border md:grid-cols-5 md:border-l-0 md:border-t">{['Property Data','Market Intelligence','Accessibility Intelligence','ML Rent Estimation','Value & Recommendation Engine'].map((step,i)=><div key={step} className="relative flex gap-4 border-b border-border px-5 py-5 first:pt-0 md:block md:border-b-0 md:px-5 md:pt-6"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground md:absolute md:-top-3 md:left-5">{i+1}</span><p className="text-sm font-medium leading-6 md:mt-3">{step}</p></div>)}</div></section><section className="mx-5 mb-20 rounded-2xl bg-primary px-6 py-12 text-primary-foreground md:px-12 lg:mx-auto lg:max-w-7xl"><div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between"><div><p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">Make the next move with clarity</p><h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.04em]">A better rental decision starts with better information.</h2></div><Button asChild variant="secondary" size="lg"><Link href="/predict">Estimate Rent <ArrowRight data-icon="inline-end"/></Link></Button></div></section></main><Footer/></>}