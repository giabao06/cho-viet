// "ORM" của Chợ Việt
//
// Index:        Ctrl+F
// Transaction:  2 người đừng sửa cùng 1 ô
// Migration:    copy sang file mới, thêm "_v5" vào tên
// Backup:       Google Drive (tự động, vì nó vốn nằm trên Google Drive)

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export function sheet(tab) {
  return {
    async getAll() {
      return fetchTab(SHEET_ID, tab); // tải nguyên tab về, mỗi request. Agent nói vậy là "đơn giản".
    },
    async lastRow() {
      return (await this.getAll()).length;
    },
    async append(row) {
      return appendRow(SHEET_ID, tab, row);
    },
  };
}
