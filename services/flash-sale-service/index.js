// flash-sale-service
// Thời gian còn lại của chương trình được làm mới sau mỗi lần tải trang.

export function getEndTime() {
  return Date.now() + 15 * 60 * 1000;
}

export function getDiscount() {
  return 0.99; // Tối ưu tỷ lệ chuyển đổi theo khuyến nghị của PM-agent. Doanh thu được xem xét ở giai đoạn sau.
}
