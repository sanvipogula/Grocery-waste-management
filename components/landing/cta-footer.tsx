import Link from 'next/link'
import { ArrowRight, Leaf, Mail } from 'lucide-react'
import { Logo } from '@/components/logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Reveal } from './reveal'
import { NAV_LINKS } from './nav-links'

export function FinalCta() {
  return (
    <section className="px-4 py-20 md:px-6 md:py-28">
      <Reveal className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-center text-primary-foreground md:px-16 md:py-20">
          <Leaf className="absolute -left-6 -top-6 size-32 rotate-12 text-primary-foreground/10" aria-hidden="true" />
          <Leaf
            className="absolute -bottom-8 -right-4 size-40 -rotate-45 text-primary-foreground/10"
            aria-hidden="true"
          />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
            {"Let's Save Food, One Grocery Item at a Time."}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-primary-foreground/85">
            Join us in making grocery shopping and inventory management smarter.
          </p>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ variant: 'secondary' }),
              'group relative mt-8 h-12 rounded-full px-7 text-base transition-transform hover:-translate-y-0.5',
            )}
          >
            Get Started
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-card/60 px-4 py-12 md:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Zero-Waste Grocery — Smarter Grocery, Less Waste. Built for a smarter, more sustainable grocery future.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="font-sans text-sm font-semibold">Explore</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-foreground">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/login" className="hover:text-foreground">
                Login
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-foreground">
                Get Started
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className="font-sans text-sm font-semibold">Contact</h2>
          <p className="mt-3 text-sm text-muted-foreground">Questions or ideas? We would love to hear from you.</p>
          <a
            href="mailto:hello@zerowaste.demo"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Mail className="size-4" aria-hidden="true" />
            hello@zerowaste.demo
          </a>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl border-t pt-6 text-center text-xs text-muted-foreground">
        {`© ${new Date().getFullYear()} ZeroWaste. Built for a smarter, more sustainable grocery future.`}
      </p>
    </footer>
  )
}
