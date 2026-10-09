import Image from 'next/image'
import { Logo } from '@/components/logo'

export function AuthShell({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-8 md:px-10">
        <Logo />
        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 py-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{text}</p>
          </div>
          {children}
        </main>
      </div>
      <div className="relative hidden items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--color-secondary)_0%,var(--color-accent)_70%)] lg:flex">
        <div className="flex max-w-md flex-col items-center gap-6 px-10 text-center">
          <Image
            src="/images/hero-groceries.png"
            alt=""
            width={420}
            height={420}
            className="h-auto w-80 drop-shadow-xl"
          />
          <p className="font-serif text-2xl font-semibold text-balance">Every product saved makes a difference.</p>
        </div>
      </div>
    </div>
  )
}
