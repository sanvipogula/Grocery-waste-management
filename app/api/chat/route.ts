import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// ─── Knowledge base ──────────────────────────────────────────────────────────
// Pattern → response pairs. Matched top-to-bottom; first match wins.

const KB: Array<{ patterns: RegExp[]; reply: string | ((m: RegExpMatchArray) => string) }> = [
  // Greetings
  {
    patterns: [/\b(hi|hello|hey|howdy|greetings)\b/i],
    reply: "Hi there! 👋 I'm ZeroWaste Assistant. I can help you with:\n\n• Finding discounted products 🛒\n• Understanding how our AI suggestions work 🤖\n• Navigating your dashboard\n• Anything about reducing food waste 🌿\n\nWhat can I help you with today?",
  },

  // What is zerowaste
  {
    patterns: [/what is zero.?waste|what does this (app|platform|site) do|tell me about/i],
    reply: "**ZeroWaste** is a smart grocery platform that helps:\n\n🏪 **Stores** reduce food waste by tracking expiry dates, predicting demand, and acting early.\n\n🛒 **Customers** find discounted products that would otherwise go to waste.\n\n🤖 **AI agents** analyse stock data 24/7 and suggest markdowns, transfers, or reorders — but a human always approves.",
  },

  // How AI works
  {
    patterns: [/how (does|do) (the )?ai|how (does|do) (the )?agent|how (does|do) suggestion|explain (the )?ai/i],
    reply: "Our AI runs three agents working together:\n\n1. **Demand Agent** — forecasts daily sales using a weighted moving average of the last 28 days.\n\n2. **Spoilage Agent** — compares expected sales vs. stock on hand vs. expiry date to find surplus.\n\n3. **Coordinator Agent** — picks the best action:\n   - 🔄 **Transfer** surplus to a store that needs it\n   - 🏷️ **Markdown** items that can't be transferred in time\n   - 📦 **Reorder** when a stockout is forecast\n\nMerchants review every suggestion before anything happens.",
  },

  // Discount / deals
  {
    patterns: [/discount|deal|sale|cheap|offer|saving/i],
    reply: "Great news! Today's flash deals include:\n\n🍌 **Ripe Bananas** — 40% off (expires tomorrow)\n🌿 **Organic Spinach** — 30% off (expires in 2 days)\n🍓 **Strawberries** — 35% off (expires in 2 days)\n🍞 **Sourdough Bread** — 20% off (expires tomorrow)\n🍗 **Chicken Breast** — 25% off (expires in 2 days)\n\nHead to the **Shop** page to grab them before they're gone!",
  },

  // Expiry / expiring soon
  {
    patterns: [/expir|going off|best before|use by|spoil/i],
    reply: "Items expiring **within 3 days** are flagged automatically. Here's what's urgent:\n\n⚠️ **Expires tomorrow:** Sourdough Bread, Ripe Bananas\n🟡 **Expires in 2 days:** Organic Spinach, Chicken Breast, Strawberries\n🟢 **Expires in 3 days:** Cherry Tomatoes, Broccoli\n\nThese all have discounts applied. Buy them today and help reduce waste! 🌱",
  },

  // Stock / inventory
  {
    patterns: [/stock|inventor|how many|quantity|units/i],
    reply: "Here's a quick snapshot of current inventory:\n\n| Product | Stock | Status |\n|---|---|---|\n| Wholegrain Pasta | 200 packs | ✅ Healthy |\n| Red Apples | 120 kg | ✅ Healthy |\n| Organic Spinach | 45 bags | ⚠️ At risk |\n| Chicken Breast | 25 kg | ⚠️ At risk |\n| Free Range Eggs | 8 dozens | 🔴 Low stock |\n\nMerchants can see the full table in their dashboard.",
  },

  // Login / signup / account
  {
    patterns: [/login|log in|sign.?in|sign.?up|register|account|password/i],
    reply: "To get started:\n\n1. Go to the **Login** page (top right)\n2. Pick your role: Customer, Merchant, or Admin\n3. Click **\"Fill in demo details\"** for instant access — no real email needed!\n\nOr **Sign Up** to create a customer account with any email and a password (min 8 characters).",
  },

  // Roles
  {
    patterns: [/role|customer|merchant|admin|manager|who can/i],
    reply: "There are **3 roles** on ZeroWaste:\n\n👛 **Customer** — Browse products, find deals, place orders. Go to `/shop` after login.\n\n🏪 **Merchant** — Manage your store's inventory, review AI suggestions, approve actions. Go to `/merchant`.\n\n🛡️ **Admin** — System-wide oversight: stores, users, activity log, waste metrics. Go to `/admin`.",
  },

  // Transfer
  {
    patterns: [/transfer|move stock|move product|redistribute/i],
    reply: "**Stock transfers** are one of our most powerful waste-reduction tools.\n\nWhen Store A has surplus of a product that Store B is running low on, the AI suggests moving stock instead of discounting it — fresher product reaches more customers and nothing goes to waste.\n\nMerchants approve every transfer before it happens. The AI just spots the opportunity. 🔄",
  },

  // Reorder / replenish
  {
    patterns: [/reorder|replenish|order more|stockout|out of stock|running low/i],
    reply: "The AI monitors **days of cover** for every product — that's how many days the current stock will last at the current sales rate.\n\nWhen cover drops below the reorder lead time (2 days), a **reorder suggestion** is raised. The quantity is rounded up to the nearest case size (6 units) to keep things practical. 📦",
  },

  // Waste / sustainability
  {
    patterns: [/waste|sustain|environment|green|eco|planet|food saved/i],
    reply: "🌍 **Food waste by the numbers:**\n\n• ~1/3 of all food produced globally is wasted\n• Grocery stores are a major contributor\n• Most waste happens because of poor demand forecasting\n\nZeroWaste has helped save an estimated **2,635 kg** of food across our demo stores since May 2025 — that's roughly **6,000 meals** worth of food.\n\nEvery discounted item you buy helps! 🌱",
  },

  // Stores
  {
    patterns: [/store|location|where|city|near me/i],
    reply: "We currently have **8 partner stores** across Ireland:\n\n📍 Dublin — Green Valley Market, City Centre Store\n📍 Cork — Harbour Fresh\n📍 Galway — Riverside Foods\n📍 Limerick — Northside Grocery\n📍 Waterford — Eastgate Market\n📍 Sligo — Westlands Fresh\n📍 Kilkenny — SouthPark Grocery",
  },

  // Suggestion / recommendation
  {
    patterns: [/suggestion|recommend|pending|approve|reject/i],
    reply: "Merchants currently have **5 pending suggestions** to review:\n\n🏷️ Markdown Organic Spinach (-30%)\n🏷️ Markdown Ripe Bananas (-40%)\n🔄 Transfer Chicken Breast → Harbour Fresh\n📦 Reorder Free Range Eggs (60 dozens)\n🏷️ Markdown Sourdough Bread (-20%)\n\nMerchants can **Approve**, **Edit**, or **Reject** each one in their dashboard.",
  },

  // Help / what can you do
  {
    patterns: [/help|what can you|what do you|support|assist/i],
    reply: "I can help you with:\n\n🛒 **Shopping** — Find deals, check prices, discover discounted items\n📊 **Inventory** — Stock levels, expiry dates, risk items\n🤖 **AI system** — How suggestions work, what agents do\n🏪 **Stores** — Locations, products, availability\n👤 **Account** — Login, signup, roles explained\n🌿 **Sustainability** — Food waste facts and our impact\n\nJust ask me anything!",
  },

  // Thank you
  {
    patterns: [/thank|thanks|cheers|great|awesome|perfect|nice/i],
    reply: "You're welcome! 😊 Feel free to ask anything else — I'm here to help you get the most out of ZeroWaste. 🌿",
  },

  // Bye
  {
    patterns: [/bye|goodbye|see you|later|cya/i],
    reply: "Goodbye! 👋 Come back any time. And remember — every product you buy on discount helps save food from waste. 🌱",
  },
]

const FALLBACK =
  "I'm not sure about that one, but here are some things I can help with:\n\n• **Deals & discounts** — ask \"what deals are available?\"\n• **How the AI works** — ask \"explain the AI agents\"\n• **Stores & products** — ask \"which stores do you have?\"\n• **Getting started** — ask \"how do I log in?\"\n\nOr try rephrasing your question! 😊"

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { message } = (await req.json()) as { message: string }

  if (!message?.trim()) {
    return NextResponse.json({ reply: "Please type a message and I'll do my best to help! 😊" })
  }

  // Simulate a slight thinking delay (150–400ms)
  await new Promise((r) => setTimeout(r, 150 + Math.random() * 250))

  const lower = message.toLowerCase()
  for (const entry of KB) {
    for (const pat of entry.patterns) {
      const m = lower.match(pat)
      if (m) {
        const reply = typeof entry.reply === 'function' ? entry.reply(m) : entry.reply
        return NextResponse.json({ reply })
      }
    }
  }

  return NextResponse.json({ reply: FALLBACK })
}
