// ============================================================
// Mo-PETA — Konfigurasi & Fungsi Utama
// ============================================================

var CONFIG = {
  SCRIPT_URL:     "https://script.google.com/macros/s/AKfycbx_BBwJLfZjJO0VJrWrXVMquDoz6UHhiNfm_7_p1ju7Rn60XCs7RdchoUp9x-Lw8nqXFw/exec",
  WHATSAPP:       "62895425966562",    // ← Ganti dengan nomor WhatsApp (format: 628xxx)
  INSTAGRAM:      "mopeta.official",  // ← Ganti dengan username Instagram
  ADMIN_KODE:     "mopeta-mimin",     // ← Kode di URL: admin.html?kode=mopeta-admin
  ADMIN_PASSWORD: "ganti3kali"         // ← Kata sandi halaman admin
};

// Setel link WA & IG di footer, tandai nav aktif, inisialisasi halaman
document.addEventListener("DOMContentLoaded", function () {
  var waLinks = document.querySelectorAll(".footer-wa");
  var igLinks = document.querySelectorAll(".footer-ig");
  waLinks.forEach(function (el) {
    el.href = "https://wa.me/" + CONFIG.WHATSAPP;
    el.target = "_blank";
  });
  igLinks.forEach(function (el) {
    el.href = "https://instagram.com/" + CONFIG.INSTAGRAM;
    el.target = "_blank";
  });

  var path = window.location.pathname.split("/").pop() || "index.html";
  var navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(function (link) {
    if (link.getAttribute("href") === path) link.classList.add("active");
  });

  if (typeof initPage === "function") initPage();
});


// ============================================================
// Utilitas: Panggil API via JSONP (semua pakai GET)
// ============================================================
function apiGet(params, callback) {
  var url = CONFIG.SCRIPT_URL + "?" + objToQuery(params);
  var script = document.createElement("script");
  var cbName = "mopeta_cb_" + Date.now();
  url += "&callback=" + cbName;

  window[cbName] = function (data) {
    delete window[cbName];
    document.body.removeChild(script);
    callback(null, data);
  };

  script.onerror = function () {
    delete window[cbName];
    document.body.removeChild(script);
    callback("Gagal terhubung ke server");
  };

  script.src = url;
  document.body.appendChild(script);
}

function objToQuery(obj) {
  return Object.keys(obj).map(function (k) {
    return encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]);
  }).join("&");
}


