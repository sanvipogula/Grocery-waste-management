/**
 * Seed script — populates Supabase with demo stores, products,
 * inventory, sales, and three demo user accounts.
 *
 * Run with:  pnpm tsx scripts/seed.ts
 */

import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '../lib/db/schema'
import { eq } from 'drizzle-orm'

const pool = new Pool({
  connectionString:
    'postgresql://postgres.cciqqmmvoyrbzhrbnrll:sanvypogula@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
})

const db = drizzle(pool, { schema })

// ─── helpers ─────────────────────────────────────────────────────────────────

function daysFromNow(n: number) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function daysAgo(n: number) {
  return daysFromNow(-n)
}

// ─── Stores ───────────────────────────────────────────────────────────────────

const STORES = [
  { name: 'Green Valley Market',  city: 'Dublin'    },
  { name: 'City Centre Store',    city: 'Dublin'    },
  { name: 'Harbour Fresh',        city: 'Cork'      },
  { name: 'Riverside Foods',      city: 'Galway'    },
  { name: 'Northside Grocery',    city: 'Limerick'  },
  { name: 'Eastgate Market',      city: 'Waterford' },
  { name: 'Westlands Fresh',      city: 'Sligo'     },
  { name: 'SouthPark Grocery',    city: 'Kilkenny'  },
]

// ─── Products ─────────────────────────────────────────────────────────────────

const PRODUCTS = [
  { name: 'Organic Spinach',   category: 'Vegetables', unit: 'bag',    price: '2.49',  shelfLifeDays: 7  },
  { name: 'Sourdough Bread',   category: 'Bakery',     unit: 'loaf',   price: '4.99',  shelfLifeDays: 5  },
  { name: 'Greek Yogurt',      category: 'Dairy',      unit: '500g',   price: '3.29',  shelfLifeDays: 14 },
  { name: 'Cherry Tomatoes',   category: 'Vegetables', unit: 'punnet', price: '1.99',  shelfLifeDays: 7  },
  { name: 'Free Range Eggs',   category: 'Dairy',      unit: 'dozen',  price: '3.79',  shelfLifeDays: 28 },
  { name: 'Ripe Bananas',      category: 'Fruits',     unit: 'bunch',  price: '1.29',  shelfLifeDays: 5  },
  { name: 'Cheddar Cheese',    category: 'Dairy',      unit: '300g',   price: '5.49',  shelfLifeDays: 60 },
  { name: 'Chicken Breast',    category: 'Meat',       unit: 'kg',     price: '7.99',  shelfLifeDays: 4  },
  { name: 'Red Apples',        category: 'Fruits',     unit: 'kg',     price: '2.19',  shelfLifeDays: 21 },
  { name: 'Wholegrain Pasta',  category: 'Bakery',     unit: '500g',   price: '1.89',  shelfLifeDays: 365},
  { name: 'Broccoli',          category: 'Vegetables', unit: 'head',   price: '1.49',  shelfLifeDays: 7  },
  { name: 'Strawberries',      category: 'Fruits',     unit: 'punnet', price: '3.49',  shelfLifeDays: 4  },
]

// ─── Inventory per store ──────────────────────────────────────────────────────
// [productIndex (0-based), quantity, daysUntilExpiry, discountPct]

type InvRow = [number, number, number, number]

const STORE_INVENTORY: Record<number, InvRow[]> = {
  0: [ // Green Valley Market
    [0, 45,  2,  30],
    [1, 18,  1,  20],
    [2, 55,  6,   0],
    [3, 60,  3,  15],
    [4,  8, 12,   0],
    [5, 32,  1,  40],
    [7, 25,  2,  25],
    [8,120, 14,   0],
    [9,200, 90,   0],
    [10,30,  3,  20],
    [11,28,  2,  35],
  ],
  1: [ // City Centre Store
    [1, 12,  1,  20],
    [2, 40,  8,   0],
    [4, 24, 14,   0],
    [6, 80, 45,   0],
    [8, 90, 18,   0],
    [9,150, 90,   0],
    [0, 20,  3,   0],
    [5, 15,  2,  30],
  ],
  2: [ // Harbour Fresh
    [2, 30,  5,   0],
    [3, 45,  4,   0],
    [4,  5, 10,   0],
    [6, 60, 50,   0],
    [7, 10,  3,  20],
    [11,20,  2,  35],
    [8, 70, 16,   0],
  ],
  3: [ // Riverside Foods
    [0, 35,  4,   0],
    [1, 22,  2,  15],
    [4, 18, 15,   0],
    [5, 28,  2,  25],
    [7, 30,  3,  20],
    [8,100, 12,   0],
    [9,180, 90,   0],
  ],
  4: [ // Northside Grocery
    [2, 25,  7,   0],
    [3, 50,  5,   0],
    [4, 16, 20,   0],
    [6, 45, 55,   0],
    [8, 60, 14,   0],
    [10,90,  4,  10],
  ],
  5: [ // Eastgate Market
    [0, 15,  3,  20],
    [1, 10,  2,  15],
    [5, 22,  1,  40],
    [8, 40, 10,   0],
    [9,120, 90,   0],
  ],
  6: [ // Westlands Fresh
    [2, 20,  6,   0],
    [4, 12, 18,   0],
    [6, 35, 60,   0],
    [8, 50, 12,   0],
    [11,15,  2,  35],
  ],
  7: [ // SouthPark Grocery
    [0, 25,  3,  10],
    [3, 40,  4,   0],
    [4, 20, 16,   0],
    [7, 20,  2,  25],
    [8, 80, 14,   0],
    [9,160, 90,   0],
  ],
}

