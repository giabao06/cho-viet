// Cấu hình production. Founder điền sau khi triển khai database/apps-script/Code.gs.
// Để trống ORDER_API thì đơn hàng chỉ được lưu tại bộ nhớ đệm (tab Chrome thứ 3).
const CONFIG = {
  BACKEND_URL: "http://localhost:3000",
  ORDER_API: "https://script.google.com/macros/s/AKfycbwxy0yYNzyV316UCOwnpFRffYu6moxOc2UnEdp5Lw9APkRhUJHjW5wLRH1cWp0FnuIy/exec",  // URL ứng dụng web Apps Script, dạng https://script.google.com/macros/s/…/exec
  SHEET_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTm15dFFcHNMfSIVJzw0WP621o0sZPn8lwt9uPhUzoh2nCblxaS5WZlqiADhASoPa66veb8-6pMetXb/pubhtml",  // DB_CHUAN_FINAL_v4, bản công bố chỉ xem
  ZALO_URL: "https://www.facebook.com/profile.php?id=61596450370450", // Tạm thời: Page Harry Truong. Zalo OA đang chờ xác minh.
};
const ZALO_READY = /^https:\/\/zalo\.me\//.test(CONFIG.ZALO_URL);

// Dữ liệu sản phẩm. Nguồn chính thức: DB_CHUAN_FINAL_v4, tab Products. Bản sao dưới đây được FE-agent chép tay.

let PRODUCTS = []
let CATS = []

async function loadProducts() {
  const response = await fetch(`${CONFIG.BACKEND_URL}/api/products`)
  if (!response.ok) {
    console.log(response)
    throw new Error('Loading products failed')
  }
  PRODUCTS = await response.json()
}

async function loadCats() {
  const response = await fetch(`${CONFIG.BACKEND_URL}/api/categories`)
  if (!response.ok) {
    console.log(response)
    throw new Error('Loading categories failed')
  }
  CATS = await response.json()
}

const SEED_ORDERS = [
  [1, "khach_01", "Tai nghe chống ồn x1", 19000, "DA_GIAO"],
  [2, "founder (test)", "Laptop x1", 299000, "DA_HUY"],
  [3, "khach_02", "Trà sữa x3", 45000, "CHO_FOUNDER_XAC_NHAN"],
  [4, "Googlebot", "—", 0, "LOI"],
];

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const vnd = n => "₫" + Math.round(n).toLocaleString("vi-VN");
const sold = n => n >= 1000 ? (n / 1000).toFixed(1).replace(".", ",").replace(",0", "") + "K" : String(n);
const off = p => p.old > p.price ? Math.round((1 - p.price / p.old) * 100) : 0;

// Bộ nhớ đệm: tab Chrome thứ 3 (localStorage). Yêu cầu không xoá dữ liệu trình duyệt.
const cache = {
  get(k, d) { try { const v = localStorage.getItem("cv_" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("cv_" + k, JSON.stringify(v)); } catch (e) {} },
};
let cart = cache.get("cart", {});
let orders = cache.get("orders", []);
let voucher = null;
let cat = "all";

function toast(msg, err) {
  const t = $("toast"); t.textContent = msg; t.className = "toast on" + (err ? " err" : "");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.className = "toast", 3200);
}

function card(p) {
  const o = off(p);
  return `<button class="item" onclick="openPd(${p.id})">
    <div class="img" style="background:${p.bg}">${p.e}${o ? `<div class="off">-${o}%</div>` : ""}${p.out ? `<div class="soldout">HẾT HÀNG</div>` : ""}</div>
    <div class="name">${p.name}</div>
    <div class="price">${vnd(p.price)}${o ? `<s>${vnd(p.old)}</s>` : ""}</div>
    <div class="bar" style="--w:${p.pct}%"><span>${p.out ? "ĐÃ BÁN HẾT" : p.pct >= 90 ? "SẮP CHÁY HÀNG" : "ĐÃ BÁN " + sold(p.sold)}</span></div>
  </button>`;
}

