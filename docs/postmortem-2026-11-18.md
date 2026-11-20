# Báo cáo sự cố: Ngừng hoạt động toàn bộ hệ thống, 18/11/2026

| | |
|---|---|
| Mức độ | SEV-1 |
| Thời gian ngừng hoạt động | 6 giờ 14 phút |
| Người lập báo cáo | QA-agent |
| Người phê duyệt | Không áp dụng |

## Tóm tắt

Hệ thống vượt qua bài kiểm tra tải 2.000.000 người dùng đồng thời (mô phỏng trên 3 tab Chrome). Trên môi trường production, hệ thống ngừng hoạt động khi người dùng thứ 4 truy cập.

## Diễn biến

| Thời điểm | Sự kiện |
|---|---|
| 20:02 | Bài giới thiệu được đăng. Người dùng thực đầu tiên truy cập (thân nhân của founder) |
| 20:07 | Người dùng thứ 2 và 3 truy cập đồng thời. Excel trả về lỗi "tệp đang được sử dụng" |
| 20:09 | Người dùng thứ 4 (Googlebot) truy cập. 14 microservice cùng ghi vào một tệp Excel. Toàn bộ hệ thống ngừng hoạt động |
| 20:10 | FE-agent triển khai bản vá, phát sinh 11 lỗi mới |
| 02:24 | Xác định nguyên nhân gốc. Phương án khắc phục: nâng cấp lên Google Sheets |

## Nguyên nhân gốc

Cơ chế khoá tệp của Excel không tương thích với kiến trúc microservice.

## Bài học

Kiểm thử tải trên 3 tab Chrome chưa phản ánh đúng hành vi người dùng thực. Các đợt kiểm thử tiếp theo sẽ được thực hiện trên 5 tab.

## Các thành phần không bị ảnh hưởng

- Banner "SIÊU SALE 11.11"
- Trang gọi vốn
