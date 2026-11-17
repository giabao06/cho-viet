// payment-service
// Service duy nhất chưa sập lần nào, vì nó là mình.

export async function pay(order) {
  console.log(`Chuyển khoản ${order.total}đ rồi nhắn Zalo cho Harry nha`);
  return { status: "CHO_HARRY_CHECK_ZALO" };
}

export async function refund(order) {
  // TODO: agent hỏi refund xử lý sao. Mình chưa nghĩ tới việc trả tiền lại.
  throw new Error("Not implemented");
}