function render() {
  $("cats").innerHTML = CATS.map(([k, e, n]) => `<button class="cat ${cat === k ? "on" : ""}" onclick="setCat('${k}')"><i>${e}</i>${n}</button>`).join("");
  $("flash").innerHTML = PRODUCTS.filter(p => p.pct >= 60 && !p.out).slice(0, 6).map(card).join("");
  const q = $("q").value.trim().toLowerCase();
  const list = PRODUCTS.filter(p => (cat === "all" || p.cat === cat) && (!q || p.name.toLowerCase().includes(q)));
  $("listTitle").textContent = q ? "Kết quả tìm kiếm" : "Gợi ý hôm nay";
  $("listNote").textContent = q ? `Tìm thấy ${list.length} kết quả · Công nghệ: Ctrl+F` : "Đánh chỉ mục: Ctrl+F";
  $("all").innerHTML = list.length ? list.map(card).join("")
    : `<div class="empty" style="grid-column:1/-1">Không tìm thấy sản phẩm phù hợp.<br>Gợi ý: nhấn Ctrl+F.</div>`;
  renderStatus(); renderBadge(); renderMyOrders();
}
function setCat(k) { cat = k; render(); }
function doSearch(e) {
  e.preventDefault(); go("home"); render();
  document.getElementById("all").scrollIntoView({ behavior: "smooth", block: "center" });
}

function founderAwake() { const h = new Date().getHours(); return h >= 7; }
function renderStatus() {
  const awake = founderAwake();
  const rows = [
    ["Cơ sở dữ liệu", "Google Sheets · DB_CHUAN_FINAL_v4 · công khai chỉ xem", CONFIG.ORDER_API ? "ok" : "warn", CONFIG.ORDER_API ? "Hoạt động" : "Chờ founder kết nối"],
    ["Bộ nhớ đệm", "Tab Chrome thứ 3 · yêu cầu duy trì mở 24/7", "ok", "Hoạt động"],
    ["Thanh toán", "Founder xác nhận thủ công qua Zalo", awake ? "ok" : "warn", awake ? "Hoạt động" : "Founder đang ngủ"],
    ["Giám sát", "Thân nhân founder · cảnh báo qua điện thoại", "ok", "Hoạt động"],
    ["Hàng đợi thông điệp", "Google Forms · xử lý 1 lần/ngày", "ok", "Hoạt động"],
    ["Code review", "Loại bỏ theo ADR-002", "na", "Không áp dụng"],
  ];
  $("stat").innerHTML = rows.map(r => `<div class="srow"><span>${r[0]}<small>${r[1]}</small></span><span class="pill ${r[2]}">${r[3]}</span></div>`).join("");
}

function go(v) {
  document.querySelectorAll(".view").forEach(s => s.classList.toggle("on", s.id === "v-" + v));
  document.querySelectorAll(".tabbar button").forEach(b => b.classList.toggle("on", b.dataset.v === v));
  window.scrollTo(0, 0);
}
function openOv(k) { $("ov-" + k).classList.add("on"); document.body.style.overflow = "hidden"; }
function closeOv(k) { $("ov-" + k).classList.remove("on"); if (!document.querySelector(".ov.on")) document.body.style.overflow = ""; }

// Chi tiết sản phẩm
function openPd(id) {
  const p = PRODUCTS.find(x => x.id === id), o = off(p);
  $("pd").innerHTML = `
    <div class="pd-img" style="background:${p.bg}">${p.e}${o ? `<div class="off" style="font-size:15px">-${o}%</div>` : ""}</div>
    <div class="pd-price">${vnd(p.price)}${o ? `<s>${vnd(p.old)}</s>` : ""}</div>
    <div class="pd-name">${p.name}</div>
    <div class="kv">
      <div><span>Mô tả</span><span>${p.desc}</span></div>
      <div><span>Đã bán</span><span>${p.sold.toLocaleString("vi-VN")}${p.sold > 100 ? " (số liệu load test)" : ""}</span></div>
      <div><span>Mức giảm giá</span><span>${o ? o + "%, theo khuyến nghị của PM-agent. Doanh thu được xem xét ở giai đoạn sau." : "Không áp dụng"}</span></div>
      <div><span>Vận chuyển</span><span>Freeship toàn quốc. Địa chỉ giao hàng được founder hỏi qua Zalo.</span></div>
      <div><span>Đổi trả</span><span>Chính sách hoàn tiền đang trong quá trình xây dựng.</span></div>
    </div>
    <div class="review"><b>Đánh giá sản phẩm <span class="stars">★★★★★</span> 5,0</b>1 đánh giá. Người đánh giá: founder. Trạng thái: chưa được kiểm duyệt (xem ADR-002).</div>`;
  $("pdAdd").disabled = $("pdBuy").disabled = !!p.out;
  $("pdAdd").onclick = () => { add(id); closeOv("pd"); toast("Đã thêm vào giỏ hàng. Dữ liệu được lưu tại tab Chrome thứ 3."); };
  $("pdBuy").onclick = () => { add(id); closeOv("pd"); openCart(); };
  openOv("pd");
}

