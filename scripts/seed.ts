import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db, pool } from '@/lib/db'
import {
  decisions,
  inventory,
  orderItems,
  orders,
  products,
  recommendations,
  sales,
  stores,
  user,
} from '@/lib/db/schema'
import { HISTORY_DAYS, runAgents, shiftIso, todayIso } from '@/lib/agents/run'

const DEMO_ACCOUNTS = [
  { name: 'Demo Customer', email: 'customer@zerowaste.demo', password: 'Customer123!', role: 'customer' },
  { name: 'Demo Merchant', email: 'merchant@zerowaste.demo', password: 'Merchant123!', role: 'merchant' },
  { name: 'Demo Admin', email: 'admin@zerowaste.demo', password: 'Admin123!', role: 'admin' },
] as const

const STORES = [
  { name: 'Green Basket Downtown', city: 'Downtown', demand: 1.2 },
  { name: 'Green Basket Riverside', city: 'Riverside', demand: 1.0 },
  { name: 'Green Basket Hillview', city: 'Hillview', demand: 0.7 },
]

const PRODUCTS = [
  { name: 'Whole Milk 1L', category: 'Dairy', unit: 'bottle', price: '62.00', shelfLifeDays: 7, demand: 14 },
  { name: 'Greek Yogurt', category: 'Dairy', unit: 'cup', price: '45.00', shelfLifeDays: 14, demand: 8 },
  { name: 'Sourdough Bread', category: 'Bakery', unit: 'loaf', price: '85.00', shelfLifeDays: 4, demand: 10 },
  { name: 'Bananas', category: 'Fruit', unit: 'dozen', price: '60.00', shelfLifeDays: 6, demand: 12 },
  { name: 'Strawberries', category: 'Fruit', unit: 'box', price: '120.00', shelfLifeDays: 4, demand: 6 },
  { name: 'Baby Spinach', category: 'Vegetables', unit: 'bunch', price: '30.00', shelfLifeDays: 4, demand: 9 },
  { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', price: '40.00', shelfLifeDays: 8, demand: 15 },
  { name: 'Avocados', category: 'Fruit', unit: 'piece', price: '90.00', shelfLifeDays: 6, demand: 5 },
  { name: 'Free-range Eggs', category: 'Dairy', unit: 'tray', price: '96.00', shelfLifeDays: 21, demand: 9 },
  { name: 'Fresh Paneer', category: 'Dairy', unit: 'pack', price: '95.00', shelfLifeDays: 7, demand: 7 },
  { name: 'Chicken Breast', category: 'Meat', unit: 'pack', price: '210.00', shelfLifeDays: 4, demand: 6 },
  { name: 'Orange Juice', category: 'Beverages', unit: 'carton', price: '130.00', shelfLifeDays: 10, demand: 5 },
]

// Hand-picked situations so the demo shows every kind of suggestion.
const SCENARIOS: Record<string, { qty: number; expiresIn: number }> = {
  'Green Basket Downtown|Whole Milk 1L': { qty: 90, expiresIn: 3 },
  'Green Basket Riverside|Whole Milk 1L': { qty: 6, expiresIn: 6 },
  'Green Basket Hillview|Bananas': { qty: 60, expiresIn: 2 },
  'Green Basket Riverside|Strawberries': { qty: 34, expiresIn: 1 },
  'Green Basket Downtown|Sourdough Bread': { qty: 5, expiresIn: 3 },
  'Green Basket Hillview|Baby Spinach': { qty: 36, expiresIn: 4 },
  'Green Basket Downtown|Baby Spinach': { qty: 4, expiresIn: 4 },
  'Green Basket Riverside|Chicken Breast': { qty: 3, expiresIn: 4 },
  'Green Basket Downtown|Avocados': { qty: 42, expiresIn: 4 },
  'Green Basket Hillview|Fresh Paneer': { qty: 3, expiresIn: 6 },
}

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

async function ensureDemoAccounts() {
  for (const a of DEMO_ACCOUNTS) {
    const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, a.email))
    if (!existing) {
      await auth.api.signUpEmail({ body: { name: a.name, email: a.email, password: a.password } })
    }
    await db.update(user).set({ role: a.role }).where(eq(user.email, a.email))
  }
}

async function main() {
  const random = rng(42)
  const today = todayIso()

  await db.delete(orderItems)
  await db.delete(orders)
  await db.delete(decisions)
  await db.delete(recommendations)
  await db.delete(sales)
  await db.delete(inventory)
  await db.delete(products)
  await db.delete(stores)

  const storeRows = await db.insert(stores).values(STORES.map(({ name, city }) => ({ name, city }))).returning()
  const productRows = await db
    .insert(products)
    .values(PRODUCTS.map(({ demand: _d, ...p }) => p))
    .returning()

  const salesValues: (typeof sales.$inferInsert)[] = []
  const inventoryValues: (typeof inventory.$inferInsert)[] = []

  storeRows.forEach((store, si) => {
    productRows.forEach((product, pi) => {
      const base = PRODUCTS[pi].demand * STORES[si].demand
      for (let d = HISTORY_DAYS; d >= 1; d--) {
        const date = shiftIso(today, -d)
        const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
        const weekend = weekday === 0 || weekday === 6 ? 1.25 : 1
        const qty = Math.max(0, Math.round(base * weekend * (0.75 + random() * 0.5)))
        salesValues.push({ storeId: store.id, productId: product.id, saleDate: date, quantity: qty })
      }

      const scenario = SCENARIOS[`${store.name}|${product.name}`]
      const qty = scenario?.qty ?? Math.round(base * (2.5 + random() * 2))
      const expiresIn =
        scenario?.expiresIn ?? Math.max(3, Math.round(product.shelfLifeDays * (0.6 + random() * 0.4)))
      inventoryValues.push({
        storeId: store.id,
        productId: product.id,
        quantity: qty,
        expiryDate: shiftIso(today, expiresIn),
      })
    })
  })

  await db.insert(sales).values(salesValues)
  await db.insert(inventory).values(inventoryValues)
  await ensureDemoAccounts()
  const result = await runAgents()

  console.log(
    `Seeded ${storeRows.length} stores, ${productRows.length} products, ${salesValues.length} sales rows. ` +
      `Agents produced ${result.count} suggestions.`,
  )
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => pool.end())
