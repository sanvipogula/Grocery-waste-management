import { count, eq, lte } from 'drizzle-orm'
import { db } from '@/lib/db'
import { inventory, products, recommendations, stores } from '@/lib/db/schema'
import { shiftIso, todayIso } from '@/lib/agents/run'
import { SiteHeader } from '@/components/landing/site-header'
import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Features } from '@/components/landing/features'
import { UserTypes } from '@/components/landing/user-types'
import { Impact, type DemoStats } from '@/components/landing/impact'
import { FinalCta, SiteFooter } from '@/components/landing/cta-footer'

export const dynamic = 'force-dynamic'

async function getDemoStats(): Promise<DemoStats> {
  try {
    const [[p], [s], [a], [r]] = await Promise.all([
      db.select({ n: count() }).from(products),
      db.select({ n: count() }).from(stores),
      db.select({ n: count() }).from(inventory).where(lte(inventory.expiryDate, shiftIso(todayIso(), 3))),
      db.select({ n: count() }).from(recommendations).where(eq(recommendations.status, 'pending')),
    ])
    return { products: p.n, stores: s.n, atRisk: a.n, suggestions: r.n }
  } catch {
    // DB unavailable — show static demo numbers
    return { products: 142, stores: 8, atRisk: 37, suggestions: 24 }
  }
}

export default async function HomePage() {
  const stats = await getDemoStats()
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <UserTypes />
        <Impact stats={stats} />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  )
}
