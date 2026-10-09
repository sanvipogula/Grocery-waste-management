'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Heart, Leaf } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const LEAVES = [
  { top: '8%', left: '6%', size: 'size-7', delay: 0, rotate: -20 },
  { top: '18%', left: '88%', size: 'size-6', delay: 1.2, rotate: 30 },
  { top: '72%', left: '2%', size: 'size-5', delay: 0.6, rotate: 10 },
  { top: '82%', left: '84%', size: 'size-8', delay: 1.8, rotate: -35 },
  { top: '45%', left: '95%', size: 'size-4', delay: 2.4, rotate: 50 },
]

export function Hero() {
  const reduce = useReducedMotion()

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,var(--color-secondary)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,var(--color-accent)_0%,transparent_60%)]"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start gap-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 px-3 py-1 text-sm font-medium text-primary">
            <Leaf className="size-4" aria-hidden="true" />
            Smarter Grocery, Less Waste
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Fresh Food. <span className="text-primary">Less Waste.</span> Smarter Shopping.
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            Help grocery stores save food, reduce losses, and keep the right products available. Together, we can
            build a world with less food waste.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className={cn(
                buttonVariants(),
                'group h-12 rounded-full px-6 text-base shadow-md shadow-primary/20 transition-transform hover:-translate-y-0.5',
              )}
            >
              Get Started
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <a
              href="#how-it-works"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-12 rounded-full bg-card/70 px-6 text-base transition-transform hover:-translate-y-0.5',
              )}
            >
              How It Works
            </a>
          </div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="size-4 fill-primary/20 text-primary" aria-hidden="true" />
            Every product saved makes a difference.
          </p>
        </motion.div>

        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          <div className="absolute inset-6 rounded-full bg-secondary/60 blur-3xl" aria-hidden="true" />
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{
              opacity: { duration: 0.7 },
              scale: { duration: 0.7 },
              y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="relative"
          >
            <Image
              src="/images/hero-groceries.png"
              alt="A reusable shopping bag filled with fresh vegetables, fruit, and bread"
              width={640}
              height={640}
              priority
              className="h-auto w-full drop-shadow-xl"
            />
          </motion.div>
          {LEAVES.map((leaf, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="absolute text-primary/70"
              style={{ top: leaf.top, left: leaf.left }}
              initial={{ rotate: leaf.rotate }}
              animate={
                reduce ? undefined : { y: [0, -14, 0], rotate: [leaf.rotate, leaf.rotate + 15, leaf.rotate] }
              }
              transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: leaf.delay }}
            >
              <Leaf className={leaf.size} />
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  )
}
