import { and, eq, gte, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { inventory, products, recommendations, sales, stores } from '@/lib/db/schema'
import { analyze, coordinate, type Analysis, type StockItem } from './engine'

export const HISTORY_DAYS = 28

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function shiftIso(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export async function loadAnalyses(): Promise<Analysis[]> {
  const today = todayIso()
  const start = shiftIso(today, -HISTORY_DAYS)

  const [rows, salesRows] = await Promise.all([
    db
      .select({
        storeId: inventory.storeId,
        storeName: stores.name,
        productId: inventory.productId,
        productName: products.name,
        unit: products.unit,
        quantity: inventory.quantity,
        incomingQuantity: inventory.incomingQuantity,
        expiryDate: inventory.expiryDate,
      })
      .from(inventory)
      .innerJoin(stores, eq(stores.id, inventory.storeId))
      .innerJoin(products, eq(products.id, inventory.productId)),
    db
      .select({
        storeId: sales.storeId,
        productId: sales.productId,
        saleDate: sales.saleDate,
        quantity: sql<number>`sum(${sales.quantity})::int`,
      })
      .from(sales)
      .where(and(gte(sales.saleDate, start), sql`${sales.saleDate} < ${today}`))
      .groupBy(sales.storeId, sales.productId, sales.saleDate),
  ])

  const byKey = new Map<string, Map<string, number>>()
  for (const s of salesRows) {
    const k = `${s.storeId}:${s.productId}`
    if (!byKey.has(k)) byKey.set(k, new Map())
    byKey.get(k)!.set(s.saleDate, s.quantity)
  }

  return rows.map((r) => {
    const daily = byKey.get(`${r.storeId}:${r.productId}`)
    const history: number[] = []
    for (let i = HISTORY_DAYS; i >= 1; i--) history.push(daily?.get(shiftIso(today, -i)) ?? 0)
    const item: StockItem = { ...r, history }
    return analyze(item, today)
  })
}

/** Runs every agent and stores fresh pending suggestions. Nothing is executed. */
export async function runAgents() {
  const analyses = await loadAnalyses()
  const proposals = coordinate(analyses)
  const runId = `run_${Date.now().toString(36)}`

  await db.transaction(async (tx) => {
    await tx
      .update(recommendations)
      .set({ status: 'superseded' })
      .where(eq(recommendations.status, 'pending'))
    if (proposals.length) {
      await tx.insert(recommendations).values(
        proposals.map((p) => ({
          runId,
          storeId: p.storeId,
          productId: p.productId,
          action: p.action,
          quantity: p.quantity,
          discountPct: p.discountPct,
          targetStoreId: p.targetStoreId,
          risk: p.risk,
          forecastDaily: p.forecastDaily.toFixed(2),
          explanation: p.explanation,
        })),
      )
    }
  })

  return { runId, count: proposals.length, analyzed: analyses.length }
}