// Giỏ hàng
function add(id) { cart[id] = (cart[id] || 0) + 1; cache.set("cart", cart); renderBadge(); }
function setQty(id, d) { cart[id] = (cart[id] || 0) + d; if (cart[id] <= 0) delete cart[id]; cache.set("cart", cart); renderBadge(); renderCart(); }
function renderBadge() { $("badge").textContent = Object.values(cart).reduce((a, b) => a + b, 0); }
function subtotal() { return Object.entries(cart).reduce((s, [id, q]) => s + PRODUCTS.find(p => p.id == id).price * q, 0); }
function total() { const s = subtotal(); return voucher ? s * 0.01 : s; }
function openCart() { renderCart(); openOv("cart"); }
function renderCart() {
  const ids = Object.keys(cart);
  if (!ids.length) {
    $("cartBody").innerHTML = `<div class="empty"><div style="font-size:48px">🛒</div>Giỏ hàng trống.</div>`;
    $("checkoutBtn").disabled = true; return;
  }
  $("checkoutBtn").disabled = false;
  const s = subtotal();
  $("cartBody").innerHTML = ids.map(id => { const p = PRODUCTS.find(x => x.id == id); return `
    <div class="ci"><div class="im" style="background:${p.bg}">${p.e}</div>
      <div class="nm">${p.name}<b>${vnd(p.price)}</b></div>
      <div class="qty"><button onclick="setQty(${p.id},-1)">−</button><span>${cart[id]}</span><button onclick="setQty(${p.id},1)">+</button></div></div>`; }).join("") + `
    <div class="vrow"><input id="vcode" placeholder="Nhập mã voucher" value="${voucher ? voucher.replace(/"/g, "") : ""}"><button onclick="applyV()">Áp dụng</button></div>
    <div class="vmsg" id="vmsg">${voucher ? "Đã áp dụng voucher giảm 99%. Không giới hạn số lần sử dụng." : ""}</div>
    <div class="sum">
      <div><span>Tạm tính</span><span>${vnd(s)}</span></div>
      <div><span>Voucher</span><span>${voucher ? "−" + vnd(s * 0.99) : "—"}</span></div>
      <div><span>Phí vận chuyển</span><span>₫0</span></div>
      <div class="tot"><span>Tổng thanh toán</span><span>${vnd(total())}</span></div>
      <small>Thuế VAT: chưa được agent tính đến</small>
    </div>`;
}
function applyV() {
  const c = $("vcode").value.trim();
  if (!c) { voucher = null; renderCart(); return; }
  if (c.toUpperCase().includes("REVIEW")) { $("vmsg").className = "vmsg bad"; $("vmsg").textContent = "Mã không tồn tại. Quy trình review đã được loại bỏ (ADR-002)."; return; }
  voucher = c; renderCart(); toast("Voucher hợp lệ. Mọi mã voucher đều được giảm 99%.");
}

// Đặt hàng
const DEMO_NOTE = `<div class="demo">⚠️ <b>Trang trình diễn.</b> Chợ Việt không bán hàng và không nhận thanh toán. Vui lòng <b>không chuyển tiền</b>, không gửi họ tên, địa chỉ, số điện thoại hay số tài khoản cho bất kỳ ai.</div>`;
function checkout() {
  closeOv("cart");
  $("payTitle").textContent = "Xác nhận đơn hàng";
  $("payBody").innerHTML = `
    <div class="box" style="margin-top:0">
      <div class="r"><span>Tổng thanh toán</span><b style="color:var(--brand);font-size:18px">${vnd(total())}</b></div>
      <div class="r"><span>Thanh toán</span><span>Không áp dụng (trang trình diễn)</span></div>
      <div class="r"><span>Xác nhận đơn</span><span>Founder, thủ công, qua Zalo</span></div>
      <div class="r"><span>Thông tin khách hàng</span><span>Không thu thập. Hệ thống tự cấp biệt danh.</span></div>
    </div>
    <div class="steps" style="margin-top:14px">
      <div class="step"><div class="dotc">1</div><div><b>Đặt hàng</b><small>Đơn được ghi trực tiếp vào Google Sheets, tab Orders.</small></div></div>
      <div class="step"><div class="dotc">2</div><div><b>Nhắn founder qua Zalo</b><small>Nội dung tin nhắn được sao chép sẵn. Chỉ gồm mã đơn và sản phẩm.</small></div></div>
      <div class="step"><div class="dotc">3</div><div><b>Theo dõi đơn trong cơ sở dữ liệu</b><small>DB_CHUAN_FINAL_v4 được công khai ở chế độ chỉ xem.</small></div></div>
    </div>
    ${DEMO_NOTE}`;
  $("payFoot").innerHTML = `<button class="btn" id="placeBtn" onclick="placeOrder()">Đặt hàng</button>`;
  openOv("pay");
}

