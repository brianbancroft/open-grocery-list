import { z } from 'zod'
export const colors = ['red', 'orange', 'yellow', 'green', 'mint', 'blue', 'purple', 'pink'] as const
const name = (max: number) => z.string().trim().min(1).max(max)
const quantity = z.string().trim().max(80).transform(value => value || null)
export const authSchema = z.object({ identityToken: z.string().min(20), inviteCode: z.string().trim().min(8).max(128).optional(), displayName: name(100).optional() })
export const createListSchema = z.object({ name: name(100) })
export const updateListSchema = z.object({ name: name(100) })
export const createItemSchema = z.object({ name: name(140), quantity: quantity.optional(), colorLabel: z.enum(colors).default('blue') })
export const updateItemSchema = z.object({ name: name(140).optional(), quantity: quantity.optional(), colorLabel: z.enum(colors).optional() }).refine(x => x.name !== undefined || x.quantity !== undefined || x.colorLabel !== undefined)
export const inviteSchema = z.object({ email: z.string().trim().email().max(254) })
