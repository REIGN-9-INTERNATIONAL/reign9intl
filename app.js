// Reign 9 v2: tema, 3 bahasa, menu, layar pembuka (WELCOME → ditonjok IXAR → logo + kastil), data live dari admin
// (roster, jadwal, prestasi, news), podium + bendera, banner, kontak.
const ADMIN = 'https://admin.reign9.site';
const gerakBoleh = !matchMedia('(prefers-reduced-motion: reduce)').matches;
const VERSI = (document.currentScript && new URL(document.currentScript.src).searchParams.get('v')) || '';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- bahasa ----------
const R9 = window.R9 = {
  bahasa: 'id',
  t(k) { const e = window.R9_KAMUS[k]; return e ? (e[R9.bahasa] ?? e.id) : k; },
  // isi dari admin: string biasa, atau {id, en, zh}
  teks(v) { return v && typeof v === 'object' ? (v[R9.bahasa] || v.id || v.en || '') : (v ?? ''); },
  lokal() { return { id: 'id-ID', en: 'en-GB', zh: 'zh-CN' }[R9.bahasa]; },
  tanggal(s, opsi = { day: 'numeric', month: 'long', year: 'numeric' }) { return s ? new Intl.DateTimeFormat(R9.lokal(), opsi).format(new Date(`${s.slice(0, 10)}T00:00:00`)) : ''; },
  rupiah(n) { return n ? new Intl.NumberFormat(R9.lokal(), { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n) : ''; },
};
function pasangBahasa(b, simpan) {
  R9.bahasa = ['id', 'en', 'zh'].includes(b) ? b : 'id';
  document.documentElement.lang = R9.bahasa === 'zh' ? 'zh-CN' : R9.bahasa;
  $$('[data-i18n]').forEach((el) => { el.textContent = R9.t(el.dataset.i18n); });
  $$('[data-i18n-html]').forEach((el) => { el.innerHTML = R9.t(el.dataset.i18nHtml); }); // isi kamus sendiri, aman
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
  // titik awal lingkaran dipasang dulu biar tampilan baru mulai tertutup (gak kedip)
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

// ---------- sosmed di kaki: salinan dari hero ----------
$('[data-sosmed-salin]').innerHTML = $('.hero .sosmed').innerHTML;

// ---------- salin guild ID ----------
$$('[data-salin]').forEach((b) => b.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(b.dataset.salin); } catch (e) {}
  b.textContent = R9.t('guild.tersalin'); setTimeout(() => { b.textContent = R9.t('guild.salin'); }, 1600);
}));

