import type { Metadata } from 'next'
import {
  Activity, CheckCircle2, MapPin, Package,
  ShieldCheck, Store, TrendingDown, TrendingUp, Users, XCircle,
} from 'lucide-react'
import { requireRole } from '@/lib/session'
import { AppShell, StatCard, Panel } from '@/components/dashboard/app-shell'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Admin Dashboard — ZeroWaste' }

// ─── Mock data ────────────────────────────────────────────────────────────────

const STORES = [
  { id: 1, name: 'Green Valley Market',  city: 'Dublin',   products: 142, atRisk: 12, status: 'active' },
  { id: 2, name: 'City Centre Store',    city: 'Dublin',   products: 118, atRisk: 8,  status: 'active' },
  { id: 3, name: 'Harbour Fresh',        city: 'Cork',     products: 97,  atRisk: 5,  status: 'active' },
  { id: 4, name: 'Riverside Foods',      city: 'Galway',   products: 105, atRisk: 9,  status: 'active' },
  { id: 5, name: 'Northside Grocery',    city: 'Limerick', products: 88,  atRisk: 3,  status: 'active' },
  { id: 6, name: 'Eastgate Market',      city: 'Waterford',products: 76,  atRisk: 6,  status: 'inactive' },
  { id: 7, name: 'Westlands Fresh',      city: 'Sligo',    products: 64,  atRisk: 2,  status: 'active' },
  { id: 8, name: 'SouthPark Grocery',    city: 'Kilkenny', products: 83,  atRisk: 4,  status: 'active' },
]

const USERS = [
  { id: 1, name: 'Alice Murphy',    email: 'alice@zerowaste.demo',    role: 'merchant', store: 'Green Valley Market', joined: '2025-03-12', active: true },
  { id: 2, name: 'Bob Keane',       email: 'bob@zerowaste.demo',      role: 'merchant', store: 'City Centre Store',   joined: '2025-04-01', active: true },
  { id: 3, name: 'Clara Doherty',   email: 'clara@zerowaste.demo',    role: 'customer', store: '—',                   joined: '2025-05-15', active: true },
  { id: 4, name: 'Derek Walsh',     email: 'derek@zerowaste.demo',    role: 'merchant', store: 'Harbour Fresh',       joined: '2025-02-20', active: true },
  { id: 5, name: 'Emma Byrne',      email: 'emma@zerowaste.demo',     role: 'customer', store: '—',                   joined: '2025-06-01', active: false },
  { id: 6, name: 'Frank O\'Brien',  email: 'frank@zerowaste.demo',    role: 'merchant', store: 'Riverside Foods',     joined: '2025-01-08', active: true },
  { id: 7, name: 'Grace Higgins',   email: 'grace@zerowaste.demo',    role: 'admin',    store: '—',                   joined: '2024-11-30', active: true },
  { id: 8, name: 'Harry Nolan',     email: 'harry@zerowaste.demo',    role: 'customer', store: '—',                   joined: '2025-07-10', active: true },
]

const RECENT_ACTIVITY = [
  { id: 1, actor: 'Alice Murphy',  action: 'Approved markdown',   detail: '-30% on Organic Spinach @ Green Valley',    time: '2 min ago',  type: 'approve' },
  { id: 2, actor: 'Bob Keane',     action: 'Rejected transfer',   detail: 'Chicken Breast → Harbour Fresh',            time: '14 min ago', type: 'reject'  },
  { id: 3, actor: 'Derek Walsh',   action: 'Approved reorder',    detail: '60x Free Range Eggs @ Harbour Fresh',       time: '1 hr ago',   type: 'approve' },
  { id: 4, actor: 'System',        action: 'AI analysis ran',     detail: '24 new suggestions generated',             time: '2 hr ago',   type: 'system'  },
  { id: 5, actor: 'Frank O\'Brien',action: 'Approved transfer',   detail: '15 kg Chicken Breast → Harbour Fresh',     time: '3 hr ago',   type: 'approve' },
  { id: 6, actor: 'System',        action: 'AI analysis ran',     detail: '18 new suggestions generated',             time: '1 day ago',  type: 'system'  },
  { id: 7, actor: 'Alice Murphy',  action: 'Approved markdown',   detail: '-40% on Ripe Bananas @ Green Valley',      time: '1 day ago',  type: 'approve' },
  { id: 8, actor: 'Bob Keane',     action: 'Approved markdown',   detail: '-20% on Sourdough Bread @ City Centre',    time: '1 day ago',  type: 'approve' },
]

const WASTE_SAVED = [
  { month: 'May',  kg: 320 },
  { month: 'Jun',  kg: 415 },
  { month: 'Jul',  kg: 390 },
  { month: 'Aug',  kg: 502 },
  { month: 'Sep',  kg: 467 },
  { month: 'Oct',  kg: 541 },
]

