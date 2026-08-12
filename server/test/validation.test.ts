import { describe, expect, it } from 'vitest'
import { colors, createItemSchema, createListSchema, updateItemSchema } from '../src/validation.js'
describe('request validation', () => {
  it('permits exactly the eight product color labels', () => { expect(colors).toHaveLength(8); for (const color of colors) expect(createItemSchema.safeParse({ name: 'Milk', colorLabel: color }).success).toBe(true); expect(createItemSchema.safeParse({ name: 'Milk', colorLabel: 'teal' }).success).toBe(false) })
  it('trims and rejects blank names', () => { expect(createListSchema.parse({ name: '  Shopping  ' }).name).toBe('Shopping'); expect(createListSchema.safeParse({ name: '   ' }).success).toBe(false) })
  it('does not allow an empty item patch', () => { expect(updateItemSchema.safeParse({}).success).toBe(false) })
  it('accepts a free-form quantity and stores an empty value as null', () => { expect(createItemSchema.parse({ name: 'Milk', quantity: ' 2 bottles ' }).quantity).toBe('2 bottles'); expect(createItemSchema.parse({ name: 'Milk', quantity: ' ' }).quantity).toBeNull() })
})
