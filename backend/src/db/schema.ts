import { int, sqliteTable, text, real } from 'drizzle-orm/sqlite-core'
import { sql } from "drizzle-orm"

// Database schema based on the **PUBLIC!** DB_CHUAN_FINAL_V4.
// also add some more stuff based on frontend/script.js

export const ordersTable = sqliteTable("orders", {
  id: int().primaryKey({ autoIncrement: true }),
  user: text(),
  // store data as a JSON string
  items: text(),
  total: int(),
  status: int({ mode: 'timestamp'}).default(sql`(CURRENT_TIMESTAMP)`)
});

export const productsTable = sqliteTable("products", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  emoji: text().notNull(),
  bg_color: text().notNull(),
  category: int().references(() => categoriesTable.id).notNull(),
  price: int().notNull(),
  old_price: int().notNull(),
  sold: int().notNull(),
  percentage: int().notNull(),
  desc: text().notNull(),
  sold_out: int({mode: 'boolean'}).default(sql`FALSE`).notNull()
})

export const categoriesTable = sqliteTable("categories", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  alias: text().notNull(),
  emoji: text().notNull()
})

export const vouchersTable = sqliteTable("vouchers", {
  id: int().primaryKey({ autoIncrement: true }),
  code: text(),
  discount: real(),
  max_uses: int(),
  notes: text()
})