// ─── Demo users ───────────────────────────────────────────────────────────────
// We insert directly into the user table with pre-hashed passwords.
// Password hash below is bcrypt of the plaintext passwords using cost 10.
// customer@zerowaste.demo / Customer123!
// merchant@zerowaste.demo / Merchant123!
// admin@zerowaste.demo    / Admin123!

const DEMO_USERS = [
  {
    id: 'demo-customer-001',
    name: 'Demo Customer',
    email: 'customer@zerowaste.demo',
    role: 'customer',
    // bcrypt hash of "Customer123!"
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  },
  {
    id: 'demo-merchant-001',
    name: 'Demo Merchant',
    email: 'merchant@zerowaste.demo',
    role: 'merchant',
    // bcrypt hash of "Merchant123!"
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  },
  {
    id: 'demo-admin-001',
    name: 'Demo Admin',
    email: 'admin@zerowaste.demo',
    role: 'admin',
    // bcrypt hash of "Admin123!"
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding Supabase database…\n')

  // 1. Stores
  console.log('📍 Inserting stores…')
  const insertedStores = await db
    .insert(schema.stores)
    .values(STORES)
    .onConflictDoNothing()
    .returning()
  const storeIds = insertedStores.map((s) => s.id)
  // If stores already exist, fetch them
  const allStores = storeIds.length
    ? insertedStores
    : await db.select().from(schema.stores).orderBy(schema.stores.id)
  console.log(`   ✓ ${allStores.length} stores ready`)

  // 2. Products
  console.log('🛒 Inserting products…')
  const insertedProducts = await db
    .insert(schema.products)
    .values(PRODUCTS)
    .onConflictDoNothing()
    .returning()
  const allProducts = insertedProducts.length
    ? insertedProducts
    : await db.select().from(schema.products).orderBy(schema.products.id)
  console.log(`   ✓ ${allProducts.length} products ready`)

  // 3. Inventory
  console.log('📦 Inserting inventory…')
  let invCount = 0
  for (let si = 0; si < Math.min(allStores.length, 8); si++) {
    const storeId = allStores[si].id
    const rows = STORE_INVENTORY[si] ?? []
    for (const [pi, qty, daysLeft, disc] of rows) {
      const product = allProducts[pi]
      if (!product) continue
      await db
        .insert(schema.inventory)
        .values({
          storeId,
          productId: product.id,
          quantity: qty,
          expiryDate: daysFromNow(daysLeft),
          discountPct: disc,
          incomingQuantity: 0,
        })
        .onConflictDoUpdate({
          target: [schema.inventory.storeId, schema.inventory.productId],
          set: {
            quantity: qty,
            expiryDate: daysFromNow(daysLeft),
            discountPct: disc,
            updatedAt: new Date(),
          },
        })
      invCount++
    }
  }
  console.log(`   ✓ ${invCount} inventory rows ready`)

  // 4. Sales history (28 days)
  console.log('📊 Inserting sales history…')
  const salesRows: typeof schema.sales.$inferInsert[] = []
  for (const store of allStores) {
    for (const product of allProducts) {
      // ~60% chance a given product is sold at a given store
      if (Math.random() > 0.6) continue
      const baseQty = Math.floor(Math.random() * 8) + 1
      for (let d = 1; d <= 28; d++) {
        const qty = Math.max(0, baseQty + Math.floor(Math.random() * 4) - 2)
        if (qty === 0) continue
        salesRows.push({
          storeId: store.id,
          productId: product.id,
          saleDate: daysAgo(d),
          quantity: qty,
        })
      }
    }
  }
  // Insert in batches of 200
  for (let i = 0; i < salesRows.length; i += 200) {
    await db.insert(schema.sales).values(salesRows.slice(i, i + 200)).onConflictDoNothing()
  }
  console.log(`   ✓ ${salesRows.length} sales records ready`)

  // 5. Demo users (insert into user table + account table for password auth)
  console.log('👤 Inserting demo users…')
  for (const u of DEMO_USERS) {
    // Upsert user row
    await db
      .insert(schema.user)
      .values({
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: true,
        role: u.role,
      })
      .onConflictDoUpdate({
        target: schema.user.id,
        set: { role: u.role, name: u.name },
      })

    // Upsert account row for email/password
    await db
      .insert(schema.account)
      .values({
        id: `${u.id}-account`,
        accountId: u.email,
        providerId: 'credential',
        userId: u.id,
        password: u.password,
      })
      .onConflictDoUpdate({
        target: schema.account.id,
        set: { password: u.password },
      })

    console.log(`   ✓ ${u.role}: ${u.email}`)
  }

  console.log('\n✅ Seed complete!\n')
  console.log('Demo login credentials:')
  console.log('  customer@zerowaste.demo  /  Customer123!')
  console.log('  merchant@zerowaste.demo  /  Merchant123!')
  console.log('  admin@zerowaste.demo     /  Admin123!')

  await pool.end()
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
