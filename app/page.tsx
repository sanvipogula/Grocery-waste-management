import { SiteHeader } from '@/components/landing/site-header'
import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Features } from '@/components/landing/features'
import { UserTypes } from '@/components/landing/user-types'
import { Impact, type DemoStats } from '@/components/landing/impact'
import { FinalCta, SiteFooter } from '@/components/landing/cta-footer'

// --- MOCK: hardcoded demo stats, no database required ---
const DEMO_STATS: DemoStats = {
  products: 142,
  stores: 8,
  atRisk: 37,
  suggestions: 24,
}

export default async function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <UserTypes />
        <Impact stats={DEMO_STATS} />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  )
}
