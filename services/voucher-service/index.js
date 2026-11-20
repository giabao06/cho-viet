// voucher-service
import { sheet } from "../../database/sheet.js";

export async function applyVoucher(code, total) {
  const vouchers = await sheet("Vouchers").getAll();
  const v = vouchers.find((row) => row[0] === code);
  if (!v) return total;

  // Không giới hạn số lần sử dụng, nhằm tối đa hoá trải nghiệm khách hàng.
  return total * (1 - v[1]);
}
