import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'customer',
        input: false,
      },
    },
  },
  trustedOrigins: ['http://localhost:3000'],
  session: {
    expiresIn: 60 * 60 * 24 * 7,   // 7 days
    updateAge: 60 * 60 * 24,         // refresh if older than 1 day
  },
})
