import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { categoriesTable, ordersTable, productsTable, vouchersTable } from './schema';

const db = drizzle(process.env.DATABASE_URL!);

// from frontend

const PRODUCTS = [
  { id: 1,  e: "🎧", bg: "#eef6ff", cat: "dt", name: "Tai nghe chống ồn không dây, pin 40 giờ", price: 19000, old: 1900000, sold: 1200, pct: 92, desc: "Chống ồn chủ động. Phù hợp để không nghe thấy cuộc gọi cảnh báo từ hệ thống giám sát." },
  { id: 2,  e: "👟", bg: "#fff4e6", cat: "tt", name: "Giày chạy bộ siêu nhẹ", price: 99000, old: 990000, sold: 1200, pct: 61, desc: "Đế êm. Phù hợp để chạy khỏi phòng họp khi được hỏi về kiến trúc hệ thống." },
  { id: 3,  e: "⌚", bg: "#f2fbef", cat: "dt", name: "Đồng hồ thông minh, đo nhịp tim", price: 49000, old: 2450000, sold: 3400, pct: 78, desc: "Theo dõi nhịp tim của founder trong các đợt flash sale." },
  { id: 4,  e: "👜", bg: "#fdf0f6", cat: "tt", name: "Túi xách da thật (theo mô tả của agent)", price: 129000, old: 1290000, sold: 860, pct: 40, desc: "Chất liệu: da thật. Thông tin do Copywriter-agent cung cấp và chưa được xác minh." },
  { id: 5,  e: "💻", bg: "#f3f0ff", cat: "dt", name: "Laptop 16GB RAM, đủ chạy 3 tab Chrome", price: 299000, old: 29900000, sold: 9100, pct: 97, desc: "Cấu hình tương đương máy chủ production của Chợ Việt. Đáp ứng 2.000.000 người dùng đồng thời (load test)." },
  { id: 6,  e: "🧋", bg: "#eefbfb", cat: "da", name: "Trà sữa trân châu đường đen, size L", price: 15000, old: 30000, sold: 9900, pct: 70, desc: "Nhiên liệu vận hành chính của đội ngũ phát triển (con người)." },
  { id: 7,  e: "📱", bg: "#eef1ff", cat: "dt", name: "Điện thoại màn hình 6,7 inch, cài sẵn Zalo", price: 199000, old: 19900000, sold: 2100, pct: 55, desc: "Cài sẵn Zalo để gửi ảnh chuyển khoản cho founder." },
  { id: 8,  e: "🪑", bg: "#fff8e8", cat: "nc", name: "Ghế công thái học dành cho founder", price: 450000, old: 4500000, sold: 1, pct: 10, desc: "Thiết kế cho việc ngồi xác nhận đơn hàng thủ công trong thời gian dài." },
  { id: 9,  e: "🔌", bg: "#f4f4f4", cat: "nc", name: "Ổ cắm kéo dài 5m, chống ngắt điện", price: 39000, old: 390000, sold: 640, pct: 35, desc: "Đảm bảo máy chủ (laptop của founder) không vào chế độ ngủ. Thành phần hạ tầng then chốt." },
  { id: 10, e: "☕", bg: "#f8efe6", cat: "da", name: "Cà phê phin 500g", price: 29000, old: 145000, sold: 5300, pct: 66, desc: "Được hệ thống giám sát (thân nhân founder) sử dụng để duy trì trực 24/7." },
  { id: 11, e: "📗", bg: "#eaf7ee", cat: "nc", name: "Sách: Học SQL trong 21 ngày", price: 189000, old: 189000, sold: 0, pct: 0, desc: "Sản phẩm không áp dụng giảm giá. Đội ngũ phát triển đã đánh giá phương án này là \"khó\" (xem ADR-001)." },
  { id: 12, e: "🎟", bg: "#fdeeee", cat: "vc", name: "Gói token AI 1 năm, không giới hạn", price: 2000000, old: 20000000, sold: 1, pct: 100, out: true, desc: "Hết hàng. Toàn bộ số lượng đã được founder mua để phát triển Chợ Việt." },
];
const CATS = [["all", "🏬", "Tất cả"], ["dt", "📱", "Điện tử"], ["tt", "👕", "Thời trang"], ["da", "🍜", "Đồ ăn"], ["vc", "🎟", "Voucher"], ["nc", "", "no category"]];


async function main() {
  console.log("seed categories")
  for (const cat of CATS) {
    const new_category: typeof categoriesTable.$inferInsert = {
      alias: cat[0],
      emoji: cat[1],
      name: cat[2]
    };
    await db.insert(categoriesTable).values(new_category);
    console.log(`${new_category.alias} (${new_category.emoji}): ${new_category.name}`)
  }
  console.log("seed products")
  for (const prod of PRODUCTS) {
    const prod_category_id = await db.select({alias: categoriesTable.alias, name: categoriesTable.name, id: categoriesTable.id}).from(categoriesTable).where(eq(categoriesTable.alias, prod.cat))!
    const new_product: typeof productsTable.$inferInsert = {
      name: prod.name,
      emoji: prod.e,
      bg_color: prod.bg,
      category: prod_category_id[0].id,
      price: prod.price,
      old_price: prod.old,
      sold: prod.sold,
      percentage: prod.pct,
      desc: prod.desc,
      sold_out: prod.out
    }
    await db.insert(productsTable).values(new_product);
    console.log(`${new_product.name}, category ${prod_category_id[0].name}`)
  }
}

main();
