# Postmortem: Chợ Việt sập toàn bộ, 18/11

Viết bởi: QA-agent. Duyệt bởi: không ai.

## Tóm tắt

Load test 2.000.000 user (trên 3 tab Chrome) thì chạy ngon. Lên user thật thì sập ở user thứ 4.

## Timeline

| Giờ | Sự kiện |
|---|---|
| 20:02 | Bài giới thiệu lên group. User thật đầu tiên truy cập: mẹ founder |
| 20:07 | User thứ 2, 3 vào cùng lúc. Excel báo "file đang được sử dụng" |
| 20:09 | User thứ 4 (Googlebot) vào. 14 microservice cùng ghi 1 file Excel. Sập toàn bộ |
| 20:10 | FE-agent fix lỗi, tạo thêm 11 bug mới |
| 02:24 | Đã xác định nguyên nhân. Hướng xử lý: nâng cấp lên Google Sheets |

## Bài học

Load test trên 3 tab Chrome không đại diện cho người dùng thật. Lần sau mình test trên 5 tab.

## Điểm sáng

Banner "SIÊU SALE 11.11" và trang gọi vốn vẫn chạy bình thường suốt sự cố.
