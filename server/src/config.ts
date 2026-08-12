import { z } from 'zod'

const schema = z.object({
  DATABASE_URL: z.string().url(),
  // Deliberately permitted to be blank during infrastructure setup. Apple sign-in
  // then returns a configuration error while all non-auth infrastructure stays live.
  APPLE_BUNDLE_ID: z.string().optional().default(''),
  APPLE_ADMIN_SUBS: z.string().optional().default(''),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM: z.string().email().optional(),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
})
export type Config = z.infer<typeof schema> & { adminSubs: Set<string> }
export const configFrom = (env: NodeJS.ProcessEnv): Config => {
  const parsed = schema.parse(env)
  return { ...parsed, adminSubs: new Set(parsed.APPLE_ADMIN_SUBS.split(',').map(x => x.trim()).filter(Boolean)) }
}
