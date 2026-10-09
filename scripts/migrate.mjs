import pg from 'pg'

const statements = [
  `CREATE TABLE IF NOT EXISTS "user" (
    "id" text PRIMARY KEY,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "emailVerified" boolean NOT NULL DEFAULT false,
    "image" text,
    "role" text NOT NULL DEFAULT 'customer',
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text NOT NULL DEFAULT 'customer'`,
  `CREATE TABLE IF NOT EXISTS "session" (
    "id" text PRIMARY KEY,
    "expiresAt" timestamp NOT NULL,
    "token" text NOT NULL UNIQUE,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "account" (
    "id" text PRIMARY KEY,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp,
    "refreshTokenExpiresAt" timestamp,
    "scope" text,
    "password" text,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "verification" (
    "id" text PRIMARY KEY,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expiresAt" timestamp NOT NULL,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS stores (
    id serial PRIMARY KEY,
    name text NOT NULL,
    city text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id serial PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    unit text NOT NULL,
    price numeric(10,2) NOT NULL,
    shelf_life_days integer NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS inventory (
    id serial PRIMARY KEY,
    store_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL DEFAULT 0,
    expiry_date date NOT NULL,
    discount_pct integer NOT NULL DEFAULT 0,
    incoming_quantity integer NOT NULL DEFAULT 0,
    updated_at timestamp NOT NULL DEFAULT now(),
    UNIQUE (store_id, product_id)
  )`,
  `CREATE TABLE IF NOT EXISTS sales (
    id serial PRIMARY KEY,
    store_id integer NOT NULL,
    product_id integer NOT NULL,
    sale_date date NOT NULL,
    quantity integer NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS sales_store_product_date_idx ON sales (store_id, product_id, sale_date)`,
  `CREATE TABLE IF NOT EXISTS recommendations (
    id serial PRIMARY KEY,
    run_id text NOT NULL,
    store_id integer NOT NULL,
    product_id integer NOT NULL,
    action text NOT NULL,
    quantity integer NOT NULL DEFAULT 0,
    discount_pct integer NOT NULL DEFAULT 0,
    target_store_id integer,
    risk text NOT NULL,
    forecast_daily numeric(10,2) NOT NULL,
    explanation text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS decisions (
    id serial PRIMARY KEY,
    recommendation_id integer NOT NULL,
    "userId" text NOT NULL,
    user_name text NOT NULL,
    decision text NOT NULL,
    note text,
    summary text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id serial PRIMARY KEY,
    "userId" text NOT NULL,
    store_id integer NOT NULL,
    total numeric(10,2) NOT NULL,
    status text NOT NULL DEFAULT 'placed',
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id serial PRIMARY KEY,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL
  )`,
]

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
for (const sql of statements) {
  await client.query(sql)
}
const { rows } = await client.query(
  `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
)
console.log('Tables:', rows.map((r) => r.table_name).join(', '))
await client.end()