// ---------- layar pembuka: bara → WELCOME TO OUR REIGN → ditonjok IXAR → logo + kastil ----------
// Mesin bara (window.R9Hero) dikendaliin otak IXAR di bawahnya: IXAR yang nonjok tulisan & ngancurin logo.
(async () => {
  const kanvas = $('.hero__bara'), wadah = $('.hero__logo'), hero = $('.hero');
  if (!kanvas || !gerakBoleh) return;
  const c = kanvas.getContext('2d');
  const sprite = await fetch(`gambar/logo.svg?v=${VERSI}`).then((r) => r.text()).catch(() => '');
  const m = sprite.match(/id="tegak" viewBox="([^"]+)">(.*?)<\/symbol>/);
  if (!m) return;
  const vb = m[1].split(' ').map(Number), bentuk = [...m[2].matchAll(/ d="([^"]+)"/g)].map((x) => new Path2D(x[1]));
  await document.fonts.load('700 100px Oxanium').catch(() => {});
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
    const tw = Math.min(w * .9, 980), uk = Math.min(tw / 6.2, 150), th = Math.round(uk * 2.7);
    [o, oc] = kanvasBantu(Math.round(tw), th);
    oc.font = `700 ${uk}px Oxanium, sans-serif`; oc.textAlign = 'center'; oc.textBaseline = 'middle';
    oc.fillText('WELCOME TO', tw / 2, uk * .7, tw); oc.fillText('OUR REIGN', tw / 2, uk * 1.9, tw);
    const tx = (w - tw) / 2, ty = gy + lh * .42 - uk * 1.15;
    titik.teks = cuplik(oc, Math.round(tw), th, w < 600 ? 2.5 : 3.2, tx, ty);
    titik.kotakTeks = [tx + tw * .06, ty, tx + tw * .94, ty + th];
    // kastil di belakang (kebentuk dari pecahan tulisan WELCOME)
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
    // titik tulisan WELCOME bisa lebih banyak dari jumlah bara: diambil merata biar baris bawah gak kepotong
    if (titik.teks.length > n) { const lompat = titik.teks.length / n; titik.teks = Array.from({ length: n }, (_, i) => titik.teks[Math.floor(i * lompat)]); }
    // diacak urutannya biar bara yang ngebentuk tulisan nyebar dari mana-mana
    for (let i = titik.teks.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [titik.teks[i], titik.teks[j]] = [titik.teks[j], titik.teks[i]]; }
    butir = Array.from({ length: n }, (_, i) => butir[i] || { x: Math.random() * w, y: h + Math.random() * h * .5, vx: 0, vy: 0, r: Math.random() * .6 + 1, kedip: Math.random() * 6.28, warna: pilihWarna() });
    butir.length = n;
    lepas = Array.from({ length: Math.round(w / 18) }, () => baraLepas(true));
    aturTujuan(fase);
  };
  // ubah koordinat halaman ↔ kanvas
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
    // pukulan biasa: bara di sekitar tinju kelempar
    pukul(xh, yh, kuat = 18) { const [x, y] = keKanvas(xh, yh); dorong(x, y, kuat, Math.max(220, w * .25)); goyang(); },
    // tonjokan ke tulisan WELCOME: pecah, terus nyusun jadi logo + kastil
    tonjokSambut(xh, yh) { const [x, y] = keKanvas(xh, yh); dorong(x, y, 26, w * .9); goyang(); setTimeout(() => aturTujuan('logo'), 260); },
    // logo dihancurin: bara bubar, lalu kumpul lagi jadi tulisan WELCOME
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
  } catch (e) { document.documentElement.classList.remove('bara-hidup'); kanvas.remove(); window.R9Hero = null; }
})();

