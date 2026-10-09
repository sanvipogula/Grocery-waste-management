import { AlertTriangle, CalendarClock, Recycle, Tag, TrendingUp, Truck } from 'lucide-react'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

const FEATURES = [
  { icon: CalendarClock, title: 'Expiry Date Tracking', text: 'See which products are close to expiring at a glance.' },
  { icon: TrendingUp, title: 'Demand Prediction', text: 'Know how much of each product shoppers are likely to buy.' },
  { icon: Recycle, title: 'Food Waste Reduction', text: 'Act early so good food gets eaten instead of thrown away.' },
  { icon: Tag, title: 'Smart Discounts', text: 'Get a fair discount suggestion for items that need to sell soon.' },
  { icon: Truck, title: 'Store-to-Store Transfers', text: 'Move extra stock to a nearby store that is running low.' },
  { icon: AlertTriangle, title: 'Stock Shortage Alerts', text: 'Get a heads-up before popular products run out.' },
]

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 bg-card/60 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Features"
          title="Everything a store needs to waste less"
          text="Simple tools that help every product find a home."
        />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <li key={f.title}>
              <Reveal delay={(i % 3) * 0.08} className="h-full">
                <div className="group flex h-full gap-4 rounded-2xl border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-card hover:shadow-md">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-transform group-hover:scale-110">
                    <f.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-sans text-base font-semibold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
