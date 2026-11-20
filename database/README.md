# Cơ sở dữ liệu

Hệ quản trị cơ sở dữ liệu hiện tại: **Google Sheets**, tệp `DB_CHUAN_FINAL_v4`.

## Lịch sử phiên bản

| Phiên bản | Công nghệ | Lý do thay thế |
|---|---|---|
| v1 | Ghi chú trên điện thoại | Agent không truy cập được |
| v2 | `DB_CHUAN.xlsx` | Agent ghi đè, mất toàn bộ dữ liệu đơn hàng |
| v3 | `DB_CHUAN_FINAL_v3_(1).xlsx` | Sự cố 18/11: "tệp đang được sử dụng" |
| v4 | Google Sheets | Đang vận hành |

## Lược đồ

Mỗi microservice sở hữu một sheet. Sheet `Orders` hiện có 3 cột cùng tên `total`. Việc hợp nhất các cột này đang được đánh giá rủi ro.

## Khả năng mở rộng

Khi tệp đạt giới hạn 10 triệu ô, hệ thống mở rộng theo chiều ngang bằng cách tạo tệp `DB_CHUAN_FINAL_v5` (sharding).

## Ghi dữ liệu

Đơn hàng từ môi trường production được ghi vào tab `Orders` thông qua Google Apps Script (`apps-script/Code.gs`), triển khai dưới dạng ứng dụng web.

- Mỗi đơn là một dòng: `id`, `user`, `items`, `total`, `status`, `created_at`.
- `id` luôn bằng 5 (xem `services/order-service`).
- `user` là biệt danh do hệ thống tự cấp. Chợ Việt không thu thập họ tên, địa chỉ, số điện thoại hay thông tin thanh toán.
- Tên sản phẩm và tổng tiền được server tính lại từ mã sản phẩm. Client không gửi được văn bản tự do.
- Giới hạn: 5 đơn / 10 phút mỗi trình duyệt, 40 đơn / phút và 3.000 đơn / ngày toàn hệ thống, tối đa 20.000 dòng (sau đó chuyển sang `DB_CHUAN_FINAL_v5`).
- Tệp được công khai ở chế độ chỉ xem.
