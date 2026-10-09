'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Leaf, Loader2, MessageCircle, Send, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant'
type Message = { id: string; role: Role; text: string; time: string }

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  text: "Hi! 👋 I'm the **ZeroWaste Assistant**.\n\nI can help you find deals, understand how our AI works, or navigate the platform. What would you like to know?",
  time: nowTime(),
}

const SUGGESTIONS = [
  'What deals are available?',
  'How does the AI work?',
  'Which stores do you have?',
  'How do I log in?',
]

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
// Converts **bold**, bullet lists, and line-breaks to JSX — no extra deps.

function renderText(text: string) {
  return text.split('\n').map((line, i) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>
      }
      return part
    })

    // Bullet list item
    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <li key={i} className="ml-4 list-disc">
          {parts.slice(1)}
        </li>
      )
    }

    // Table row (simple pipe detection)
    if (line.startsWith('|')) {
      const cells = line.split('|').filter(Boolean)
      if (cells.every((c) => c.trim().match(/^-+$/))) return null // separator row
      return (
        <tr key={i} className="border-b border-white/10">
          {cells.map((c, ci) => (
            <td key={ci} className="px-2 py-0.5 text-xs">
              {c.trim()}
            </td>
          ))}
        </tr>
      )
    }

    // Emoji-prefixed line (treat as block)
    if (line.trim() === '') return <br key={i} />
    return <p key={i}>{parts}</p>
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens; reset unread count
  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [open])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: trimmed,
      time: nowTime(),
    }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })
      const { reply } = await res.json()
      const botMsg: Message = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        text: reply,
        time: nowTime(),
      }
      setMessages((m) => [...m, botMsg])
      if (!open) setUnread((n) => n + 1)
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          text: "Sorry, something went wrong. Please try again! 😊",
          time: nowTime(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <>
      {/* ── Floating bubble ───────────────────────────────────────── */}
      <motion.button
        type="button"
        aria-label={open ? 'Close assistant' : 'Open ZeroWaste Assistant'}
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <MessageCircle className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {unread > 0 && !open && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </motion.button>

      {/* ── Chat panel ────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-50 flex w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-black/20"
            role="dialog"
            aria-label="ZeroWaste Assistant"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b bg-primary px-4 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                <Leaf className="size-5 text-primary-foreground" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary-foreground">ZeroWaste Assistant</p>
                <p className="flex items-center gap-1.5 text-xs text-primary-foreground/70">
                  <span className="size-1.5 rounded-full bg-green-400" />
                  Online — Ask me anything
                </p>
              </div>
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
                className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-full text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4" style={{ maxHeight: '22rem', minHeight: '14rem' }}>
              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  {/* Avatar */}
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center self-end rounded-full text-xs',
                      msg.role === 'assistant'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {msg.role === 'assistant' ? <Bot className="size-4" /> : '👤'}
                  </span>

                  {/* Bubble */}
                  <div
                    className={cn(
                      'flex max-w-[78%] flex-col gap-1 rounded-2xl px-3 py-2 text-sm leading-relaxed',
                      msg.role === 'assistant'
                        ? 'rounded-tl-sm bg-muted text-foreground'
                        : 'rounded-tr-sm bg-primary text-primary-foreground',
                    )}
                  >
                    <div className="flex flex-col gap-0.5">{renderText(msg.text)}</div>
                    <span
                      className={cn(
                        'self-end text-[10px]',
                        msg.role === 'assistant' ? 'text-muted-foreground' : 'text-primary-foreground/60',
                      )}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="size-4" />
                  </span>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-3 py-2.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="size-2 rounded-full bg-muted-foreground/50"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick suggestion chips — show only on first message */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 border-t bg-muted/40 px-3 py-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border bg-card px-2.5 py-1 text-xs font-medium transition-all hover:border-primary/40 hover:bg-accent active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 border-t bg-card px-3 py-2.5">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask me anything…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                disabled={loading}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                aria-label="Chat message"
              />
              <button
                type="button"
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 active:scale-95"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
