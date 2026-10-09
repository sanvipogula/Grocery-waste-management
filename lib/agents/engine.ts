export type Action = 'markdown' | 'transfer' | 'replenish'
export type Risk = 'high' | 'medium' | 'low'

export type StockItem = {
  storeId: number
  storeName: string
  productId: number
  productName: string
  unit: string
  quantity: number
  incomingQuantity: number
  expiryDate: string
  /** Daily units sold, oldest first. */
  history: number[]
}

export type Analysis = StockItem & {
  forecastDaily: number
  daysToExpiry: number
  expectedSoldBeforeExpiry: number
  excess: number
  daysOfCover: number
  shortageNeed: number
  risk: Risk
}

export type Proposal = {
  storeId: number
  productId: number
  action: Action
  quantity: number
  discountPct: number
  targetStoreId: number | null
  risk: Risk
  forecastDaily: number
  explanation: string
}

const REORDER_LEAD_DAYS = 2
const TARGET_COVER_DAYS = 5
const TRANSFER_MIN_DAYS_LEFT = 3
const MARKDOWN_WINDOW_DAYS = 5
const CASE_SIZE = 6

function mean(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
}

export function daysBetween(fromIso: string, toIso: string) {
  const from = Date.parse(`${fromIso}T00:00:00Z`)
  const to = Date.parse(`${toIso}T00:00:00Z`)
  return Math.round((to - from) / 86_400_000)
}

/** Demand agent: weighted moving average that leans on the most recent week. */
export function forecastDaily(history: number[]) {
  const lastWeek = mean(history.slice(-7))
  const priorWeek = mean(history.slice(-14, -7))
  const value = priorWeek > 0 ? lastWeek * 0.65 + priorWeek * 0.35 : lastWeek
  return Math.max(0.1, Math.round(value * 10) / 10)
}

/** Spoilage + stock agents: score each product at each store. */
export function analyze(item: StockItem, today: string): Analysis {
  const forecast = forecastDaily(item.history)
  const daysToExpiry = Math.max(0, daysBetween(today, item.expiryDate))
  const expectedSold = Math.round(forecast * daysToExpiry)
  const excess = Math.max(0, item.quantity - expectedSold)
  const daysOfCover = item.quantity / forecast
  const projected = item.quantity + item.incomingQuantity
  const shortageNeed =
    daysOfCover < REORDER_LEAD_DAYS + 1 && excess === 0
      ? Math.max(0, Math.ceil(forecast * TARGET_COVER_DAYS - projected))
      : 0

  let risk: Risk = 'low'
  if ((excess > 0 && daysToExpiry <= 2) || daysOfCover < 1) risk = 'high'
  else if ((excess > 0 && daysToExpiry <= MARKDOWN_WINDOW_DAYS) || shortageNeed > 0) risk = 'medium'

  return {
    ...item,
    forecastDaily: forecast,
    daysToExpiry,
    expectedSoldBeforeExpiry: expectedSold,
    excess,
    daysOfCover: Math.round(daysOfCover * 10) / 10,
    shortageNeed,
    risk,
  }
}

function markdownPct(excess: number, quantity: number) {
  const share = quantity > 0 ? excess / quantity : 0
  const raw = 15 + share * 45
  return Math.min(50, Math.max(15, Math.round(raw / 5) * 5))
}

/**
 * Coordinator agent: picks at most one action per product per store.
 * Order of preference: transfer surplus to a store that is running short,
 * then markdown what cannot be sold in time, then replenish real shortages.
 */