// ---------- otak IXAR di layar pembuka: jalan-jalan, lompat ke menu, nonjok & ngancurin logo, dll. Sendiri. ----------
(() => {
  const el = $('.hero__ixar'), hero = $('.hero');
  if (!el) return;
  const x = () => el.ixar;
  let px = 0, py = 0, tinggi = 160, lebar = 130, sibuk = false, jedaSampai = 0, mati = false, hadapKiri = false;
  const tidur = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const ukur = () => { const r = el.getBoundingClientRect(); lebar = r.width; tinggi = r.height || lebar * 1.22; };
  const lantai = () => { const r = hero.getBoundingClientRect(); return r.bottom + scrollY - tinggi - 6; };
  const batasX = () => [8, document.documentElement.clientWidth - lebar - 8];
  const taruh = () => { el.style.transform = `translate(${px}px, ${py}px)`; };
  const hadap = (kiri) => { hadapKiri = kiri; el.classList.toggle('hadap-kiri', kiri); };
  const pose = (p) => x()?.set(p);
  const animasi = (durasi, tiap) => new Promise((ok) => {
    const t0 = performance.now();
    const langkah = (t) => { const k = Math.min(1, (t - t0) / durasi); tiap(k); taruh(); if (k < 1 && !mati) requestAnimationFrame(langkah); else ok(); };
    requestAnimationFrame(langkah);
  });
  async function jalanKe(tx, cepat = false) {
    const [a, b] = batasX(); tx = Math.max(a, Math.min(b, tx));
    const jarak = Math.abs(tx - px); if (jarak < 4) return;
    hadap(tx < px); pose(cepat ? 'jalanCepat' : 'jalan');
    const x0 = px, y0 = py, yl = lantai();
    await animasi(jarak / (cepat ? 420 : 170) * 1000, (k) => { px = x0 + (tx - x0) * k; py = y0 + (yl - y0) * Math.min(1, k * 3); });
    pose('diam');
  }
  async function lompatKe(tx, ty, puncak = 160, durasi = 700, gaya = 'lompat') {
    const x0 = px, y0 = py; hadap(tx < px); pose(gaya);
    await animasi(durasi, (k) => { px = x0 + (tx - x0) * k; py = y0 + (ty - y0) * k - Math.sin(Math.PI * k) * puncak; });
  }
  async function turun() { await lompatKe(px + (hadapKiri ? -40 : 40), lantai(), 60, 520, 'kaget'); pose('diam'); }

  // --- tingkah ---
  async function tonjokSambutan() {
    const t = window.R9Hero?.kotakTeks(); if (!t) return;
    await jalanKe(t.kiri - lebar * .85, true);
    hadap(false); x()?.lakukan('tonjok', 900); await tidur(180);
    window.R9Hero.tonjokSambut(t.kiri + 10, (t.atas + t.bawah) / 2);
    await tidur(900); x()?.lakukan('menang', 1300); await tidur(1300);
  }
  async function hancurinLogo() {
    const L = window.R9Hero?.kotakLogo(); if (!L) return;
    const kiri = Math.random() < .5 || L.kiri - lebar < 20, tx = kiri ? L.kiri - lebar * .8 : L.kanan - lebar * .2;
    await jalanKe(tx, true);
    await lompatKe(tx, (L.atas + L.bawah) / 2 - tinggi * .45, 120, 600);
    hadap(!kiri);
    const tinjuX = kiri ? L.kiri + 6 : L.kanan - 6, tinjuY = (L.atas + L.bawah) / 2;
    for (let i = 0; i < 3; i++) { x()?.lakukan('tonjok', 380); await tidur(160); window.R9Hero.pukul(tinjuX, tinjuY + (i - 1) * 50, 14 + i * 4); await tidur(420); }
    x()?.lakukan('marah', 500); await tidur(500);
    x()?.lakukan('tonjok', 600); await tidur(170); window.R9Hero.hancur(tinjuX, tinjuY);
    await tidur(500); await turun(); x()?.lakukan('menang', 1400); await tidur(1600);
  }
  async function keMenu() {
    if (scrollY > 30) return;
    const pilihan = $$('.atas__menu a, .bahasa, .tema').filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.top < 90; });
    if (!pilihan.length) return;
    const sasaran = pilihan[Math.floor(Math.random() * pilihan.length)], r = sasaran.getBoundingClientRect();
    const tx = r.left + r.width / 2 - lebar / 2 + scrollX, ty = $('.atas').getBoundingClientRect().bottom + scrollY - tinggi * .08;
    await jalanKe(tx, true);
    await lompatKe(tx, ty, 40, 650);
    // gelantungan di bawah menu sambil nyorotin menu itu
    pose('regang'); sasaran.classList.add('disentuh-ixar');
    await tidur(1800); sasaran.classList.remove('disentuh-ixar');
    await turun();
  }
  async function jalanJalan() { const [a, b] = batasX(); await jalanKe(a + Math.random() * (b - a), Math.random() < .25); }
  async function gaya() { const p = ['regang', 'penasaran', 'pedang', 'tameng', 'tunjuk', 'nyambut', 'meditasi', 'marah'][Math.floor(Math.random() * 8)]; x()?.lakukan(p, 2200); await tidur(2400); }

  async function otak() {
    while (!mati) {
      if (performance.now() < jedaSampai || !x() || scrollY > innerHeight * 1.2 || document.hidden) { await tidur(400); continue; }
      sibuk = true;
      const H = window.R9Hero;
      try {
        if (H && H.fase === 'teks' && H.umurFase > 2600) await tonjokSambutan();
        else if (H && H.fase === 'logo') {
          const n = Math.random();
          if (H.umurFase > 9000 && n < .5) await hancurinLogo();
          else if (n < .35) await jalanJalan();
          else if (n < .55) await keMenu();
          else if (n < .85) await gaya();
          else await tidur(1200);
        } else await tidur(300);
      } catch (e) { /* lanjut aja */ }
      sibuk = false;
      await tidur(500 + Math.random() * 900);
    }
  }
  // pengunjung bisa ikut main: klik di layar pembuka → IXAR jalan ke situ; IXAR diklik → dia berhenti sebentar & bereaksi
  hero.addEventListener('click', (e) => {
    if (e.target.closest('a, button, input')) return;
    jedaSampai = performance.now() + 2500;
    jalanKe(e.pageX - lebar / 2, true).then(() => x()?.lakukan('nyambut', 1200));
  });
  el.addEventListener('click', () => { jedaSampai = performance.now() + 2000; });
  addEventListener('resize', () => { ukur(); if (!sibuk) { py = lantai(); taruh(); } });
  addEventListener('scroll', () => { if (scrollY > 30 && py < lantai() - 20 && !sibuk) { py = lantai(); taruh(); } }, { passive: true });
  const mulai = () => {
    ukur(); px = Math.max(8, (document.documentElement.clientWidth - 1160) / 2); py = lantai(); taruh();
    if (gerakBoleh && window.R9Hero) otak();
  };
  if (window.R9Hero) mulai(); else { document.addEventListener('r9:hero-siap', mulai, { once: true }); setTimeout(() => { if (!px) mulai(); }, 2500); }
})();

