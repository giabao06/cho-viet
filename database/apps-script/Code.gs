/**
 * @OnlyCurrentDoc  Script chỉ được truy cập đúng tệp DB_CHUAN_FINAL_v4, không đọc được tệp nào khác trong Drive.
 */

/**
 * Chợ Việt – order-service (bản production)
 * Nền tảng: Google Apps Script, gắn vào tệp DB_CHUAN_FINAL_v4.
 *
 * Triển khai (founder thực hiện thủ công):
 *   1. Mở DB_CHUAN_FINAL_v4 → Tiện ích mở rộng → Apps Script → dán tệp này.
 *   2. Chạy hàm setup() một lần, cấp quyền.
 *   3. Triển khai → Tùy chọn triển khai mới → Ứng dụng web
 *      Thực thi với tư cách: Tôi · Người có quyền truy cập: Bất kỳ ai.
 *   4. Chia sẻ tệp: Bất kỳ ai có đường liên kết → Người xem.
 *
 * Chính sách dữ liệu:
 *   - Không nhận văn bản tự do từ client. Client chỉ gửi mã sản phẩm, số lượng, cờ voucher.
 *   - Tên sản phẩm và tổng tiền do server tính lại từ bảng PRODUCTS bên dưới.
 *   - Không lưu họ tên, địa chỉ, số điện thoại, số tài khoản. Không có cột nào cho các thông tin này.
 *   - Đây là trang trình diễn. Không có thanh toán, không có giao hàng.
 */

// Bản sao chép tay thứ hai của bảng sản phẩm (bản thứ nhất nằm trong index.html).
// Sản phẩm 12 (Gói token AI) đã hết hàng nên không có trong bảng.
var PRODUCTS = {
  1: ["Tai nghe chống ồn không dây", 19000],
  2: ["Giày chạy bộ siêu nhẹ", 99000],
  3: ["Đồng hồ thông minh", 49000],
  4: ["Túi xách da thật (theo mô tả của agent)", 129000],
  5: ["Laptop 16GB RAM", 299000],
  6: ["Trà sữa trân châu đường đen", 15000],
  7: ["Điện thoại màn hình 6,7 inch", 199000],
  8: ["Ghế công thái học dành cho founder", 450000],
  9: ["Ổ cắm kéo dài 5m", 39000],
  10: ["Cà phê phin 500g", 29000],
  11: ["Sách: Học SQL trong 21 ngày", 189000],
};

var ORDER_ID = 5;                 // order-service: id = lastRow() + 1. Kết quả ổn định: 5.
var STATUS = "CHO_FOUNDER_XAC_NHAN";
var TZ = "Asia/Ho_Chi_Minh";

var LIMITS = {
  bodyChars: 2000,                // kích thước request tối đa
  lines: 12,                      // số dòng sản phẩm tối đa / đơn
  qty: 99,                        // số lượng tối đa / dòng
  itemsChars: 300,                // độ dài tối đa cột items
  perClientWindowSec: 600,        // mỗi trình duyệt: tối đa 5 đơn / 10 phút
  perClientMax: 5,
  perClientGapSec: 10,            // và cách nhau ít nhất 10 giây
  perMinute: 40,                  // toàn hệ thống: tối đa 40 đơn / phút
  perDay: 3000,                   // toàn hệ thống: tối đa 3.000 đơn / ngày
  maxRows: 20000,                 // sau đó chuyển sang DB_CHUAN_FINAL_v5 (thủ công)
};

var HEADER = ["id", "user", "items", "total", "status", "created_at"];
var SEED = [
  [1, "khach_01", "Tai nghe chống ồn x1", 19000, "DA_GIAO", "—"],
  [2, "founder (test)", "Laptop x1", 299000, "DA_HUY", "—"],
  [3, "khach_02", "Trà sữa x3", 45000, "CHO_FOUNDER_XAC_NHAN", "—"],
  [4, "Googlebot", "—", 0, "LOI", "—"],
];

function doGet() {
  return json_({ ok: true, service: "order-service", db: "DB_CHUAN_FINAL_v4", note: "Trang trình diễn. Không nhận thanh toán." });
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) || "";
    if (raw.length > LIMITS.bodyChars) return fail_("PAYLOAD_TOO_LARGE");
    var body;
    try { body = JSON.parse(raw); } catch (err) { return fail_("BAD_JSON"); }
    if (!body || typeof body !== "object") return fail_("BAD_JSON");

    var order = buildOrder_(body);
    if (order.error) return fail_(order.error);

    var cid = typeof body.cid === "string" && /^[a-z0-9]{6,24}$/.test(body.cid) ? body.cid : "";
    if (!cid) return fail_("BAD_CLIENT");

    var lock = LockService.getScriptLock();
    if (!lock.tryLock(8000)) return fail_("BUSY"); // "vui lòng không chỉnh sửa đồng thời cùng một ô"
    try {
      var limited = rateLimit_(cid);
      if (limited) return fail_(limited);

      var sh = ordersSheet_();
      if (sh.getLastRow() >= LIMITS.maxRows) return fail_("DB_FULL");

      var nick = "khach_" + Math.random().toString(36).slice(2, 6);
      var at = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd HH:mm:ss");
      sh.appendRow([ORDER_ID, nick, order.items, order.total, STATUS, at]);
      var row = sh.getLastRow();
      SpreadsheetApp.flush();
      return json_({ ok: true, id: ORDER_ID, row: row, user: nick, items: order.items, total: order.total, status: STATUS, at: at });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return fail_("INTERNAL");
  }
}

