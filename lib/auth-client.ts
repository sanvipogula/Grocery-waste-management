'use client'

// --- MOCK: no real auth, simulates success and redirects to /dashboard ---
export const authClient = {
  signUp: {
    email: async (_: { name: string; email: string; password: string }) => {
      return { error: null }
    },
  },
  signIn: {
    email: async (_: { email: string; password: string }) => {
      return { error: null }
    },
  },
}
