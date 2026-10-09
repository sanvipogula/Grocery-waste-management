import type { Metadata } from 'next'
import { ShoppingCart, Tag, Leaf, Clock, Star, Search } from 'lucide-react'
import { requireRole } from '@/lib/session'
import { AppShell, StatCard, Panel } from '@/components/dashboard/app-shell'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Shop — ZeroWaste' }

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Meat']

const PRODUCTS = [
  { id: 1,  name: 'Organic Spinach',     category: 'Vegetables', price: 2.49,  discountPct: 30, expiresIn: 2, store: 'Green Valley Market',  rating: 4.5, unit: 'bag' },
  { id: 2,  name: 'Sourdough Bread',     category: 'Bakery',     price: 4.99,  discountPct: 20, expiresIn: 1, store: 'City Centre Store',     rating: 4.8, unit: 'loaf' },
  { id: 3,  name: 'Greek Yogurt',        category: 'Dairy',      price: 3.29,  discountPct: 0,  expiresIn: 6, store: 'Harbour Fresh',         rating: 4.3, unit: '500g' },
  { id: 4,  name: 'Cherry Tomatoes',     category: 'Vegetables', price: 1.99,  discountPct: 15, expiresIn: 3, store: 'Green Valley Market',   rating: 4.6, unit: 'punnet' },
  { id: 5,  name: 'Free Range Eggs',     category: 'Dairy',      price: 3.79,  discountPct: 0,  expiresIn: 12, store: 'Riverside Foods',      rating: 4.7, unit: 'dozen' },
  { id: 6,  name: 'Ripe Bananas',        category: 'Fruits',     price: 1.29,  discountPct: 40, expiresIn: 1, store: 'City Centre Store',     rating: 4.1, unit: 'bunch' },
  { id: 7,  name: 'Cheddar Cheese',      category: 'Dairy',      price: 5.49,  discountPct: 0,  expiresIn: 20, store: 'Harbour Fresh',        rating: 4.4, unit: '300g' },
  { id: 8,  name: 'Chicken Breast',      category: 'Meat',       price: 7.99,  discountPct: 25, expiresIn: 2, store: 'Riverside Foods',       rating: 4.6, unit: 'kg' },
  { id: 9,  name: 'Red Apples',          category: 'Fruits',     price: 2.19,  discountPct: 0,  expiresIn: 14, store: 'Green Valley Market',  rating: 4.5, unit: 'kg' },
  { id: 10, name: 'Wholegrain Pasta',    category: 'Bakery',     price: 1.89,  discountPct: 0,  expiresIn: 90, store: 'City Centre Store',    rating: 4.2, unit: '500g' },
  { id: 11, name: 'Broccoli',            category: 'Vegetables', price: 1.49,  discountPct: 20, expiresIn: 3, store: 'Harbour Fresh',         rating: 4.4, unit: 'head' },
  { id: 12, name: 'Strawberries',        category: 'Fruits',     price: 3.49,  discountPct: 35, expiresIn: 2, store: 'Riverside Foods',       rating: 4.9, unit: 'punnet' },
]

function discountedPrice(price: number, pct: number) {
  return pct > 0 ? (price * (1 - pct / 100)).toFixed(2) : null
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireRole('customer')
  const { denied } = await searchParams

  const discounted = PRODUCTS.filter((p) => p.discountPct > 0)
  const expiringSoon = PRODUCTS.filter((p) => p.expiresIn <= 3)

  return (
    <AppShell
      user={user}
      title={`Welcome back, ${user.name.split(' ')[0]} 👋`}
      subtitle="Browse fresh products and grab a deal before they're gone."
      denied={!!denied}
    >
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products available" value={PRODUCTS.length} hint="Across all stores" />
        <StatCard label="Deals today" value={discounted.length} hint="Discounted items" />
        <StatCard label="Expiring soon" value={expiringSoon.length} hint="Save them today" />
        <StatCard label="Stores nearby" value={4} hint="In your area" />
      </div>

      {/* Flash deals */}
      <Panel
        title="🔥 Flash Deals"
        description="Discounted items expiring soon — buy them before they're gone."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {discounted.map((p) => (
            <ProductCard key={p.id} product={p} highlight />
          ))}
        </div>
      </Panel>

      {/* All products */}
      <Panel
        title="All Products"
        description="Fresh items available across our partner stores."
        action={
          <div className="flex items-center gap-2 rounded-xl border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            <Search className="size-4" />
            <span>Search coming soon</span>
          </div>
        }
      >
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span
              key={c}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                c === 'All' ? 'border-primary bg-primary text-primary-foreground' : 'bg-muted hover:border-primary/40'
              }`}
            >
              {c}
            </span>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Panel>
    </AppShell>
  )
}

function ProductCard({
  product: p,
  highlight = false,
}: {
  product: (typeof PRODUCTS)[number]
  highlight?: boolean
}) {
  const sale = discountedPrice(p.price, p.discountPct)
  const urgency = p.expiresIn <= 1 ? 'destructive' : p.expiresIn <= 3 ? 'secondary' : 'outline'

  return (
    <div
      className={`group flex flex-col gap-3 rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
        highlight ? 'border-primary/30 bg-primary/5' : 'bg-card'
      }`}
    >
      {/* Colour swatch acting as product image placeholder */}
      <div className="flex h-28 items-center justify-center rounded-xl bg-accent/60 text-4xl">
        {categoryEmoji(p.category)}
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium leading-snug">{p.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{p.store}</p>
        </div>
        <Badge variant={urgency} className="shrink-0 text-xs">
          <Clock className="mr-1 size-3" />
          {p.expiresIn}d
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          {sale ? (
            <>
              <span className="text-lg font-semibold text-primary">€{sale}</span>
              <span className="text-sm text-muted-foreground line-through">€{p.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-lg font-semibold">€{p.price.toFixed(2)}</span>
          )}
          <span className="text-xs text-muted-foreground">/ {p.unit}</span>
        </div>
        {p.discountPct > 0 && (
          <Badge className="bg-green-600 text-white hover:bg-green-700">
            <Tag className="mr-1 size-3" />
            -{p.discountPct}%
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          {p.rating}
        </span>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
        >
          <ShoppingCart className="size-3" />
          Add to cart
        </button>
      </div>
    </div>
  )
}

function categoryEmoji(cat: string) {
  const map: Record<string, string> = {
    Vegetables: '🥦',
    Fruits: '🍎',
    Dairy: '🧀',
    Bakery: '🍞',
    Meat: '🥩',
  }
  return map[cat] ?? '🛒'
}
