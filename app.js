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
if (window.top !== window.self) { try { window.top.location.replace(window.self.location.href); } catch (e) { document.documentElement.hidden = true; } }

// ---------- sistem keamanan R9: anti-copy, anti-bajak, & anti-scraper ----------
(() => {
  try {
    console.log(
      '%c🛡️ REIGN 9 INTERNATIONAL — SECURITY SHIELD ACTIVE',
      'background:#DA1617;color:#fff;font-weight:800;font-size:14px;padding:6px 12px;border-radius:2px;'
    );
    console.log(
      '%cSeluruh kode, desain, aset visual, font Reign9Display, dan maskot IXAR dilindungi hak cipta © 2026 Reign 9 International. Ekstraksi otomatis oleh AI/scraper luar atau penggandaan tanpa izin dilarang keras.',
      'color:#ff8a3c;font-size:12px;'
    );
  } catch (e) {}

  // Blokir klik kanan pada gambar, SVG, kanvas, dan elemen non-input agar aset tidak mudah dicuri
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('input, textarea')) return;
    e.preventDefault();
  });

  // Blokir drag aset gambar & SVG
  document.addEventListener('dragstart', (e) => {
    if (e.target.closest('img, svg, canvas, a')) e.preventDefault();
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
function pasangBahasa(b, simpan) {
  R9.bahasa = ['id', 'en', 'zh'].includes(b) ? b : 'id';
  document.documentElement.lang = R9.bahasa === 'zh' ? 'zh-CN' : R9.bahasa;
  $$('[data-i18n]').forEach((el) => { el.textContent = R9.t(el.dataset.i18n); });
  $$('[data-i18n-html]').forEach((el) => { el.innerHTML = R9.t(el.dataset.i18nHtml); });
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
$('.tema').addEventListener('click', (e) => {
  const baru = temaSekarang() === 'terang' ? 'gelap' : 'terang';
  if (!gerakBoleh) return pasangTema(baru);
  if (!document.startViewTransition) {
    document.documentElement.classList.add('ganti-tema'); pasangTema(baru);
    return setTimeout(() => document.documentElement.classList.remove('ganti-tema'), 500);
  }
  const r = e.currentTarget.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  const jari = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.documentElement.style.setProperty('--vt-x', `${x}px`); document.documentElement.style.setProperty('--vt-y', `${y}px`);
  document.startViewTransition(() => pasangTema(baru)).ready.then(() => {
    document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${jari}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards', pseudoElement: '::view-transition-new(root)' });
  });
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
  const sprite = $('#r9-sprite-logo')?.outerHTML || await fetch(`gambar/logo.svg`).then((r) => r.text()).catch(() => '');
  const m = sprite.match(/id="tegak" viewBox="([^"]+)">(.*?)<\/symbol>/);
  if (!m) { document.documentElement.classList.add('bara-gagal'); return; }
  const vb = m[1].split(' ').map(Number), bentuk = [...m[2].matchAll(/ d="([^"]+)"/g)].map((x) => new Path2D(x[1]));
  await document.fonts.load('700 100px Reign9Display').catch(() => {});
  let w, h, butir = [], lepas = [], titik = {}, px = -999, py = -999, jalan = true, fase = 'teks', mulaiFase = performance.now(), terang = false;
  const kanvasBantu = (lw, lh) => { const o = Object.assign(document.createElement('canvas'), { width: Math.max(1, lw), height: Math.max(1, lh) }); return [o, o.getContext('2d', { willReadFrequently: true })]; };
  const cuplik = (oc, lw, lh, jarak, gx = 0, gy = 0) => {
    const d = oc.getImageData(0, 0, Math.max(1, lw), Math.max(1, lh)).data, hasil = [];
    for (let y = 0; y < lh; y += jarak) for (let x = 0; x < lw; x += jarak) if (d[(Math.round(y) * lw + Math.round(x)) * 4 + 3] > 128) hasil.push([gx + x, gy + y]);
    return hasil;
  };
  const hitungTitik = () => {
    const r = wadah.getBoundingClientRect(), k = kanvas.getBoundingClientRect();
    const lw = Math.round(r.width), lh = Math.round(r.height), gx = r.left - k.left, gy = r.top - k.top;
    let [o, oc] = kanvasBantu(lw, lh);
    const s = Math.min(lw / vb[2], lh / vb[3]);
    oc.translate((lw - vb[2] * s) / 2, 0); oc.scale(s, s); oc.translate(-vb[0], -vb[1]); bentuk.forEach((b) => oc.fill(b, 'evenodd'));
    const batas = Math.round((355 - vb[1]) * s), atas = cuplik(oc, lw, batas, lw < 320 ? 3 : 3.5, gx, gy);
    const [, oc2] = kanvasBantu(lw, lh - batas); oc2.drawImage(o, 0, -batas);
    titik.logo = [...atas, ...cuplik(oc2, lw, lh - batas, 2, gx, gy + batas)];
    titik.kotakLogo = [gx, gy, gx + lw, gy + lh];
    const tw = Math.min(w * .9, 980), uk = Math.min(tw / 6.5, 142), th = Math.round(uk * 2.7);
    [o, oc] = kanvasBantu(Math.round(tw), th);
    oc.font = `700 ${uk}px Reign9Display, Oxanium, sans-serif`; oc.textAlign = 'center'; oc.textBaseline = 'middle';
    oc.fillText('WELCOME TO', tw / 2, uk * .7, tw); oc.fillText('OUR REIGN', tw / 2, uk * 1.9, tw);
    const tx = (w - tw) / 2, ty = gy + lh * .42 - uk * 1.15;
    titik.teks = cuplik(oc, Math.round(tw), th, w < 600 ? 2.5 : 3.2, tx, ty);
    titik.kotakTeks = [tx + tw * .06, ty, tx + tw * .94, ty + th];
    [o, oc] = kanvasBantu(Math.round(w), Math.round(h));
    const dasar = h * .97, lebar = Math.min(w * .96, 1500), x0 = (w - lebar) / 2, u = lebar / 100;
    const gerigi = (x, y, l, t) => { for (let i = 0; i < l; i += t * 2) oc.fillRect(x + i, y - t, t, t); };
    oc.fillRect(x0, dasar - 22 * u, lebar, 22 * u); gerigi(x0, dasar - 22 * u, lebar, 2.4 * u);
    [[2, 9, 40], [20, 10, 52], [45, 12, 66], [70, 10, 52], [89, 9, 40]].forEach(([p0, l, t]) => {
      const x = x0 + p0 * u, y = dasar - t * u; oc.fillRect(x, y, l * u, t * u); gerigi(x, y, l * u, 1.8 * u);
      oc.clearRect(x + l * u * .35, y + t * u * .25, l * u * .3, t * u * .14);
    });
    oc.globalCompositeOperation = 'destination-out'; oc.beginPath(); oc.arc(x0 + 51 * u, dasar - 10 * u, 5 * u, Math.PI, 0); oc.rect(x0 + 46 * u, dasar - 10 * u, 10 * u, 10 * u); oc.fill();
    const semua = cuplik(oc, Math.round(w), Math.round(h), w < 600 ? 6 : 7), lompat = Math.max(1, semua.length / 2200);
    titik.kastil = Array.from({ length: Math.min(2200, semua.length) }, (_, i) => semua[Math.floor(i * lompat)]);
  };
  const WARNA_GELAP = [['#da1617', 34], ['#ff1f1f', 22], ['#b30d10', 18], ['#ff3b26', 14], ['#ff6a2a', 8], ['#ffb04a', 4]];
  const WARNA_TERANG = [['#000000', 46], ['#1a0102', 10], ['#da1617', 24], ['#a80309', 20]];
  const pilihWarna = () => { const daftar = terang ? WARNA_TERANG : WARNA_GELAP; let n = Math.random() * 100; for (const [wr, b] of daftar) { if ((n -= b) < 0) return wr; } return daftar[0][0]; };
  const baraLepas = (acak) => ({ x: Math.random() * w, y: acak ? Math.random() * h : h + 10, r: Math.random() * 1.8 + .5, v: Math.random() * .6 + .25, goyang: Math.random() * 6.28, umur: Math.random() * .5 + .4 });
  function aturTujuan(f) {
    fase = f; mulaiFase = performance.now();
    const L = titik.logo.length;
    butir.forEach((b, i) => {
      b.kastil = false;
      if (f === 'teks') { const t = titik.teks[i]; b.tx = t ? t[0] : null; b.ty = t ? t[1] : null; b.tunda = Math.random() * 700; }
      else if (f === 'logo') { if (i < L) [b.tx, b.ty] = titik.logo[i]; else { [b.tx, b.ty] = titik.kastil[i - L]; b.kastil = true; } b.tunda = Math.random() * 250; }
      else { b.tx = null; b.ty = null; }
    });
  }
  const ukur = () => {
    const rasio = Math.min(devicePixelRatio || 1, 2);
    w = kanvas.clientWidth; h = kanvas.clientHeight;
    kanvas.width = w * rasio; kanvas.height = h * rasio; c.setTransform(rasio, 0, 0, rasio, 0, 0);
    hitungTitik();
    const n = titik.logo.length + titik.kastil.length;
    if (titik.teks.length > n) { const lompat = titik.teks.length / n; titik.teks = Array.from({ length: n }, (_, i) => titik.teks[Math.floor(i * lompat)]); }
    for (let i = titik.teks.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [titik.teks[i], titik.teks[j]] = [titik.teks[j], titik.teks[i]]; }
    butir = Array.from({ length: n }, (_, i) => butir[i] || { x: Math.random() * w, y: h + Math.random() * h * .5, vx: 0, vy: 0, r: Math.random() * .6 + 1, kedip: Math.random() * 6.28, warna: pilihWarna() });
    butir.length = n;
    lepas = Array.from({ length: Math.round(w / 18) }, () => baraLepas(true));
    aturTujuan(fase);
  };
  const keKanvas = (x, y) => { const k = kanvas.getBoundingClientRect(); return [x - (k.left + scrollX), y - (k.top + scrollY)]; };
  const keHalaman = ([x0, y0, x1, y1]) => { const k = kanvas.getBoundingClientRect(); return { kiri: x0 + k.left + scrollX, atas: y0 + k.top + scrollY, kanan: x1 + k.left + scrollX, bawah: y1 + k.top + scrollY }; };
  const dorong = (x, y, kuat, jangkau) => butir.forEach((b) => {
    const dx = b.x - x, dy = b.y - y, d = Math.hypot(dx, dy) || 1;
    if (d > jangkau) return;
    const f = kuat * (1 - d / jangkau); b.vx += dx / d * f + (Math.random() - .5) * kuat * .3; b.vy += dy / d * f - Math.random() * kuat * .2;
  });
  const goyang = () => { hero.classList.remove('goyang'); void hero.offsetWidth; hero.classList.add('goyang'); };
  window.R9Hero = {
    get fase() { return fase; }, get umurFase() { return performance.now() - mulaiFase; },
    kotakLogo: () => keHalaman(titik.kotakLogo), kotakTeks: () => keHalaman(titik.kotakTeks),
    pukul(xh, yh, kuat = 18) { const [x, y] = keKanvas(xh, yh); dorong(x, y, kuat, Math.max(220, w * .25)); goyang(); },
    tonjokSambut(xh, yh) { const [x, y] = keKanvas(xh, yh); dorong(x, y, 26, w * .9); goyang(); setTimeout(() => aturTujuan('logo'), 260); },
    hancur(xh, yh) { const [x, y] = keKanvas(xh, yh); dorong(x, y, 34, w); goyang(); aturTujuan('bubar'); setTimeout(() => aturTujuan('teks'), 2200); },
  };
  const gambar = (t) => {
    if (!jalan) return;
    c.clearRect(0, 0, w, h);
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
      c.globalAlpha = (terang ? .9 + Math.sin(b.kedip) * .1 : .75 + Math.sin(b.kedip) * .25) * (b.kastil ? (terang ? .22 : .32) : 1) * (b.tx == null ? .55 : 1);
      c.fillStyle = b.warna; c.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }
    c.globalAlpha = 1;
    requestAnimationFrame(gambar);
  };
  hero.addEventListener('pointermove', (e) => { const k = kanvas.getBoundingClientRect(); px = e.clientX - k.left; py = e.clientY - k.top; });
  hero.addEventListener('pointerleave', () => { px = py = -999; });
  hero.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') px = py = -999; });
  document.addEventListener('r9:tema', () => { terang = temaSekarang() === 'terang'; butir.forEach((b) => { b.warna = pilihWarna(); }); });
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

  async function otakHero() {
    while (!mati) {
      if (sedangDiseret || sedangJatuh || performance.now() < jedaSampai || !x() || document.hidden || scrollY > innerHeight) {
        await tidur(420);
        continue;
      }
      const H = window.R9Hero;
      try {
        if (H && H.fase === 'teks' && H.umurFase > 2400) {
          await tonjokSambutan();
        } else if (H && H.fase === 'logo') {
          const n = Math.random();
          if (H.umurFase > 8500 && n < .46) await hancurinLogo();
          else if (n < .62) await jalanJalanHero();
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
  const el = $('.jelajah__ixar'), panggung = $('.panggung-ixar'), hero = $('.hero'), panggungKenal = $('[data-panggung-kenal]');
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
    : ['Together We Reign! 🔥👑'];
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
    const teks = daftarCuitan[idxAsli];
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
    if (panggungKenal) {
      const rk = panggungKenal.getBoundingClientRect();
      if (rk.bottom > tinggi + 110 && rk.top < innerHeight - 130 && rk.width > lebar) {
        const yPanggung = Math.min(innerHeight - tinggi - 12, rk.bottom - tinggi - 132);
        return { mode: 'kenal', y: Math.max(72, yPanggung), xMin: Math.max(8, rk.left + 20), xMax: Math.min(innerWidth - lebar - 8, rk.right - lebar - 20) };
      }
    }
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
  async function peragakanPose(namaPose, durasi = 4500) {
    if (sedangDiseret) return;
    jedaSampai = performance.now() + durasi + 800;
    const info = infoPlatform();
    if (info.mode === 'kenal') {
      const tengahPanggung = (info.xMin + info.xMax) / 2;
      if (Math.abs(px - tengahPanggung) > 60 || Math.abs(py - info.y) > 24) {
        await lompatKe(tengahPanggung, info.y, 120, 540);
      }
    }
    if (namaPose === 'lompat') {
      await lompatKe(px, lantai(), 165, 660);
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
}

// ---------- Command Deck IXAR (#ixar): Filter Tab, Kartu Pose, & Tombol 200 Cuitan ----------
$$('[data-tab-pose]').forEach((tab) => tab.addEventListener('click', () => {
  const kat = tab.dataset.tabPose;
  $$('[data-tab-pose]').forEach((t) => t.setAttribute('aria-selected', t === tab));
  $$('[data-pose]').forEach((kartu) => {
    kartu.hidden = kat !== 'semua' && kartu.dataset.kategoriPose !== kat;
  });
}));
$$('[data-pose]').forEach((b) => b.addEventListener('click', () => {
  $$('[data-pose]').forEach((x) => x.setAttribute('aria-pressed', x === b));
  window.R9IxarUtama?.peragakanPose(b.dataset.pose, 4600);
  window.R9IxarUtama?.tampilkanCuitanAcak(6800);
}));
$('[data-panggil-ixar]')?.addEventListener('click', () => {
  window.R9IxarUtama?.peragakanPose('nyambut', 3200);
  window.R9IxarUtama?.tampilkanCuitanAcak(6800);
});
$('[data-lempar-cuitan]')?.addEventListener('click', () => {
  window.R9IxarUtama?.tampilkanCuitanAcak(7500);
  window.R9IxarUtama?.peragakanPose('nyambut', 2000);
});

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

  return `<li class="kartu-pemain ${coach ? 'kartu-pemain--coach' : ''}">
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
  return `<a class="berita" href="news.html?id=${idAman(n.id)}">
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
  const segarkan = async () => {
    const d = await ambilDataLive();
    if (d) {
      DATA = d;
      gambarData();
    }
  };
  await segarkan();
  // langsung tayang: admin ngirim sinyal tiap ada yang disimpan/diunggah → data diambil saat itu juga (cadangan: cek tiap 15 dtk)
  try {
    const sinyal = new EventSource(`${ADMIN}/api/langsung`);
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
  const muat = (n) => gambar[n] || (gambar[n] = new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = `gambar/banner/banner-${n}.jpg`; }));
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
      let uk = 88; c.font = `700 ${uk}px Reign9Display, Oxanium, sans-serif`;
      while (c.measureText(nama.toUpperCase()).width > 760 && uk > 34) { uk -= 4; c.font = `700 ${uk}px Reign9Display, Oxanium, sans-serif`; }
      c.fillStyle = '#fff';
      c.fillText(nama.toUpperCase(), 1450, sub ? 430 : 455);
    }
    if (sub) {
      c.font = '700 24px Reign9Display, Oxanium, sans-serif';
      c.fillStyle = '#ff3b26';
      c.fillText(sub.toUpperCase(), 1450, 468);
    }
    c.shadowBlur = 0;
  };
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
