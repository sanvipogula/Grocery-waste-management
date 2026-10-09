import { Brain, PackageCheck, Sprout } from 'lucide-react'
import { Counter } from './counter'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

const GOALS = [
  { icon: Sprout, title: 'Less food waste', text: 'Sell or move food before it spoils.' },
  { icon: PackageCheck, title: 'Better stock availability', text: 'Keep shelves full of what people want.' },
  { icon: Brain, title: 'Smarter grocery decisions', text: 'Clear suggestions, with a person always deciding.' },
]

export type DemoStats = { products: number; stores: number; atRisk: number; suggestions: number }

export function Impact({ stats }: { stats: DemoStats }) {
  const items = [
    { label: 'Products tracked', value: stats.products },
    { label: 'Stores in the demo', value: stats.stores },
    { label: 'Items close to expiry', value: stats.atRisk },
    { label: 'Suggestions waiting', value: stats.suggestions },
  ]

  return (
    <section id="about" className="scroll-mt-16 bg-card/60 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="About Us & Our Goals"
          title="Why we built ZeroWaste"
          text="A lot of good food is thrown away simply because it was in the wrong place at the wrong time. We are a student team building a simple helper so stores can spot problems early and act in time."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {GOALS.map((g, i) => (
            <Reveal key={g.title} delay={i * 0.1}>
              <div className="flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-b from-accent to-background p-8 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-card text-primary shadow-sm">
                  <g.icon className="size-7" aria-hidden="true" />
                </span>
                <h3 className="font-sans text-lg font-semibold">{g.title}</h3>
                <p className="text-muted-foreground">{g.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-10 rounded-3xl border border-dashed border-primary/30 bg-background p-6 md:p-8">
            <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {items.map((item) => (
                <div key={item.label} className="flex flex-col gap-1 text-center">
                  <dt className="order-2 text-sm text-muted-foreground">{item.label}</dt>
                  <dd className="order-1 font-serif text-4xl font-semibold text-primary">
                    <Counter value={item.value} />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Sample data: these numbers come from the simulated demo stores, not from real shops.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
