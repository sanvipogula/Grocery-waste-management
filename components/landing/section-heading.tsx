import { Reveal } from './reveal'

export function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
      <span className="text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</span>
      <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {text && <p className="text-lg leading-relaxed text-muted-foreground">{text}</p>}
    </Reveal>
  )
}
