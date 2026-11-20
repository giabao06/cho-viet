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
