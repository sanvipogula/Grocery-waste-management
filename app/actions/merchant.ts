'use server'

import { revalidatePath } from 'next/cache'
import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { decisions, inventory, products, recommendations, stores } from '@/lib/db/schema'
import { assertRole } from '@/lib/session'
import { runAgents } from '@/lib/agents/run'

export type ActionResult = { ok: true; message: string } | { ok: false; error: string }

const decisionSchema = z.object({
  id: z.number().int().positive(),
  decision: z.enum(['approved', 'edited', 'rejected']),
  quantity: z.number().int().min(0).max(10000).optional(),
  discountPct: z.number().int().min(0).max(90).optional(),
  note: z.string().trim().max(300).optional(),
})

export async function decideRecommendation(input: z.input<typeof decisionSchema>): Promise<ActionResult> {
  const me = await assertRole('merchant')
  const parsed = decisionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Please check the values you entered.' }
  const { id, decision, note } = parsed.data

  try {
    const message = await db.transaction(async (tx) => {
      const [rec] = await tx
        .select()
        .from(recommendations)
        .where(and(eq(recommendations.id, id), eq(recommendations.status, 'pending')))
        .for('update')
      if (!rec) throw new Error('This suggestion was already handled or replaced by a newer run.')

      const [product] = await tx.select().from(products).where(eq(products.id, rec.productId))
      const [store] = await tx.select().from(stores).where(eq(stores.id, rec.storeId))
      const name = `${product?.name ?? 'Product'} at ${store?.name ?? 'store'}`

      if (decision === 'rejected') {
        await tx.update(recommendations).set({ status: 'rejected' }).where(eq(recommendations.id, id))
        const summary = `Rejected ${rec.action} for ${name}.`
        await tx.insert(decisions).values({
          recommendationId: id,
          userId: me.id,
          userName: me.name,
          decision,
          note: note || null,
          summary,
        })
        return summary
      }

      const quantity = decision === 'edited' && parsed.data.quantity !== undefined ? parsed.data.quantity : rec.quantity
      const discountPct =
        decision === 'edited' && parsed.data.discountPct !== undefined ? parsed.data.discountPct : rec.discountPct

      const [source] = await tx
        .select()
        .from(inventory)
        .where(and(eq(inventory.storeId, rec.storeId), eq(inventory.productId, rec.productId)))
        .for('update')
      if (!source) throw new Error('Stock record not found.')

      let summary: string
      if (rec.action === 'markdown') {
        if (discountPct < 1) throw new Error('A discount must be at least 1%.')
        await tx
          .update(inventory)
          .set({ discountPct, updatedAt: new Date() })
          .where(eq(inventory.id, source.id))
        summary = `Set a ${discountPct}% discount on ${name}.`
      } else if (rec.action === 'transfer') {
        if (!rec.targetStoreId) throw new Error('This transfer has no destination store.')
        const moved = Math.min(quantity, source.quantity)
        if (moved < 1) throw new Error('There is no stock left to move.')
        await tx
          .update(inventory)
          .set({ quantity: source.quantity - moved, updatedAt: new Date() })
          .where(eq(inventory.id, source.id))
        await tx
          .insert(inventory)
          .values({
            storeId: rec.targetStoreId,
            productId: rec.productId,
            quantity: moved,
            expiryDate: source.expiryDate,
          })
          .onConflictDoUpdate({
            target: [inventory.storeId, inventory.productId],
            set: { quantity: sql`${inventory.quantity} + ${moved}`, updatedAt: new Date() },
          })
        const [target] = await tx.select().from(stores).where(eq(stores.id, rec.targetStoreId))
        summary = `Moved ${moved} ${product?.unit ?? 'units'} of ${product?.name} from ${store?.name} to ${target?.name}.`
      } else {
        if (quantity < 1) throw new Error('Reorder quantity must be at least 1.')
        await tx
          .update(inventory)
          .set({ incomingQuantity: source.incomingQuantity + quantity, updatedAt: new Date() })
          .where(eq(inventory.id, source.id))
        summary = `Placed a simulated reorder of ${quantity} ${product?.unit ?? 'units'} for ${name}.`
      }

      await tx
        .update(recommendations)
        .set({ status: decision, quantity, discountPct })
        .where(eq(recommendations.id, id))
      await tx.insert(decisions).values({
        recommendationId: id,
        userId: me.id,
        userName: me.name,
        decision,
        note: note || null,
        summary,
      })
      return summary
    })

    revalidatePath('/merchant')
    revalidatePath('/shop')
    return { ok: true, message }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Something went wrong.' }
  }
}

export async function rerunAgents(): Promise<ActionResult> {
  await assertRole('merchant')
  try {
    const result = await runAgents()
    revalidatePath('/merchant')
    return {
      ok: true,
      message: `Checked ${result.analyzed} stock items and prepared ${result.count} new suggestions for review.`,
    }
  } catch {
    return { ok: false, error: 'The agents could not run right now. Please try again.' }
  }
}
