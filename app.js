// ============================================================================
// Reign 9 v2 (FONT REIGN 9 DISPLAY + 3-LEVEL ROSTER DRILLDOWN + IXAR AVATAR)
// ============================================================================
// Fitur Utama:
// 1. Font utama menggunakan Reign9Display-Regular (TTF/OTF) di seluruh judul & kanvas.
// 2. Menu Roster 3 Tingkat (Drill-down):
//    - Tingkat 1: Pilih "Active Squads" atau "Non-Active Squads" (History perjuangan R9)
//    - Tingkat 2: Saat diklik, baru muncul daftar Nama Tim (termasuk "Competitive Division")
//    - Tingkat 3: Saat Nama Tim diklik, baru muncul daftar Pemain, Coach, Analyst, & Manager
// 3. Jika foto pemain tidak tersedia (kosong atau gagal muat), otomatis menampilkan
//    karakter interaktif IXAR sesuai role sebagai stock/dummy picture!
// 4. Bendera negara lengkap (ID, MY, CN, SG, PH, KR, TH, VN, TW, HK).
// ============================================================================

const ADMIN = 'https://admin.reign9.site';
const gerakBoleh = !matchMedia('(prefers-reduced-motion: reduce)').matches;
const VERSI = (document.currentScript && new URL(document.currentScript.src, location.href).searchParams.get('v')) || '';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// keamanan data dari admin sebelum masuk HTML: ID cuma angka, tautan cuma http/https (dicek pakai pembaca URL)
const idAman = (v) => (/^\d{1,10}$/.test(String(v ?? '')) ? String(v) : '');
const tautanAman = (v) => { if (!v) return ''; try { const u = new URL(String(v), location.href); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
// cegah situs ini ditempel di iframe situs lain (lapisan tambahan; header frame-ancestors gak bisa dipasang di GitHub Pages)
const pratinjauAdmin = window.parent === window.top && document.referrer.split('/').slice(0,3).join('/') === ADMIN && new URLSearchParams(location.search).has('editor');
if (window.top !== window.self && !pratinjauAdmin) { try { window.top.location.replace(window.self.location.href); } catch (e) { document.documentElement.hidden = true; } }

// ---------- sistem keamanan R9: anti-copy, anti-bajak, & anti-scraper ----------
(() => {
  try {
    console.log(
      '%c🛡️ REIGN 9 INTERNATIONAL — SECURITY SHIELD ACTIVE',
      'background:#DA1617;color:#fff;font-weight:800;font-size:14px;padding:6px 12px;border-radius:2px;'
    );
    console.log(
      '%cSeluruh kode, desain, aset visual, font Reign9Display, dan maskot IXAR dilindungi hak cipta © 2026 Reign 9 International. Ekstraksi otomatis oleh AI/scraper luar atau penggandaan tanpa izin dilarang keras.',
      'color:#DA1617;font-size:12px;'
    );
  } catch (e) {}

  // Blokir klik kanan pada gambar, SVG, kanvas, dan elemen non-input agar aset tidak mudah dicuri
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('input, textarea, [data-pfp-hasil]')) return; // foto profil hasil boleh disimpan (tekan lama di HP)
    e.preventDefault();
  });

  // Blokir drag aset gambar & SVG
  document.addEventListener('dragstart', (e) => {
    if (e.target.closest('img, svg, canvas, a') && !e.target.closest('[data-pfp-hasil]')) e.preventDefault();
  });

  // Blokir pintasan keyboard pembajak (Ctrl+U View Source, Ctrl+S Save Page, F12 / Ctrl+Shift+I/J/C Inspect)
  document.addEventListener('keydown', (e) => {
    const k = (e.key || '').toLowerCase();
    if (
      e.key === 'F12' ||
      ((e.ctrlKey || e.metaKey) && ['u', 's', 'p'].includes(k)) ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c', 'k'].includes(k))
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // Proteksi penyalinan massal teks di luar input
  document.addEventListener('copy', (e) => {
    if (e.target.closest('input, textarea')) return;
    const sel = String(window.getSelection ? window.getSelection() : '').trim();
    if (sel && sel !== '980982') {
      e.preventDefault();
      e.clipboardData?.setData('text/plain', '© 2026 Reign 9 International (https://www.reign9.site) — Together We Reign.');
    }
  });
})();

// ---------- bahasa ----------
const R9 = window.R9 = {
  bahasa: 'id',
  t(k) { const e = window.R9_KAMUS[k]; return e ? (e[R9.bahasa] ?? e.id) : k; },
  teks(v) { return v && typeof v === 'object' ? (v[R9.bahasa] || v.id || v.en || '') : (v ?? ''); },
  lokal() { return { id: 'id-ID', en: 'en-GB', zh: 'zh-CN' }[R9.bahasa]; },
  tanggal(s, opsi = { day: 'numeric', month: 'long', year: 'numeric' }) { return s ? new Intl.DateTimeFormat(R9.lokal(), opsi).format(new Date(`${s.slice(0, 10)}T00:00:00`)) : ''; },
  rupiah(n) { return n ? new Intl.NumberFormat(R9.lokal(), { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n) : ''; },
};
// teks dari admin (tab Situs) cuma teks biasa: di-escape dulu, lalu [kata] jadi aksen merah & baris baru jadi <br>
const htmlAdmin = (v) => esc(v).replace(/\[([^\]\n]{1,80})\]/g, '<span class="aksen-merah">$1</span>').replace(/\n/g, '<br>');
const KAMUS_ASLI = JSON.parse(JSON.stringify(window.R9_KAMUS));
let situsTerpasang = '';
// pasang isi tab Situs dari admin: teks (3 bahasa) & info (guild, sosmed, toko)
function terapkanSitus(situs) {
  const jejak = JSON.stringify(situs || {}); if (jejak === situsTerpasang) return; situsTerpasang = jejak;
  window.R9Tampilan?.apply(situs?.desain);
  const teks = situs?.teks || {}, info = situs?.info || {};
  for (const k of Object.keys(window.R9_KAMUS)) if (window.R9_KAMUS[k].dariAdmin && !teks[k]) window.R9_KAMUS[k] = { ...KAMUS_ASLI[k] };
  for (const [k, v] of Object.entries(teks)) {
    const asli = KAMUS_ASLI[k] || {};
    // terjemahan kosong → pakai teks baru dari admin (biar perubahan selalu keliatan), bukan teks lama
    window.R9_KAMUS[k] = { id: v.id || asli.id || '', en: v.en || v.id || asli.en || '', zh: v.zh || v.id || asli.zh || '', dariAdmin: true };
  }
  if (info.guildId) {
    $$('.guild__id').forEach((el) => { el.textContent = info.guildId; });
    $$('[data-salin]').forEach((el) => { el.dataset.salin = info.guildId; });
    $$('.hero__sudut span').forEach((el) => { if (/^GUILD /.test(el.textContent)) el.textContent = `GUILD ${info.guildId}`; });
  }
  const isiDd = (kunci, nilai) => { if (!nilai) return; $$(`dt[data-i18n="${kunci}"]`).forEach((dt) => { const dd = dt.nextElementSibling; if (dd) dd.textContent = nilai; }); };
  isiDd('guild.nama', info.guildNama); isiDd('guild.tag', info.guildTag);
  for (const [k, pola] of [['instagram', 'instagram.com'], ['tiktok', 'tiktok.com'], ['discord', 'discord.']]) {
    const url = tautanAman(info[k]); if (url) $$(`a[href*="${pola}"]`).forEach((a) => { a.href = url; });
  }
  const toko = tautanAman(info.toko);
  $$('.shop__segera, .shop__toko').forEach((el) => {
    if (toko && el.tagName !== 'A') { const a = document.createElement('a'); a.className = 'tombol tombol--utama shop__toko'; a.href = toko; a.target = '_blank'; a.rel = 'noopener'; a.dataset.i18n = 'shop.kunjungi'; a.textContent = R9.t('shop.kunjungi'); el.replaceWith(a); }
    else if (toko) el.href = toko;
    else if (el.tagName === 'A') { const p = document.createElement('p'); p.className = 'shop__segera'; p.dataset.i18n = 'shop.segera'; p.textContent = R9.t('shop.segera'); el.replaceWith(p); }
  });
  window.R9_CUITAN_IXAR?.forEach((v,i) => Object.assign(v, window.R9_KAMUS['cuitan.'+(i+1)]));
  pasangBahasa(R9.bahasa);
}
function pasangBahasa(b, simpan) {
  R9.bahasa = ['id', 'en', 'zh'].includes(b) ? b : 'id';
  document.documentElement.lang = R9.bahasa === 'zh' ? 'zh-CN' : R9.bahasa;
  $$('[data-i18n]').forEach((el) => { el.textContent = R9.t(el.dataset.i18n); });
  $$('[data-i18n-html]').forEach((el) => { const k = el.dataset.i18nHtml; if (window.R9_KAMUS[k]?.dariAdmin) el.innerHTML = htmlAdmin(R9.t(k)); else el.innerHTML = R9.t(k); });
  $$('[data-i18n-attr]').forEach((el) => el.dataset.i18nAttr.split(';').forEach((p) => { const [a, k] = p.split(':'); el.setAttribute(a, R9.t(k)); }));
  $$('[data-bahasa]').forEach((t) => t.setAttribute('aria-pressed', t.dataset.bahasa === R9.bahasa));
  if (simpan) try { localStorage.setItem('bahasa', R9.bahasa); } catch (e) {}
  document.dispatchEvent(new Event('r9:bahasa'));
}
let bahasaAwal = 'id';
try { bahasaAwal = localStorage.getItem('bahasa') || ((navigator.language || '').startsWith('zh') ? 'zh' : (navigator.language || '').startsWith('id') ? 'id' : 'en'); } catch (e) {}
pasangBahasa(bahasaAwal);
$$('[data-bahasa]').forEach((t) => t.addEventListener('click', () => pasangBahasa(t.dataset.bahasa, true)));

// ---------- tema ----------
const temaSekarang = () => document.documentElement.dataset.tema || (matchMedia('(prefers-color-scheme: light)').matches ? 'terang' : 'gelap');
const pasangTema = (t) => { document.documentElement.dataset.tema = t; try { localStorage.setItem('tema', t); } catch (e) {} document.dispatchEvent(new Event('r9:tema')); };
// ganti tema halus: semua warna meluncur barengan dari tema lama ke tema baru (transisi CSS sementara di <html>).
// Gak pakai tutupan layar (bikin layar diam dulu) & gak pakai View Transitions (kedip di sebagian HP).
let timerTema = 0;
$('.tema').addEventListener('click', () => {
  const baru = temaSekarang() === 'terang' ? 'gelap' : 'terang', html = document.documentElement;
  if (!gerakBoleh) return pasangTema(baru);
  clearTimeout(timerTema);
  html.classList.add('ganti-tema');
  void html.offsetWidth; // transisi harus kepasang dulu sebelum warna berubah
  pasangTema(baru);
  timerTema = setTimeout(() => html.classList.remove('ganti-tema'), 600);
});

// ---------- menu HP ----------
const tombolMenu = $('.atas__buka'), menu = $('#menu');
tombolMenu.addEventListener('click', () => { const buka = tombolMenu.getAttribute('aria-expanded') !== 'true'; tombolMenu.setAttribute('aria-expanded', buka); menu.classList.toggle('buka', buka); });
menu.addEventListener('click', (e) => { if (e.target.closest('a')) { tombolMenu.setAttribute('aria-expanded', 'false'); menu.classList.remove('buka'); } });

// ---------- sosmed di kaki ----------
if ($('[data-sosmed-salin]') && $('.hero .sosmed')) {
  $('[data-sosmed-salin]').innerHTML = $('.hero .sosmed').innerHTML;
}

// ---------- salin guild ID ----------
$$('[data-salin]').forEach((b) => b.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(b.dataset.salin); } catch (e) {}
  b.textContent = R9.t('guild.tersalin'); setTimeout(() => { b.textContent = R9.t('guild.salin'); }, 1600);
}));

