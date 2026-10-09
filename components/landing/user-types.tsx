import Link from 'next/link'
import { Check, ShieldCheck, ShoppingBasket, Store } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

const TYPES = [
  {
    icon: ShoppingBasket,
    title: 'Customer',
    points: ['Find available groceries.', 'Discover discounted products.', 'View products and place orders.'],
    cta: 'Customer Login',
    href: '/login?role=customer',
    featured: false,
  },
  {
    icon: Store,
    title: 'Merchant / Store Manager',
    points: ['Track stock and expiry dates.', 'View smart recommendations.', 'Approve, edit, or reject suggestions.'],
    cta: 'Merchant Login',
    href: '/login?role=merchant',
    featured: true,
  },
  {
    icon: ShieldCheck,
    title: 'Administrator',
    points: ['Manage stores and users.', 'Monitor inventory and system activity.', 'View overall reports.'],
    cta: 'Admin Login',
    href: '/login?role=admin',
    featured: false,
  },
]

export function UserTypes() {
  return (
    <section id="users" className="scroll-mt-16 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Who It's For"
          title="One place for everyone"
          text="Each person gets their own space, with only the tools they need."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TYPES.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.1} className="h-full">
              <div
                className={cn(
                  'flex h-full flex-col gap-5 rounded-3xl border p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
                  t.featured ? 'border-primary bg-primary text-primary-foreground' : 'bg-card',
                )}
              >
                <span
                  className={cn(
                    'flex size-12 items-center justify-center rounded-2xl',
                    t.featured ? 'bg-primary-foreground/15' : 'bg-accent text-primary',
                  )}
                >
                  <t.icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="font-sans text-xl font-semibold">{t.title}</h3>
                <ul className="flex flex-1 flex-col gap-3">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <Check
                        className={cn('mt-0.5 size-4 shrink-0', t.featured ? 'text-secondary' : 'text-primary')}
                        aria-hidden="true"
                      />
                      <span className={t.featured ? 'text-primary-foreground/90' : 'text-muted-foreground'}>{p}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={t.href}
                  className={cn(
                    buttonVariants({ variant: t.featured ? 'secondary' : 'outline' }),
                    'h-11 w-full rounded-full text-sm',
                  )}
                >
                  {t.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
