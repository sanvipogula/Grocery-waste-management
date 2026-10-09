import type { Metadata } from 'next'
import {
  AlertTriangle, ArrowLeftRight, CheckCircle2, Clock,
  PackageCheck, RefreshCw, Tag, TrendingDown, TrendingUp,
} from 'lucide-react'
import { requireRole } from '@/lib/session'
import { AppShell, StatCard, Panel } from '@/components/dashboard/app-shell'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Merchant Dashboard — ZeroWaste' }

// ─── Mock data ────────────────────────────────────────────────────────────────

const INVENTORY = [
  { id: 1,  name: 'Organic Spinach',   category: 'Vegetables', qty: 45,  expiresIn: 2,  unit: 'bags',   discountPct: 30 },
  { id: 2,  name: 'Sourdough Bread',   category: 'Bakery',     qty: 18,  expiresIn: 1,  unit: 'loaves', discountPct: 20 },
  { id: 3,  name: 'Cherry Tomatoes',   category: 'Vegetables', qty: 60,  expiresIn: 3,  unit: 'punnets',discountPct: 15 },
  { id: 4,  name: 'Ripe Bananas',      category: 'Fruits',     qty: 32,  expiresIn: 1,  unit: 'bunches',discountPct: 40 },
  { id: 5,  name: 'Chicken Breast',    category: 'Meat',       qty: 25,  expiresIn: 2,  unit: 'kg',     discountPct: 25 },
  { id: 6,  name: 'Cheddar Cheese',    category: 'Dairy',      qty: 90,  expiresIn: 20, unit: 'packs',  discountPct: 0  },
  { id: 7,  name: 'Greek Yogurt',      category: 'Dairy',      qty: 55,  expiresIn: 6,  unit: 'tubs',   discountPct: 0  },
  { id: 8,  name: 'Red Apples',        category: 'Fruits',     qty: 120, expiresIn: 14, unit: 'kg',     discountPct: 0  },
  { id: 9,  name: 'Free Range Eggs',   category: 'Dairy',      qty: 8,   expiresIn: 12, unit: 'dozens', discountPct: 0  },
  { id: 10, name: 'Wholegrain Pasta',  category: 'Bakery',     qty: 200, expiresIn: 90, unit: 'packs',  discountPct: 0  },
]

const SUGGESTIONS = [
  {
    id: 1,
    action: 'markdown',
    risk: 'high',
    product: 'Organic Spinach',
    store: 'Green Valley Market',
    qty: 45,
    discountPct: 30,
    targetStore: null,
    explanation: 'Expires in 2 days. Current velocity suggests only 12 units will sell at full price. A 30% discount should clear remaining stock.',
  },
  {
    id: 2,
    action: 'markdown',
    risk: 'high',
    product: 'Ripe Bananas',
    store: 'Green Valley Market',
    qty: 32,
    discountPct: 40,
    targetStore: null,
    explanation: 'Overripe tomorrow. Historical data shows 40% discount moves bananas quickly. Act today.',
  },
  {
    id: 3,
    action: 'transfer',
    risk: 'medium',
    product: 'Chicken Breast',
    store: 'Green Valley Market',
    qty: 15,
    discountPct: 0,
    targetStore: 'Harbour Fresh',
    explanation: 'Harbour Fresh is nearly out of chicken. Transferring 15 kg prevents a stockout and avoids waste here.',
  },
  {
    id: 4,
    action: 'reorder',
    risk: 'low',
    product: 'Free Range Eggs',
    store: 'Green Valley Market',
    qty: 60,
    discountPct: 0,
    targetStore: null,
    explanation: 'Only 8 dozens left. Forecast demand for next week is 48 dozens. Reorder 60 to stay stocked.',
  },
  {
    id: 5,
    action: 'markdown',
    risk: 'medium',
    product: 'Sourdough Bread',
    store: 'City Centre Store',
    qty: 18,
    discountPct: 20,
    targetStore: null,
    explanation: 'Expires tomorrow. A 20% discount aligns with competitor pricing and should clear remaining loaves.',
  },
]

const ACTION_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  markdown: { label: 'Markdown',  icon: Tag,         color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
  transfer: { label: 'Transfer',  icon: ArrowLeftRight, color: 'bg-blue-500/10 text-blue-700 border-blue-200'  },
  reorder:  { label: 'Reorder',   icon: RefreshCw,   color: 'bg-green-500/10 text-green-700 border-green-200' },
}

const RISK_META: Record<string, { label: string; variant: 'destructive' | 'secondary' | 'outline' }> = {
  high:   { label: 'High risk',   variant: 'destructive' },
  medium: { label: 'Medium risk', variant: 'secondary'   },
  low:    { label: 'Low risk',    variant: 'outline'      },
}

