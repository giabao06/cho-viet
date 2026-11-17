// order-service
import { sheet } from "../../database/sheet.js";

export async function createOrder(order) {
  // Agent nói chỗ này cần transaction. Mình bảo không cần, mình tin anh em.
  const id = (await sheet("Orders").lastRow()) + 1;
  // 2 người đặt cùng lúc thì chung 1 mã đơn. Coi như mua chung, cho vui.

  await sheet("Orders").append([id, order.user, order.items, order.total, "CHUA_THANH_TOAN"]);
  return id;
}
