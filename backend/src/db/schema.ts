import { int, sqliteTable, text, real } from 'drizzle-orm/sqlite-core'
import { sql } from "drizzle-orm"
import { boolean } from 'drizzle-orm/mysql-core/index';

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
  name: text(),
  emoji: text(),
  bg_color: text(),
  category: int().references(() => categoriesTable.id),
  price: int(),
  old_price: int(),
  sold: int(),
  percentage: int(),
  desc: text(),
  sold_out: boolean()
})

export const categoriesTable = sqliteTable("categories", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text(),
  alias: text(),
  emoji: text()
})

export const vouchersTable = sqliteTable("vouchers", {
  id: int().primaryKey({ autoIncrement: true }),
  code: text(),
  discount: real(),
  max_uses: int(),
  notes: text()
})