export function coordinate(analyses: Analysis[]): Proposal[] {
  const proposals: Proposal[] = []
  const decided = new Set<string>()
  const key = (a: { storeId: number; productId: number }) => `${a.storeId}:${a.productId}`

  const remainingNeed = new Map<string, number>()
  for (const a of analyses) if (a.shortageNeed > 0) remainingNeed.set(key(a), a.shortageNeed)

  const surplus = analyses
    .filter((a) => a.excess > 0 && a.daysToExpiry <= MARKDOWN_WINDOW_DAYS + 2)
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry || b.excess - a.excess)

  for (const source of surplus) {
    if (source.daysToExpiry < TRANSFER_MIN_DAYS_LEFT) continue
    const candidates = analyses
      .filter(
        (t) =>
          t.productId === source.productId &&
          t.storeId !== source.storeId &&
          (remainingNeed.get(key(t)) ?? 0) > 0 &&
          !decided.has(key(t)),
      )
      .sort((a, b) => (remainingNeed.get(key(b)) ?? 0) - (remainingNeed.get(key(a)) ?? 0))
    const target = candidates[0]
    if (!target) continue

    const need = remainingNeed.get(key(target)) ?? 0
    const sellableAtTarget = Math.floor(target.forecastDaily * (source.daysToExpiry - 1))
    const qty = Math.min(source.excess, need, Math.max(0, sellableAtTarget))
    if (qty < 2) continue

    remainingNeed.set(key(target), need - qty)
    decided.add(key(source))
    const leftover = source.excess - qty
    proposals.push({
      storeId: source.storeId,
      productId: source.productId,
      action: 'transfer',
      quantity: qty,
      discountPct: 0,
      targetStoreId: target.storeId,
      risk: source.risk,
      forecastDaily: source.forecastDaily,
      explanation:
        `${source.storeName} has ${source.quantity} ${source.unit}s but is expected to sell only about ${source.expectedSoldBeforeExpiry} ` +
        `in the ${source.daysToExpiry} days before expiry. ${target.storeName} has only ${target.daysOfCover} days of stock left ` +
        `(sells about ${target.forecastDaily}/day). Moving ${qty} units fills that gap instead of ordering new stock` +
        (leftover > 0 ? `; ${leftover} surplus units may still need a discount later.` : '.'),
    })
  }

  for (const a of surplus) {
    if (decided.has(key(a)) || a.daysToExpiry > MARKDOWN_WINDOW_DAYS) continue
    decided.add(key(a))
    const pct = markdownPct(a.excess, a.quantity)
    proposals.push({
      storeId: a.storeId,
      productId: a.productId,
      action: 'markdown',
      quantity: a.excess,
      discountPct: pct,
      targetStoreId: null,
      risk: a.risk,
      forecastDaily: a.forecastDaily,
      explanation:
        `Expires in ${a.daysToExpiry} day${a.daysToExpiry === 1 ? '' : 's'}. At about ${a.forecastDaily} sold per day, ` +
        `roughly ${a.excess} of ${a.quantity} units would go unsold. No nearby store needs this item, ` +
        `so a ${pct}% discount is suggested to speed up sales before it spoils.`,
    })
  }

  for (const a of analyses) {
    const need = remainingNeed.get(key(a)) ?? 0
    if (decided.has(key(a)) || need <= 0) continue
    const qty = Math.ceil(need / CASE_SIZE) * CASE_SIZE
    const coveredByTransfer = a.shortageNeed - need
    decided.add(key(a))
    proposals.push({
      storeId: a.storeId,
      productId: a.productId,
      action: 'replenish',
      quantity: qty,
      discountPct: 0,
      targetStoreId: null,
      risk: a.risk,
      forecastDaily: a.forecastDaily,
      explanation:
        `Only ${a.quantity} on the shelf${a.incomingQuantity ? ` and ${a.incomingQuantity} on the way` : ''}, ` +
        `which covers about ${a.daysOfCover} days at ${a.forecastDaily} sold per day. ` +
        (coveredByTransfer > 0 ? `A transfer already covers ${coveredByTransfer} units. ` : '') +
        `Ordering ${qty} units (rounded to cases of ${CASE_SIZE}) keeps roughly ${TARGET_COVER_DAYS} days of stock.`,
    })
  }

  const riskOrder: Record<Risk, number> = { high: 0, medium: 1, low: 2 }
  return proposals.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk])
}