// Mã trình duyệt ẩn danh, chỉ dùng để giới hạn tần suất đặt hàng. Không ghi vào cơ sở dữ liệu.
function clientId() {
  let c = cache.get("cid", "");
  if (!/^[a-z0-9]{6,24}$/.test(c)) { c = (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, 16); cache.set("cid", c); }
  return c;
}
const API_ERR = {
  RATE_LIMITED: "Founder chưa kịp nhập đơn trước. Vui lòng thử lại sau ít phút.",
  DAILY_LIMIT: "Đã đạt hạn mức 3.000 đơn/ngày của Google Sheets. Vui lòng quay lại ngày mai.",
  DB_FULL: "DB_CHUAN_FINAL_v4 đã đầy. Đang chờ founder tạo DB_CHUAN_FINAL_v5.",
  BUSY: "Có người khác đang chỉnh sửa cùng một ô. Vui lòng thử lại.",
};
async function sendOrder(lines, useVoucher) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(CONFIG.ORDER_API, {
      method: "POST", signal: ctl.signal, redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // tránh preflight CORS của Apps Script
      body: JSON.stringify({ cid: clientId(), items: lines, voucher: useVoucher }),
    });
    return await r.json();
  } finally { clearTimeout(t); }
}

async function placeOrder() {
  const btn = $("placeBtn");
  if (btn) { btn.disabled = true; btn.textContent = "Đang ghi vào Google Sheets…"; }
  // order-service: id = lastRow() + 1. lastRow() đọc từ Google Sheets, không đọc từ bộ nhớ đệm.
  const id = SEED_ORDERS.length + 1;
  const lines = Object.entries(cart).map(([pid, q]) => [Number(pid), q]);
  let items = lines.map(([pid, q]) => PRODUCTS.find(p => p.id === pid).name.split(",")[0] + " x" + q).join("; ");
  let tot = total(), user = "ban (khách)", row = null, src = "cache";
  if (CONFIG.ORDER_API) {
    try {
      const res = await sendOrder(lines, !!voucher);
      if (res && res.ok) { items = res.items; tot = res.total; user = res.user; row = res.row; src = "sheets"; }
      else if (res && API_ERR[res.error]) {
        toast(API_ERR[res.error], true);
        if (btn) { btn.disabled = false; btn.textContent = "Đặt hàng"; }
        return;
      }
    } catch (e) { /* Google Sheets không phản hồi: chuyển sang bộ nhớ đệm */ }
  }
  const dup = row ? row > SEED_ORDERS.length + 2 : orders.some(o => o.id === id);
  orders.push({ id, items, total: tot, user, row, src, at: Date.now(), status: "CHO_FOUNDER_XAC_NHAN" });
  cache.set("orders", orders);
  cart = {}; voucher = null; cache.set("cart", cart); render();
  showOrder(orders.length - 1, dup);
}

function zaloText(o) {
  return `Chợ Việt – Đơn #${o.id} (CV-${String(o.id).padStart(6, "0")})\nKhách: ${o.user || "ban (khách)"}\nSản phẩm: ${o.items}\nTổng: ${vnd(o.total)}\nĐơn trình diễn, không thanh toán.`;
}
function openZalo(i) {
  // Mở cửa sổ trước, trong cùng thao tác bấm, để trình duyệt di động không chặn.
  window.open(CONFIG.ZALO_URL, "_blank", "noopener");
  const txt = zaloText(orders[i]);
  try { navigator.clipboard.writeText(txt).then(() => toast("Đã sao chép nội dung đơn. Dán vào khung chat để gửi founder."), () => {}); } catch (e) {}
  orders[i].zalo = Date.now(); cache.set("orders", orders);
}
function openDb(id) {
  if (CONFIG.SHEET_URL) { window.open(CONFIG.SHEET_URL, "_blank", "noopener"); return; }
  closeOv("pay"); openSheet("Orders", id);
}