// ---------- bendera juara 1: kain diiris biar bisa bergelombang ----------
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
new IntersectionObserver((d, o) => { if (d.some((e) => e.isIntersecting)) { podium.classList.add('keliatan'); o.disconnect(); } }, { threshold: .15 }).observe(podium);

// ---------- kenalan IXAR: tombol ekspresi ----------
const ixarKenal = $('.kenal__ixar');
$$('[data-pose]').forEach((b) => b.addEventListener('click', () => {
  $$('[data-pose]').forEach((x) => x.setAttribute('aria-pressed', x === b));
  ixarKenal.ixar?.lakukan(b.dataset.pose, 4000);
}));

// ---------- data live dari admin (cadangan: salinan di GitHub) ----------
let DATA = null, newsTampil = 6;
const BENDERA = {
  ID: '<svg class="kartu-pemain__negara" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="10" fill="#E70011"/><rect y="10" width="30" height="10" fill="#fff"/></svg>',
  MY: '<svg class="kartu-pemain__negara" viewBox="0 0 28 14" aria-hidden="true"><rect width="28" height="14" fill="#fff"/><g fill="#CC0001"><rect width="28" height="1"/><rect y="2" width="28" height="1"/><rect y="4" width="28" height="1"/><rect y="6" width="28" height="1"/><rect y="8" width="28" height="1"/><rect y="10" width="28" height="1"/><rect y="12" width="28" height="1"/></g><rect width="14" height="8" fill="#010066"/><circle cx="5.6" cy="4" r="3" fill="#FC0"/><circle cx="6.5" cy="4" r="2.5" fill="#010066"/></svg>',
};
async function ambilData() {
  for (const url of [`${ADMIN}/api/publik`, `data/reign9.json?t=${Date.now()}`]) {
    try {
      const ac = new AbortController(), batas = setTimeout(() => ac.abort(), 4000);
      const r = await fetch(url, { signal: ac.signal, cache: 'no-store' }); clearTimeout(batas);
      if (r.ok) return await r.json();
    } catch (e) { /* coba sumber berikutnya */ }
  }
  return null;
}
const hariIni = () => new Date().toISOString().slice(0, 10);
function gambarData() {
  const d = DATA || { pemain: { aktif: [], nonaktif: [] }, event: [], prestasi: [], news: [], ringkas: {} };
  // podium & hadiah
  const rk = d.ringkas || {};
  $$('[data-juara]').forEach((el) => { const n = rk[`juara${el.dataset.juara}`]; el.textContent = n ? n : '–'; });
  $('[data-hadiah]').textContent = R9.rupiah(rk.totalHadiah) || R9.t('hadiah.kosong');
  // roster
  const aktif = d.pemain?.aktif || [];
  $('[data-roster-kosong]').hidden = aktif.length > 0;
  $('[data-roster]').innerHTML = aktif.map((p) => {
    const coach = p.jenis === 'coach' || p.role === 'Pelatih';
    const role = p.role ? R9.t(`role.${p.role}`) : '';
    return `<li class="kartu-pemain ${coach ? 'kartu-pemain--coach' : ''}"><div class="kartu-pemain__isi">
      <span class="lencana-role">${esc(coach ? R9.t('roster.coach') : role || R9.t('roster.player'))}</span>
      ${p.foto ? `<img class="kartu-pemain__foto" src="${esc(p.foto)}" alt="${esc(p.nickname)}" loading="lazy" width="400" height="500">` : `<div class="kartu-pemain__tanpa"><svg viewBox="0 0 105.63 183.98" aria-hidden="true"><use href="gambar/logo.svg#simbol"/></svg></div>`}
      <div class="kartu-pemain__info"><span class="kartu-pemain__nama">${esc(p.nickname)}</span>
        <span class="kartu-pemain__role">${BENDERA[p.negara] || ''}${esc([coach && role !== R9.t('role.Pelatih') ? role : '', R9.t(`negara.${p.negara || 'ID'}`)].filter(Boolean).join(' · '))}</span>
        ${p.instagram ? `<a class="kartu-pemain__ig" href="https://www.instagram.com/${encodeURIComponent(p.instagram)}/" target="_blank" rel="noopener">@${esc(p.instagram)}</a>` : ''}</div>
    </div></li>`;
  }).join('');
  const hitung = {}; aktif.forEach((p) => { hitung[p.negara || 'ID'] = (hitung[p.negara || 'ID'] || 0) + 1; });
  $('[data-hitung-negara]').textContent = aktif.length ? `${aktif.length} ${R9.t('roster.pemain')} · ${Object.entries(hitung).map(([k, v]) => `${R9.t(`negara.${k}`)} ${v}`).join(' · ')}` : '';
  const alumni = d.pemain?.nonaktif || [];
  $('[data-alumni]').hidden = !alumni.length;
  $('[data-alumni-daftar]').innerHTML = alumni.map((p) => `<li>${esc(p.nickname)}${p.role ? ` · ${esc(R9.t(`role.${p.role}`))}` : ''}</li>`).join('');
  // jadwal
  const kartuEvent = (v) => `<li class="event"><div class="event__tgl"><b>${new Date(`${v.mulai}T00:00:00`).getDate()}</b><span>${esc(R9.tanggal(v.mulai, { month: 'short', year: '2-digit' }))}</span></div>
    <div><p class="event__nama">${esc(R9.teks(v.nama))}</p><p class="event__meta">${esc([R9.t(`jenis.${v.jenis}`), R9.teks(v.tempat), v.selesai && v.selesai !== v.mulai ? `${R9.tanggal(v.mulai)} – ${R9.tanggal(v.selesai)}` : ''].filter(Boolean).join(' · '))}</p>
    ${R9.teks(v.keterangan) ? `<p>${esc(R9.teks(v.keterangan))}</p>` : ''}
    ${R9.teks(v.hasil) || v.hadiah ? `<p class="event__meta">${R9.teks(v.hasil) ? `${esc(R9.t('jadwal.hasil'))}: <strong>${esc(R9.teks(v.hasil))}</strong>` : ''}${v.hadiah ? ` · ${esc(R9.t('jadwal.hadiah'))}: <strong>${esc(R9.rupiah(v.hadiah))}</strong>` : ''}</p>` : ''}
    ${v.link ? `<a href="${esc(v.link)}" target="_blank" rel="noopener">${esc(R9.t('jadwal.daftar'))}</a>` : ''}</div></li>`;
  const ev = d.event || [], akan = ev.filter((v) => (v.selesai || v.mulai) >= hariIni()), lewat = ev.filter((v) => (v.selesai || v.mulai) < hariIni()).reverse();
  $('[data-event-akan]').innerHTML = akan.map(kartuEvent).join('');
  $('[data-event-kosong]').hidden = akan.length > 0;
  $('[data-event-lewat]').innerHTML = lewat.slice(0, 8).map(kartuEvent).join('');
  $('[data-event-lewat-judul]').hidden = !lewat.length;
  $('[data-prestasi]').innerHTML = (d.prestasi || []).map((p) => `<li class="prestasi"><span class="prestasi__lencana">${esc(R9.teks(p.peringkat))}</span>
    <span class="prestasi__nama">${esc(R9.teks(p.turnamen))}<small>${esc(R9.tanggal(p.tanggal))}</small></span><span class="prestasi__hadiah">${esc(R9.rupiah(p.hadiah))}</span></li>`).join('');
  // news (diurut dari tanggal tulisan, bisa tanggal mundur dari admin)
  const news = (d.news || []).slice().sort((a, b) => (b.tanggal > a.tanggal ? 1 : -1));
  $('[data-news-kosong]').hidden = news.length > 0;
  $('[data-news]').innerHTML = news.slice(0, newsTampil).map((n) => `<button class="berita" type="button" data-berita="${n.id}">
    ${n.gambar ? `<img src="${esc(n.gambar)}" alt="" loading="lazy" width="800" height="450">` : ''}
    <span class="berita__isi"><time datetime="${esc(n.tanggal)}">${esc(R9.tanggal(n.tanggal))}</time><h3>${esc(R9.teks(n.judul))}</h3><p>${esc(R9.teks(n.ringkas) || String(R9.teks(n.isi)).slice(0, 140))}</p></span></button>`).join('');
  $('[data-news-lebih]').hidden = news.length <= newsTampil;
}
$('[data-news-lebih]').addEventListener('click', () => { newsTampil += 6; gambarData(); });
$('[data-news]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-berita]'); if (!b) return;
  const n = (DATA?.news || []).find((x) => String(x.id) === b.dataset.berita); if (!n) return;
  const dlg = $('[data-baca]'), img = $('.baca__gambar', dlg);
  img.hidden = !n.gambar; if (n.gambar) img.src = n.gambar;
  $('.baca__tanggal', dlg).textContent = R9.tanggal(n.tanggal);
  $('.baca__judul', dlg).textContent = R9.teks(n.judul);
  $('.baca__isi', dlg).textContent = R9.teks(n.isi);
  dlg.showModal();
});
document.addEventListener('r9:bahasa', gambarData);
(async () => {
  const segarkan = async () => { const d = await ambilData(); if (d) { const beda = JSON.stringify(d) !== JSON.stringify(DATA); DATA = d; if (beda) gambarData(); } };
  gambarData(); await segarkan();
  // "realtime": cek data baru tiap 30 detik selama halaman kebuka
  setInterval(() => { if (!document.hidden) segarkan(); }, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) segarkan(); });
})();