// ============================================================
// HALAMAN PESAN
// ============================================================
function initFormPesan() {
  var form = document.getElementById("form-pesan");
  if (!form) return;

  var jenisPetaSelect    = document.getElementById("jenis-peta");
  var sectionLokasi      = document.getElementById("section-lokasi");
  var sectionWa          = document.getElementById("section-wa");
  var jenisLokasiSelect  = document.getElementById("jenis-lokasi");
  var sectionDetailLokasi = document.getElementById("section-detail-lokasi");
  var labelDetail        = document.getElementById("label-detail");

  jenisPetaSelect.addEventListener("change", function () {
    var val = this.value;
    if (val === "Peta Lokasi Penelitian") {
      sectionLokasi.style.display = "block";
      sectionWa.style.display = "none";
      updateDetailLabel();
    } else if (val === "Peta Titik Pengambilan Sampel") {
      sectionLokasi.style.display = "none";
      sectionWa.style.display = "block";
    } else {
      sectionLokasi.style.display = "none";
      sectionWa.style.display = "none";
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

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    kirimPesanan();
  });

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

  btn.disabled = true;
  btn.textContent = "Mengirim...";
  statusEl.style.display = "none";
  hasilEl.style.display = "none";

  var params = {
    action:       "submitOrder",
    bahasa:       document.getElementById("bahasa").value,
    nama:         document.getElementById("nama").value,
    nim:          document.getElementById("nim").value,
    programStudi: document.getElementById("program-studi").value,
    kontak:       document.getElementById("kontak").value,
    jenisPeta:    document.getElementById("jenis-peta").value,
    jenisLokasi:  document.getElementById("jenis-lokasi") ? document.getElementById("jenis-lokasi").value : "-",
    detailLokasi: document.getElementById("detail-lokasi") ? document.getElementById("detail-lokasi").value : "-"
  };

  apiGet(params, function (err, data) {
    btn.disabled = false;
    btn.textContent = "Kirim Pesanan";

    if (err || !data || !data.success) {
      statusEl.className = "alert alert-error";
      statusEl.textContent = "Gagal mengirim pesanan. Coba lagi atau hubungi WhatsApp kami.";
      statusEl.style.display = "block";
      return;
    }

    hasilEl.querySelector(".order-id-display").textContent = data.orderId;
    hasilEl.style.display = "block";
    document.getElementById("form-pesan").reset();
    document.getElementById("section-lokasi").style.display = "none";
    document.getElementById("section-wa").style.display = "none";
    window.scrollTo({ top: hasilEl.offsetTop - 80, behavior: "smooth" });
  });
}

function salinId() {
  var el = document.querySelector(".order-id-display");
  var teks = el ? el.textContent.trim() : "";
  if (!teks) return;
  navigator.clipboard.writeText(teks).then(function () {
    var btn = document.querySelector(".btn-salin");
    if (btn) {
      var asal = btn.textContent;
      btn.textContent = "Tersalin!";
      setTimeout(function () { btn.textContent = asal; }, 2000);
    }
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
      hasilEl.innerHTML = '<p class="alert alert-error">Pesanan dengan ID <strong>' + id + '</strong> tidak ditemukan.</p>';
      return;
    }
    var o = data.order;
    var statusClass = getStatusClass(o.status);
    hasilEl.innerHTML =
      '<div class="order-card">' +
        '<div class="order-card-header">' +
          '<span class="order-id">' + o.id + '</span>' +
          '<span class="badge ' + statusClass + '">' + o.status + '</span>' +
        '</div>' +
        '<div class="order-card-body">' +
          '<div class="order-row"><span>Nama</span><span>' + o.nama + '</span></div>' +
          '<div class="order-row"><span>NIM</span><span>' + o.nim + '</span></div>' +
          '<div class="order-row"><span>Program Studi</span><span>' + o.programStudi + '</span></div>' +
          '<div class="order-row"><span>Kontak</span><span>' + o.kontak + '</span></div>' +
          '<div class="order-row"><span>Jenis Peta</span><span>' + o.jenisPeta + '</span></div>' +
          (o.jenisLokasi && o.jenisLokasi !== "-" ? '<div class="order-row"><span>Jenis Lokasi</span><span>' + o.jenisLokasi + '</span></div>' : '') +
          (o.detailLokasi && o.detailLokasi !== "-" ? '<div class="order-row"><span>Detail Lokasi</span><span>' + o.detailLokasi + '</span></div>' : '') +
          '<div class="order-row"><span>Tanggal Pesan</span><span>' + o.tanggalPesan + '</span></div>' +
          (o.catatanAdmin ? '<div class="order-row catatan"><span>Catatan</span><span>' + o.catatanAdmin + '</span></div>' : '') +
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
      hasilEl.innerHTML = '<p class="alert alert-error">Tidak ada riwayat pesanan untuk NIM <strong>' + nim + '</strong>.</p>';
      return;
    }

    var html = '<p class="riwayat-info">Ditemukan <strong>' + data.total + '</strong> pesanan</p>';
    data.orders.forEach(function (o) {
      var statusClass = getStatusClass(o.status);
      html +=
        '<div class="riwayat-item">' +
          '<div class="riwayat-summary" onclick="toggleRiwayat(this)">' +
            '<div>' +
              '<span class="riwayat-id">' + o.id + '</span>' +
              '<span class="riwayat-peta">' + o.jenisPeta + '</span>' +
            '</div>' +
            '<div class="riwayat-kanan">' +
              '<span class="badge ' + statusClass + '">' + o.status + '</span>' +
              '<span class="riwayat-arrow">▼</span>' +
            '</div>' +
          '</div>' +
          '<div class="riwayat-detail">' +
            '<div class="order-row"><span>Nama</span><span>' + o.nama + '</span></div>' +
            '<div class="order-row"><span>NIM</span><span>' + o.nim + '</span></div>' +
            '<div class="order-row"><span>ID Pesanan</span>' +
              '<span>' + o.id + ' <button class="btn-salin-kecil" onclick="salinTeks(\'' + o.id + '\', this)">Salin</button></span>' +
            '</div>' +
            '<div class="order-row"><span>Tanggal</span><span>' + o.tanggalPesan + '</span></div>' +
            (o.catatanAdmin ? '<div class="order-row catatan"><span>Catatan</span><span>' + o.catatanAdmin + '</span></div>' : '') +
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
var _adminData = [];
var _filterAktif = "";

function initAdmin() {
  var params = new URLSearchParams(window.location.search);
  var kode = params.get("kode") || "";

  // Cek kode URL
  if (kode !== CONFIG.ADMIN_KODE) {
    document.getElementById("screen-login").style.display = "none";
    document.getElementById("screen-denied").style.display = "flex";
    return;
  }

  // Setup form login
  document.getElementById("form-login").addEventListener("submit", function (e) {
    e.preventDefault();
    var pw = document.getElementById("input-password").value;
    if (pw === CONFIG.ADMIN_PASSWORD) {
      document.getElementById("screen-login").style.display = "none";
      document.getElementById("screen-admin").style.display = "block";
      muatSemuaPesanan();
    } else {
      document.getElementById("login-error").style.display = "block";
      document.getElementById("input-password").value = "";
      document.getElementById("input-password").focus();
    }
  });
}

function logout() {
  document.getElementById("screen-admin").style.display = "none";
  document.getElementById("screen-login").style.display = "flex";
  document.getElementById("input-password").value = "";
}

function muatSemuaPesanan() {
  document.getElementById("admin-loading").style.display = "block";
  document.getElementById("admin-tabel").style.display = "none";

  apiGet({ action: "getAllOrders" }, function (err, data) {
    document.getElementById("admin-loading").style.display = "none";
    if (err || !data || !data.success) {
      document.getElementById("admin-loading").style.display = "block";
      document.getElementById("admin-loading").textContent = "Gagal memuat data. Coba refresh.";
      return;
    }
    _adminData = data.orders || [];
    document.getElementById("admin-total").textContent = "Total: " + _adminData.length + " pesanan";
    tampilkanTabel(_adminData);
  });
}

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buatTd(isi) {
  var td = document.createElement("td");
  td.innerHTML = isi;
  return td;
}

function buatTdTeks(teks, style) {
  var td = document.createElement("td");
  td.textContent = teks || "-";
  if (style) td.setAttribute("style", style);
  return td;
}

function tampilkanTabel(orders) {
  var tbody = document.getElementById("admin-tbody");
  var kosong = document.getElementById("admin-kosong");
  var tabel  = document.getElementById("admin-tabel");

  if (!tbody || !kosong || !tabel) return;

  tbody.innerHTML = "";

  if (!orders || orders.length === 0) {
    kosong.style.display = "block";
    tabel.style.display = "block";
    return;
  }
  kosong.style.display = "none";
  tabel.style.display = "block";

  var statusList = ["Menunggu Konfirmasi", "Diproses", "Menunggu Revisi", "Selesai", "Dibatalkan"];

  orders.forEach(function (o) {
    try {
      var id          = o.id           || "";
      var tgl         = o.tanggalPesan ? String(o.tanggalPesan).substring(0, 16) : "-";
      var nama        = o.nama         || "-";
      var prodi       = o.programStudi || "-";
      var nim         = String(o.nim   || "-");
      var kontak      = o.kontak       || "-";
      var jenisPeta   = o.jenisPeta    || "-";
      var jenisLokasi = o.jenisLokasi  || "-";
      var detailLok   = o.detailLokasi || "-";
      var status      = o.status       || "Menunggu Konfirmasi";
      var catatan     = o.catatanAdmin || "";

      var tr = document.createElement("tr");
      tr.setAttribute("data-id",     id);
      tr.setAttribute("data-status", status);
      tr.setAttribute("data-nama",   nama.toLowerCase());
      tr.setAttribute("data-nim",    nim.toLowerCase());

      // Kolom 1: ID
      var tdId = document.createElement("td");
      var spanId = document.createElement("span");
      spanId.className = "admin-order-id";
      spanId.textContent = id;
      var smallTgl = document.createElement("small");
      smallTgl.style.color = "var(--teks-abu)";
      smallTgl.textContent = tgl;
      tdId.appendChild(spanId);
      tdId.appendChild(document.createElement("br"));
      tdId.appendChild(smallTgl);
      tr.appendChild(tdId);

      // Kolom 2: Nama + Prodi
      var tdNama = document.createElement("td");
      var strong = document.createElement("strong");
      strong.textContent = nama;
      var smallProdi = document.createElement("small");
      smallProdi.textContent = prodi;
      tdNama.appendChild(strong);
      tdNama.appendChild(document.createElement("br"));
      tdNama.appendChild(smallProdi);
      tr.appendChild(tdNama);

      // Kolom 3: NIM
      tr.appendChild(buatTdTeks(nim));

      // Kolom 4: Kontak
      tr.appendChild(buatTdTeks(kontak, "font-size:0.85rem"));

      // Kolom 5: Jenis Peta + detail singkat
      var tdPeta = document.createElement("td");
      tdPeta.style.fontSize = "0.85rem";
      tdPeta.textContent = jenisPeta;
      if (jenisLokasi !== "-") {
        var br1 = document.createElement("br");
        var smallLok = document.createElement("small");
        smallLok.style.color = "var(--teks-abu)";
        smallLok.textContent = jenisLokasi;
        tdPeta.appendChild(br1);
        tdPeta.appendChild(smallLok);
      }
      tr.appendChild(tdPeta);

      // Kolom 6: Detail Lokasi
      var tdDetail = document.createElement("td");
      tdDetail.style.fontSize = "0.85rem";
      tdDetail.textContent = detailLok;
      tr.appendChild(tdDetail);

      // Kolom 7: Status dropdown + badge
      var tdStatus = document.createElement("td");
      var select = document.createElement("select");
      select.className = "form-control select-status";
      select.style.minWidth = "160px";
      statusList.forEach(function (s) {
        var opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        if (s === status) opt.selected = true;
        select.appendChild(opt);
      });
      var divBadge = document.createElement("div");
      divBadge.style.marginTop = "4px";
      var badge = document.createElement("span");
      badge.className = "badge " + getStatusClass(status);
      badge.id = "badge-" + id;
      badge.textContent = status;
      divBadge.appendChild(badge);
      tdStatus.appendChild(select);
      tdStatus.appendChild(divBadge);
      tr.appendChild(tdStatus);

      // Kolom 8: Catatan Admin
      var tdCatatan = document.createElement("td");
      var textarea = document.createElement("textarea");
      textarea.className = "form-control";
      textarea.rows = 2;
      textarea.style.minWidth = "180px";
      textarea.style.fontSize = "0.85rem";
      textarea.placeholder = "Catatan untuk pemesan...";
      textarea.value = catatan;
      tdCatatan.appendChild(textarea);
      tr.appendChild(tdCatatan);

      // Kolom 9: Tombol Simpan
      var tdBtn = document.createElement("td");
      var btn = document.createElement("button");
      btn.className = "btn-simpan-status";
      btn.textContent = "Simpan";
      btn.setAttribute("data-order-id", id);
      btn.addEventListener("click", function () { simpanStatus(this, id); });
      tdBtn.appendChild(btn);
      tr.appendChild(tdBtn);

      tbody.appendChild(tr);

    } catch (e) {
      console.error("Error render baris:", e, o);
    }
  });
}

function simpanStatus(btn, orderId) {
  var tr = btn.closest("tr");
  var statusBaru = tr.querySelector(".select-status").value;
  var catatan = tr.querySelector("textarea").value;

  btn.disabled = true;
  btn.textContent = "...";

  apiGet({ action: "updateStatus", id: orderId, status: statusBaru, catatan: catatan }, function (err, data) {
    btn.disabled = false;
    btn.textContent = "Simpan";

    if (err || !data || !data.success) {
      btn.textContent = "Gagal!";
      btn.style.background = "var(--merah)";
      setTimeout(function () { btn.textContent = "Simpan"; btn.style.background = ""; }, 2500);
      return;
    }

    // Update badge status di baris
    var badge = document.getElementById("badge-" + orderId);
    if (badge) {
      badge.textContent = statusBaru;
      badge.className = "badge " + getStatusClass(statusBaru);
    }
    tr.setAttribute("data-status", statusBaru);

    btn.textContent = "✓ Tersimpan";
    btn.style.background = "var(--hijau)";
    setTimeout(function () { btn.textContent = "Simpan"; btn.style.background = ""; }, 2500);

    // Update data lokal
    _adminData.forEach(function (o) { if (o.id === orderId) { o.status = statusBaru; o.catatanAdmin = catatan; } });
  });
}

function filterStatus(status, btn) {
  _filterAktif = status;
  document.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("active"); });
  btn.classList.add("active");
  terapkanFilter();
}

function cariPesanan(kata) {
  terapkanFilter(kata);
}

function terapkanFilter(kata) {
  var cari = (kata || document.getElementById("admin-search").value || "").toLowerCase();
  var rows = document.querySelectorAll("#admin-tbody tr");
  var tampil = 0;
  rows.forEach(function (tr) {
    var statusOk = !_filterAktif || tr.getAttribute("data-status") === _filterAktif;
    var cariOk   = !cari ||
      tr.getAttribute("data-id").toLowerCase().includes(cari) ||
      tr.getAttribute("data-nama").includes(cari) ||
      tr.getAttribute("data-nim").includes(cari);
    var show = statusOk && cariOk;
    tr.style.display = show ? "" : "none";
    if (show) tampil++;
  });
  document.getElementById("admin-kosong").style.display = tampil === 0 ? "block" : "none";
}