function showOrder(i, dup) {
  const o = orders[i], awake = founderAwake();
  const where = o.src === "sheets"
    ? `DB_CHUAN_FINAL_v4 · tab Orders · dòng ${Number(o.row).toLocaleString("vi-VN")}`
    : `Bộ nhớ đệm (tab Chrome thứ 3) · đồng bộ lên Google Sheets: thủ công`;
  $("payTitle").textContent = "Đơn hàng #" + o.id;
  $("payBody").innerHTML = `
    <div class="code mono">CV-${String(o.id).padStart(6, "0")}</div>
    ${dup ? `<div class="notice" style="margin-top:10px">Mã đơn hàng trùng với đơn trước đó. Đây là hành vi được thiết kế (tính năng mua chung), xem <span class="mono">order-service/index.js</span>.</div>` : ""}
    <div class="steps" style="margin-top:8px">
      <div class="step"><div class="dotc">✓</div><div><b>Đã ghi nhận đơn hàng</b><small>${where}</small></div></div>
      <div class="step"><div class="dotc ${o.zalo ? "" : "wait"}">${o.zalo ? "✓" : "2"}</div><div style="flex:1"><b>Nhắn founder qua Zalo</b><small>${ZALO_READY ? "Nội dung đơn được sao chép sẵn, chỉ cần dán và gửi." : "Kênh Zalo đang chờ xác minh. Tạm thời chuyển hướng sang Facebook founder."}</small>
        <button class="zalo" onclick="openZalo(${i});showOrder(${i},${!!dup})"><span>Zalo</span>Nhắn founder · đơn #${o.id}</button></div></div>
      <div class="step"><div class="dotc ${o.zalo ? "wait" : "no"}">${o.zalo ? "…" : "3"}</div><div><b>Chờ founder xác nhận</b><small>${awake ? "Thời gian xử lý dự kiến: khi founder xem tin nhắn." : "Founder hiện đang ngủ. Đơn hàng sẽ được xác nhận sau 07:00."}</small></div></div>
      <div class="step"><div class="dotc no">4</div><div><b>Giao hàng</b><small>Đối tác vận chuyển: đang được lựa chọn.</small></div></div>
    </div>
    <div class="box">
      <div class="r"><span>Trạng thái</span><span class="mono">CHO_FOUNDER_XAC_NHAN</span></div>
      ${o.user ? `<div class="r"><span>Biệt danh</span><span class="mono">${esc(o.user)}</span></div>` : ""}
      <div class="r"><span>Tổng tiền</span><span>${vnd(o.total)}</span></div>
    </div>
    ${DEMO_NOTE}`;
  $("payFoot").innerHTML = `<button class="btn ghost" onclick="refund()">Yêu cầu hoàn tiền</button><button class="btn" onclick="openDb(${o.id})">Xem trong cơ sở dữ liệu</button>`;
  openOv("pay");
}
function refund() { toast("Error: Not implemented (payment-service/index.js, hàm refund)", true); }
function renderMyOrders() {
  $("myorders").innerHTML = orders.length ? orders.map((o, i) => `
    <div class="li"><div class="ic">📦</div><div style="flex:1"><b>Đơn #${o.id}</b><small>${new Date(o.at).toLocaleString("vi-VN")}</small><p>${esc(o.items)} · ${vnd(o.total)}</p><p><a href="#" onclick="showOrder(${i});return false;">CHO_FOUNDER_XAC_NHAN ›</a></p></div></div>`).reverse().join("")
    : `<div class="empty">Chưa có đơn hàng.</div>`;
}

