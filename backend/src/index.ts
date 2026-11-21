import { Elysia } from "elysia";
import { cors } from "@elysia/cors"
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { categoriesTable, productsTable } from "./db/schema";
import { CompatProduct } from "./types/compat_product";
import { eq } from 'drizzle-orm';

const client = createClient({ url: process.env.DATABASE_URL! });
const db = drizzle({client})

const app = new Elysia()
  .use(cors({
    origin: /(localhost|127.0.0.1):.[0-9]*$/
  }))
  .get('/api/categories', async () => {
    const categories = await db.select().from(categoriesTable);
    // map the categories to the shape used by frontend: array of 3 items [alias, emoji, name]
    let cat_array: Array<string[]> = [];
    for (const cat of categories) {
      const ind_cat: string[] = [cat.alias!, cat.emoji!, cat.name!]
      cat_array.unshift(ind_cat);
    }
    return cat_array
  })
  .get('/api/products', async () => {
    const products = await db.select({prod: productsTable, cat: categoriesTable}).from(productsTable).leftJoin(categoriesTable, eq(productsTable.category, categoriesTable.id))
    let prod_array: Array<CompatProduct> = [];
    for (const product of products) {
      const compat_product: CompatProduct = {
        id: product.prod.id,
        e: product.prod.emoji,
        bg: product.prod.bg_color,
        cat: product.cat!.alias,
        name: product.prod.name,
        price: product.prod.price,
        old: product.prod.old_price,
        sold: product.prod.sold,
        pct: product.prod.percentage,
        out: Boolean(product.prod.sold_out),
        desc: product.prod.desc
      };
      prod_array.unshift(compat_product)
    }
    return prod_array
  })
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
