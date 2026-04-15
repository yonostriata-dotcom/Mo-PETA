// ============================================================
// Mo-PETA — Versi Admin Panel
// ============================================================

var CONFIG = {
  SCRIPT_URL:     "https://script.google.com/macros/s/AKfycbx_BBwJLfZjJO0VJrWrXVMquDoz6UHhiNfm_7_p1ju7Rn60XCs7RdchoUp9x-Lw8nqXFw/exec",
  WHATSAPP:       "62895425966562",    // ← Ganti dengan nomor WhatsApp (format: 628xxx)
  INSTAGRAM:      "mopeta.official",  // ← Ganti dengan username Instagram
  ADMIN_KODE:     "mopeta-mimin",     // ← Kode di URL: admin.html?kode=mopeta-admin
  ADMIN_PASSWORD: "ganti3kali"         // ← Kata sandi halaman admin
};

document.addEventListener("DOMContentLoaded", function () {
  var waLinks = document.querySelectorAll(".footer-wa");
  var igLinks = document.querySelectorAll(".footer-ig");
  waLinks.forEach(function (el) {
    el.href   = "https://wa.me/" + CONFIG.WHATSAPP;
    el.target = "_blank";
  });
  igLinks.forEach(function (el) {
    el.href   = "https://instagram.com/" + CONFIG.INSTAGRAM;
    el.target = "_blank";
  });

  var path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(function (link) {
    if (link.getAttribute("href") === path) link.classList.add("active");
  });

  if (typeof initPage === "function") initPage();
});


// ============================================================
// Utilitas: Panggil API via JSONP
// ============================================================
function apiGet(params, callback) {
  var cbName = "cb_" + Date.now() + "_" + Math.floor(Math.random() * 99999);
  var url    = CONFIG.SCRIPT_URL + "?" + objToQuery(params) + "&callback=" + cbName;
  var script = document.createElement("script");
  var selesai = false;

  window[cbName] = function (data) {
    if (selesai) return;
    selesai = true;
    delete window[cbName];
    // Tunda penghapusan script agar tidak memutus eksekusi
    setTimeout(function () {
      if (script && script.parentNode) script.parentNode.removeChild(script);
    }, 50);
    callback(null, data);
  };

  script.onerror = function () {
    if (selesai) return;
    selesai = true;
    delete window[cbName];
    if (script && script.parentNode) script.parentNode.removeChild(script);
    callback("Gagal terhubung ke server");
  };

  // Timeout 15 detik
  setTimeout(function () {
    if (!selesai) {
      selesai = true;
      delete window[cbName];
      if (script && script.parentNode) script.parentNode.removeChild(script);
      callback("Waktu habis. Periksa koneksi internet.");
    }
  }, 15000);

  script.src = url;
  document.body.appendChild(script);
}

function objToQuery(obj) {
  return Object.keys(obj).map(function (k) {
    return encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]);
  }).join("&");
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


// ============================================================
// HALAMAN PESAN
// ============================================================
function initFormPesan() {
  var form = document.getElementById("form-pesan");
  if (!form) return;

  var jenisPetaSelect     = document.getElementById("jenis-peta");
  var sectionLokasi       = document.getElementById("section-lokasi");
  var sectionWa           = document.getElementById("section-wa");
  var jenisLokasiSelect   = document.getElementById("jenis-lokasi");
  var sectionDetailLokasi = document.getElementById("section-detail-lokasi");
  var labelDetail         = document.getElementById("label-detail");

  jenisPetaSelect.addEventListener("change", function () {
    var val = this.value;
    if (val === "Peta Lokasi Penelitian") {
      sectionLokasi.style.display = "block";
      sectionWa.style.display     = "none";
      updateDetailLabel();
    } else if (val === "Peta Titik Pengambilan Sampel") {
      sectionLokasi.style.display = "none";
      sectionWa.style.display     = "block";
    } else {
      sectionLokasi.style.display = "none";
      sectionWa.style.display     = "none";
    }
  });

  jenisLokasiSelect.addEventListener("change", updateDetailLabel);

  function updateDetailLabel() {
    var jl = jenisLokasiSelect.value;
    if (jl === "Wilayah") {
      labelDetail.textContent = "Nama Wilayah";
      document.getElementById("detail-lokasi").placeholder = "Contoh: Kecamatan Bogor Utara, Kota Bogor";
    } else if (jl === "Nama Tempat (Institusi/Lembaga)") {
      labelDetail.textContent = "Nama Institusi / Lembaga";
      document.getElementById("detail-lokasi").placeholder = "Contoh: IPB University, Bogor";
    } else {
      labelDetail.textContent = "Detail Lokasi";
      document.getElementById("detail-lokasi").placeholder = "";
    }
    sectionDetailLokasi.style.display = jl ? "block" : "none";
  }

  form.addEventListener("submit", function (e) { e.preventDefault(); kirimPesanan(); });

  var btnWa = document.getElementById("btn-wa-sampel");
  if (btnWa) {
    btnWa.addEventListener("click", function () {
      var pesan = "Halo Mo-PETA! Saya ingin memesan Peta Titik Pengambilan Sampel.";
      window.open("https://wa.me/" + CONFIG.WHATSAPP + "?text=" + encodeURIComponent(pesan), "_blank");
    });
  }
}

