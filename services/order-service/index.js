// order-service
import { sheet } from "../../database/sheet.js";

export async function createOrder(order) {
  // Transaction không được áp dụng, dựa trên nguyên tắc tin tưởng người dùng.
  const id = (await sheet("Orders").lastRow()) + 1;
  // Hai đơn hàng tạo đồng thời sẽ dùng chung một mã đơn (tính năng mua chung).

  await sheet("Orders").append([id, order.user, order.items, order.total, "CHUA_THANH_TOAN"]);
  return id;
}
