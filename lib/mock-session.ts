/**
 * Mock session — stores role + user info in a plain cookie.
 * No database, no real auth. For frontend demo only.
 */

export const MOCK_COOKIE = 'mock_session'

export type MockSessionData = {
  id: string
  name: string
  email: string
  role: 'customer' | 'merchant' | 'admin'
}

/** Called server-side to read the mock session from cookies. */
export function parseMockSession(cookieValue: string | undefined): MockSessionData | null {
  if (!cookieValue) return null
  try {
    return JSON.parse(decodeURIComponent(cookieValue)) as MockSessionData
  } catch {
    return null
  }
}

/** Serialise session data into a cookie value string. */
export function serialiseMockSession(data: MockSessionData): string {
  return encodeURIComponent(JSON.stringify(data))
}
