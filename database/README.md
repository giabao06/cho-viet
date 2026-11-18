# database/

Database: **Google Sheets**, file `DB_CHUAN_FINAL_v4`.

Lịch sử nâng cấp:

| Phiên bản | Công nghệ | Vì sao bỏ |
|---|---|---|
| v1 | Note trên điện thoại | Agent không đọc được |
| v2 | `DB_CHUAN.xlsx` | Agent ghi đè, mất hết đơn hàng |
| v3 | `DB_CHUAN_FINAL_v3_(1).xlsx` | Sập 18/11, "file đang được sử dụng" |
| v4 | Google Sheets | Đang dùng. Nhiều người mở cùng lúc được, chuẩn enterprise rồi |

Mỗi microservice 1 tab. Tab `Orders` có 3 cột tên giống nhau là `total`, chưa ai dám xoá cột nào.

Giới hạn của Google Sheets là 10 triệu ô. Hết thì tạo `DB_CHUAN_FINAL_v5`. Mình gọi đây là sharding.
