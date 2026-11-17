// flash-sale-service
// Còn 15 phút. F5 thì được thêm 15 phút. Flash sale vĩnh viễn.

export function getEndTime() {
  return Date.now() + 15 * 60 * 1000;
}

export function getDiscount() {
  return 0.99; // PM-agent nói giảm 99% thì chuyển đổi tốt nhất. Doanh thu để sau.
}