// ---------- layar pembuka: bara → WELCOME TO OUR REIGN (Font Reign9Display) → ditonjok IXAR → logo + kastil ----------
(async () => {
  const kanvas = $('.hero__bara'), wadah = $('.hero__logo'), hero = $('.hero');
  if (!kanvas || !gerakBoleh) { document.documentElement.classList.add('bara-gagal'); return; }
  const c = kanvas.getContext('2d');
  const kanvasLatar = Object.assign(document.createElement('canvas'), { className: 'hero__latar' });
  kanvasLatar.setAttribute('aria-hidden', 'true'); kanvas.before(kanvasLatar);
  const cl = kanvasLatar.getContext('2d');
  const sprite = $('#r9-sprite-logo')?.outerHTML || await fetch(`gambar/logo.svg`).then((r) => r.text()).catch(() => '');
  const m = sprite.match(/id="tegak" viewBox="([^"]+)">(.*?)<\/symbol>/);
  if (!m) { document.documentElement.classList.add('bara-gagal'); return; }
  // tiap path bawa aturan isinya sendiri (bentuk tanpa lubang: nonzero; evenodd bikin bolong garis yang motong dirinya)
  const vb = m[1].split(' ').map(Number), bentuk = [...m[2].matchAll(/<path([^>]*)>/g)].map((x) => [new Path2D(x[1].match(/ d="([^"]+)"/)[1]), (x[1].match(/fill-rule="(\w+)"/) || [])[1] === 'evenodd' ? 'evenodd' : 'nonzero']);
  await document.fonts.load('700 100px Reign9Display').catch(() => {});
  let w, h, butir = [], lepas = [], titik = {}, px = -999, py = -999, jalan = true, fase = 'teks', mulaiFase = performance.now(), terang = false;
  const kanvasBantu = (lw, lh) => { const o = Object.assign(document.createElement('canvas'), { width: Math.max(1, lw), height: Math.max(1, lh) }); return [o, o.getContext('2d', { willReadFrequently: true })]; };
  // susut > 0: titik cuma dipasang kalau satu butir utuh (±susut px) muat di dalam bentuk, biar celah tipis logo gak ketutup
  const cuplik = (oc, lw, lh, jarak, gx = 0, gy = 0, susutAwal = 0) => {
    const susutDi = typeof susutAwal === 'function' ? susutAwal : () => susutAwal;
    const d = oc.getImageData(0, 0, Math.max(1, lw), Math.max(1, lh)).data, hasil = [];
    const isi = (x, y) => { x = Math.round(x); y = Math.round(y); return x >= 0 && y >= 0 && x < lw && y < lh && d[(y * lw + x) * 4 + 3] > 128; };
    for (let y = 0; y < lh; y += jarak) for (let x = 0; x < lw; x += jarak) {
      const susut = susutDi(y);
      if (isi(x, y) && (!susut || (isi(x - susut, y) && isi(x + susut, y) && isi(x, y - susut) && isi(x, y + susut)))) hasil.push([gx + x, gy + y]);
    }
    return hasil;
  };
  const hitungTitik = () => {
    const r = wadah.getBoundingClientRect(), k = kanvas.getBoundingClientRect();
    const lw = Math.round(r.width), lh = Math.round(r.height), gx = r.left - k.left, gy = r.top - k.top;
    let [o, oc] = kanvasBantu(lw, lh);
    const s = Math.min(lw / vb[2], lh / vb[3]);
    oc.translate((lw - vb[2] * s) / 2, 0); oc.scale(s, s); oc.translate(-vb[0], -vb[1]); bentuk.forEach(([b, aturan]) => oc.fill(b, aturan));
    // simbol & tulisan dicuplik sama persis (jarak & susut sama) biar komposisi apinya seragam
    // jarak sama di semua bagian; kikisan cuma buat simbol & REIGN 9 (huruf INTERNATIONAL terlalu tipis buat dikikis)
    const garisInternational = (394 - vb[1]) * s;
    const jarak = lw < 320 ? 2.2 : 2.6, garis = Math.floor(garisInternational);
    const [, ocBawah] = kanvasBantu(lw, lh - garis); ocBawah.drawImage(o, 0, -garis);
    titik.logo = [...cuplik(oc, lw, garis, jarak, gx, gy, 1), ...cuplik(ocBawah, lw, lh - garis, jarak * .75, gx, gy + garis)];
    titik.kotakLogo = [gx, gy, gx + lw, gy + lh];
    const tw = Math.min(w * .9, 980), uk = Math.min(tw / 6.5, 142), th = Math.round(uk * 2.7);
    [o, oc] = kanvasBantu(Math.round(tw), th);
    oc.font = `700 ${uk}px Reign9Display, Reign9Display, Oxanium, sans-serif`; oc.textAlign = 'center'; oc.textBaseline = 'middle';
    oc.fillText(R9.t('hero.baraAtas'), tw / 2, uk * .7, tw); oc.fillText(R9.t('hero.baraBawah'), tw / 2, uk * 1.9, tw);
    const tx = (w - tw) / 2, ty = gy + lh * .42 - uk * 1.15;
    titik.teks = cuplik(oc, Math.round(tw), th, w < 600 ? 2.5 : 3.2, tx, ty);
    titik.kotakTeks = [tx + tw * .06, ty, tx + tw * .94, ty + th];
  };
  // warna api logo ikut aturan logo: putih di tema gelap, merah di tema terang. Api latar selalu hitam pekat (beda dari logo).
  const WARNA_GELAP = [['#ffffff', 46], ['#ffe9e6', 24], ['#ffd0cb', 16], ['#ff8a80', 9], ['#ff5245', 5]];
  const WARNA_TERANG = [['#da1617', 44], ['#c00f12', 24], ['#ff2a1f', 16], ['#a80309', 16]];
  const WARNA_LATAR = [['#000000', 62], ['#070000', 24], ['#160205', 14]];
  const undi = (daftar) => { let n = Math.random() * 100; for (const [wr, b] of daftar) { if ((n -= b) < 0) return wr; } return daftar[0][0]; };
  const pilihWarna = () => undi(terang ? WARNA_TERANG : WARNA_GELAP);

  // ---------- api latar: siluet hitam pekat sepenuh layar, gonta-ganti bentuk, bisa dimainin IXAR ----------
  const BENTUK_LATAR = ['kastil', 'api', 'mahkota', 'menara', 'gunung'];
  let latar = [], titikLatar = {}, iLatar = 0, gantiLatarPada = 0;
  function gambarLatar(oc, nama) {
    const dasar = h + 2, x0 = 0;
    oc.beginPath();
    if (nama === 'kastil') {
      const u = w / 100, t = (k) => dasar - Math.min(h * k, w * k * 1.1);
      const gerigi = (x, y, l, g) => { for (let i = 0; i < l; i += g * 2) oc.rect(x + i, y - g, g, g); };
      oc.rect(x0, t(.3), w, h); gerigi(x0, t(.3), w, 3 * u);
      [[1, 12, .5], [18, 12, .64], [41, 18, .8], [70, 12, .64], [87, 12, .5]].forEach(([p0, l, k]) => { oc.rect(p0 * u, t(k), l * u, h); gerigi(p0 * u, t(k), l * u, 2.2 * u); });
      oc.fill(); oc.globalCompositeOperation = 'destination-out'; oc.beginPath();
      oc.arc(50 * u, t(.14), 6 * u, Math.PI, 0); oc.rect(44 * u, t(.14), 12 * u, h);
      [[7, .42], [24, .56], [50, .7], [76, .56], [93, .42]].forEach(([p, k]) => oc.rect((p - 1.2) * u, t(k), 2.4 * u, 6 * u));
      oc.fill(); oc.globalCompositeOperation = 'source-over'; return;
    }
    if (nama === 'api') {
      oc.moveTo(0, dasar); const n = Math.max(7, Math.round(w / 110));
      for (let i = 0; i <= n; i++) {
        const x = (i / n) * w, puncak = dasar - h * (.42 + .32 * Math.abs(Math.sin(i * 2.17)) + (i % 2 ? 0 : .08)), lebar = w / n;
        oc.quadraticCurveTo(x - lebar * .55, dasar - h * .2, x - lebar * .1, puncak + h * .12); oc.quadraticCurveTo(x, puncak - h * .02, x + lebar * .05, puncak);
        oc.quadraticCurveTo(x + lebar * .2, puncak + h * .2, x + lebar * .45, dasar - h * .24);
      }
      oc.lineTo(w, dasar); oc.closePath(); oc.fill(); return;
    }
    if (nama === 'mahkota') {
      const lebar = Math.min(w * .96, h * 1.5), kiri = (w - lebar) / 2, bawah = dasar, pita = h * .14, tinggi = h * .62, ujung = 5;
      oc.rect(0, bawah - h * .12, w, h * .12 + 4);
      oc.moveTo(kiri, bawah - pita);
      for (let i = 0; i <= ujung * 2; i++) { const x = kiri + (i / (ujung * 2)) * lebar, y = i % 2 ? bawah - pita - tinggi * .45 : bawah - pita - tinggi * (i === ujung ? 1 : .8); oc.lineTo(x, y); }
      oc.lineTo(kiri + lebar, bawah); oc.lineTo(kiri, bawah); oc.closePath();
      for (let i = 0; i <= ujung * 2; i += 2) { const x = kiri + (i / (ujung * 2)) * lebar, y = bawah - pita - tinggi * (i === ujung ? 1 : .8); oc.moveTo(x + lebar * .028, y - lebar * .02); oc.arc(x, y - lebar * .02, lebar * .028, 0, Math.PI * 2); }
      oc.fill(); return;
    }
    if (nama === 'menara') { // barisan menara catur = pasukan kepala IXAR
      const n = w < 600 ? 4 : 6, lebar = w / n;
      for (let i = 0; i < n; i++) {
        const tinggi = h * (.45 + .25 * Math.abs(Math.sin(i * 1.9 + 1))), x = i * lebar + lebar * .12, l = lebar * .76, atas = dasar - tinggi, g = l / 7;
        oc.rect(x + l * .12, atas + g * 1.6, l * .76, tinggi); oc.rect(x, atas + g * .6, l, g * 1.2);
        for (let k = 0; k < 4; k++) oc.rect(x + k * g * 2, atas - g * .4, g, g * 1.2);
        oc.rect(x - l * .05, dasar - g * 1.6, l * 1.1, g * 1.6);
      }
      oc.rect(0, dasar - h * .06, w, h * .06 + 4); oc.fill(); return;
    }
    // gunung
    oc.moveTo(0, dasar);
    const pk = [[0, .5], [.12, .68], [.24, .5], [.38, .82], [.52, .55], [.66, .74], [.8, .5], [.9, .64], [1, .48]];
    pk.forEach(([px2, k]) => oc.lineTo(px2 * w, dasar - h * k));
    oc.lineTo(w, dasar); oc.closePath(); oc.fill();
    oc.globalCompositeOperation = 'destination-out'; oc.beginPath(); // jalur salju dibikin bolong biar ada tekstur
    pk.forEach(([px2, k], i) => { if (i && i < pk.length - 1) { oc.moveTo(px2 * w - w * .025, dasar - h * (k - .07)); oc.lineTo(px2 * w, dasar - h * k + h * .04); oc.lineTo(px2 * w + w * .025, dasar - h * (k - .07)); oc.closePath(); } });
    oc.fill(); oc.globalCompositeOperation = 'source-over';
  }
  function hitungLatar() {
    const batasN = w < 600 ? 3600 : 5200, jarak = Math.max(6, Math.sqrt(w * h * .62 / batasN));
    titikLatar = {};
    for (const nama of BENTUK_LATAR) {
      const [, oc] = kanvasBantu(Math.round(w), Math.round(h)); oc.fillStyle = '#000'; gambarLatar(oc, nama);
      let t = cuplik(oc, Math.round(w), Math.round(h), jarak);
      if (t.length > batasN) { const l = t.length / batasN; t = Array.from({ length: batasN }, (_, i) => t[Math.floor(i * l)]); }
      for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; }
      titikLatar[nama] = t;
    }
    const n = Math.max(...Object.values(titikLatar).map((t) => t.length));
    const besar = [jarak * .52, jarak * .14]; // setengah jarak = butir saling nempel → siluet pekat
    latar = Array.from({ length: n }, (_, i) => latar[i] || { x: Math.random() * w, y: h + Math.random() * h * .3, vx: 0, vy: 0, r: besar[0] + Math.random() * besar[1], kedip: Math.random() * 6.28, warna: undi(WARNA_LATAR) });
    latar.length = n;
    latar.sort((a, b) => (a.warna < b.warna ? -1 : a.warna > b.warna ? 1 : 0));
    arahkanLatar(0);
  }
  // pindah ke bentuk berikutnya; asal (titik kanvas) = dari mana gelombang perubahan nyebar
  function arahkanLatar(asal) {
    const t = titikLatar[BENTUK_LATAR[iLatar]] || [], cx = asal ? asal[0] : w / 2;
    latar.forEach((b, i) => { const q = t[i % Math.max(1, t.length)]; [b.tx, b.ty] = q || [Math.random() * w, h + 20]; b.lebih = i >= t.length; b.tunda = asal ? Math.abs(b.x - cx) * 1.1 : Math.random() * 600; });
    mulaiLatar = performance.now(); gantiLatarPada = mulaiLatar + 9000;
  }
  let mulaiLatar = 0;
  const gantiLatar = (asal) => { iLatar = (iLatar + 1) % BENTUK_LATAR.length; arahkanLatar(asal); };
  const baraLepas = (acak) => ({ x: Math.random() * w, y: acak ? Math.random() * h : h + 10, r: Math.random() * 1.8 + .5, v: Math.random() * .6 + .25, goyang: Math.random() * 6.28, umur: Math.random() * .5 + .4 });
  function aturTujuan(f) {
    fase = f; mulaiFase = performance.now();
    const L = titik.logo.length;
    butir.forEach((b, i) => {
      if (f === 'teks') { const t = titik.teks[i]; b.tx = t ? t[0] : null; b.ty = t ? t[1] : null; b.tunda = Math.random() * 700; }
      else if (f === 'logo') { [b.tx, b.ty] = titik.logo[i % L]; b.tunda = Math.random() * 250; }
      else { b.tx = null; b.ty = null; }
    });
  }
  const ukur = () => {
    const rasio = Math.min(devicePixelRatio || 1, 2);
    w = kanvas.clientWidth; h = kanvas.clientHeight;
    kanvas.width = w * rasio; kanvas.height = h * rasio; c.setTransform(rasio, 0, 0, rasio, 0, 0);
    kanvasLatar.width = w; kanvasLatar.height = h;
    hitungTitik();
    const n = titik.logo.length;
    if (titik.teks.length > n) { const lompat = titik.teks.length / n; titik.teks = Array.from({ length: n }, (_, i) => titik.teks[Math.floor(i * lompat)]); }
    for (let i = titik.teks.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [titik.teks[i], titik.teks[j]] = [titik.teks[j], titik.teks[i]]; }
    butir = Array.from({ length: n }, (_, i) => butir[i] || { x: Math.random() * w, y: h + Math.random() * h * .5, vx: 0, vy: 0, r: Math.random() * .3 + 1, kedip: Math.random() * 6.28, warna: pilihWarna() });
    butir.length = n;
    hitungLatar();
    lepas = Array.from({ length: Math.round(w / 18) }, () => baraLepas(true));
    aturTujuan(fase);
  };
  const keKanvas = (x, y) => { const k = kanvas.getBoundingClientRect(); return [x - (k.left + scrollX), y - (k.top + scrollY)]; };
  const keHalaman = ([x0, y0, x1, y1]) => { const k = kanvas.getBoundingClientRect(); return { kiri: x0 + k.left + scrollX, atas: y0 + k.top + scrollY, kanan: x1 + k.left + scrollX, bawah: y1 + k.top + scrollY }; };
  const dorong = (x, y, kuat, jangkau, kumpulan = butir) => kumpulan.forEach((b) => {
    const dx = b.x - x, dy = b.y - y, d = Math.hypot(dx, dy) || 1;
    if (d > jangkau) return;
    const f = kuat * (1 - d / jangkau); b.vx += dx / d * f + (Math.random() - .5) * kuat * .3; b.vy += dy / d * f - Math.random() * kuat * .2;
  });
  const goyang = () => { hero.classList.remove('goyang'); void hero.offsetWidth; hero.classList.add('goyang'); };
  window.R9Hero = {
    get fase() { return fase; }, get umurFase() { return performance.now() - mulaiFase; },
    kotakLogo: () => keHalaman(titik.kotakLogo), kotakTeks: () => keHalaman(titik.kotakTeks),
    pukul(xh, yh, kuat = 18) { const [x, y] = keKanvas(xh, yh); dorong(x, y, kuat, Math.max(220, w * .25)); dorong(x, y, kuat * .6, Math.max(160, w * .18), latar); goyang(); },
    tonjokSambut(xh, yh) { const [x, y] = keKanvas(xh, yh); dorong(x, y, 26, w * .9); dorong(x, y, 14, w * .5, latar); goyang(); setTimeout(() => aturTujuan('logo'), 260); },
    hancur(xh, yh) { const [x, y] = keKanvas(xh, yh); dorong(x, y, 34, w); dorong(x, y, 22, w, latar); goyang(); aturTujuan('bubar'); setTimeout(() => aturTujuan('teks'), 2200); },
    // IXAR (atau pengunjung) nonjok latar: api latar pecah dari titik itu lalu nyusun bentuk berikutnya
    gantiLatar(xh, yh) { const [x, y] = keKanvas(xh, yh); dorong(x, y, 20, w * .6, latar); goyang(); gantiLatar([x, y]); return BENTUK_LATAR[iLatar]; },
    get bentukLatar() { return BENTUK_LATAR[iLatar]; },
  };
  const ixarHero = [$('.hero__ixar'), $('.jelajah__ixar')].filter(Boolean);
  const gambar = (t) => {
    if (!jalan) return;
    c.clearRect(0, 0, w, h);
    if (t > gantiLatarPada) gantiLatar(null);
    // posisi IXAR di kanvas: api latar minggir pas IXAR lewat
    const k = kanvas.getBoundingClientRect(), dorongan = [];
    for (const el of ixarHero) { const r = el.getBoundingClientRect(); if (r.width && r.bottom > k.top && r.top < k.bottom) dorongan.push([r.left - k.left + r.width / 2, r.top - k.top + r.height * .6, (r.width * .5) ** 2]); }
    const umurLatar = t - mulaiLatar;
    for (const b of latar) {
      if (umurLatar > b.tunda) { const dx = b.tx - b.x, dy = b.ty - b.y; b.vx += dx * .01; b.vy += dy * .01; }
      b.kedip += .05; b.vx += Math.sin(b.kedip * 1.7) * .03; b.vy -= .012; // api: goyang & naik dikit
      for (const [ix, iy, rr] of dorongan) { const ex = b.x - ix, ey = b.y - iy, d2 = ex * ex + ey * ey; if (d2 < rr) { const d = Math.sqrt(d2) || 1, f = (1 - d2 / rr) * 3; b.vx += ex / d * f; b.vy += ey / d * f; } }
      const ex = b.x - px, ey = b.y - py, d2 = ex * ex + ey * ey;
      if (d2 < 9000) { const f = (9000 - d2) / 9000 * 2.2, d = Math.sqrt(d2) || 1; b.vx += ex / d * f; b.vy += ey / d * f; }
      b.vx *= .87; b.vy *= .87; b.x += b.vx; b.y += b.vy;
    }
    // kanvas latar resolusi 1x (butirnya kotak besar), butir udah urut warna: ringan walau ribuan
    cl.clearRect(0, 0, w, h); let warnaAktif = '';
    for (const b of latar) {
      if (b.warna !== warnaAktif) { warnaAktif = b.warna; cl.fillStyle = warnaAktif; }
      cl.globalAlpha = b.lebih ? .55 : .94; cl.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }
    c.globalCompositeOperation = terang ? 'source-over' : 'lighter';
    for (const b of lepas) {
      b.y -= b.v; b.goyang += .02; b.x += Math.sin(b.goyang) * .35;
      c.globalAlpha = Math.max(0, Math.min(1, b.y / h)) * b.umur * (terang ? .5 : 1);
      c.fillStyle = terang ? '#000' : '#ff2a1a'; c.beginPath(); c.arc(b.x, b.y, b.r, 0, 6.29); c.fill();
      if (b.y < -10) Object.assign(b, baraLepas(false));
    }
    c.globalCompositeOperation = 'source-over';
    const umur = t - mulaiFase;
    for (const b of butir) {
      if (b.tx != null && umur > b.tunda) { const dx = b.tx - b.x, dy = b.ty - b.y; b.vx += dx * .012 - dy * .002; b.vy += dy * .012 + dx * .002; }
      else { b.vx += (Math.random() - .5) * .12; b.vy += -.02 + (Math.random() - .5) * .1; if (b.y < -20) { b.y = h + 10; b.x = Math.random() * w; } }
      const ex = b.x - px, ey = b.y - py, d2 = ex * ex + ey * ey;
      if (d2 < 6400) { const f = (6400 - d2) / 6400 * 2.4, d = Math.sqrt(d2) || 1; b.vx += ex / d * f; b.vy += ey / d * f; }
      b.vx *= .86; b.vy *= .86; b.x += b.vx; b.y += b.vy; b.kedip += .08;
      c.globalAlpha = (.88 + Math.sin(b.kedip) * .12) * (b.tx == null ? .55 : 1);
      c.fillStyle = b.warna; c.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }
    c.globalAlpha = 1;
    requestAnimationFrame(gambar);
  };
  hero.addEventListener('pointermove', (e) => { const k = kanvas.getBoundingClientRect(); px = e.clientX - k.left; py = e.clientY - k.top; });
  hero.addEventListener('pointerleave', () => { px = py = -999; });
  hero.addEventListener('click', (e) => { if (!e.target.closest('a, button, input, .hero__ixar, .jelajah__ixar')) window.R9Hero.gantiLatar(e.pageX, e.pageY); });
  hero.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') px = py = -999; });
  document.addEventListener('r9:tema', () => { terang = temaSekarang() === 'terang'; butir.forEach((b) => { b.warna = pilihWarna(); }); });
  document.addEventListener('r9:bahasa', () => { if (w && h) ukur(); });
  new IntersectionObserver(([e]) => { const tadi = jalan; jalan = e.isIntersecting; if (jalan && !tadi) requestAnimationFrame(gambar); }).observe(kanvas);
  let tunggu; addEventListener('resize', () => { clearTimeout(tunggu); tunggu = setTimeout(ukur, 200); });
  try {
    terang = temaSekarang() === 'terang';
    ukur();
    if (!titik.logo.length) throw new Error('titik logo kosong');
    document.documentElement.classList.add('bara-hidup');
    requestAnimationFrame(gambar);
    document.dispatchEvent(new Event('r9:hero-siap'));
  } catch (e) {
    document.documentElement.classList.remove('bara-hidup');
    document.documentElement.classList.add('bara-gagal');
    kanvas.remove();
    window.R9Hero = null;
  }
})();