const ROLE_META: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  admin:    { label: 'Admin',    variant: 'default'    },
  merchant: { label: 'Merchant', variant: 'secondary'  },
  customer: { label: 'Customer', variant: 'outline'    },
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireRole('admin')
  const { denied } = await searchParams

  const totalAtRisk  = STORES.reduce((s, x) => s + x.atRisk, 0)
  const activeStores = STORES.filter((s) => s.status === 'active').length
  const activeUsers  = USERS.filter((u) => u.active).length

  return (
    <AppShell
      user={user}
      title="Admin Dashboard"
      subtitle="System-wide overview — stores, users, waste, and activity."
      denied={!!denied}
    >
      {/* KPI stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active stores"     value={activeStores}          hint={`${STORES.length} total`} />
        <StatCard label="Registered users"  value={activeUsers}           hint={`${USERS.length} total`} />
        <StatCard label="Items at risk"     value={totalAtRisk}           hint="Expiring within 3 days" />
        <StatCard label="Waste saved (kg)"  value="2,635"                 hint="Across all stores, all time" />
      </div>

      {/* Waste saved trend */}
      <Panel title="🌿 Waste Saved (kg) — Last 6 Months" description="Estimated food saved from landfill across all stores.">
        <WasteSavedChart data={WASTE_SAVED} />
      </Panel>

      {/* Stores table */}
      <Panel
        title="Store Overview"
        description="All registered stores and their current risk status."
        action={
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
          >
            <Store className="size-4" />
            Add store
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Store</th>
                <th className="pb-3 pr-4 font-medium">City</th>
                <th className="pb-3 pr-4 font-medium text-right">Products</th>
                <th className="pb-3 pr-4 font-medium text-right">At risk</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {STORES.map((s) => (
                <tr key={s.id} className="hover:bg-muted/40">
                  <td className="py-3 pr-4 font-medium">{s.name}</td>
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="size-3" />{s.city}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="flex items-center justify-end gap-1">
                      <Package className="size-3 text-muted-foreground" />{s.products}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className={`font-medium ${s.atRisk > 8 ? 'text-destructive' : s.atRisk > 4 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      {s.atRisk}
                    </span>
                  </td>
                  <td className="py-3">
                    {s.status === 'active' ? (
                      <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
                        <CheckCircle2 className="mr-1 size-3" />Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-muted text-muted-foreground">
                        <XCircle className="mr-1 size-3" />Inactive
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Users table + activity side by side on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users */}
        <Panel
          title="Users"
          description="All registered accounts."
          action={
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium transition-all hover:border-primary/40 hover:bg-accent"
            >
              <Users className="size-3.5" />
              Invite user
            </button>
          }
        >
          <div className="flex flex-col divide-y">
            {USERS.map((u) => {
              const rm = ROLE_META[u.role]
              return (
                <div key={u.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className={`truncate font-medium text-sm ${!u.active ? 'opacity-50' : ''}`}>{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant={rm.variant} className="text-xs">{rm.label}</Badge>
                    {!u.active && <span className="text-xs text-muted-foreground">Inactive</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

        {/* Recent activity */}
        <Panel title="Recent Activity" description="Latest decisions and system events.">
          <div className="flex flex-col gap-3">
            {RECENT_ACTIVITY.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
                    a.type === 'approve' ? 'bg-green-100 text-green-700'
                    : a.type === 'reject' ? 'bg-red-100 text-red-600'
                    : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {a.type === 'approve' ? <CheckCircle2 className="size-3.5" />
                   : a.type === 'reject' ? <XCircle className="size-3.5" />
                   : <Activity className="size-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{a.actor}</span>{' '}
                    <span className="text-muted-foreground">{a.action}</span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{a.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Role breakdown */}
      <Panel title="User Role Breakdown" description="Distribution of roles across registered users.">
        <RoleBreakdown users={USERS} />
      </Panel>
    </AppShell>
  )
}

function WasteSavedChart({ data }: { data: { month: string; kg: number }[] }) {
  const max = Math.max(...data.map((d) => d.kg))
  return (
    <div className="flex items-end gap-3 pt-2">
      {data.map((d) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-medium">{d.kg}</span>
          <div
            className="w-full rounded-t-lg bg-green-500/80 transition-all hover:bg-green-600"
            style={{ height: `${(d.kg / max) * 120}px` }}
            title={`${d.month}: ${d.kg} kg`}
          />
          <span className="text-xs text-muted-foreground">{d.month}</span>
        </div>
      ))}
    </div>
  )
}

function RoleBreakdown({ users }: { users: typeof USERS }) {
  const counts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const total = users.length
  const colors: Record<string, string> = {
    admin:    'bg-primary',
    merchant: 'bg-secondary',
    customer: 'bg-accent border border-border',
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-4 w-full overflow-hidden rounded-full">
        {Object.entries(counts).map(([role, count]) => (
          <div
            key={role}
            className={`${colors[role]} transition-all`}
            style={{ width: `${(count / total) * 100}%` }}
            title={`${role}: ${count}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {Object.entries(counts).map(([role, count]) => (
          <div key={role} className="flex items-center gap-2 text-sm">
            <span className={`size-3 rounded-full ${colors[role]}`} />
            <span className="capitalize text-muted-foreground">{role}</span>
            <span className="font-semibold">{count}</span>
            <span className="text-muted-foreground">({Math.round((count / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}