function kirimPesanan() {
  var btn      = document.getElementById("btn-kirim");
  var statusEl = document.getElementById("status-pesan");
  var hasilEl  = document.getElementById("hasil-pesan");

  btn.disabled    = true;
  btn.textContent = "Mengirim...";
  statusEl.style.display = "none";
  hasilEl.style.display  = "none";

  var params = {
    action:       "submitOrder",
    bahasa:       document.getElementById("bahasa").value,
    nama:         document.getElementById("nama").value,
    nim:          document.getElementById("nim").value,
    programStudi: document.getElementById("program-studi").value,
    kontak:       document.getElementById("kontak").value,
    jenisPeta:    document.getElementById("jenis-peta").value,
    jenisLokasi:  document.getElementById("jenis-lokasi")  ? document.getElementById("jenis-lokasi").value  : "-",
    detailLokasi: document.getElementById("detail-lokasi") ? document.getElementById("detail-lokasi").value : "-"
  };

  apiGet(params, function (err, data) {
    btn.disabled    = false;
    btn.textContent = "Kirim Pesanan";

    if (err || !data || !data.success) {
      statusEl.className   = "alert alert-error";
      statusEl.textContent = "Gagal mengirim pesanan. Coba lagi atau hubungi WhatsApp kami.";
      statusEl.style.display = "block";
      return;
    }

    hasilEl.querySelector(".order-id-display").textContent = data.orderId;
    hasilEl.style.display = "block";
    document.getElementById("form-pesan").reset();
    document.getElementById("section-lokasi").style.display = "none";
    document.getElementById("section-wa").style.display     = "none";
    window.scrollTo({ top: hasilEl.offsetTop - 80, behavior: "smooth" });
  });
}

function salinId() {
  var el   = document.querySelector(".order-id-display");
  var teks = el ? el.textContent.trim() : "";
  if (!teks) return;
  navigator.clipboard.writeText(teks).then(function () {
    var btn = document.querySelector(".btn-salin");
    if (btn) { var asal = btn.textContent; btn.textContent = "Tersalin!"; setTimeout(function () { btn.textContent = asal; }, 2000); }
  });
}


// ============================================================
// HALAMAN LACAK PESANAN
// ============================================================
function initLacak() {
  var formId  = document.getElementById("form-lacak-id");
  var formNim = document.getElementById("form-lacak-nim");
  if (formId)  formId.addEventListener("submit",  function (e) { e.preventDefault(); lacakById(); });
  if (formNim) formNim.addEventListener("submit", function (e) { e.preventDefault(); lacakByNim(); });
}