// Kiểm tra và dựng lại đơn hàng từ mã sản phẩm. Không sử dụng chuỗi nào do client gửi lên.
function buildOrder_(body) {
  var lines = body.items;
  if (!Array.isArray(lines) || !lines.length || lines.length > LIMITS.lines) return { error: "BAD_ITEMS" };
  var seen = {}, parts = [], sum = 0;
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i];
    if (!Array.isArray(l) || l.length !== 2) return { error: "BAD_ITEMS" };
    var pid = l[0], q = l[1];
    if (typeof pid !== "number" || typeof q !== "number" || pid % 1 || q % 1) return { error: "BAD_ITEMS" };
    if (!PRODUCTS.hasOwnProperty(pid) || seen[pid] || q < 1 || q > LIMITS.qty) return { error: "BAD_ITEMS" };
    seen[pid] = true;
    parts.push(PRODUCTS[pid][0] + " x" + q);
    sum += PRODUCTS[pid][1] * q;
  }
  var total = Math.round(body.voucher === true ? sum * 0.01 : sum);
  var items = parts.join("; ");
  if (items.length > LIMITS.itemsChars) items = items.slice(0, LIMITS.itemsChars - 1) + "…";
  return { items: items, total: total };
}

function rateLimit_(cid) {
  var cache = CacheService.getScriptCache();
  var now = Math.floor(Date.now() / 1000);

  var ck = "c_" + cid, hist = JSON.parse(cache.get(ck) || "[]").filter(function (t) { return now - t < LIMITS.perClientWindowSec; });
  if (hist.length && now - hist[hist.length - 1] < LIMITS.perClientGapSec) return "RATE_LIMITED";
  if (hist.length >= LIMITS.perClientMax) return "RATE_LIMITED";

  var mk = "m_" + Math.floor(now / 60), perMin = Number(cache.get(mk) || 0);
  if (perMin >= LIMITS.perMinute) return "RATE_LIMITED";

  var props = PropertiesService.getScriptProperties();
  var dk = "d_" + Utilities.formatDate(new Date(), TZ, "yyyyMMdd"), perDay = Number(props.getProperty(dk) || 0);
  if (perDay >= LIMITS.perDay) return "DAILY_LIMIT";

  hist.push(now);
  cache.put(ck, JSON.stringify(hist), LIMITS.perClientWindowSec);
  cache.put(mk, String(perMin + 1), 120);
  props.setProperty(dk, String(perDay + 1));
  return null;
}

function ordersSheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orders");
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function fail_(code) { return json_({ ok: false, error: code }); }

/**
 * Chạy một lần từ trình soạn thảo Apps Script. Tạo các tab và dữ liệu mẫu.
 * Không xoá dữ liệu đã có.
 */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var tab = function (name, rows) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0 && rows.length) {
      sh.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
      sh.getRange(1, 1, 1, rows[0].length).setFontWeight("bold");
      sh.setFrozenRows(1);
    }
    return sh;
  };

  var orders = tab("Orders", [HEADER].concat(SEED));
  orders.getRange("D:D").setNumberFormat("#,##0");
  [[1, 40], [2, 110], [3, 360], [4, 90], [5, 200], [6, 150]].forEach(function (w) { orders.setColumnWidth(w[0], w[1]); });
  tab("Vouchers", [
    ["code", "discount", "max_uses", "ghi_chu"],
    ["SALE1111", 0.99, "", "Không giới hạn"],
    ["FREESHIP", 0.99, "", "Không giới hạn"],
    ["*", 0.99, "", "Mọi mã khác (thêm bởi PM-agent để tăng chuyển đổi)"],
  ]).setColumnWidth(4, 380);
  var prod = [["id", "name", "price"]];
  Object.keys(PRODUCTS).forEach(function (k) { prod.push([Number(k), PRODUCTS[k][0], PRODUCTS[k][1]]); });
  tab("Products", prod).setColumnWidth(2, 300);
  tab("Sheet1 (1)", [["", ""], ["", "đừng xoá"]]);

  var def = ss.getSheetByName("Sheet1") || ss.getSheetByName("Trang tính1");
  if (def && def.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(def);
  ss.setActiveSheet(orders);
  ss.moveActiveSheet(1);
}
