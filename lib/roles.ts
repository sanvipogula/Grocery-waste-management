export const ROLES = ['customer', 'merchant', 'admin'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_HOME: Record<Role, string> = {
  customer: '/shop',
  merchant: '/merchant',
  admin: '/admin',
}

export const ROLE_LABEL: Record<Role, string> = {
  customer: 'Customer',
  merchant: 'Merchant',
  admin: 'Administrator',
}

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}
