import { ClipboardList, Lightbulb, CheckCircle2 } from 'lucide-react'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Track Your Stock',
    text: 'Keep track of products, quantities, sales, and expiry dates.',
  },
  {
    icon: Lightbulb,
    title: 'Find the Best Action',
    text: 'Our smart system predicts demand, spots products that may expire, and finds possible shortages.',
  },
  {
    icon: CheckCircle2,
    title: 'Review and Take Action',
    text: 'Store managers review suggestions to discount, transfer, or reorder products.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="How It Works"
          title="Three simple steps"
          text="From the shelf to a smart decision, people stay in charge the whole way."
        />
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <Reveal delay={i * 0.1} className="h-full">
                <div className="group relative flex h-full flex-col gap-4 rounded-3xl border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <span className="absolute right-6 top-5 font-serif text-5xl font-semibold text-accent">
                    {i + 1}
                  </span>
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <step.icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="font-sans text-xl font-semibold">{step.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