function lacakById() {
  var id      = document.getElementById("input-id").value.trim().toUpperCase();
  var hasilEl = document.getElementById("hasil-lacak-id");
  hasilEl.innerHTML = '<p class="loading">Mencari pesanan...</p>';

  apiGet({ action: "getOrder", id: id }, function (err, data) {
    if (err || !data || !data.success) {
      hasilEl.innerHTML = '<p class="alert alert-error">Pesanan dengan ID <strong>' + esc(id) + '</strong> tidak ditemukan.</p>';
      return;
    }
    var o  = data.order;
    var sc = getStatusClass(o.status);
    hasilEl.innerHTML =
      '<div class="order-card">' +
        '<div class="order-card-header">' +
          '<span class="order-id">' + esc(o.id) + '</span>' +
          '<span class="badge ' + sc + '">' + esc(o.status) + '</span>' +
        '</div>' +
        '<div class="order-card-body">' +
          '<div class="order-row"><span>Nama</span><span>' + esc(o.nama) + '</span></div>' +
          '<div class="order-row"><span>NIM</span><span>' + esc(o.nim) + '</span></div>' +
          '<div class="order-row"><span>Program Studi</span><span>' + esc(o.programStudi) + '</span></div>' +
          '<div class="order-row"><span>Kontak</span><span>' + esc(o.kontak) + '</span></div>' +
          '<div class="order-row"><span>Jenis Peta</span><span>' + esc(o.jenisPeta) + '</span></div>' +
          (o.jenisLokasi  && o.jenisLokasi  !== "-" ? '<div class="order-row"><span>Jenis Lokasi</span><span>' + esc(o.jenisLokasi) + '</span></div>' : '') +
          (o.detailLokasi && o.detailLokasi !== "-" ? '<div class="order-row"><span>Detail Lokasi</span><span>' + esc(o.detailLokasi) + '</span></div>' : '') +
          '<div class="order-row"><span>Tanggal Pesan</span><span>' + esc(o.tanggalPesan) + '</span></div>' +
          (o.catatanAdmin ? '<div class="order-row catatan"><span>Catatan</span><span>' + esc(o.catatanAdmin) + '</span></div>' : '') +
        '</div>' +
      '</div>';
  });
}

function lacakByNim() {
  var nim     = document.getElementById("input-nim").value.trim();
  var hasilEl = document.getElementById("hasil-lacak-nim");
  hasilEl.innerHTML = '<p class="loading">Mencari riwayat...</p>';

  apiGet({ action: "getOrdersByNIM", nim: nim }, function (err, data) {
    if (err || !data || !data.success || data.total === 0) {
      hasilEl.innerHTML = '<p class="alert alert-error">Tidak ada riwayat pesanan untuk NIM <strong>' + esc(nim) + '</strong>.</p>';
      return;
    }
    var html = '<p class="riwayat-info">Ditemukan <strong>' + data.total + '</strong> pesanan</p>';
    data.orders.forEach(function (o) {
      var sc = getStatusClass(o.status);
      html +=
        '<div class="riwayat-item">' +
          '<div class="riwayat-summary" onclick="toggleRiwayat(this)">' +
            '<div><span class="riwayat-id">' + esc(o.id) + '</span><span class="riwayat-peta">' + esc(o.jenisPeta) + '</span></div>' +
            '<div class="riwayat-kanan"><span class="badge ' + sc + '">' + esc(o.status) + '</span><span class="riwayat-arrow">▼</span></div>' +
          '</div>' +
          '<div class="riwayat-detail">' +
            '<div class="order-row"><span>Nama</span><span>' + esc(o.nama) + '</span></div>' +
            '<div class="order-row"><span>NIM</span><span>' + esc(o.nim) + '</span></div>' +
            '<div class="order-row"><span>ID Pesanan</span><span>' + esc(o.id) + ' <button class="btn-salin-kecil" onclick="salinTeks(\'' + esc(o.id) + '\', this)">Salin</button></span></div>' +
            '<div class="order-row"><span>Tanggal</span><span>' + esc(o.tanggalPesan) + '</span></div>' +
            (o.catatanAdmin ? '<div class="order-row catatan"><span>Catatan</span><span>' + esc(o.catatanAdmin) + '</span></div>' : '') +
          '</div>' +
        '</div>';
    });
    hasilEl.innerHTML = html;
  });
}

function toggleRiwayat(el) {
  var item = el.parentElement;
  item.classList.toggle("open");
  var arrow = el.querySelector(".riwayat-arrow");
  if (arrow) arrow.textContent = item.classList.contains("open") ? "▲" : "▼";
}

