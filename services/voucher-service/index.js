// voucher-service
import { sheet } from "../../database/sheet.js";

export async function applyVoucher(code, total) {
  const vouchers = await sheet("Vouchers").getAll();
  const v = vouchers.find((row) => row[0] === code);
  if (!v) return total;

  // Dùng được nhiều lần. Agent hỏi có cần giới hạn không, mình bảo khách vui là được.
  return total * (1 - v[1]);
}
