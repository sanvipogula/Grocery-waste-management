import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('customer'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const stores = pgTable('stores', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  city: text('city').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  unit: text('unit').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  shelfLifeDays: integer('shelf_life_days').notNull(),
})

export const inventory = pgTable(
  'inventory',
  {
    id: serial('id').primaryKey(),
    storeId: integer('store_id').notNull(),
    productId: integer('product_id').notNull(),
    quantity: integer('quantity').notNull().default(0),
    expiryDate: date('expiry_date').notNull(),
    discountPct: integer('discount_pct').notNull().default(0),
    incomingQuantity: integer('incoming_quantity').notNull().default(0),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [unique().on(t.storeId, t.productId)],
)

export const sales = pgTable('sales', {
  id: serial('id').primaryKey(),
  storeId: integer('store_id').notNull(),
  productId: integer('product_id').notNull(),
  saleDate: date('sale_date').notNull(),
  quantity: integer('quantity').notNull(),
})

export const recommendations = pgTable('recommendations', {
  id: serial('id').primaryKey(),
  runId: text('run_id').notNull(),
  storeId: integer('store_id').notNull(),
  productId: integer('product_id').notNull(),
  action: text('action').notNull(),
  quantity: integer('quantity').notNull().default(0),
  discountPct: integer('discount_pct').notNull().default(0),
  targetStoreId: integer('target_store_id'),
  risk: text('risk').notNull(),
  forecastDaily: numeric('forecast_daily', { precision: 10, scale: 2 }).notNull(),
  explanation: text('explanation').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const decisions = pgTable('decisions', {
  id: serial('id').primaryKey(),
  recommendationId: integer('recommendation_id').notNull(),
  userId: text('userId').notNull(),
  userName: text('user_name').notNull(),
  decision: text('decision').notNull(),
  note: text('note'),
  summary: text('summary').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  storeId: integer('store_id').notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('placed'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull(),
  productId: integer('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
})