// ---------- pembuat banner ----------
(() => {
  const kanvas = $('.banner__kanvas'), c = kanvas.getContext('2d'), isian = $('[name=nama-banner]'), gambar = {};
  const muat = (n) => gambar[n] || (gambar[n] = new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = `gambar/banner/banner-${n}.jpg`; }));
  const lukis = async () => {
    const n = $('[name=banner]:checked').value, img = await muat(n);
    c.clearRect(0, 0, 1500, 500);
    if (img) c.drawImage(img, 0, 0, 1500, 500); else { c.fillStyle = '#000'; c.fillRect(0, 0, 1500, 500); }
    const nama = isian.value.trim();
    if (!nama) return;
    await document.fonts.load('700 80px Oxanium').catch(() => {});
    let uk = 96; c.font = `700 ${uk}px Oxanium, sans-serif`;
    while (c.measureText(nama.toUpperCase()).width > 760 && uk > 36) { uk -= 4; c.font = `700 ${uk}px Oxanium, sans-serif`; }
    c.textAlign = 'right'; c.textBaseline = 'alphabetic';
    const g = c.createLinearGradient(700, 330, 1500, 500); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)');
    c.fillStyle = g; c.fillRect(700, 330, 800, 170);
    c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 18; c.fillStyle = '#fff';
    c.fillText(nama.toUpperCase(), 1450, 455); c.shadowBlur = 0;
  };
  $$('[name=banner]').forEach((r) => r.addEventListener('change', lukis));
  isian.addEventListener('input', lukis);
  $('[data-unduh]').addEventListener('click', async () => {
    await lukis();
    const a = document.createElement('a');
    a.download = `reign9-banner-${(isian.value.trim() || 'r9').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    a.href = kanvas.toDataURL('image/png'); a.click();
  });
  lukis();
})();

// ---------- contact: kirim lewat server admin (email), cadangan aplikasi email ----------
(() => {
  const form = $('.kontak__form'), info = $('.kontak__info'), ixar = $('.kontak__ixar');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.nama.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) || !d.pesan.trim()) { info.textContent = R9.t('kontak.lengkapi'); ixar.ixar?.lakukan('kaget', 1200); return; }
    const tombol = $('button[type=submit]', form); tombol.disabled = true;
    try {
      const r = await fetch(`${ADMIN}/api/kontak`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, bahasa: R9.bahasa }) });
      if (!r.ok) throw new Error();
      info.textContent = R9.t('kontak.terkirim'); form.reset(); ixar.ixar?.lakukan('menang', 2200);
    } catch (err) {
      info.textContent = R9.t('kontak.gagal');
      location.href = `mailto:reign9intl@reign9.site?cc=reignnine2@gmail.com&subject=${encodeURIComponent(`[R9 Contact] ${d.keperluan} - ${d.nama}`)}&body=${encodeURIComponent(`${d.pesan}\n\n${d.nama} <${d.email}>`)}`;
    } finally { tombol.disabled = false; }
  });
})();