export default async function MerchantPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireRole('merchant')
  const { denied } = await searchParams

  const atRisk   = INVENTORY.filter((i) => i.expiresIn <= 3)
  const lowStock = INVENTORY.filter((i) => i.qty < 10)

  return (
    <AppShell
      user={user}
      title="Merchant Dashboard"
      subtitle="Review AI suggestions and manage your store inventory."
      denied={!!denied}
    >
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total SKUs tracked"   value={INVENTORY.length} hint="Across your store" />
        <StatCard label="Items at risk"         value={atRisk.length}    hint="Expire within 3 days" />
        <StatCard label="Low stock alerts"      value={lowStock.length}  hint="Under 10 units" />
        <StatCard label="Pending suggestions"   value={SUGGESTIONS.length} hint="Awaiting your review" />
      </div>

      {/* AI suggestions */}
      <Panel
        title="🤖 Smart Suggestions"
        description="AI-generated actions to reduce waste and prevent stockouts. You decide what happens."
        action={
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium transition-all hover:border-primary/40 hover:bg-accent"
          >
            <RefreshCw className="size-4" />
            Re-run analysis
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          {SUGGESTIONS.map((s) => {
            const am = ACTION_META[s.action]
            const rm = RISK_META[s.risk]
            const Icon = am.icon
            return (
              <div
                key={s.id}
                className="flex flex-col gap-3 rounded-2xl border bg-background p-4 sm:flex-row sm:items-start sm:gap-5"
              >
                {/* Action badge */}
                <div className={`flex shrink-0 items-center gap-2 self-start rounded-xl border px-3 py-2 text-sm font-medium ${am.color}`}>
                  <Icon className="size-4" />
                  {am.label}
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{s.product}</span>
                    <span className="text-sm text-muted-foreground">@ {s.store}</span>
                    <Badge variant={rm.variant} className="text-xs">{rm.label}</Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{s.explanation}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {s.action === 'markdown' && (
                      <>
                        <span className="flex items-center gap-1"><Tag className="size-3" />{s.discountPct}% off</span>
                        <span className="flex items-center gap-1"><PackageCheck className="size-3" />{s.qty} units</span>
                      </>
                    )}
                    {s.action === 'transfer' && (
                      <>
                        <span className="flex items-center gap-1"><ArrowLeftRight className="size-3" />Move {s.qty} units</span>
                        <span>→ {s.targetStore}</span>
                      </>
                    )}
                    {s.action === 'reorder' && (
                      <span className="flex items-center gap-1"><RefreshCw className="size-3" />Order {s.qty} units</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2 self-start">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                  >
                    <CheckCircle2 className="size-3.5" />
                    Approve
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium transition-all hover:border-destructive/40 hover:text-destructive active:scale-95"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      {/* Inventory table */}
      <Panel title="Current Inventory" description="Live stock levels at Green Valley Market.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Product</th>
                <th className="pb-3 pr-4 font-medium">Category</th>
                <th className="pb-3 pr-4 font-medium text-right">Qty</th>
                <th className="pb-3 pr-4 font-medium text-right">Expires</th>
                <th className="pb-3 font-medium text-right">Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {INVENTORY.map((item) => (
                <tr key={item.id} className="group hover:bg-muted/40">
                  <td className="py-3 pr-4 font-medium">{item.name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{item.category}</td>
                  <td className="py-3 pr-4 text-right">
                    <span className={item.qty < 10 ? 'font-semibold text-destructive' : ''}>
                      {item.qty} {item.unit}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.expiresIn <= 2
                          ? 'bg-destructive/10 text-destructive'
                          : item.expiresIn <= 5
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Clock className="size-3" />
                      {item.expiresIn}d
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {item.discountPct > 0 ? (
                      <Badge className="bg-green-600 text-white hover:bg-green-700">-{item.discountPct}%</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Quick charts (bar-like visual using CSS) */}
      <Panel title="Sales Trend (Last 7 Days)" description="Units sold per day across your store.">
        <SalesTrendChart />
      </Panel>
    </AppShell>
  )
}

function SalesTrendChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const values = [42, 58, 51, 67, 73, 95, 82]
  const max = Math.max(...values)

  return (
    <div className="flex items-end gap-2 pt-2">
      {days.map((day, i) => (
        <div key={day} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-medium text-foreground">{values[i]}</span>
          <div
            className="w-full rounded-t-lg bg-primary/80 transition-all hover:bg-primary"
            style={{ height: `${(values[i] / max) * 120}px` }}
            title={`${day}: ${values[i]} units`}
          />
          <span className="text-xs text-muted-foreground">{day}</span>
        </div>
      ))}
    </div>
  )
}