// ============================================================================
// 1. OTAK IXAR HERO (KHUSUS DI DASHBOARD UTAMA: NINJU WELCOME TO OUR REIGN & LOGO R9)
// ============================================================================
(() => {
  const el = $('.hero__ixar'), hero = $('.hero'), panggungHero = $('.panggung-ixar-hero');
  if (!el || !hero) return;
  const x = () => el.ixar;
  let px = 0, py = 0, tinggi = 148, lebar = 120, sedangDiseret = false, sedangJatuh = false;
  let jedaSampai = 0, mati = false, hadapKiri = false, tokenAksi = 0;
  const tidur = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const ukur = () => { const r = el.getBoundingClientRect(); lebar = r.width || 120; tinggi = r.height || lebar * 1.22; };
  const lantaiHero = () => Math.max(40, hero.clientHeight - tinggi - 6);
  const batasHeroX = () => [8, Math.max(8, hero.clientWidth - lebar - 8)];
  const taruh = () => { el.style.transform = `translate3d(${Math.round(px)}px, ${Math.round(py)}px, 0)`; };
  const hadap = (kiri) => { hadapKiri = kiri; el.classList.toggle('hadap-kiri', kiri); };
  const pose = (p) => x()?.set(p);

  const animasi = (durasi, tiap, myToken = tokenAksi) => new Promise((ok) => {
    const t0 = performance.now(), d = Math.max(16, durasi);
    const langkah = (t) => {
      if (mati || sedangDiseret || myToken !== tokenAksi) return ok(false);
      const k = Math.min(1, (t - t0) / d);
      tiap(k); taruh();
      if (k < 1) requestAnimationFrame(langkah); else ok(true);
    };
    requestAnimationFrame(langkah);
  });

  async function jalanKe(tx, cepat = false) {
    if (sedangDiseret) return;
    const myToken = ++tokenAksi;
    const [a, b] = batasHeroX(); tx = Math.max(a, Math.min(b, tx));
    const jarak = Math.abs(tx - px); if (jarak < 4) return;
    hadap(tx < px); pose(cepat ? 'jalanCepat' : 'jalan');
    const x0 = px, y0 = py;
    await animasi(jarak / (cepat ? 420 : 175) * 1000, (k) => {
      px = x0 + (tx - x0) * k;
      py = y0 + (lantaiHero() - y0) * Math.min(1, k * 3);
    }, myToken);
    if (myToken === tokenAksi && !sedangDiseret) pose('diam');
  }

  async function lompatKe(tx, ty, puncak = 140, durasi = 640) {
    if (sedangDiseret) return;
    const myToken = ++tokenAksi;
    const [a, b] = batasHeroX(); tx = Math.max(a, Math.min(b, tx));
    hadap(tx < px); pose('mendarat');
    await tidur(85);
    if (myToken !== tokenAksi || sedangDiseret) return;
    const x0 = px, y0 = py;
    const selesai = await animasi(durasi, (k) => {
      px = x0 + (tx - x0) * k;
      py = y0 + (ty - y0) * k - Math.sin(Math.PI * k) * puncak;
      if (x()) x().miring = (tx - x0) * .032 * Math.cos(Math.PI * k);
      pose(k < .52 ? 'lompat' : 'jatuh');
    }, myToken);
    if (!selesai || myToken !== tokenAksi || sedangDiseret) return;
    if (x()) x().miring = 0;
    pose('mendarat'); await tidur(190);
    if (myToken === tokenAksi && !sedangDiseret) pose('diam');
  }

  async function turun() {
    await lompatKe(px + (hadapKiri ? -32 : 32), lantaiHero(), 65, 500);
  }

  async function tonjokSambutan() {
    const t = window.R9Hero?.kotakTeks(); if (!t) return;
    const rh = hero.getBoundingClientRect();
    const kiriRel = t.kiri - (rh.left + scrollX);
    const myToken = tokenAksi;
    await jalanKe(kiriRel - lebar * .85, true);
    if (myToken !== tokenAksi || sedangDiseret) return;
    hadap(false); x()?.lakukan('tonjok', 900); await tidur(180);
    window.R9Hero.tonjokSambut(t.kiri + 10, (t.atas + t.bawah) / 2);
    await tidur(900); x()?.lakukan('menang', 1300); await tidur(1300);
  }

  // duel 2 IXAR di bawah tulisan WELCOME: tukar serangan dengan percikan, lalu tonjokan terakhir ngancurin tulisan jadi logo
  const percik = (vx, vy, besar = 1) => {
    const p = document.createElement('span'); p.className = 'percik-duel'; p.setAttribute('aria-hidden', 'true');
    Object.assign(p.style, { left: `${vx}px`, top: `${vy}px`, '--besar': besar }); document.body.append(p);
    setTimeout(() => p.remove(), 650);
  };
  async function duel() {
    const J = window.R9Jelajah, H = window.R9Hero, t = H?.kotakTeks();
    if (!J || !t || !(await J.ambilAlih())) return tonjokSambutan();
    try {
      const hr = hero.getBoundingClientRect(), kiriHero = hr.left + scrollX, atasHero = hr.top + scrollY;
      const tengah = (t.kiri + t.kanan) / 2 - kiriHero, lantaiH = lantaiHero(), w = lebar;
      const lantaiLayar = () => hero.getBoundingClientRect().top + lantaiHero();
      // dua IXAR jalan saling mendekat
      const xA = Math.max(8, tengah - w * 1.25), xB = tengah + w * .25;
      J.set('jalanCepat'); J.hadap(true);
      await Promise.all([jalanKe(xA, true), J.keLayar(xB + hr.left, lantaiLayar(), 900)]);
      hadap(false); J.hadap(true); J.set('marah'); x()?.set('marah'); await tidur(500);
      // tiga ronde tukar serangan
      for (let r = 0; r < 3; r++) {
        const tengahBentur = () => [hr.left + (px + w + (J.posisi().x - hr.left)) / 2 + 0, lantaiLayar() + tinggi * .45];
        if (r % 2 === 0) { x()?.lakukan('serbu', 420); J.set('tameng'); px += w * .15; taruh(); }
        else { J.lakukan('serbu', 420); x()?.set('tameng'); await J.keLayar(J.posisi().x - w * .15, lantaiLayar(), 160); }
        await tidur(200);
        const [bx, by] = tengahBentur(); percik(bx, by, 1 + r * .3); H.pukul(bx + scrollX, by + scrollY - tinggi, 6 + r * 3);
        if (r % 2 === 0) { x()?.lakukan('tonjok', 380); await J.keLayar(J.posisi().x + w * .35, lantaiLayar(), 300, 40); J.lakukan('kaget', 500); }
        else { J.lakukan('tonjok', 380); await lompatKe(px - w * .35, lantaiH, 40, 300); x()?.lakukan('kaget', 500); }
        await tidur(420);
      }
      // final: dua-duanya lompat ke tulisan, IXAR pembuka ngasih tonjokan terakhir
      const yTeks = (t.atas + t.bawah) / 2 - atasHero - tinggi * .5;
      J.set('lompat'); x()?.set('serbu');
      await Promise.all([lompatKe(tengah - w * .9, yTeks, 60, 520), J.keLayar(tengah + w * .1 + hr.left, yTeks + hr.top, 520, 60)]);
      x()?.lakukan('tonjok', 700); J.lakukan('kaget', 700); await tidur(160);
      const pv = [hr.left + tengah, (t.atas + t.bawah) / 2 - scrollY];
      percik(pv[0], pv[1], 2.2); H.tonjokSambut(t.kiri + (t.kanan - t.kiri) / 2, (t.atas + t.bawah) / 2);
      await tidur(500);
      await Promise.all([turun(), J.keLayar(Math.min(innerWidth - w - 16, tengah + w * 2 + hr.left), lantaiLayar(), 600, 50)]);
      x()?.lakukan('menang', 1500); J.lakukan('kecewa', 1500); await tidur(1600);
    } finally { J.lepas(); }
  }
  async function hancurinLogo() {
    const L = window.R9Hero?.kotakLogo(); if (!L) return;
    const rh = hero.getBoundingClientRect(), ox = rh.left + scrollX, oy = rh.top + scrollY;
    const lKiri = L.kiri - ox, lKanan = L.kanan - ox, lAtas = L.atas - oy, lBawah = L.bawah - oy;
    const kiri = Math.random() < .5 || lKiri - lebar < 20, tx = kiri ? lKiri - lebar * .8 : lKanan - lebar * .2;
    await jalanKe(tx, true);
    if (sedangDiseret) return;
    await lompatKe(tx, (lAtas + lBawah) / 2 - tinggi * .45, 120, 600);
    if (sedangDiseret) return;
    hadap(!kiri);
    const tinjuX = kiri ? L.kiri + 6 : L.kanan - 6, tinjuY = (L.atas + L.bawah) / 2;
    for (let i = 0; i < 3; i++) {
      if (sedangDiseret) return;
      x()?.lakukan('tonjok', 380); await tidur(160);
      window.R9Hero.pukul(tinjuX, tinjuY + (i - 1) * 50, 14 + i * 4);
      await tidur(420);
    }
    x()?.lakukan('marah', 500); await tidur(500);
    x()?.lakukan('tonjok', 600); await tidur(170); window.R9Hero.hancur(tinjuX, tinjuY);
    await tidur(500); await turun(); x()?.lakukan('menang', 1400); await tidur(1600);
  }

  async function jalanJalanHero() {
    const [a, b] = batasHeroX();
    await jalanKe(a + Math.random() * (b - a), Math.random() < .35);
  }

  // IXAR main api latar: jalan ke satu titik, lompat, nonjok ke bawah → siluet latar pecah & ganti bentuk
  async function mainLatar() {
    const rh = hero.getBoundingClientRect(), [a, b] = batasHeroX();
    await jalanKe(a + Math.random() * (b - a), Math.random() < .4);
    if (sedangDiseret) return;
    await lompatKe(px, lantaiHero(), 150, 620);
    if (sedangDiseret) return;
    x()?.lakukan(Math.random() < .5 ? 'tonjok' : 'pedang', 900); await tidur(180);
    window.R9Hero?.gantiLatar(rh.left + scrollX + px + lebar / 2, rh.top + scrollY + py + tinggi * .8);
    await tidur(900);
  }
  async function gayaHero() {
    const daftar = ['pedang', 'tameng', 'tonjok', 'serbu', 'bendera', 'menang', 'lompat'];
    const p = daftar[Math.floor(Math.random() * daftar.length)];
    if (p === 'lompat') await lompatKe(px + (Math.random() - .5) * 80, lantaiHero(), 125, 580);
    else { x()?.lakukan(p, 2000); await tidur(2100); }
  }

  // Drag & Drop pada IXAR Hero
  let ptrHero = null, oxHero = 0, oyHero = 0;
  el.addEventListener('pointerdown', (e) => {
    if (e.button && e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    ptrHero = e.pointerId;
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
    sedangDiseret = true; tokenAksi++;
    jedaSampai = performance.now() + 3000;
    const rh = hero.getBoundingClientRect();
    oxHero = (e.clientX - rh.left) - px;
    oyHero = (e.clientY - rh.top) - py;
    el.classList.add('sedang-diseret');
    pose('seret');
  });
  el.addEventListener('pointermove', (e) => {
    if (!sedangDiseret || e.pointerId !== ptrHero) return;
    const rh = hero.getBoundingClientRect(), [xMin, xMax] = batasHeroX();
    px = Math.max(xMin, Math.min(xMax, (e.clientX - rh.left) - oxHero));
    py = Math.max(8, Math.min(lantaiHero(), (e.clientY - rh.top) - oyHero));
    taruh();
  });
  const lepasHero = (e) => {
    if (!sedangDiseret || (e && e.pointerId !== ptrHero)) return;
    try { el.releasePointerCapture(ptrHero); } catch (err) {}
    sedangDiseret = false; ptrHero = null;
    el.classList.remove('sedang-diseret');
    lompatKe(px, lantaiHero(), 35, 420);
  };
  el.addEventListener('pointerup', lepasHero);
  el.addEventListener('pointercancel', lepasHero);

  el.addEventListener('click', () => { if (!sedangDiseret && window.R9Hero) { const r = el.getBoundingClientRect(); setTimeout(() => window.R9Hero.gantiLatar(r.left + scrollX + r.width / 2, r.bottom + scrollY - 10), 220); } });
  async function otakHero() {
    while (!mati) {
      if (sedangDiseret || sedangJatuh || performance.now() < jedaSampai || !x() || document.hidden || scrollY > innerHeight) {
        await tidur(420);
        continue;
      }
      const H = window.R9Hero;
      try {
        if (H && H.fase === 'teks' && H.umurFase > 2400) {
          // dua IXAR lagi di atas → duel; kalau pengunjung lagi di bawah, IXAR pembuka nonjok sendiri
          if (window.R9Jelajah && scrollY < 80) await duel(); else await tonjokSambutan();
        } else if (H && H.fase === 'logo') {
          const n = Math.random();
          if (H.umurFase > 8500 && n < .4) await hancurinLogo();
          else if (n < .58) await mainLatar();
          else if (n < .72) await jalanJalanHero();
          else await gayaHero();
        } else {
          await jalanJalanHero();
        }
      } catch (e) {}
      await tidur(700 + Math.random() * 900);
    }
  }

  addEventListener('resize', () => {
    ukur();
    if (!sedangDiseret) {
      const [a, b] = batasHeroX();
      px = Math.max(a, Math.min(b, px));
      py = lantaiHero();
      taruh();
    }
  });
  const mulaiHero = () => {
    ukur();
    px = Math.max(16, (hero.clientWidth - Math.min(1160, hero.clientWidth - 32)) / 2);
    py = lantaiHero();
    taruh();
    if (gerakBoleh) otakHero();
  };
  if (window.R9Hero) mulaiHero(); else { document.addEventListener('r9:hero-siap', mulaiHero, { once: true }); setTimeout(() => { if (!px) mulaiHero(); }, 1800); }
})();

// ============================================================================
// 2. OTAK IXAR PENJELAJAH AKTIF: IKUT SCROLL, DRAG & DROP FISIKA JATUH,
//    REBAHAN SANTAI, POSE SESUAI BAGIAN MENU, & 200 CUITAN LUCU / FUN FACT!
// ============================================================================
(() => {
  const el = $('.jelajah__ixar'), panggung = $('.panggung-ixar'), hero = $('.hero');
  const elGelembung = $('[data-ixar-gelembung]'), elCuitanTeks = $('[data-ixar-cuitan-teks]'), elCuitanNomor = $('[data-ixar-cuitan-nomor]');
  const elCuitanPanggung = $('[data-ixar-cuitan-panggung]'), elCuitanCounter = $('[data-ixar-cuitan-counter]'), elModeBadge = $('[data-ixar-mode-badge]');
  if (!el) return;
  const x = () => el.ixar;
  let px = 0, py = 0, tinggi = 148, lebar = 120, sibuk = false, sedangDiseret = false, sedangJatuh = false;
  let jedaSampai = 0, mati = false, hadapKiri = true, tokenAksi = 0, sudahSapaKenal = false, seksiTerakhir = '';
  const tidur = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const ukur = () => { const r = el.getBoundingClientRect(); lebar = r.width || 120; tinggi = r.height || lebar * 1.22; };
  const batasLayarX = () => [8, Math.max(8, document.documentElement.clientWidth - lebar - 8)];

  // ---------- Sistem 200 Cuitan Acak Tanpa Pengulangan Beruntun (Fisher-Yates Deck) ----------
  const daftarCuitan = Array.isArray(window.R9_CUITAN_IXAR) && window.R9_CUITAN_IXAR.length
    ? window.R9_CUITAN_IXAR
    : ['Together We Reign!'];
  let urutanCuitan = [], indeksDeck = 0, timerTutupGelembung = null;
  function kocokDeckCuitan() {
    urutanCuitan = Array.from({ length: daftarCuitan.length }, (_, i) => i);
    for (let i = urutanCuitan.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [urutanCuitan[i], urutanCuitan[j]] = [urutanCuitan[j], urutanCuitan[i]];
    }
    indeksDeck = 0;
  }
  kocokDeckCuitan();
  let idxTerakhir = -1;
  document.addEventListener('r9:bahasa', () => { if (idxTerakhir >= 0 && elCuitanTeks && elGelembung && !elGelembung.hidden) elCuitanTeks.textContent = R9.teks(daftarCuitan[idxTerakhir]); });

  function posisikanGelembung() {
    if (!elGelembung || elGelembung.hidden) return;
    const gw = elGelembung.offsetWidth || 250, gh = elGelembung.offsetHeight || 76;
    const gx = Math.max(10, Math.min(document.documentElement.clientWidth - gw - 10, px + lebar / 2 - gw / 2));
    const gy = Math.max(70, py - gh - 10);
    elGelembung.style.transform = `translate3d(${Math.round(gx)}px, ${Math.round(gy)}px, 0)`;
  }

  function tampilkanCuitanAcak(durasiTampil = 6800) {
    if (indeksDeck >= urutanCuitan.length) kocokDeckCuitan();
    const idxAsli = urutanCuitan[indeksDeck++];
    idxTerakhir = idxAsli;
    const teks = R9.teks(daftarCuitan[idxAsli]);
    const labelNomor = `#${idxAsli + 1} / ${daftarCuitan.length}`;
    if (elCuitanTeks) elCuitanTeks.textContent = teks;
    if (elCuitanNomor) elCuitanNomor.textContent = labelNomor;
    if (elCuitanPanggung) elCuitanPanggung.textContent = `“${teks}”`;
    if (elCuitanCounter) elCuitanCounter.textContent = labelNomor;
    if (elGelembung) {
      elGelembung.hidden = false;
      posisikanGelembung();
      clearTimeout(timerTutupGelembung);
      timerTutupGelembung = setTimeout(() => {
        if (elGelembung) elGelembung.hidden = true;
      }, durasiTampil);
    }
    return teks;
  }

  elGelembung?.addEventListener('click', (e) => {
    e.stopPropagation();
    tampilkanCuitanAcak(7200);
    x()?.lakukan('nyambut', 1200);
  });
  document.addEventListener('r9:ixar-sentuh', (e) => {
    if (e.detail?.el === el) tampilkanCuitanAcak(6500);
  });

  // ---------- Deteksi Bagian / Section Menu Aktif untuk Animasi Kontekstual ----------
  const PETA_SEKSI = [
    { sel: '#rosters', pose: 'roster', label: 'ROSTER // PRO PLAYER' },
    { sel: '#shop', pose: 'belanja', label: 'SHOP // MERCH HUNTER' },
    { sel: '#schedule', pose: 'manajer', label: 'SCHEDULE // TEAM MANAGER' },
    { sel: '#news', pose: 'wartawan', label: 'NEWS // PRESS READER' },
    { sel: '#banner', pose: 'pelukis', label: 'BANNER // ART DESIGNER' },
    { sel: '#contact', pose: 'kurir', label: 'CONTACT // R9 COURIER' },
    { sel: '#ixar', pose: 'nyambut', label: 'STAGE // INTERACTIVE' },
    { sel: '.ethos', pose: 'penjaga', label: 'ETHOS // ROYAL GUARD' },
    { sel: '#about', pose: 'penjaga', label: 'ABOUT // ROYAL GUARD' },
  ];

  function deteksiSeksiAktif() {
    const tengahLayar = innerHeight * .48;
    for (const item of PETA_SEKSI) {
      const s = $(item.sel);
      if (!s) continue;
      const r = s.getBoundingClientRect();
      if (r.top <= tengahLayar && r.bottom >= tengahLayar) return item;
    }
    return { sel: '.hero', pose: 'diam', label: 'HERO // COMPANION' };
  }

  // Deteksi platform/lantai tempat IXAR berpijak
  function infoPlatform() {
    return { mode: 'jelajah', y: innerHeight - tinggi - 8, xMin: 8, xMax: Math.max(8, document.documentElement.clientWidth - lebar - 8) };
  }
  const lantai = () => infoPlatform().y;
  const batasX = () => { const p = infoPlatform(); return [p.xMin, Math.max(p.xMin, p.xMax)]; };
  const taruh = () => {
    el.style.transform = `translate3d(${Math.round(px)}px, ${Math.round(py)}px, 0)`;
    posisikanGelembung();
  };
  const hadap = (kiri) => { hadapKiri = kiri; el.classList.toggle('hadap-kiri', kiri); };
  const pose = (p) => {
    x()?.set(p);
    if (elModeBadge) elModeBadge.textContent = p.toUpperCase();
  };

  function efekMendarat(cx, cy) {
    if (!panggung || !gerakBoleh) return;
    const j = document.createElement('span');
    j.className = 'jejak-mendarat';
    j.style.left = `${Math.round(cx)}px`;
    j.style.top = `${Math.round(cy)}px`;
    panggung.append(j);
    setTimeout(() => j.remove(), 460);
  }

  const animasi = (durasi, tiap, myToken = tokenAksi) => new Promise((ok) => {
    const t0 = performance.now(), d = Math.max(16, durasi);
    const langkah = (t) => {
      if (mati || sedangDiseret || myToken !== tokenAksi) return ok(false);
      const k = Math.min(1, (t - t0) / d);
      tiap(k); taruh();
      if (k < 1) requestAnimationFrame(langkah); else ok(true);
    };
    requestAnimationFrame(langkah);
  });

  // Fisika jatuh bebas nyata dengan gravitasi, pantulan dinding/lantai, pose mengayuh di udara, & squash saat mendarat
  function fisikaJatuh(vxAwal = 0, vyAwal = 0) {
    if (sedangDiseret) return Promise.resolve();
    const myToken = ++tokenAksi;
    sedangJatuh = true; sibuk = true;
    return new Promise((ok) => {
      let vx = vxAwal, vy = vyAwal, tTerakhir = performance.now(), pantul = 0;
      const tinggiJatuhAwal = lantai() - py;
      const GRAVITASI = 2200;
      const frame = (t) => {
        if (mati || sedangDiseret || myToken !== tokenAksi) {
          if (x()) x().miring = 0;
          sedangJatuh = false; return ok();
        }
        const dt = Math.min(.045, Math.max(.004, (t - tTerakhir) / 1000));
        tTerakhir = t;
        vy += GRAVITASI * dt;
        vx *= Math.pow(.985, dt * 60);
        px += vx * dt;
        py += vy * dt;

        const [xMin, xMax] = batasLayarX();
        if (px < xMin) { px = xMin; vx = Math.abs(vx) * .58; hadap(false); }
        else if (px > xMax) { px = xMax; vx = -Math.abs(vx) * .58; hadap(true); }
        if (py < 6) { py = 6; vy = Math.abs(vy) * .35; }

        if (Math.abs(vx) > 25) hadap(vx < 0);
        if (x()) x().miring = Math.max(-26, Math.min(26, vx * .022));

        pose(vy < -110 ? 'lompat' : 'jatuh');

        const yl = lantai();
        if (py >= yl) {
          py = yl;
          if (vy > 260) efekMendarat(px + lebar / 2, py + tinggi - 6);
          if (vy > 540 && pantul < 2) {
            pantul++;
            vy = -vy * .34;
            vx *= .62;
            pose('mendarat');
            taruh();
            requestAnimationFrame(frame);
            return;
          }
          if (x()) x().miring = 0;
          taruh();
          pose('mendarat');
          setTimeout(() => {
            if (myToken !== tokenAksi || sedangDiseret) { sedangJatuh = false; return ok(); }
            const seksi = deteksiSeksiAktif();
            if (tinggiJatuhAwal > 220) {
              pose('rebahan');
              setTimeout(() => {
                if (myToken === tokenAksi && !sedangDiseret) pose(seksi.pose || 'diam');
                sedangJatuh = false; sibuk = false; ok();
              }, 1600);
            } else {
              pose(seksi.pose || 'diam');
              sedangJatuh = false; sibuk = false; ok();
            }
          }, 240);
          return;
        }
        taruh();
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  }

  async function jalanKe(tx, cepat = false) {
    if (sedangDiseret) return;
    const myToken = ++tokenAksi;
    const [a, b] = batasX(); tx = Math.max(a, Math.min(b, tx));
    const jarak = Math.abs(tx - px); if (jarak < 4) return;
    hadap(tx < px); pose(cepat ? 'jalanCepat' : 'jalan');
    const x0 = px, y0 = py;
    await animasi(jarak / (cepat ? 420 : 175) * 1000, (k) => {
      const yl = lantai();
      px = x0 + (tx - x0) * k;
      py = y0 + (yl - y0) * Math.min(1, k * 3);
    }, myToken);
    if (myToken === tokenAksi && !sedangDiseret) {
      const seksi = deteksiSeksiAktif();
      pose(seksi.pose || 'diam');
    }
  }

  async function lompatKe(tx, ty, puncak = 150, durasi = 680) {
    if (sedangDiseret) return;
    const myToken = ++tokenAksi;
    const [a, b] = batasLayarX();
    tx = Math.max(a, Math.min(b, tx));
    hadap(tx < px);
    pose('mendarat');
    await tidur(95);
    if (myToken !== tokenAksi || sedangDiseret) return;
    const x0 = px, y0 = py;
    const selesai = await animasi(durasi, (k) => {
      px = x0 + (tx - x0) * k;
      py = y0 + (ty - y0) * k - Math.sin(Math.PI * k) * puncak;
      if (x()) x().miring = (tx - x0) * .035 * Math.cos(Math.PI * k);
      pose(k < .52 ? 'lompat' : 'jatuh');
    }, myToken);
    if (!selesai || myToken !== tokenAksi || sedangDiseret) return;
    if (x()) x().miring = 0;
    efekMendarat(px + lebar / 2, py + tinggi - 6);
    pose('mendarat');
    await tidur(210);
    if (myToken === tokenAksi && !sedangDiseret) {
      const seksi = deteksiSeksiAktif();
      pose(seksi.pose || 'diam');
    }
  }

  async function turun() {
    await lompatKe(px + (hadapKiri ? -36 : 36), lantai(), 70, 520);
  }

  async function kePodiumJuara() {
    const kotak1 = $('.podium__kotak--1');
    if (!kotak1) return;
    const r = kotak1.getBoundingClientRect();
    if (r.top < tinggi + 30 || r.top > innerHeight - 60) return;
    const tx = r.left + r.width / 2 - lebar / 2, ty = r.top - tinggi + 8;
    await lompatKe(tx, ty, 130, 680);
    if (sedangDiseret) return;
    x()?.lakukan('bendera', 2600);
    await tidur(2700);
    if (!sedangDiseret) await turun();
  }

  async function jalanJalan() {
    const [a, b] = batasX();
    await jalanKe(a + Math.random() * (b - a), Math.random() < .3);
  }

  async function istirahatRebahan() {
    const jenisRebahan = Math.random() < .65 ? 'rebahan' : 'tidur';
    pose(jenisRebahan);
    x()?.lakukan(jenisRebahan, 4200);
    await tidur(4300);
  }

  async function aksiSesuaiSeksi() {
    const seksi = deteksiSeksiAktif();
    if (seksi.pose && seksi.pose !== 'diam') {
      pose(seksi.pose);
      x()?.lakukan(seksi.pose, 3600);
      if (Math.random() < .48) tampilkanCuitanAcak(6500);
      await tidur(3700);
    } else {
      const daftar = ['regang', 'penasaran', 'pedang', 'tameng', 'tunjuk', 'nyambut', 'meditasi', 'rebahan', 'lompat'];
      const p = daftar[Math.floor(Math.random() * daftar.length)];
      if (p === 'lompat') await lompatKe(px + (Math.random() - .5) * 90, lantai(), 135, 620);
      else { pose(p); x()?.lakukan(p, 2600); await tidur(2700); }
    }
  }

  // Perintahkan IXAR melakukan pose tertentu (dipakai oleh Command Deck #ixar)
  let urutanPose = 0; // klik skill terakhir selalu menang: aksi lama yang masih jalan gak boleh nimpa
  async function peragakanPose(namaPose, durasi = 4500) {
    if (sedangDiseret) return;
    const ini = ++urutanPose;
    jedaSampai = performance.now() + durasi + 800;
    const info = infoPlatform();
    if (info.mode === 'kenal') {
      const tengahPanggung = (info.xMin + info.xMax) / 2;
      if (Math.abs(px - tengahPanggung) > 60 || Math.abs(py - info.y) > 24) {
        await lompatKe(tengahPanggung, info.y, 120, 540);
        if (ini !== urutanPose) return;
      }
    }
    if (namaPose === 'lompat') {
      await lompatKe(px, lantai(), 165, 660);
      if (ini !== urutanPose) return;
      pose('menang');
      x()?.lakukan('menang', 1600);
    } else {
      pose(namaPose);
      x()?.lakukan(namaPose, durasi);
    }
  }

  window.R9IxarUtama = { peragakanPose, lompatKe, fisikaJatuh, tampilkanCuitanAcak };

  // Drag & Drop Interaktif pada IXAR Penjelajah
  let pointerIdAktif = null, geserX0 = 0, geserY0 = 0, offsetDragX = 0, offsetDragY = 0;
  let riwayatGerak = [];
  el.addEventListener('pointerdown', (e) => {
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    pointerIdAktif = e.pointerId;
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
    sedangDiseret = true;
    if (x()) x().sedangDiseret = true;
    tokenAksi++;
    jedaSampai = performance.now() + 4000;
    geserX0 = e.clientX; geserY0 = e.clientY;
    offsetDragX = e.clientX - px;
    offsetDragY = e.clientY - py;
    riwayatGerak = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    el.classList.add('sedang-diseret');
    clearTimeout(x()?.balik);
    pose('seret');
  });

  el.addEventListener('pointermove', (e) => {
    if (!sedangDiseret || e.pointerId !== pointerIdAktif) return;
    e.preventDefault();
    const sekarang = performance.now();
    const [xMin, xMax] = batasLayarX();
    px = Math.max(xMin, Math.min(xMax, e.clientX - offsetDragX));
    py = Math.max(4, Math.min(innerHeight - tinggi - 4, e.clientY - offsetDragY));
    riwayatGerak.push({ x: e.clientX, y: e.clientY, t: sekarang });
    while (riwayatGerak.length > 6 && sekarang - riwayatGerak[0].t > 90) riwayatGerak.shift();
    const awal = riwayatGerak[0];
    const dt = Math.max(12, sekarang - awal.t);
    const vx = ((e.clientX - awal.x) / dt) * 1000;
    if (Math.abs(vx) > 40) hadap(vx < 0);
    if (x()) {
      x().ayunDrag = Math.max(-42, Math.min(42, -vx * .038));
      x().miring = Math.max(-22, Math.min(22, vx * .015));
    }
    taruh();
  });

  function lepasDrag(e) {
    if (!sedangDiseret || (e && e.pointerId !== pointerIdAktif)) return;
    try { el.releasePointerCapture(pointerIdAktif); } catch (err) {}
    sedangDiseret = false;
    pointerIdAktif = null;
    el.classList.remove('sedang-diseret');
    if (x()) {
      x().sedangDiseret = false;
      x().ayunDrag = 0;
    }
    const sekarang = performance.now();
    const jarakTotal = e ? Math.hypot(e.clientX - geserX0, e.clientY - geserY0) : 0;
    if (jarakTotal > 7 && x()) {
      x().baruDiseret = true;
      setTimeout(() => { if (x()) x().baruDiseret = false; }, 180);
    }
    const awal = riwayatGerak[0] || { x: px, y: py, t: sekarang - 16 };
    const akhir = riwayatGerak[riwayatGerak.length - 1] || awal;
    const dt = Math.max(16, sekarang - awal.t);
    const vx = jarakTotal > 7 ? Math.max(-1100, Math.min(1100, ((akhir.x - awal.x) / dt) * 1000 * .75)) : 0;
    const vy = jarakTotal > 7 ? Math.max(-950, Math.min(950, ((akhir.y - awal.y) / dt) * 1000 * .75)) : 0;
    jedaSampai = performance.now() + 2600;
    if (py < lantai() - 4 || Math.abs(vx) > 90 || vy < -90) {
      fisikaJatuh(vx, vy);
    } else {
      py = lantai();
      if (x()) x().miring = 0;
      taruh();
      pose(deteksiSeksiAktif().pose || 'diam');
    }
  }
  el.addEventListener('pointerup', lepasDrag);
  el.addEventListener('pointercancel', lepasDrag);

  // Mengikuti user saat scroll & otomatis mengganti animasi sesuai bagian menu yang sedang dilihat!
  let scrollTerakhir = scrollY, timerScroll = null;
  addEventListener('scroll', () => {
    const dyScroll = scrollY - scrollTerakhir;
    scrollTerakhir = scrollY;
    if (sedangDiseret) return;

    const seksi = deteksiSeksiAktif();
    if (seksi.sel !== seksiTerakhir) {
      seksiTerakhir = seksi.sel;
      if (x()) x().dasar = seksi.pose || 'diam';
      if (elModeBadge) elModeBadge.textContent = seksi.label;
    }

    const info = infoPlatform();
    if (info.mode === 'kenal' && !sudahSapaKenal && !sedangJatuh) {
      sudahSapaKenal = true;
      jedaSampai = performance.now() + 2400;
      lompatKe((info.xMin + info.xMax) / 2, info.y, 125, 620).then(() => {
        x()?.lakukan('nyambut', 1800);
        tampilkanCuitanAcak(6500);
      });
      return;
    }
    if (info.mode !== 'kenal') sudahSapaKenal = false;

    py = Math.max(10, Math.min(innerHeight - tinggi * .35, py - dyScroll * .48));
    taruh();

    clearTimeout(timerScroll);
    timerScroll = setTimeout(() => {
      if (sedangDiseret || sedangJatuh) return;
      const targetY = lantai();
      const [xMin, xMax] = batasX();
      const seksiSekarang = deteksiSeksiAktif();
      if (px < xMin || px > xMax) {
        const tx = Math.max(xMin, Math.min(xMax, px));
        lompatKe(tx, targetY, 110, 560);
      } else if (py < targetY - 14) {
        fisikaJatuh((Math.random() - .5) * 90, 0);
      } else if (py > targetY + 14) {
        lompatKe(px, targetY, 95, 480);
      } else {
        py = targetY;
        taruh();
        pose(seksiSekarang.pose || 'diam');
      }
    }, 90);
  }, { passive: true });

  async function otak() {
    // Munculkan cuitan pembuka setelah 3.2 detik
    setTimeout(() => { if (! mati) tampilkanCuitanAcak(6500); }, 3200);
    while (!mati) {
      if (sedangDiseret || sedangJatuh || performance.now() < jedaSampai || !x() || document.hidden) {
        await tidur(380);
        continue;
      }
      sibuk = true;
      const info = infoPlatform();
      try {
        const n = Math.random();
        if (n < .38) await aksiSesuaiSeksi();
        else if (n < .64) await jalanJalan();
        else if (n < .84) await istirahatRebahan();
        else if (n < .94 && info.mode === 'jelajah') await kePodiumJuara();
        else await tidur(1100);
      } catch (e) {}
      sibuk = false;
      await tidur(700 + Math.random() * 1100);
    }
  }

  addEventListener('resize', () => {
    ukur();
    if (!sedangDiseret && !sedangJatuh) {
      const [a, b] = batasX();
      px = Math.max(a, Math.min(b, px));
      py = lantai();
      taruh();
    }
  });
  // pintu buat adegan duel di layar pembuka: IXAR pembuka bisa "minjem" IXAR ini sebentar (posisi = koordinat layar)
  window.R9Jelajah = {
    async ambilAlih() { jedaSampai = Infinity; for (let i = 0; i < 50 && (sibuk || sedangJatuh || sedangDiseret); i++) await tidur(100); return !sedangDiseret; },
    lepas() { jedaSampai = 0; },
    posisi: () => ({ x: px, y: py, w: lebar, h: tinggi }),
    hadap, set: (p) => x()?.set(p), lakukan: (p, ms) => x()?.lakukan(p, ms),
    keLayar(tx, ty, ms, puncak = 0) {
      const x0 = px, y0 = py;
      return new Promise((ok) => { const t0 = performance.now(); const f = (t) => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        px = x0 + (tx - x0) * e; py = y0 + (ty - y0) * e - Math.sin(Math.PI * k) * puncak; taruh(); if (k < 1) requestAnimationFrame(f); else ok(); }; requestAnimationFrame(f); });
    },
  };
  const mulai = () => {
    ukur();
    const [a, b] = batasX();
    // Mulai di sisi kanan bawah layar agar tidak bertumpukan dengan IXAR Hero di tengah-kiri
    px = Math.max(a, Math.min(b, document.documentElement.clientWidth - lebar - Math.max(24, document.documentElement.clientWidth * .08)));
    py = lantai();
    hadap(true);
    taruh();
    if (gerakBoleh) otak();
  };
  if (window.R9Hero) mulai(); else { document.addEventListener('r9:hero-siap', mulai, { once: true }); setTimeout(() => { if (!px) mulai(); }, 1800); }
})();

// ---------- bendera juara 1 ----------
$$('.bendera__kain').forEach((kain) => {
  const logo = $('svg', kain), N = 30;
  kain.style.setProperty('--n', N);
  for (let i = 0; i < N; i++) {
    const iris = document.createElement('span'), isi = document.createElement('span');
    iris.className = 'kain-iris'; isi.className = 'kain-iris__isi';
    iris.style.setProperty('--i', i); iris.style.setProperty('--ayun', (Math.pow(i / (N - 1), 1.3) * 5).toFixed(2));
    isi.append(logo.cloneNode(true)); iris.append(isi); kain.append(iris);
  }
});
const podium = $('.podium');
if (podium) {
  new IntersectionObserver((d, o) => { if (d.some((e) => e.isIntersecting)) { podium.classList.add('keliatan'); o.disconnect(); } }, { threshold: .15 }).observe(podium);

// ---------- podium: IXAR bawa panji R9, lompat juara 3 → 2 → 1, nancepin bendera, berdiri gagah (klik = ulang) ----------
(() => {
  const pod = $('.podium'), ix = $('.podium__ixar'), bendera = $('.podium__bendera');
  if (!pod || !ix) return;
  const kotak = (n) => $(`.podium__kotak--${n}`, pod);
  // posisi IXAR (kiri-atas, relatif ke podium) supaya kakinya pas di atas kotak juara n
  const titik = (n, geser = 0) => { const p = pod.getBoundingClientRect(), k = kotak(n).getBoundingClientRect(), w = ix.offsetWidth, h = ix.offsetHeight;
    return [k.left - p.left + k.width / 2 - w / 2 + geser, k.top - p.top - h * .97]; };
  let main = false;
  const lompat = (dari, ke, ms) => ix.animate([
    { transform: `translate(${dari[0]}px, ${dari[1]}px)` },
    { transform: `translate(${(dari[0] + ke[0]) / 2}px, ${Math.min(dari[1], ke[1]) - 90}px)`, offset: .5 },
    { transform: `translate(${ke[0]}px, ${ke[1]}px)` }], { duration: ms, easing: 'cubic-bezier(.33, 0, .3, 1)', fill: 'forwards' }).finished;
  const tunggu = (ms) => new Promise((ok) => setTimeout(ok, ms));
  async function adegan() {
    if (main || !ix.ixar) return; main = true;
    const akhir = titik(1, -ix.offsetWidth * .62);
    if (!gerakBoleh) { ix.style.transform = `translate(${akhir[0]}px, ${akhir[1]}px)`; bendera?.classList.add('tancap'); ix.ixar.dasar = 'pegangTiang'; ix.ixar.set('pegangTiang'); main = false; return; }
    bendera?.classList.remove('tancap'); ix.ixar.dasar = 'penjaga'; ix.ixar.set('penjaga');
    const a = titik(3), b = titik(2), c = titik(1, -ix.offsetWidth * .2);
    ix.style.transform = `translate(${a[0]}px, ${a[1]}px)`; ix.classList.add('tampil');
    await tunggu(500);
    ix.ixar.set('lompatPanji'); await lompat(a, b, 650); ix.ixar.set('penjaga'); await tunggu(280);
    ix.ixar.set('lompatPanji'); await lompat(b, c, 700); ix.ixar.set('menang'); await tunggu(500);
    // nancepin bendera: panji di tangan ilang, tiang di juara 1 naik & kainnya berkibar
    ix.ixar.set('tonjok'); await tunggu(220); bendera?.classList.add('tancap');
    await ix.animate([{ transform: `translate(${c[0]}px, ${c[1]}px)` }, { transform: `translate(${akhir[0]}px, ${akhir[1]}px)` }], { duration: 300, fill: 'forwards' }).finished;
    ix.ixar.dasar = 'pegangTiang'; ix.ixar.set('pegangTiang'); main = false;
  }
  new IntersectionObserver((d, o) => { if (d.some((e) => e.isIntersecting)) { o.disconnect(); setTimeout(adegan, 300); } }, { threshold: .35 }).observe(pod);
  ix.addEventListener('click', () => setTimeout(adegan, 50));
  addEventListener('resize', () => { if (!main && bendera?.classList.contains('tancap')) { const t = titik(1, -ix.offsetWidth * .62); ix.getAnimations().forEach((x) => x.cancel()); ix.style.transform = `translate(${t[0]}px, ${t[1]}px)`; } });
})();
}

// ---------- Panggung IXAR (#ixar): IXAR sendiri di panggung, satu baris ikon skill, keterangan di panggung ----------
(() => {
  const ixEl = $('[data-ixar-panggung]'), rel = $('[data-rel-skill]'), nama = $('[data-ket-nama]'), isi = $('[data-ket-isi]');
  if (!ixEl || !rel) return;
  let aktif = '', urutCuitan = 0;
  const tulis = () => {
    if (aktif) { nama.textContent = R9.t(`pose.${aktif}`); isi.textContent = R9.t(`skill.${aktif}`); }
    else { nama.textContent = 'IXAR'; isi.textContent = R9.t('ixar.ketAwal'); }
  };
  const ganti = (efek) => { if (!gerakBoleh) return efek(); nama.parentElement.classList.remove('muncul'); void nama.offsetWidth; efek(); nama.parentElement.classList.add('muncul'); };
  rel.addEventListener('click', (e) => {
    const b = e.target.closest('[data-skill]'); if (!b) return;
    aktif = b.dataset.skill;
    $$('[data-skill]', rel).forEach((x) => x.setAttribute('aria-pressed', x === b));
    b.scrollIntoView({ behavior: gerakBoleh ? 'smooth' : 'auto', block: 'nearest', inline: 'center' });
    ganti(tulis);
    ixEl.ixar?.lakukan(aktif, aktif === 'tidur' || aktif === 'rebahan' ? 6000 : 4600);
  });
  // colek IXAR = celetukan di keterangan
  ixEl.addEventListener('click', () => {
    const daftar = window.R9_CUITAN_IXAR || []; if (!daftar.length) return;
    if (!urutCuitan) urutCuitan = Math.floor(Math.random() * daftar.length);
    aktif = ''; $$('[data-skill]', rel).forEach((x) => x.setAttribute('aria-pressed', 'false'));
    ganti(() => { nama.textContent = 'IXAR'; isi.textContent = `“${R9.teks(daftar[urutCuitan++ % daftar.length])}”`; });
  });
  // panah geser + sembunyiin panah di ujung
  const panah = $$('[data-geser-skill]');
  panah.forEach((p) => p.addEventListener('click', () => rel.scrollBy({ left: +p.dataset.geserSkill * rel.clientWidth * .7, behavior: gerakBoleh ? 'smooth' : 'auto' })));
  const cekUjung = () => { const maks = rel.scrollWidth - rel.clientWidth - 2; panah[0].disabled = rel.scrollLeft <= 2; panah[1].disabled = rel.scrollLeft >= maks; rel.classList.toggle('di-awal', rel.scrollLeft <= 2); rel.classList.toggle('di-akhir', rel.scrollLeft >= maks); };
  rel.addEventListener('scroll', cekUjung, { passive: true }); addEventListener('resize', cekUjung); cekUjung();
  document.addEventListener('r9:bahasa', () => { if (aktif || !isi.textContent.startsWith('“')) tulis(); });
  tulis();
  const jelajah = $('.panggung-ixar');
  if (jelajah) { // panggung IXAR & generator foto profil keliatan = penjelajah minggir
    const keliatan = new Set();
    const io = new IntersectionObserver((d) => { d.forEach((e) => (e.isIntersecting ? keliatan.add(e.target) : keliatan.delete(e.target))); jelajah.classList.toggle('minggir', keliatan.size > 0); }, { threshold: .35 });
    ['.kenal__panggung', '.pfp__kerja'].forEach((sel) => { const el = $(sel); if (el) io.observe(el); });
  }
})();

// ============================================================================
// KOLEKSI BENDERA NEGARA LENGKAP (SVG)
// ============================================================================
const BENDERA = {
  ID: '<svg class="kartu-pemain__negara" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="10" fill="#E70011"/><rect y="10" width="30" height="10" fill="#fff"/></svg>',
  MY: '<svg class="kartu-pemain__negara" viewBox="0 0 28 14" aria-hidden="true"><rect width="28" height="14" fill="#fff"/><g fill="#CC0001"><rect width="28" height="1"/><rect y="2" width="28" height="1"/><rect y="4" width="28" height="1"/><rect y="6" width="28" height="1"/><rect y="8" width="28" height="1"/><rect y="10" width="28" height="1"/><rect y="12" width="28" height="1"/></g><rect width="14" height="8" fill="#010066"/><circle cx="5.6" cy="4" r="3" fill="#FC0"/><circle cx="6.5" cy="4" r="2.5" fill="#010066"/><path d="M10.3 1.6l.5 1.6 1.6-.4-1.1 1.2 1.1 1.2-1.6-.4-.5 1.6-.5-1.6-1.6.4 1.1-1.2-1.1-1.2 1.6.4z" fill="#FC0"/></svg>',
  CN: '<svg class="kartu-pemain__negara" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#EE1C25"/><polygon points="5,2.2 5.9,4.9 8.7,4.9 6.4,6.6 7.3,9.3 5,7.6 2.7,9.3 3.6,6.6 1.3,4.9 4.1,4.9" fill="#FFFF00"/><circle cx="10.2" cy="2.1" r=".85" fill="#FFFF00"/><circle cx="12" cy="4" r=".85" fill="#FFFF00"/><circle cx="12" cy="6.8" r=".85" fill="#FFFF00"/><circle cx="10.2" cy="8.8" r=".85" fill="#FFFF00"/></svg>',
  SG: '<svg class="kartu-pemain__negara" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="10" fill="#EF3340"/><rect y="10" width="30" height="10" fill="#fff"/><circle cx="6.8" cy="5" r="3.4" fill="#fff"/><circle cx="7.9" cy="5" r="3" fill="#EF3340"/><g fill="#fff"><circle cx="8.2" cy="3.3" r=".6"/><circle cx="9.8" cy="4.4" r=".6"/><circle cx="9.2" cy="6.2" r=".6"/><circle cx="7.2" cy="6.2" r=".6"/><circle cx="6.6" cy="4.4" r=".6"/></g></svg>',
  PH: '<svg class="kartu-pemain__negara" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="10" fill="#0038A8"/><rect y="10" width="30" height="10" fill="#CE1126"/><polygon points="0,0 13,10 0,20" fill="#fff"/><circle cx="4.5" cy="10" r="1.9" fill="#FCD116"/><circle cx="1.6" cy="3.2" r=".75" fill="#FCD116"/><circle cx="1.6" cy="16.8" r=".75" fill="#FCD116"/><circle cx="10.4" cy="10" r=".75" fill="#FCD116"/></svg>',
  KR: '<svg class="kartu-pemain__negara" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="5" fill="#CD2E3A"/><path d="M10 10a5 5 0 0 0 10 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 0-5 0z" fill="#0047A0"/><g stroke="#000" stroke-width="1.2"><line x1="6" y1="4" x2="9" y2="7"/><line x1="21" y1="4" x2="24" y2="7"/><line x1="6" y1="16" x2="9" y2="13"/><line x1="21" y1="16" x2="24" y2="13"/></g></svg>',
  TH: '<svg class="kartu-pemain__negara" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#A51931"/><rect y="3.3" width="30" height="13.4" fill="#F4F5F8"/><rect y="6.6" width="30" height="6.8" fill="#2D2A4A"/></svg>',
  VN: '<svg class="kartu-pemain__negara" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#DA251D"/><polygon points="15,4 16.5,8.6 21.3,8.6 17.4,11.4 18.9,16 15,13.2 11.1,16 12.6,11.4 8.7,8.6 13.5,8.6" fill="#FFFF00"/></svg>',
  TW: '<svg class="kartu-pemain__negara" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#FE0000"/><rect width="15" height="10" fill="#000095"/><circle cx="7.5" cy="5" r="2.6" fill="#fff"/></svg>',
  HK: '<svg class="kartu-pemain__negara" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#DE2910"/><circle cx="15" cy="10" r="4.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 1.5"/></svg>',
};

const IKON_ROLE = {
  'Clash Lane': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 3l2 2-9 9-2-2 9-9zM5 13l6 6-4 2-2-2 2-4-2-2z" fill="currentColor"/></svg>',
  'Jungling': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L4 12l6 2-2 8 12-11-6-2 2-7z" fill="currentColor"/></svg>',
  'Mid Lane': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="currentColor"/></svg>',
  'Farm Lane': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9h-3a6 6 0 1 1-6-6V3zm5 2l4 4-8 8-2-2 6-6-2-2 2-2z" fill="currentColor"/></svg>',
  'Roaming': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L4 5v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V5l-8-3z" fill="currentColor"/></svg>',
  'Coach': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" fill="currentColor"/></svg>',
};

// Pose default IXAR saat dijadikan foto dummy/stock pemain berdasarkan Role
const POSE_IXAR_ROLE = {
  'Clash Lane': 'pedang',
  'Jungling': 'serbu',
  'Mid Lane': 'meditasi',
  'Farm Lane': 'tunjuk',
  'Roaming': 'tameng',
  'Pelatih': 'bendera',
  'Analis': 'penasaran',
  'Manajer': 'nyambut',
};

// ---------- state menu 3 tingkat & sinkronisasi live ----------
let DATA = null;
let newsTampil = 6;
let kategoriTerpilih = null; // null | 'aktif' | 'nonaktif' | 'management' (Diklik dulu baru muncul daftar tim/divisi!)
let timTerpilih = null;      // null | string nama tim/divisi (Diklik dulu baru muncul daftar pemain/anggota!)

// 5 Divisi Resmi di bawah Management (плюс bisa ditambah divisi baru lewat Admin Panel)
const DIVISI_MANAGEMENT_RESMI = [
  'Media and Publication',
  'Competitive',
  'HR & Community',
  'Secretariat',
  'BizDev',
];

// Resolusi URL media (foto pemain, gambar news, & dokumentasi prestasi) langsung ke server live admin.reign9.site
function urlMedia(jalur) {
  if (!jalur) return '';
  if (/^(data:image\/|blob:)/i.test(jalur)) return jalur;
  if (/^https?:/i.test(jalur)) { try { const u = new URL(jalur); return ['admin.reign9.site', 'reign9.site', 'www.reign9.site'].includes(u.hostname) && u.protocol === 'https:' ? u.href : ''; } catch { return ''; } }
  const bersih = String(jalur).replace(/^\/+/, '');
  if (window.R9Desain?.mediaPath.test('/' + bersih)) return ADMIN + '/' + bersih;
  if (bersih.startsWith('gambar/roster/') || bersih.startsWith('gambar/news/') || bersih.startsWith('gambar/prestasi/')) {
    return `${ADMIN}/${bersih}`;
  }
  return bersih;
}

async function ambilDataLive() {
  for (const url of [`${ADMIN}/api/publik`, `data/reign9.json?t=${Date.now()}`]) {
    try {
      const ac = new AbortController(), batas = setTimeout(() => ac.abort(), 5000);
      const r = await fetch(url, { signal: ac.signal, cache: 'no-store' }); clearTimeout(batas);
      if (r.ok) return await r.json();
    } catch (e) {}
  }
  return null;
}

const hariIni = () => new Date().toISOString().slice(0, 10);

// Deteksi apakah anggota termasuk kategori Management (Media and Publication, Competitive, HR & Community, Secretariat, BizDev)
function apakahManagement(p) {
  if (!p) return false;
  if (p.status === 'management' || p.status === 'kompetitif') return true;
  const kel = String(p.kelompok || p.divisi || '').trim();
  if ([...DIVISI_MANAGEMENT_RESMI, 'Competitive Division', 'Coaching & Staff', 'Man Behind the Match', 'Management', 'Media & Publication'].includes(kel)) return true;
  return p.jenis === 'coach' || ['Pelatih', 'Manajer', 'Analis', 'Konten', 'Media and Publication', 'HR & Community', 'Secretariat', 'BizDev'].includes(p.role);
}

// Menentukan nama tim (Active/Non-Active) atau nama divisi (Management) untuk setiap anggota
function namaTimPemain(p, status = 'aktif') {
  const kel = String(p.kelompok || '').trim();
  const div = String(p.divisi || '').trim();

  if (status === 'management' || status === 'kompetitif') {
    if (['Competitive', 'Competitive Division', 'Coaching & Staff', 'Man Behind the Match'].includes(kel)) return 'Competitive';
    if (['Media and Publication', 'Media & Publication'].includes(kel)) return 'Media and Publication';
    if (['HR & Community', 'HR and Community'].includes(kel)) return 'HR & Community';
    if (kel === 'Secretariat') return 'Secretariat';
    if (['BizDev', 'Business Development'].includes(kel)) return 'BizDev';
    if (kel && !['Honor of Kings', 'Main Roster', 'R9 Main Roster'].includes(kel)) return kel;
    if (p.role === 'Konten' || p.role === 'Media and Publication') return 'Media and Publication';
    if (DIVISI_MANAGEMENT_RESMI.includes(p.role)) return p.role;
    return 'Competitive';
  }

  if (kel) {
    if (kel === 'Main Roster') return 'R9 Main Roster';
    return kel;
  }
  if (div && div !== 'Honor of Kings') {
    if (div === 'Main Roster') return 'R9 Main Roster';
    return div;
  }
  return status === 'nonaktif' ? 'Legacy Squad' : 'R9 Main Roster';
}

function renderKartuPemain(p) {
  const coach = apakahManagement(p);
  const roleKamus = p.role ? R9.t(`role.${p.role}`) : '';
  const roleLabel = p.role
    ? (roleKamus !== `role.${p.role}` ? roleKamus : p.role)
    : (coach ? R9.t('roster.coach') : R9.t('roster.player'));
  const ikonRole = IKON_ROLE[coach ? 'Coach' : p.role] || '';
  const kodeNegara = (p.negara || 'ID').toUpperCase();
  const benderaSvg = BENDERA[kodeNegara] || '';
  const namaNegara = R9.t(`negara.${kodeNegara}`);
  const poseIxar = p.poseIxar || POSE_IXAR_ROLE[p.role] || (coach ? 'manajer' : 'pedang');

  const daftarHero = Array.isArray(p.hero)
    ? p.hero
    : (typeof p.hero === 'string' && p.hero.trim() ? p.hero.split(',').map((x) => x.trim()).filter(Boolean) : []);
  const heroes = daftarHero.length
    ? `<div class="kartu-pemain__hero" title="${esc(R9.t('roster.hero'))}">${daftarHero.map((h) => `<span>${esc(h)}</span>`).join('')}</div>`
    : '';
  const infoWaktu = p.periode
    ? `<div class="kartu-pemain__meta">${esc(R9.t('roster.periode'))}: <strong>${esc(p.periode)}</strong></div>`
    : p.gabung
      ? `<div class="kartu-pemain__meta">${esc(R9.t('roster.gabung'))}: ${esc(R9.tanggal(p.gabung, { month: 'short', year: 'numeric' }))}</div>`
      : '';

  const sumberFoto = urlMedia(p.foto);
  const cadanganLokal = p.foto && !/^(https?:|data:|blob:)/i.test(p.foto) ? String(p.foto).replace(/^\/+/, '') : '';
  // Rasio foto 3:5 portrait (width="360" height="600")
  const htmlFoto = sumberFoto
    ? `<img class="kartu-pemain__foto" src="${esc(sumberFoto)}" data-cadangan-lokal="${esc(cadanganLokal)}" alt="${esc(p.nickname)}" loading="lazy" width="360" height="600" data-pose-cadangan="${esc(poseIxar)}">`
    : `<div class="kartu-pemain__tanpa"><span class="kartu-pemain__ixar" data-ixar="${esc(poseIxar)}" data-ixar-interaktif></span></div>`;

  return `<li id="pemain-${idAman(p.id)}" class="kartu-pemain ${coach ? 'kartu-pemain--coach' : ''}">
    <div class="kartu-pemain__isi">
      <span class="lencana-role">${ikonRole}${esc(roleLabel)}</span>
      <span class="lencana-negara-pojok" title="${esc(namaNegara)}">${benderaSvg}<span>${esc(kodeNegara)}</span></span>
      ${htmlFoto}
      <div class="kartu-pemain__info">
        <span class="kartu-pemain__nama">${esc(p.nickname)}</span>
        <span class="kartu-pemain__role">${benderaSvg}<span>${esc([roleLabel, namaNegara].filter(Boolean).join(' · '))}</span></span>
        ${heroes}
        ${infoWaktu}
        ${(p.instagram || p.tiktok) ? `<div class="kartu-pemain__sosmed">
          ${p.instagram ? `<a class="kartu-pemain__ig" href="https://www.instagram.com/${encodeURIComponent(p.instagram)}/" target="_blank" rel="noopener">IG @${esc(p.instagram)}</a>` : ''}
          ${p.tiktok ? `<a class="kartu-pemain__ig" href="https://www.tiktok.com/@${encodeURIComponent(p.tiktok)}" target="_blank" rel="noopener">TT @${esc(p.tiktok)}</a>` : ''}
        </div>` : ''}
      </div>
    </div>
  </li>`;
}

// Pasang IXAR pada semua kartu tanpa foto & tangani fallback jika gambar 404
function aktifkanIxarKartu(wadah) {
  if (!wadah) return;
  $$('[data-ixar]', wadah).forEach((el) => window.IXAR?.pasang(el));
  $$('img.kartu-pemain__foto', wadah).forEach((img) => {
    img.addEventListener('error', function tanganiError() {
      const lokal = img.dataset.cadanganLokal;
      if (lokal && img.getAttribute('src') !== lokal) {
        img.dataset.cadanganLokal = '';
        img.src = lokal;
        return;
      }
      const pose = img.dataset.poseCadangan || 'pedang';
      const ganti = document.createElement('div');
      ganti.className = 'kartu-pemain__tanpa';
      ganti.innerHTML = `<span class="kartu-pemain__ixar" data-ixar="${esc(pose)}" data-ixar-interaktif></span>`;
      img.replaceWith(ganti);
      const span = $('[data-ixar]', ganti);
      if (span) window.IXAR?.pasang(span);
    });
  });
}

function kelompokkanTim(daftar, status) {
  const map = new Map();
  // Untuk kategori Management, sediakan 5 divisi resmi secara berurutan (+ divisi tambahan dari Admin)
  if (status === 'management') {
    DIVISI_MANAGEMENT_RESMI.forEach((div) => map.set(div, []));
  }
  daftar.forEach((p) => {
    const nama = namaTimPemain(p, status);
    if (!map.has(nama)) map.set(nama, []);
    map.get(nama).push(p);
  });
  return map;
}

function renderKartuBerita(n) {
  return `<a id="berita-${idAman(n.id)}" class="berita" href="news.html?id=${idAman(n.id)}">
    ${n.gambar ? `<img src="${esc(urlMedia(n.gambar))}" alt="${esc(R9.teks(n.judul))}" loading="lazy" width="800" height="450">` : ''}
    <span class="berita__isi">
      <time datetime="${esc(n.tanggal)}">${esc(R9.tanggal(n.tanggal))}</time>
      <h3>${esc(R9.teks(n.judul))}</h3>
      <p>${esc(R9.teks(n.ringkas) || String(R9.teks(n.isi)).slice(0, 140))}</p>
      <span class="berita__baca">${esc(R9.t('news.baca'))} →</span>
    </span>
  </a>`;
}

// Render Halaman Khusus News (news.html)
function gambarHalamanBerita(d) {
  const wadahUtama = $('[data-artikel-berita]');
  if (!wadahUtama) return;
  const news = (d.news || []).slice().sort((a, b) => (b.tanggal > a.tanggal ? 1 : -1));
  const params = new URLSearchParams(location.search);
  const idCari = params.get('id');
  const artikel = (idCari && news.find((x) => String(x.id) === String(idCari))) || news[0];

  if (!artikel) {
    wadahUtama.innerHTML = `<p class="kosong">${esc(R9.t('news.kosong'))}</p>`;
    return;
  }

  document.title = `${R9.teks(artikel.judul)} · Reign 9 International News`;
  const paragraf = String(R9.teks(artikel.isi) || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  wadahUtama.innerHTML = `
    ${artikel.gambar
      ? `<img class="artikel-berita__gambar" src="${esc(urlMedia(artikel.gambar))}" alt="${esc(R9.teks(artikel.judul))}" width="1200" height="675">`
      : `<div class="artikel-berita__visual"><svg viewBox="0 0 188.61 237.24" aria-hidden="true"><use href="#tegak"/></svg></div>`}
    <div class="artikel-berita__badan">
      <div class="artikel-berita__meta">
        <span class="artikel-berita__lencana">${esc(R9.t('news.lencana'))}</span>
        <time class="artikel-berita__tanggal" datetime="${esc(artikel.tanggal)}">${esc(R9.tanggal(artikel.tanggal))}</time>
      </div>
      <h1 class="artikel-berita__judul">${esc(R9.teks(artikel.judul))}</h1>
      ${R9.teks(artikel.ringkas) ? `<p class="artikel-berita__ringkas">${esc(R9.teks(artikel.ringkas))}</p>` : ''}
      <div class="artikel-berita__isi">
        ${paragraf.map((par) => `<p>${esc(par)}</p>`).join('')}
      </div>
      <div class="artikel-berita__aksi">
        <a class="tombol tombol--garis tombol--kecil" href="index.html#news">${esc(R9.t('news.kembali'))}</a>
        <button type="button" class="tombol tombol--utama tombol--kecil" data-salin-berita>${esc(R9.t('news.bagikan'))}</button>
      </div>
    </div>
  `;

  $('[data-salin-berita]', wadahUtama)?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    try { await navigator.clipboard.writeText(location.href); } catch (err) {}
    btn.textContent = R9.t('news.tersalin');
    setTimeout(() => { btn.textContent = R9.t('news.bagikan'); }, 1800);
  });

  const wadahLainnya = $('[data-news-lainnya]');
  if (wadahLainnya) {
    const daftarLain = news.filter((x) => String(x.id) !== String(artikel.id));
    wadahLainnya.innerHTML = (daftarLain.length ? daftarLain : news).map(renderKartuBerita).join('');
  }
}

function gambarData() {
  if (DATA?.situs) terapkanSitus(DATA.situs);
  const d = DATA || { pemain: { aktif: [], nonaktif: [] }, event: [], prestasi: [], news: [], ringkas: {} };

  if ($('[data-artikel-berita]')) {
    gambarHalamanBerita(d);
  }

  // 1. Podium, Champion Spotlight (inspirasi nmss.gg), & Hadiah
  const rk = d.ringkas || {};
  $$('[data-juara]').forEach((el) => { const n = rk[`juara${el.dataset.juara}`]; el.textContent = n ? n : '–'; });
  if ($('[data-hadiah]')) $('[data-hadiah]').textContent = R9.rupiah(rk.totalHadiah) || R9.t('hadiah.kosong');

  const wadahChampion = $('[data-champion-wadah]');
  if (wadahChampion) {
    const juaraUtama = (d.prestasi || []).find((p) => p.juara === 1) || (d.prestasi || [])[0];
    if (juaraUtama) {
      wadahChampion.innerHTML = `<button type="button" class="kartu-champion" data-buka-prestasi="${idAman(juaraUtama.id)}">
        <span class="kartu-champion__lencana">🏆 ${esc(R9.teks(juaraUtama.peringkat))}</span>
        <span class="kartu-champion__info">
          <span class="kartu-champion__judul">${esc(R9.teks(juaraUtama.turnamen))}</span>
          <span class="kartu-champion__sub">${esc([juaraUtama.divisi || 'Honor of Kings', R9.tanggal(juaraUtama.tanggal, { month: 'long', year: 'numeric' })].filter(Boolean).join(' · '))}</span>
        </span>
        <span class="kartu-champion__aksi">${esc(R9.t('prestasi.detail'))}</span>
      </button>`;
    } else {
      wadahChampion.innerHTML = '';
    }
  }

  // 2. Statistik Wilayah & Bendera (Seluruh anggota aktif & management)
  const semuaAktif = d.pemain?.aktif || [];
  const aktif = semuaAktif.filter((p) => !apakahManagement(p));
  const nonaktif = d.pemain?.nonaktif || [];
  const mentahManagement = [
    ...(d.pemain?.management || []),
    ...(d.pemain?.kompetitif || []),
    ...semuaAktif.filter((p) => apakahManagement(p)),
  ];
  const idManagement = new Set();
  const management = mentahManagement.filter((p) => {
    const kunci = String(p.id || p.nickname || '');
    if (idManagement.has(kunci)) return false;
    idManagement.add(kunci);
    return true;
  });
  const anggotaAktifTotal = [...aktif, ...management];
  const hitungNegara = {};
  anggotaAktifTotal.forEach((p) => {
    const neg = (p.negara || 'ID').toUpperCase();
    hitungNegara[neg] = (hitungNegara[neg] || 0) + 1;
  });
  const daftarNegara = Object.keys(hitungNegara);
  const elBenderaWilayah = $('[data-wilayah-bendera]');
  if (elBenderaWilayah) {
    elBenderaWilayah.innerHTML = (daftarNegara.length ? daftarNegara : ['ID', 'MY', 'CN'])
      .map((kode) => BENDERA[kode] || '')
      .join('');
  }
  if ($('[data-hitung-negara]')) {
    $('[data-hitung-negara]').innerHTML = anggotaAktifTotal.length
      ? `<span>${anggotaAktifTotal.length} ${esc(R9.t('roster.pemain'))}</span>` +
        Object.entries(hitungNegara)
          .map(([k, v]) => `<span class="wilayah__negara-item">${BENDERA[k] || ''} ${esc(R9.t(`negara.${k}`))} (${v})</span>`)
          .join('')
      : '';
  }

  // Kelompokkan tim/divisi untuk 3 Kategori: Active Squads, Non-Active Squads, & Management
  const grupAktif = kelompokkanTim(aktif, 'aktif');
  const grupNonaktif = kelompokkanTim(nonaktif, 'nonaktif');
  const grupManagement = kelompokkanTim(management, 'management');

  // LEVEL 1: Render 3 Tombol Kategori Utama (Active Squads, Non-Active Squads, & Management)
  const elKategori = $('[data-roster-kategori]');
  if (elKategori) {
    elKategori.innerHTML = `
      <button type="button" class="kartu-kategori" data-pilih-kategori="aktif" aria-pressed="${kategoriTerpilih === 'aktif'}">
        <div class="kartu-kategori__atas">
          <span class="kartu-kategori__judul"><span class="titik-status"></span>${esc(R9.t('roster.kategori.aktif'))}</span>
          <span class="kartu-kategori__lencana">${grupAktif.size} ${esc(R9.t('roster.tim'))} · ${aktif.length} ${esc(R9.t('roster.pemain'))}</span>
        </div>
        <p class="kartu-kategori__sub">${esc(R9.t('roster.kategori.aktifSub'))}</p>
      </button>
      <button type="button" class="kartu-kategori" data-pilih-kategori="nonaktif" aria-pressed="${kategoriTerpilih === 'nonaktif'}">
        <div class="kartu-kategori__atas">
          <span class="kartu-kategori__judul"><span class="titik-status titik-status--sejarah"></span>${esc(R9.t('roster.kategori.nonaktif'))}</span>
          <span class="kartu-kategori__lencana">${grupNonaktif.size} ${esc(R9.t('roster.tim'))} · ${nonaktif.length} ${esc(R9.t('roster.pemain'))}</span>
        </div>
        <p class="kartu-kategori__sub">${esc(R9.t('roster.kategori.nonaktifSub'))}</p>
      </button>
      <button type="button" class="kartu-kategori" data-pilih-kategori="management" aria-pressed="${kategoriTerpilih === 'management'}">
        <div class="kartu-kategori__atas">
          <span class="kartu-kategori__judul"><span class="titik-status titik-status--kompetitif"></span>${esc(R9.t('roster.kategori.management'))}</span>
          <span class="kartu-kategori__lencana">${grupManagement.size} ${esc(R9.t('roster.unit'))} · ${management.length} ${esc(R9.t('roster.pemain'))}</span>
        </div>
        <p class="kartu-kategori__sub">${esc(R9.t('roster.kategori.managementSub'))}</p>
      </button>
    `;
  }

  // LEVEL 2: Render Daftar Nama Tim / Divisi (HANYA muncul jika salah satu kategori diklik!)
  const elTimWadah = $('[data-roster-tim-wadah]');
  const elWadahAnggota = $('[data-roster-wadah]');
  const elPetunjuk = $('[data-roster-petunjuk]');

  if (elTimWadah && elWadahAnggota && elPetunjuk) {
    if (!kategoriTerpilih) {
      elTimWadah.hidden = true;
      elTimWadah.innerHTML = '';
      elWadahAnggota.hidden = true;
      elWadahAnggota.innerHTML = '';
      elPetunjuk.hidden = false;
      elPetunjuk.textContent = R9.t('roster.pilihKategori');
    } else {
      const mapSekarang = kategoriTerpilih === 'aktif'
        ? grupAktif
        : kategoriTerpilih === 'management'
          ? grupManagement
          : grupNonaktif;
      const daftarNamaTim = [...mapSekarang.keys()];
      if (timTerpilih && !mapSekarang.has(timTerpilih)) timTerpilih = null;

      elTimWadah.hidden = false;
      if (!daftarNamaTim.length) {
        elTimWadah.innerHTML = `<p class="kosong">${esc(R9.t('roster.kosong'))}</p>`;
        elWadahAnggota.hidden = true;
        elPetunjuk.hidden = true;
      } else {
        elTimWadah.innerHTML = `<div class="roster__tim-daftar" role="group">
          ${daftarNamaTim.map((nama) => {
            const anggota = mapSekarang.get(nama) || [];
            const label = R9.t(`kelompok.${nama}`) !== `kelompok.${nama}` ? R9.t(`kelompok.${nama}`) : nama;
            const desk = R9.t(`deskripsiTim.${nama}`) !== `deskripsiTim.${nama}` ? R9.t(`deskripsiTim.${nama}`) : '';
            const negaraUnik = [...new Set(anggota.map((p) => (p.negara || 'ID').toUpperCase()))];
            return `<button type="button" class="kartu-tim" data-pilih-tim="${esc(nama)}" aria-pressed="${timTerpilih === nama}">
              <div class="kartu-tim__atas">
                <span class="kartu-tim__nama">${esc(label)}</span>
                <span class="kartu-tim__jumlah">${anggota.length} ${esc(R9.t('roster.pemain'))}</span>
              </div>
              ${desk ? `<p class="kartu-tim__sub">${esc(desk)}</p>` : ''}
              ${negaraUnik.length ? `<div class="kartu-tim__bendera">${negaraUnik.map((k) => BENDERA[k] || '').join('')}</div>` : ''}
            </button>`;
          }).join('')}
        </div>`;

        // LEVEL 3: Render Daftar Anggota (HANYA muncul ketika nama tim / divisi diklik!)
        if (!timTerpilih) {
          elWadahAnggota.hidden = true;
          elWadahAnggota.innerHTML = '';
          elPetunjuk.hidden = false;
          elPetunjuk.textContent = R9.t('roster.pilihTim');
        } else {
          elPetunjuk.hidden = true;
          elWadahAnggota.hidden = false;
          const anggota = mapSekarang.get(timTerpilih) || [];
          const label = R9.t(`kelompok.${timTerpilih}`) !== `kelompok.${timTerpilih}` ? R9.t(`kelompok.${timTerpilih}`) : timTerpilih;
          elWadahAnggota.innerHTML = `<section class="kelompok-roster" aria-label="${esc(label)}">
            <div class="kelompok-roster__kepala">
              <h3 class="kelompok-roster__judul">${esc(label)}</h3>
              <span class="kelompok-roster__jumlah">${anggota.length} ${esc(R9.t('roster.pemain'))}</span>
            </div>
            ${anggota.length
              ? `<ul class="roster__grid">${anggota.map(renderKartuPemain).join('')}</ul>`
              : `<p class="kosong">${esc(R9.t('roster.kosong'))}</p>`}
          </section>`;
          aktifkanIxarKartu(elWadahAnggota);
        }
      }
    }
  }

  // 3. Jadwal Event & Prestasi
  const kartuEvent = (v) => `<li class="event">
    <div class="event__tgl"><b>${new Date(`${v.mulai}T00:00:00`).getDate()}</b><span>${esc(R9.tanggal(v.mulai, { month: 'short', year: '2-digit' }))}</span></div>
    <div>
      <p class="event__nama">${esc(R9.teks(v.nama))} ${v.skor ? `<span class="event__skor">${esc(v.skor)}</span>` : ''}</p>
      <p class="event__meta">${esc([R9.t(`jenis.${v.jenis}`), R9.teks(v.tempat), v.selesai && v.selesai !== v.mulai ? `${R9.tanggal(v.mulai)} – ${R9.tanggal(v.selesai)}` : ''].filter(Boolean).join(' · '))}</p>
      ${R9.teks(v.keterangan) ? `<p>${esc(R9.teks(v.keterangan))}</p>` : ''}
      ${R9.teks(v.hasil) || v.hadiah ? `<p class="event__meta">${R9.teks(v.hasil) ? `${esc(R9.t('jadwal.hasil'))}: <strong>${esc(R9.teks(v.hasil))}</strong>` : ''}${v.hadiah ? ` · ${esc(R9.t('jadwal.hadiah'))}: <strong>${esc(R9.rupiah(v.hadiah))}</strong>` : ''}</p>` : ''}
      ${(tautanAman(v.link) || tautanAman(v.stream)) ? `<div class="event__aksi">
        ${tautanAman(v.link) ? `<a href="${esc(tautanAman(v.link))}" target="_blank" rel="noopener">${esc(R9.t('jadwal.daftar'))}</a>` : ''}
        ${tautanAman(v.stream) ? `<a href="${esc(tautanAman(v.stream))}" target="_blank" rel="noopener">▶ ${esc(R9.t('jadwal.tonton'))}</a>` : ''}
      </div>` : ''}
    </div>
  </li>`;

  const ev = d.event || [], akan = ev.filter((v) => (v.selesai || v.mulai) >= hariIni()), lewat = ev.filter((v) => (v.selesai || v.mulai) < hariIni()).reverse();
  if ($('[data-event-akan]')) $('[data-event-akan]').innerHTML = akan.map(kartuEvent).join('');
  if ($('[data-event-kosong]')) $('[data-event-kosong]').hidden = akan.length > 0;
  if ($('[data-event-lewat]')) $('[data-event-lewat]').innerHTML = lewat.slice(0, 8).map(kartuEvent).join('');
  if ($('[data-event-lewat-judul]')) $('[data-event-lewat-judul]').hidden = !lewat.length;

  if ($('[data-prestasi]')) {
    $('[data-prestasi]').innerHTML = (d.prestasi || []).map((p) => `<li>
      <button type="button" class="prestasi" data-buka-prestasi="${idAman(p.id)}">
        <span class="prestasi__lencana">🏆 ${esc(R9.teks(p.peringkat))}</span>
        <span class="prestasi__nama">${esc(R9.teks(p.turnamen))}<small>${esc([R9.tanggal(p.tanggal), p.divisi].filter(Boolean).join(' · '))}</small></span>
        <span class="prestasi__kanan">
          ${p.hadiah ? `<span class="prestasi__hadiah">${esc(R9.rupiah(p.hadiah))}</span>` : ''}
          <span class="prestasi__detail">${esc(R9.t('prestasi.detail'))}</span>
        </span>
      </button>
    </li>`).join('');
  }

  // 4. News (Redirect ke halaman khusus news.html, bukan popup)
  const news = (d.news || []).slice().sort((a, b) => (b.tanggal > a.tanggal ? 1 : -1));
  if ($('[data-news-kosong]')) $('[data-news-kosong]').hidden = news.length > 0;
  if ($('[data-news]')) {
    $('[data-news]').innerHTML = news.slice(0, newsTampil).map(renderKartuBerita).join('');
  }
  if ($('[data-news-lebih]')) $('[data-news-lebih]').hidden = news.length <= newsTampil;
}

// Event Listener Level 1: Klik Active Squads / Non-Active Squads / Management
$('[data-roster-kategori]')?.addEventListener('click', (e) => {
  const b = e.target.closest('[data-pilih-kategori]');
  if (!b) return;
  const kat = b.dataset.pilihKategori;
  if (kategoriTerpilih === kat) {
    kategoriTerpilih = null;
    timTerpilih = null;
  } else {
    kategoriTerpilih = kat;
    timTerpilih = null;
  }
  gambarData();
});

// Event Listener Level 2: Klik Nama Tim / Divisi
$('[data-roster-tim-wadah]')?.addEventListener('click', (e) => {
  const b = e.target.closest('[data-pilih-tim]');
  if (!b) return;
  const tim = b.dataset.pilihTim;
  timTerpilih = timTerpilih === tim ? null : tim;
  gambarData();
});

$('[data-news-lebih]')?.addEventListener('click', () => { newsTampil += 6; gambarData(); });

// Buka Popup Detail Prestasi (Konsep modal dokumentasi khusus Prestasi)
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-buka-prestasi]');
  if (!b) return;
  const p = (DATA?.prestasi || []).find((x) => String(x.id) === b.dataset.bukaPrestasi);
  if (!p) return;
  const dlg = $('[data-baca]');
  if (!dlg) return;
  const img = $('.baca__gambar', dlg), visual = $('[data-baca-visual]', dlg);
  const lencana = $('[data-baca-lencana]', dlg), meta = $('[data-baca-meta]', dlg);
  const peringkat = R9.teks(p.peringkat), turnamen = R9.teks(p.turnamen);
  if (p.gambar) {
    img.hidden = false;
    img.src = urlMedia(p.gambar);
    if (visual) { visual.hidden = true; visual.innerHTML = ''; }
  } else {
    img.hidden = true;
    if (visual) {
      visual.hidden = false;
      visual.innerHTML = `<div class="baca__visual-isi">
        <svg class="baca__visual-piala" viewBox="0 0 64 64" aria-hidden="true"><path d="M18 6h28v6h10v8c0 8-6 14-13 15-2 5-5 8-9 9v8h10v6H20v-6h10v-8c-4-1-7-4-9-9C14 34 8 28 8 20v-8h10zm-4 12v2c0 4 2 7 5 8-1-3-1-6-1-10zm36 0h-4c0 4 0 7-1 10 3-1 5-4 5-8z" fill="currentColor"/></svg>
        <span class="baca__visual-peringkat">🏆 ${esc(peringkat)}</span>
        <strong class="baca__visual-judul">${esc(turnamen)}</strong>
      </div>`;
    }
  }
  if (lencana) { lencana.hidden = false; lencana.textContent = `🏆 ${peringkat}`; }
  $('.baca__tanggal', dlg).textContent = R9.tanggal(p.tanggal);
  $('.baca__judul', dlg).textContent = turnamen;
  if (meta) {
    meta.hidden = false;
    meta.innerHTML = `
      <span>${esc(R9.t('prestasi.divisi'))}: ${esc(p.divisi || 'Honor of Kings')}</span>
      <span>${esc(R9.t('prestasi.hadiahLabel'))}: ${esc(p.hadiah ? R9.rupiah(p.hadiah) : R9.t('prestasi.penghargaan'))}</span>
    `;
  }
  const cerita = R9.teks(p.keterangan);
  $('.baca__isi', dlg).textContent = cerita || R9.t('prestasi.ceritaDefault');
  dlg.showModal();
  window.R9IxarUtama?.peragakanPose('menang', 2600);
});
document.addEventListener('r9:bahasa', gambarData);
gambarData();