function salinTeks(teks, btn) {
  navigator.clipboard.writeText(teks).then(function () {
    var asal = btn.textContent;
    btn.textContent = "Tersalin!";
    setTimeout(function () { btn.textContent = asal; }, 2000);
  });
}

function getStatusClass(status) {
  var map = {
    "Menunggu Konfirmasi": "badge-kuning",
    "Diproses":            "badge-biru",
    "Menunggu Revisi":     "badge-oranye",
    "Selesai":             "badge-hijau",
    "Dibatalkan":          "badge-merah"
  };
  return map[status] || "badge-abu";
}


// ============================================================
// HALAMAN ADMIN
// ============================================================
var _semua   = [];   // semua pesanan
var _filter  = "";   // filter status aktif

function initAdmin() {
  var kode = (new URLSearchParams(window.location.search)).get("kode") || "";

  if (kode !== CONFIG.ADMIN_KODE) {
    tampilLayer("screen-denied");
    return;
  }

  document.getElementById("form-login").addEventListener("submit", function (e) {
    e.preventDefault();
    var pw = document.getElementById("input-password").value;
    if (pw === CONFIG.ADMIN_PASSWORD) {
      tampilLayer("screen-admin");
      muatPesanan();
    } else {
      document.getElementById("login-error").style.display = "block";
      document.getElementById("input-password").value = "";
      document.getElementById("input-password").focus();
    }
  });
}

function tampilLayer(id) {
  ["screen-login", "screen-denied", "screen-admin"].forEach(function (s) {
    var el = document.getElementById(s);
    if (el) el.style.display = (s === id ? (id === "screen-admin" ? "block" : "flex") : "none");
  });
}

function logout() {
  tampilLayer("screen-login");
  document.getElementById("input-password").value = "";
}

function muatPesanan() {
  var loadEl  = document.getElementById("admin-loading");
  var tabelEl = document.getElementById("admin-tabel");
  loadEl.textContent   = "Memuat data pesanan...";
  loadEl.style.display = "block";
  tabelEl.style.display = "none";

  apiGet({ action: "getAllOrders" }, function (err, data) {
    loadEl.style.display = "none";

    if (err) {
      loadEl.textContent   = "Error: " + err;
      loadEl.style.display = "block";
      return;
    }
    if (!data || !data.success) {
      loadEl.textContent   = "Gagal: " + (data ? data.message : "Tidak ada respon");
      loadEl.style.display = "block";
      return;
    }

    _semua = Array.isArray(data.orders) ? data.orders : [];
    document.getElementById("admin-total").textContent = "Total: " + _semua.length + " pesanan";
    renderTabel(_semua);
  });
}

