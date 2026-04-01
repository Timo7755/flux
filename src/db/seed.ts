import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { eq } from 'drizzle-orm'

import { db } from '#/db/index'
import * as schema from '#/db/schema'
import { env } from '#/env'

const seedAuth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
})

async function seed() {
  const email = 'admin@flux.com'
  const password = 'AdminPassword123!'
  const name = 'Admin'

  const existing = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, email))
    .limit(1)

  if (existing.length > 0) {
    console.log('Admin user already exists, skipping.')
    process.exit(0)
  }

  const result = await seedAuth.api.signUpEmail({
    body: { email, password, name },
  })

  if (!result) {
    console.error('Failed to create admin user')
    process.exit(1)
  }

  await db
    .update(schema.user)
    .set({ isAdmin: true })
    .where(eq(schema.user.email, email))

  console.log(`Admin user seeded: ${email} / ${password}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
