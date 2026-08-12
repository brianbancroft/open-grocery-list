import { describe, expect, it } from 'vitest'
import { configFrom } from '../src/config.js'

describe('runtime configuration', () => {
  it('permits Apple settings to remain unset while infrastructure is provisioned', () => {
    const config = configFrom({ DATABASE_URL: 'postgres://user:pass@localhost:5432/familylists' })
    expect(config.APPLE_BUNDLE_ID).toBe('')
    expect(config.adminSubs).toEqual(new Set())
  })
})