function renderTabel(orders) {
  var tabelEl = document.getElementById("admin-tabel");
  var tbodyEl = document.getElementById("admin-tbody");
  var loadEl  = document.getElementById("admin-loading");

  if (!tabelEl || !tbodyEl) {
    if (loadEl) { loadEl.textContent = "Error: elemen tabel tidak ditemukan."; loadEl.style.display = "block"; }
    return;
  }

  var STATUS_LIST = ["Menunggu Konfirmasi", "Diproses", "Menunggu Revisi", "Selesai", "Dibatalkan"];

  var baris = "";
  for (var i = 0; i < orders.length; i++) {
    var o      = orders[i] || {};
    var id     = String(o.id           || "");
    var tgl    = String(o.tanggalPesan || "").substring(0, 16);
    var nama   = String(o.nama         || "-");
    var prodi  = String(o.programStudi || "-");
    var nim    = String(o.nim          || "-");
    var kontak = String(o.kontak       || "-");
    var peta   = String(o.jenisPeta    || "-");
    var lok    = String(o.jenisLokasi  || "-");
    var det    = String(o.detailLokasi || "-");
    var status = String(o.status       || "Menunggu Konfirmasi");
    var catat  = String(o.catatanAdmin || "");

    var opsi = "";
    for (var j = 0; j < STATUS_LIST.length; j++) {
      opsi += '<option value="' + esc(STATUS_LIST[j]) + '"' + (STATUS_LIST[j] === status ? " selected" : "") + '>' + esc(STATUS_LIST[j]) + '</option>';
    }

    baris +=
      '<tr data-id="' + esc(id) + '" data-status="' + esc(status) + '" data-nama="' + esc(nama.toLowerCase()) + '" data-nim="' + esc(nim.toLowerCase()) + '">' +
        '<td><span class="admin-order-id">' + esc(id) + '</span><br><small style="color:var(--teks-abu)">' + esc(tgl) + '</small></td>' +
        '<td><strong>' + esc(nama) + '</strong><br><small>' + esc(prodi) + '</small></td>' +
        '<td>' + esc(nim) + '</td>' +
        '<td style="font-size:0.85rem">' + esc(kontak) + '</td>' +
        '<td style="font-size:0.85rem">' + esc(peta) + (lok !== "-" ? '<br><small style="color:var(--teks-abu)">' + esc(lok) + '</small>' : '') + '</td>' +
        '<td style="font-size:0.85rem">' + esc(det) + '</td>' +
        '<td>' +
          '<select class="form-control select-status" style="min-width:160px">' + opsi + '</select>' +
          '<div style="margin-top:4px"><span class="badge ' + getStatusClass(status) + '" id="badge-' + esc(id) + '">' + esc(status) + '</span></div>' +
        '</td>' +
        '<td><textarea class="form-control admin-catatan" rows="2" style="min-width:180px;font-size:0.85rem" placeholder="Catatan untuk pemesan...">' + esc(catat) + '</textarea></td>' +
        '<td><button class="btn-simpan-status" onclick="simpanStatus(this,\'' + esc(id) + '\')">Simpan</button></td>' +
      '</tr>';
  }

  tbodyEl.innerHTML = baris;
  document.getElementById("admin-kosong").style.display = orders.length === 0 ? "block" : "none";
  tabelEl.style.display = "block";
}

function simpanStatus(btn, orderId) {
  var tr        = btn.closest("tr");
  var statusBaru = tr.querySelector(".select-status").value;
  var catatan    = tr.querySelector(".admin-catatan").value;

  btn.disabled    = true;
  btn.textContent = "...";

  apiGet({ action: "updateStatus", id: orderId, status: statusBaru, catatan: catatan }, function (err, data) {
    btn.disabled    = false;
    btn.textContent = "Simpan";

    if (err || !data || !data.success) {
      btn.textContent   = "✗ Gagal";
      btn.style.background = "var(--merah, #c62828)";
      setTimeout(function () { btn.textContent = "Simpan"; btn.style.background = ""; }, 2500);
      return;
    }

    var badge = document.getElementById("badge-" + orderId);
    if (badge) { badge.textContent = statusBaru; badge.className = "badge " + getStatusClass(statusBaru); }
    tr.setAttribute("data-status", statusBaru);

    btn.textContent      = "✓ Simpan";
    btn.style.background = "var(--hijau, #2E7D32)";
    setTimeout(function () { btn.textContent = "Simpan"; btn.style.background = ""; }, 2500);

    _semua.forEach(function (o) {
      if (o.id === orderId) { o.status = statusBaru; o.catatanAdmin = catatan; }
    });
  });
}

function filterStatus(status, btn) {
  _filter = status;
  document.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("active"); });
  btn.classList.add("active");
  terapkanFilter();
}

function cariPesanan(kata) { terapkanFilter(kata); }

function terapkanFilter(kata) {
  var cari = (kata !== undefined ? kata : (document.getElementById("admin-search").value || "")).toLowerCase();
  var rows  = document.querySelectorAll("#admin-tbody tr");
  var n     = 0;
  rows.forEach(function (tr) {
    var okStatus = !_filter || tr.getAttribute("data-status") === _filter;
    var okCari   = !cari   ||
      (tr.getAttribute("data-id")   || "").toLowerCase().indexOf(cari) >= 0 ||
      (tr.getAttribute("data-nama") || "").indexOf(cari) >= 0 ||
      (tr.getAttribute("data-nim")  || "").indexOf(cari) >= 0;
    tr.style.display = (okStatus && okCari) ? "" : "none";
    if (okStatus && okCari) n++;
  });
  document.getElementById("admin-kosong").style.display = n === 0 ? "block" : "none";
}
