// payment-service
// Thành phần duy nhất chưa từng gặp sự cố, do được vận hành trực tiếp bởi founder.

export async function pay(order) {
  console.log(`Vui lòng chuyển khoản ${order.total}đ và gửi xác nhận qua Zalo.`);
  return { status: "CHO_FOUNDER_XAC_NHAN" };
}

export async function refund(order) {
  // Chính sách hoàn tiền đang trong quá trình xây dựng.
  throw new Error("Not implemented");
}