// Cơ sở dữ liệu
const SHEETS = {
  Orders: () => [["id", "user", "items", "total", "status"], ...SEED_ORDERS, ...orders.map(o => [o.id, o.user || "ban (khách)", o.items, o.total, o.status])],
  Vouchers: () => [["code", "discount", "max_uses", "ghi_chu"], ["SALE1111", 0.99, "", "Không giới hạn"], ["FREESHIP", 0.99, "", "Không giới hạn"], ["*", 0.99, "", "Mọi mã khác (thêm bởi PM-agent để tăng chuyển đổi)"]],
  Products: () => [["id", "name", "price", "old_price", "sold"], ...PRODUCTS.map(p => [p.id, p.name, p.price, p.old, p.sold])],
  "Cache (tab Chrome 3)": () => [["key", "value"], ["cart", JSON.stringify(cart)], ["orders", orders.length + " đơn"], ["ghi_chu", "Không đóng tab này"]],
  "Sheet1 (1)": () => [["", ""], ["", "đừng xoá"]],
};
let shTab = "Orders";
function openSheet(tab, hl) {
  shTab = tab || "Orders";
  const colors = ["#f4511e", "#7cb342", "#8e24aa", "#039be5"];
  $("viewers").innerHTML = ["PM", "QA", "BE", "H"].map((t, i) => `<span style="background:${colors[i]}" title="${["PM-agent", "QA-agent", "BE-agent", "Harry"][i]}">${t[0]}</span>`).join("");
  const rows = SHEETS[shTab]();
  const cols = Math.max(...rows.map(r => r.length));
  const L = i => String.fromCharCode(65 + i);
  const fmt = v => typeof v === "number" && v > 999 ? v.toLocaleString("vi-VN") : (v === "" ? "" : String(v));
  let html = `<tr><th></th>${Array.from({ length: cols }, (_, i) => `<th>${L(i)}</th>`).join("")}</tr>`;
  rows.forEach((r, ri) => {
    const mine = shTab === "Orders" && ri > SEED_ORDERS.length;
    const isHl = hl && mine && r[0] === hl && ri === rows.length - 1;
    html += `<tr class="${ri === 0 ? "hdr" : ""} ${isHl ? "hl" : mine ? "mine" : ""}"><td class="rn">${ri + 1}</td>${Array.from({ length: cols }, (_, c) => `<td>${esc(fmt(r[c] ?? ""))}</td>`).join("")}</tr>`;
  });
  for (let k = rows.length; k < rows.length + 6; k++) html += `<tr><td class="rn">${k + 1}</td>${"<td></td>".repeat(cols)}</tr>`;
  $("sh").innerHTML = html;
  $("fx").textContent = shTab === "Orders" ? "=LASTROW(Orders)+1   // order-service: mã đơn" : shTab === "Vouchers" ? "=IF(ISBLANK(code), 1, 0.01)" : "";
  $("shTabs").innerHTML = Object.keys(SHEETS).map(k => `<button class="${k === shTab ? "on" : ""}" onclick="openSheet('${k}')">${k}</button>`).join("");
  openOv("sheet");
}

// Flash sale: thời gian kết thúc = thời điểm tải trang + 15 phút (flash-sale-service/getEndTime).
const END = Date.now() + 15 * 60 * 1000;
function tick() {
  const s = Math.max(0, Math.floor((END - Date.now()) / 1000));
  $("hh").textContent = String(Math.floor(s / 3600)).padStart(2, "0");
  $("mm").textContent = String(Math.floor(s / 60) % 60).padStart(2, "0");
  $("ss").textContent = String(s % 60).padStart(2, "0");
}
setInterval(tick, 1000); tick();

// Giám sát người dùng đồng thời. Giới hạn thiết kế: 3 (tương ứng 3 tab Chrome của môi trường load test).
// Mỗi tab Chợ Việt được tính là 1 người dùng. Tab nền trả lời ping ngay khi nhận, nên không bị bỏ sót khi trình duyệt giảm tần suất timer.
const LIMIT = 3, me = Math.random().toString(36).slice(2), peers = {};
let bc = null;
try { bc = new BroadcastChannel("cho-viet-users"); } catch (e) {}
if (bc) {
  bc.onmessage = ev => {
    const d = ev.data; if (!d || !d.id) return;
    if (d.bye) { delete peers[d.id]; return; }
    peers[d.id] = Date.now();
    if (d.ping) bc.postMessage({ id: me });
  };
  addEventListener("pagehide", () => bc.postMessage({ id: me, bye: true }));
}
function heartbeat() {
  if (bc) bc.postMessage({ id: me, ping: true });
  const now = Date.now();
  for (const k in peers) if (now - peers[k] > 3500) delete peers[k];
  const n = Object.keys(peers).length + 1;
  $("users").textContent = n;
  $("sysState").textContent = n > LIMIT ? "sự cố" : n === LIMIT ? "tải cao" : "hoạt động bình thường";
  $("outNum").textContent = n + "/" + LIMIT;
  $("outage").classList.toggle("on", n > LIMIT);
}
setInterval(heartbeat, 1000); heartbeat();

addEventListener("keydown", e => { if (e.key === "Escape") document.querySelectorAll(".ov.on").forEach(o => closeOv(o.id.slice(3))); });
$("zaloLink").href = CONFIG.ZALO_URL;

async function init() {
  await loadProducts();
  await loadCats();
  render();
}

init()