// Sinkronisasi data live dari admin.reign9.site/api/publik (fallback ke data/reign9.json)
(async () => {
  let urutan = 0, terakhir = '';
  const segarkan = async () => {
    const permintaan = ++urutan;
    const d = await ambilDataLive();
    if (d && permintaan === urutan && (!d.diperbarui || d.diperbarui !== terakhir)) {
      terakhir = d.diperbarui;
      DATA = d;
      gambarData();
    }
  };
  await segarkan();
  // langsung tayang: admin ngirim sinyal tiap ada yang disimpan/diunggah → data diambil saat itu juga (cadangan: cek tiap 15 dtk)
  try {
    const sinyal = new EventSource(`${ADMIN}/api/langsung`);
    sinyal.addEventListener('open', () => segarkan());
    sinyal.addEventListener('berubah', () => segarkan());
  } catch (e) { /* peramban tanpa EventSource: cukup cek berkala */ }
  setInterval(() => { if (!document.hidden) segarkan(); }, 15000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) segarkan(); });
})();

// ---------- pembuat banner (Font Reign9Display) ----------
(() => {
  const kanvas = $('.banner__kanvas');
  if (!kanvas) return;
  const c = kanvas.getContext('2d'), isian = $('[name=nama-banner]'), subIsian = $('[name=sub-banner]'), gambar = {};
  const muat = n => {
    const file=getComputedStyle(document.getElementById('banner-foto-'+n)).getPropertyValue('--r9-foto').trim();
    const url=window.R9Desain.mediaPath.test('/media/'+file)?ADMIN+'/media/'+file:`gambar/banner/banner-${n}.jpg`;
    return gambar[url] ||= new Promise(ok=>{const img=new Image();img.crossOrigin='anonymous';img.onload=()=>ok(img);img.onerror=()=>{delete gambar[url];ok(null);};img.src=url;});
  };
  const lukis = async () => {
    const n = $('[name=banner]:checked').value, img = await muat(n);
    c.clearRect(0, 0, 1500, 500);
    if (img) c.drawImage(img, 0, 0, 1500, 500); else { c.fillStyle = '#000'; c.fillRect(0, 0, 1500, 500); }
    const nama = isian.value.trim();
    const sub = subIsian ? subIsian.value.trim() : '';
    if (!nama && !sub) return;
    await document.fonts.load('700 80px Reign9Display').catch(() => {});
    const g = c.createLinearGradient(700, 310, 1500, 500); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.65)');
    c.fillStyle = g; c.fillRect(700, 310, 800, 190);
    c.textAlign = 'right'; c.textBaseline = 'alphabetic';
    c.shadowColor = 'rgba(0,0,0,.7)'; c.shadowBlur = 18;
    if (nama) {
      let uk = 88; c.font = `700 ${uk}px Reign9Display, Reign9Display, Oxanium, sans-serif`;
      while (c.measureText(nama.toUpperCase()).width > 760 && uk > 34) { uk -= 4; c.font = `700 ${uk}px Reign9Display, Reign9Display, Oxanium, sans-serif`; }
      c.fillStyle = '#fff';
      c.fillText(nama.toUpperCase(), 1450, sub ? 430 : 455);
    }
    if (sub) {
      c.font = '700 24px Reign9Display, Reign9Display, Oxanium, sans-serif';
      c.fillStyle = '#ff3b26';
      c.fillText(sub.toUpperCase(), 1450, 468);
    }
    c.shadowBlur = 0;
  };
  document.addEventListener('r9:desain',lukis);
  $$('[name=banner]').forEach((r) => r.addEventListener('change', lukis));
  isian.addEventListener('input', lukis);
  subIsian?.addEventListener('input', lukis);
  $('[data-unduh]').addEventListener('click', async () => {
    await lukis();
    const a = document.createElement('a');
    a.download = `reign9-banner-${(isian.value.trim() || 'r9').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    a.href = kanvas.toDataURL('image/png'); a.click();
  });
  lukis();
})();

// ---------- contact ----------
(() => {
  const form = $('.kontak__form'), info = $('.kontak__info');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.nama.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) || !d.pesan.trim()) {
      info.textContent = R9.t('kontak.lengkapi');
      window.R9IxarUtama?.peragakanPose('kaget', 1200);
      return;
    }
    const tombol = $('button[type=submit]', form); tombol.disabled = true;
    try {
      const r = await fetch(`${ADMIN}/api/kontak`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, bahasa: R9.bahasa }) });
      if (!r.ok) throw new Error();
      info.textContent = R9.t('kontak.terkirim'); form.reset(); window.R9IxarUtama?.peragakanPose('menang', 2200);
    } catch (err) {
      info.textContent = R9.t('kontak.gagal');
      location.href = `mailto:reign9intl@reign9.site?cc=reignnine2@gmail.com&subject=${encodeURIComponent(`[R9 Contact] ${d.keperluan} - ${d.nama}`)}&body=${encodeURIComponent(`${d.pesan}\n\n${d.nama} <${d.email}>`)}`;
    } finally { tombol.disabled = false; }
  });
})();

// ---------- generator foto profil: IXAR (pose beku dari mesin IXAR) + latar + item, persegi 1080 ----------
// IXAR digambar langsung ke kanvas dari bentuk vektornya (bukan lewat gambar SVG), jadi bisa diunduh di semua peramban.
(() => {
  const kanvas = $('.pfp__kanvas'), ixEl = $('[data-pfp-ixar]');
  if (!kanvas || !ixEl) return;
  const c = kanvas.getContext('2d'), S = 1080, isian = $('[name=nama-pfp]');
  const MERAH = '#DA1617', PUTIH = '#FFFFFF', HITAM = '#0B0102', NS = 'http://www.w3.org/2000/svg';
  const LATAR = ['bara', 'kastil', 'merah', 'hitam', 'putih', 'pink', 'arena', 'kilat', 'catur', 'panji'];
  const POSE = ['diam', 'nyambut', 'pedang', 'tonjok', 'menang', 'tameng', 'meditasi', 'marah', 'penasaran', 'bendera', 'duduk', 'ngegame', 'rebahan', 'tidur'];
  const WARNA = { hitam: [HITAM, PUTIH], putih: [PUTIH, HITAM], merah: [MERAH, HITAM] }; // [badan, mata]
  const ITEM = ['kursi', 'hp', 'hammock', 'kacamata', 'headset', 'rokok', 'tongkat', 'pedang', 'syal', 'medali', 'mic'];
  const pilih = { latar: 'bara', pose: 'diam', warna: 'hitam', item: new Set(['headset']) };

  // ---- aturan otomatis: kursi = duduk, HP gaming = ngegame, hammock = tiduran ----
  const poseRig = () => {
    const it = pilih.item;
    if (it.has('hammock')) return it.has('hp') ? 'rebahan' : 'tidur';
    if (it.has('kursi')) return it.has('hp') || pilih.pose === 'ngegame' ? 'dudukMain' : 'duduk';
    if (it.has('hp') || pilih.pose === 'ngegame') return 'roster';
    return pilih.pose === 'duduk' ? 'selonjor' : pilih.pose;
  };
  const poseDariItem = () => {
    const it = pilih.item;
    if (it.has('hammock')) pilih.pose = it.has('hp') ? 'rebahan' : 'tidur';
    else if (it.has('kursi')) pilih.pose = it.has('hp') ? 'ngegame' : 'duduk';
    else if (it.has('hp')) pilih.pose = 'ngegame';
  };
  const aturItem = (v) => {
    const it = pilih.item;
    if (it.has(v)) { it.delete(v); if (['kursi', 'hammock', 'hp'].includes(v) && ['duduk', 'ngegame', 'rebahan', 'tidur'].includes(pilih.pose)) pilih.pose = 'diam'; }
    else { it.add(v); if (v === 'kursi') it.delete('hammock'); if (v === 'hammock') it.delete('kursi'); }
    poseDariItem();
  };
  const aturPose = (v) => {
    pilih.pose = v;
    const it = pilih.item;
    if (v !== 'duduk' && v !== 'ngegame') it.delete('kursi');
    if (v !== 'rebahan' && v !== 'tidur') it.delete('hammock');
    if (v !== 'ngegame' && !(v === 'rebahan' && it.has('hammock'))) it.delete('hp');
    if (v === 'ngegame') it.add('hp');
  };

  // ---- latar (semua digambar sendiri, ukuran berapa pun: dipakai juga buat gambar kecil di pilihan) ----
  function lukisLatar(x, nama, uk = S) {
    x.save(); x.scale(uk / S, uk / S);
    const isi = (w) => { x.fillStyle = w; x.fillRect(0, 0, S, S); };
    if (nama === 'hitam') isi(HITAM);
    else if (nama === 'putih') isi(PUTIH);
    else if (nama === 'pink') isi('#FFC2CF');
    else if (nama === 'merah') {
      isi('#A80309'); x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 18;
      for (let i = -S; i < S * 2; i += 90) { x.beginPath(); x.moveTo(i, S); x.lineTo(i + S, 0); x.stroke(); }
    } else if (nama === 'kastil') {
      const g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, '#22040A'); g.addColorStop(1, '#050101'); isi(g);
      x.fillStyle = '#3A050A'; const dasar = S * .9;
      [[60, 140, 330], [240, 170, 420], [440, 200, 520], [680, 170, 420], [870, 150, 330]].forEach(([a, l, t]) => { x.fillRect(a, dasar - t, l, t); for (let i = 0; i < l; i += 34) x.fillRect(a + i, dasar - t - 24, 17, 24); });
      x.fillRect(0, dasar - 150, S, 150 + S * .1);
    } else if (nama === 'arena') {
      isi('#050101');
      const g = x.createRadialGradient(S / 2, 0, 20, S / 2, 0, S * .95); g.addColorStop(0, 'rgba(255,255,255,.28)'); g.addColorStop(.35, 'rgba(218,22,23,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); isi(g);
      x.beginPath(); x.ellipse(S / 2, S * .88, S * .42, S * .07, 0, 0, Math.PI * 2); x.lineWidth = 6; x.strokeStyle = MERAH; x.shadowColor = MERAH; x.shadowBlur = 30; x.stroke(); x.shadowBlur = 0;
    } else if (nama === 'kilat') {
      isi('#7A0A10'); x.fillStyle = '#A80309'; const cx = S / 2, cy = S * .45;
      for (let i = 0; i < 24; i += 2) { const a = (i / 24) * Math.PI * 2, b = ((i + 1) / 24) * Math.PI * 2; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * S * 1.2, cy + Math.sin(a) * S * 1.2); x.lineTo(cx + Math.cos(b) * S * 1.2, cy + Math.sin(b) * S * 1.2); x.fill(); }
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, S * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); isi(g);
    } else if (nama === 'catur') {
      const k = S / 8; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? '#3A050A' : HITAM; x.fillRect(i * k, j * k, k, k); }
      const g = x.createRadialGradient(S / 2, S / 2, S * .2, S / 2, S / 2, S * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.7)'); isi(g);
    } else if (nama === 'panji') {
      const g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, '#22040A'); g.addColorStop(1, HITAM); isi(g);
      x.fillStyle = '#3A050A'; x.fillRect(0, 40, S, 16);
      [[90, 330], [380, 420], [700, 330]].forEach(([a, t]) => {
        x.fillStyle = '#A80309'; x.beginPath(); x.moveTo(a, 56); x.lineTo(a + 290, 56); x.lineTo(a + 290, t); x.lineTo(a + 145, t - 60); x.lineTo(a, t); x.closePath(); x.fill();
        x.fillStyle = 'rgba(0,0,0,.35)'; x.font = `800 120px Reign9Display, Oxanium, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('R9', a + 145, (56 + t - 60) / 2 + 20);
      });
    } else { // bara
      const g = x.createRadialGradient(S / 2, S * .55, 40, S / 2, S * .55, S * .75); g.addColorStop(0, '#7A0A10'); g.addColorStop(.6, '#2A0306'); g.addColorStop(1, '#050101'); isi(g);
      for (let i = 0; i < 260; i++) { const r = (i % 4) + 1; x.globalAlpha = .25 + (i % 5) / 8; x.fillStyle = i % 7 ? MERAH : '#FFD6D6'; x.fillRect((i * 197) % S, (i * 389) % S, r * 2, r * 2); }
      x.globalAlpha = 1;
    }
    x.restore();
  }

  // ---- penggambar SVG → kanvas (path, circle, ellipse, rect, line, text; transform, opacity, warna hasil CSS) ----
  const angka = (v) => parseFloat(v) || 0;
  const warnaCss = (v) => (v && v !== 'none' && !v.startsWith('url(') ? v : null);
  function gambarSvg(x, el, alfa) {
    const tag = el.tagName.toLowerCase();
    if (['defs', 'style', 'pattern', 'animate', 'title', 'use'].includes(tag)) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const a = alfa * (tag === 'svg' ? 1 : Number(cs.opacity || 1));
    if (a < .01) return;
    x.save();
    const m = el.transform?.baseVal?.consolidate?.()?.matrix; if (m) x.transform(m.a, m.b, m.c, m.d, m.e, m.f);
    if (tag === 'g' || tag === 'svg') { for (const anak of el.children) gambarSvg(x, anak, a); x.restore(); return; }
    const at = (n) => angka(el.getAttribute(n));
    const isi = warnaCss(cs.fill), garis = warnaCss(cs.stroke), tebal = angka(cs.strokeWidth);
    if (tag === 'text') {
      if (isi) { x.font = `${cs.fontWeight} ${angka(cs.fontSize)}px ${cs.fontFamily}`; x.textAlign = { middle: 'center', end: 'right' }[cs.textAnchor] || 'left'; x.textBaseline = 'alphabetic'; x.globalAlpha = a * Number(cs.fillOpacity || 1); x.fillStyle = isi; x.fillText(el.textContent, at('x'), at('y')); }
      x.restore(); return;
    }
    let j = null;
    if (tag === 'path') j = new Path2D(el.getAttribute('d') || '');
    else if (tag === 'circle') { j = new Path2D(); j.arc(at('cx'), at('cy'), at('r'), 0, Math.PI * 2); }
    else if (tag === 'ellipse') { j = new Path2D(); j.ellipse(at('cx'), at('cy'), at('rx'), at('ry'), 0, 0, Math.PI * 2); }
    else if (tag === 'rect') { j = new Path2D(); const r = at('rx'); if (r && j.roundRect) j.roundRect(at('x'), at('y'), at('width'), at('height'), r); else j.rect(at('x'), at('y'), at('width'), at('height')); }
    else if (tag === 'line') { j = new Path2D(); j.moveTo(at('x1'), at('y1')); j.lineTo(at('x2'), at('y2')); }
    if (j) {
      if (isi) { x.globalAlpha = a * Number(cs.fillOpacity || 1); x.fillStyle = isi; x.fill(j, cs.fillRule === 'evenodd' ? 'evenodd' : 'nonzero'); }
      if (garis && tebal > 0) { x.globalAlpha = a * Number(cs.strokeOpacity || 1); x.strokeStyle = garis; x.lineWidth = tebal; x.lineCap = cs.strokeLinecap; x.lineJoin = cs.strokeLinejoin; x.stroke(j); }
    }
    x.restore();
  }
  // kotak batas beberapa elemen, dalam koordinat svg IXAR
  function kotakSvg(svg, els) {
    const r0 = svg.getBoundingClientRect(), k = 820 / r0.width; let a = [Infinity, Infinity, -Infinity, -Infinity];
    els.forEach((e) => { const r = e.getBoundingClientRect(); if (!r.width && !r.height) return; a = [Math.min(a[0], r.left), Math.min(a[1], r.top), Math.max(a[2], r.right), Math.max(a[3], r.bottom)]; });
    return { x: 360 + (a[0] - r0.left) * k, y: -40 + (a[1] - r0.top) * k, w: (a[2] - a[0]) * k, h: (a[3] - a[1]) * k };
  }

  // ---- item: elemen SVG yang ditempel ke rig (koordinat kepala: mata x 604–696 & 838–930, y 300–439) ----
  const bikin = (tag, at, induk) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (induk) induk.append(e); return e; };
  function pasangItem(nama, ix, tangan, badan, kontras, pose) {
    const akar = ix.akar, kepala = ix.kepala, aksen = badan === MERAH ? HITAM : MERAH;
    if (nama === 'kacamata') {
      const g = bikin('g', { stroke: kontras, 'stroke-width': 14, 'stroke-linejoin': 'round' }, kepala);
      [577, 811].forEach((x) => bikin('rect', { x, y: 312, width: 146, height: 116, rx: 26, fill: HITAM }, g));
      bikin('path', { d: 'M723 360H811M577 352L496 338M957 352L1038 338', fill: 'none' }, g);
      bikin('path', { d: 'M603 342L640 390M837 342L874 390', fill: 'none', 'stroke-width': 10, opacity: .55 }, g);
      return g;
    }
    if (nama === 'headset') {
      const g = bikin('g', {}, kepala);
      bikin('path', { d: 'M474 400C452 120 1082 120 1060 400', fill: 'none', stroke: aksen, 'stroke-width': 34, 'stroke-linecap': 'round' }, g);
      bikin('rect', { x: 434, y: 318, width: 70, height: 150, rx: 26, fill: aksen, stroke: kontras, 'stroke-width': 8 }, g);
      bikin('rect', { x: 1030, y: 318, width: 70, height: 150, rx: 26, fill: aksen, stroke: kontras, 'stroke-width': 8 }, g);
      bikin('path', { d: 'M1066 460Q1060 560 950 580', fill: 'none', stroke: kontras, 'stroke-width': 12, 'stroke-linecap': 'round' }, g);
      bikin('circle', { cx: 944, cy: 582, r: 20, fill: kontras }, g);
      return g;
    }
    if (nama === 'rokok') {
      const g = bikin('g', { 'stroke-linecap': 'round', fill: 'none' }, kepala);
      bikin('path', { d: 'M880 540L1010 512', stroke: PUTIH, 'stroke-width': 26 }, g);
      bikin('path', { d: 'M992 516L1012 512', stroke: MERAH, 'stroke-width': 26 }, g);
      bikin('path', { d: 'M1028 492Q1060 450 1030 400T1060 320', stroke: '#D8D8D8', 'stroke-width': 10, opacity: .6 }, g);
      return g;
    }
    if (nama === 'syal') {
      const g = bikin('g', { fill: 'none', stroke: aksen, 'stroke-linecap': 'round' }, akar);
      bikin('path', { d: 'M660 596Q768 650 876 596', 'stroke-width': 50 }, g);
      bikin('path', { d: 'M850 620Q890 700 846 800', 'stroke-width': 42 }, g);
      bikin('path', { d: 'M866 660Q884 710 866 760', stroke: kontras, 'stroke-width': 6 }, g);
      return g;
    }
    if (nama === 'medali') {
      const g = bikin('g', { fill: 'none' }, akar);
      bikin('path', { d: 'M728 610L768 700', stroke: MERAH, 'stroke-width': 20 }, g);
      bikin('path', { d: 'M808 610L768 700', stroke: PUTIH, 'stroke-width': 20 }, g);
      bikin('circle', { cx: 768, cy: 736, r: 48, fill: PUTIH, stroke: MERAH, 'stroke-width': 10 }, g);
      const t = bikin('text', { x: 768, y: 752, 'text-anchor': 'middle', fill: MERAH, 'font-size': 44, 'font-weight': 800, 'font-family': 'Reign9Display, Oxanium, sans-serif' }, g); t.textContent = 'R9';
      return g;
    }
    if (nama === 'tongkat') {
      const [x, y] = tangan.kanan.titik, g = bikin('g', {}, akar);
      bikin('path', { d: `M${x} ${y - 360}V${y + 290}`, stroke: kontras, 'stroke-width': 22, 'stroke-linecap': 'round' }, g);
      bikin('circle', { cx: x, cy: y - 380, r: 46, fill: MERAH, stroke: kontras, 'stroke-width': 10 }, g);
      return g;
    }
    if (nama === 'mic') {
      const ke = tangan.kiri, [x, y] = ke.titik, g = bikin('g', { transform: `translate(${x} ${y}) rotate(${-ke.sudut + 90})` }, akar);
      bikin('rect', { x: -15, y: -20, width: 30, height: 130, rx: 10, fill: HITAM, stroke: kontras, 'stroke-width': 6 }, g);
      bikin('circle', { cx: 0, cy: -50, r: 40, fill: MERAH, stroke: kontras, 'stroke-width': 8 }, g);
      return g;
    }
    if (nama === 'pedang') { // pedang Reign asli dari rig, di tangan kiri
      const p = ix.alat.pedang.cloneNode(true), ke = tangan.kiri;
      p.style.opacity = 1; p.setAttribute('transform', `translate(${ke.titik[0]} ${ke.titik[1]}) rotate(${-ke.sudut})`); p.setAttribute('fill', aksen);
      akar.append(p); return p;
    }
    if (nama === 'hp' && !['roster', 'dudukMain'].includes(pose)) { // HP di tangan kanan (pose tanpa konsol bawaan)
      const ke = tangan.kanan, [x, y] = ke.titik, g = bikin('g', { transform: `translate(${x} ${y}) rotate(${-ke.sudut + 90})` }, akar);
      bikin('rect', { x: -70, y: -40, width: 140, height: 80, rx: 16, fill: HITAM, stroke: aksen, 'stroke-width': 10 }, g);
      bikin('rect', { x: -44, y: -26, width: 88, height: 52, rx: 6, fill: aksen, opacity: .8 }, g);
      return g;
    }
    if (nama === 'kursi') { // kursi gaming di belakang badan (koordinat badan, ikut turun pas duduk)
      const g = bikin('g', {}); akar.prepend(g);
      bikin('rect', { x: 604, y: 560, width: 328, height: 262, rx: 44, fill: aksen, stroke: kontras, 'stroke-width': 8 }, g);
      bikin('path', { d: 'M672 600V800M864 600V800', stroke: kontras, 'stroke-width': 10, opacity: .45, fill: 'none' }, g);
      bikin('rect', { x: 560, y: 724, width: 74, height: 26, rx: 12, fill: aksen, stroke: kontras, 'stroke-width': 6 }, g);
      bikin('rect', { x: 902, y: 724, width: 74, height: 26, rx: 12, fill: aksen, stroke: kontras, 'stroke-width': 6 }, g);
      bikin('rect', { x: 618, y: 792, width: 300, height: 48, rx: 20, fill: aksen, stroke: kontras, 'stroke-width': 8 }, g);
      bikin('rect', { x: 756, y: 840, width: 24, height: 40, fill: kontras }, g);
      bikin('path', { d: 'M676 892L768 874L860 892', fill: 'none', stroke: kontras, 'stroke-width': 14, 'stroke-linecap': 'round' }, g);
      [676, 768, 860].forEach((x) => bikin('circle', { cx: x, cy: 894, r: 10, fill: kontras }, g));
      return g;
    }
    return null;
  }
  // hammock: tiang di belakang, kain di depan badan yang lagi rebahan
  function pasangHammock(ix, badan, kontras) {
    const b = kotakSvg(ix.svg, [ix.badan, ix.kepala]), aksen = badan === MERAH ? HITAM : MERAH;
    const kiri = b.x - 70, kanan = b.x + b.w + 70, cx = b.x + b.w / 2, ujung = b.y + b.h * .45, bawah = b.y + b.h, puncak = b.y - 40;
    const tiang = bikin('g', { stroke: badan === PUTIH ? MERAH : PUTIH, 'stroke-linecap': 'round', fill: 'none' });
    ix.svg.insertBefore(tiang, ix.akar);
    bikin('path', { d: `M${kiri} ${puncak}V${bawah + 160}M${kanan} ${puncak}V${bawah + 160}`, 'stroke-width': 22 }, tiang);
    bikin('path', { d: `M${kiri} ${puncak + 20}L${kiri + 60} ${ujung}M${kanan} ${puncak + 20}L${kanan - 60} ${ujung}`, 'stroke-width': 8 }, tiang);
    const kain = bikin('g', {}, ix.svg);
    bikin('path', { d: `M${kiri + 60} ${ujung}Q${cx} ${bawah + 30} ${kanan - 60} ${ujung}Q${cx} ${bawah + 120} ${kiri + 60} ${ujung}Z`, fill: aksen, stroke: kontras, 'stroke-width': 8 }, kain);
    bikin('path', { d: `M${kiri + 110} ${ujung + 30}Q${cx} ${bawah + 82} ${kanan - 110} ${ujung + 30}`, fill: 'none', stroke: kontras, 'stroke-width': 6, opacity: .6 }, kain);
    return [tiang, kain];
  }

  // ---- IXAR + item → kanvas ----
  function lukisIxar() {
    const ix = window.IXAR?.pasang(ixEl); if (!ix) return;
    const pose = poseRig(), tangan = ix.bekukan(pose).lokal;
    const [badan, mata] = WARNA[pilih.warna], kontras = badan === PUTIH ? HITAM : PUTIH;
    ixEl.style.cssText = `color:${badan};--ixar-mata:${mata};--ixar-alat:${badan === MERAH ? kontras : MERAH};--ixar-alat-2:${kontras}`;
    const tambahan = [];
    for (const it of ITEM) if (pilih.item.has(it) && it !== 'hammock') { const e = pasangItem(it, ix, tangan, badan, kontras, pose); if (e) tambahan.push(e); }
    if (pilih.item.has('hammock')) tambahan.push(...pasangHammock(ix, badan, kontras));
    try {
      const terlihat = Object.values(ix.alat).filter((a) => a.style.opacity === '1');
      const b = kotakSvg(ix.svg, [ix.badan, ix.kepala, ...terlihat, ...tambahan]);
      const sk = Math.min(.82, 960 / b.w, 840 / b.h);
      const ox = S / 2 - (b.x + b.w / 2) * sk, oy = (S - 110) - (b.y + b.h) * sk;
      const lapis = document.createElement('canvas'); lapis.width = lapis.height = S;
      const x = lapis.getContext('2d'); x.setTransform(sk, 0, 0, sk, ox, oy);
      gambarSvg(x, ix.svg, 1);
      c.save();
      c.shadowColor = badan === HITAM ? 'rgba(218,22,23,.85)' : 'rgba(0,0,0,.5)'; c.shadowBlur = badan === HITAM ? 20 : 30;
      c.drawImage(lapis, 0, 0); c.restore();
    } finally { tambahan.forEach((e) => e.remove()); }
  }

  // ---- gabung semua ----
  let antre = Promise.resolve(), lastPhoto='', photo=null;
  document.addEventListener('r9:desain',()=>lukis());
  const lukis = () => (antre = antre.then(async () => {
    tandai();
    await document.fonts.load('700 80px Reign9Display').catch(() => {});
    c.clearRect(0, 0, S, S); lukisLatar(c, pilih.latar);
    const file=getComputedStyle(kanvas).getPropertyValue('--r9-foto').trim();
    if (file!==lastPhoto) {
      lastPhoto=file;photo=null;
      if (window.R9Desain.mediaPath.test('/media/'+file)) photo=await new Promise(ok=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>ok(im);im.onerror=()=>ok(null);im.src=ADMIN+'/media/'+file;});
    }
    if(photo)c.drawImage(photo,0,0,S,S);
    lukisIxar();
    const nama = (isian.value || '').trim().toUpperCase();
    if (nama) {
      const g = c.createLinearGradient(0, S - 220, 0, S); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.75)'); c.fillStyle = g; c.fillRect(0, S - 220, S, 220);
      let uk = 96; c.font = `700 ${uk}px Reign9Display, Oxanium, sans-serif`; while (c.measureText(nama).width > S - 120 && uk > 40) { uk -= 4; c.font = `700 ${uk}px Reign9Display, Oxanium, sans-serif`; }
      c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillStyle = PUTIH; c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 16; c.fillText(nama, S / 2, S - 54); c.shadowBlur = 0;
    }
  }).catch((e) => console.error(e)));

  // ---- pilihan di pop-up ----
  const dialog = $('[data-pfp-dialog]'), judulDialog = $('[data-pfp-dialog-judul]'), catatanItem = $('[data-pfp-catatan-item]');
  const wadah = { latar: $('[data-pfp-latar]'), pose: $('[data-pfp-pose]'), warna: $('[data-pfp-warna]'), item: $('[data-pfp-item]') };
  const label = { latar: (v) => `pfp.latar.${v}`, pose: (v) => `pose.${v}`, warna: (v) => `pfp.warna.${v}`, item: (v) => `pfp.item.${v}` };
  const tombol = (grup, v) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pfp__opsi'; b.dataset.nilai = v; b.setAttribute('aria-pressed', 'false');
    if (grup === 'latar') { const kc = document.createElement('canvas'); kc.width = kc.height = 160; kc.className = 'pfp__opsi-gambar'; kc.setAttribute('aria-hidden', 'true'); lukisLatar(kc.getContext('2d'), v, 160); b.append(kc); }
    if (grup === 'warna') { const t = document.createElement('span'); t.className = 'pfp__opsi-warna'; t.style.background = WARNA[v][0]; b.append(t); }
    const n = document.createElement('span'); n.className = 'pfp__opsi-nama'; n.dataset.i18n = label[grup](v); n.textContent = R9.t(label[grup](v)); b.append(n);
    wadah[grup].append(b);
  };
  LATAR.forEach((v) => tombol('latar', v)); POSE.forEach((v) => tombol('pose', v)); Object.keys(WARNA).forEach((v) => tombol('warna', v)); ITEM.forEach((v) => tombol('item', v));
  const JUDUL = { latar: 'pfp.latar', pose: 'pfp.gaya', warna: 'pfp.warna', item: 'pfp.itemPendek' };
  let grupAktif = 'latar';
  function tandai() {
    $$('.pfp__opsi', wadah.latar).forEach((b) => b.setAttribute('aria-pressed', b.dataset.nilai === pilih.latar));
    $$('.pfp__opsi', wadah.pose).forEach((b) => b.setAttribute('aria-pressed', b.dataset.nilai === pilih.pose));
    $$('.pfp__opsi', wadah.warna).forEach((b) => b.setAttribute('aria-pressed', b.dataset.nilai === pilih.warna));
    $$('.pfp__opsi', wadah.item).forEach((b) => b.setAttribute('aria-pressed', pilih.item.has(b.dataset.nilai)));
    $('[data-pfp-nilai="latar"]').textContent = R9.t(label.latar(pilih.latar));
    $('[data-pfp-nilai="pose"]').textContent = R9.t(label.pose(pilih.pose));
    $('[data-pfp-nilai="warna"]').textContent = R9.t(label.warna(pilih.warna));
    $('[data-pfp-nilai="item"]').textContent = pilih.item.size ? ITEM.filter((v) => pilih.item.has(v)).map((v) => R9.t(label.item(v))).join(', ') : R9.t('pfp.tanpaItem');
  }
  const bukaDialog = (grup) => {
    grupAktif = grup; judulDialog.textContent = R9.t(JUDUL[grup]);
    Object.entries(wadah).forEach(([g, w]) => { w.hidden = g !== grup; });
    catatanItem.hidden = grup !== 'item';
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
    $('.pfp__opsi[aria-pressed="true"]', wadah[grup])?.scrollIntoView({ block: 'nearest' });
  };
  const tutup = (d) => (d.close ? d.close() : d.removeAttribute('open'));
  $$('[data-pfp-buka]').forEach((b) => b.addEventListener('click', () => bukaDialog(b.dataset.pfpBuka)));
  $$('.pfp__dialog').forEach((d) => {
    d.addEventListener('click', (e) => { if (e.target === d) tutup(d); }); // klik di luar kotak = tutup
    $('[data-pfp-tutup]', d).addEventListener('click', () => tutup(d));
  });
  Object.entries(wadah).forEach(([grup, w]) => w.addEventListener('click', (e) => {
    const b = e.target.closest('.pfp__opsi'); if (!b) return;
    const v = b.dataset.nilai;
    if (grup === 'latar') pilih.latar = v; else if (grup === 'warna') pilih.warna = v;
    else if (grup === 'pose') aturPose(v); else aturItem(v);
    lukis();
    if (grup !== 'item') setTimeout(() => tutup(dialog), 160); // pilih satu = langsung balik ke pratinjau
  }));
  isian.addEventListener('input', lukis);
  $('[data-pfp-acak]').addEventListener('click', () => {
    const acak = (a) => a[Math.floor(Math.random() * a.length)];
    pilih.latar = acak(LATAR); pilih.warna = acak(Object.keys(WARNA)); aturPose(acak(POSE.filter((p) => p !== 'ngegame')));
    pilih.item = new Set(['kacamata', 'headset', 'rokok', 'tongkat', 'pedang', 'syal', 'medali', 'mic'].filter(() => Math.random() < .25));
    const r = Math.random(); if (r < .15) aturItem('kursi'); else if (r < .25) aturItem('hammock'); if (Math.random() < .15) aturItem('hp');
    lukis();
  });

  // ---- unduh: coba unduh otomatis + jendela hasil (tekan lama / bagikan buat HP & browser aplikasi) ----
  const hasil = $('[data-pfp-hasil]'), hasilImg = $('[data-pfp-hasil-img]'), simpan = $('[data-pfp-simpan]'), bagikan = $('[data-pfp-bagikan]');
  let urlLama = '';
  $('[data-pfp-unduh]').addEventListener('click', async () => {
    await lukis();
    const blob = await new Promise((ok) => kanvas.toBlob(ok, 'image/png'));
    if (!blob) return;
    const nama = `reign9-ixar-${(isian.value.trim() || pilih.pose).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    if (urlLama) URL.revokeObjectURL(urlLama);
    urlLama = URL.createObjectURL(blob);
    hasilImg.src = urlLama; simpan.href = urlLama; simpan.download = nama;
    const berkas = new File([blob], nama, { type: 'image/png' });
    bagikan.hidden = !(navigator.canShare && navigator.canShare({ files: [berkas] }));
    bagikan.onclick = () => navigator.share({ files: [berkas], title: 'Reign 9 · IXAR' }).catch(() => {});
    if (hasil.showModal) hasil.showModal(); else hasil.setAttribute('open', '');
    simpan.click();
  });

  document.addEventListener('r9:bahasa', () => { $$('.pfp__opsi-nama[data-i18n]').forEach((n) => { n.textContent = R9.t(n.dataset.i18n); }); if (dialog.open) judulDialog.textContent = R9.t(JUDUL[grupAktif]); tandai(); });
  tandai();
  new IntersectionObserver((d, o) => { if (d.some((e) => e.isIntersecting)) { o.disconnect(); lukis(); } }, { rootMargin: '300px' }).observe(kanvas);
})();
