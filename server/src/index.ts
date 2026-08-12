import { serve } from '@hono/node-server'
import { Pool } from 'pg'
import { createApp } from './app.js'
import { configFrom } from './config.js'
import { migrate } from './migrate.js'
const config = configFrom(process.env)
const pool = new Pool({ connectionString: config.DATABASE_URL, ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined })
async function main() {
  await migrate(pool)
  serve({ fetch: createApp(pool, config).fetch, port: config.PORT })
}
main().catch(error => { console.error(error); process.exit(1) })
