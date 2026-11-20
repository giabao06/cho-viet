// Lớp truy cập dữ liệu (ORM) của Chợ Việt
//
// Đánh chỉ mục:  Ctrl+F
// Giao dịch:     quy ước không chỉnh sửa đồng thời cùng một ô
// Migration:     sao chép sang tệp mới với hậu tố phiên bản (_v5)
// Sao lưu:       Google Drive

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export function sheet(tab) {
  return {
    async getAll() {
      return fetchTab(SHEET_ID, tab); // Tải toàn bộ sheet cho mỗi request, ưu tiên tính đơn giản.
    },
    async lastRow() {
      return (await this.getAll()).length;
    },
    async append(row) {
      return appendRow(SHEET_ID, tab, row);
    },
  };
}
