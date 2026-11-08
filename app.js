// Reign 9: menu HP, bara jadi logo di hero, podium balik, pembuat banner, form gabung lewat WhatsApp.
// Nomor WA admin diisi owner (format 62xxxxxxxxxx). Kosong = form ngasih tau belum dipasang.
const WA_ADMIN = '';

const gerakBoleh = !matchMedia('(prefers-reduced-motion: reduce)').matches;
// versi file (dari app.js?v=...) dipakai juga waktu ngambil logo, biar gak kecampur versi lama di cache
const VERSI = (document.currentScript && new URL(document.currentScript.src).searchParams.get('v')) || '';

// ---------- tema terang/gelap ----------
// Bawaan ngikutin setelan perangkat; pilihan lewat tombol disimpen di perangkat pengunjung.
// Ganti tema: tema baru nyebar berbentuk lingkaran dari tombol (View Transitions), browser lama warna memudar.
const temaSekarang = () => document.documentElement.dataset.tema || (matchMedia('(prefers-color-scheme: light)').matches ? 'terang' : 'gelap');
const pasangTema = (t) => {
  document.documentElement.dataset.tema = t;
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', '#DA1617');
  try { localStorage.setItem('tema', t); } catch (e) {}
};
document.querySelector('.nav__tema').addEventListener('click', (e) => {
  const baru = temaSekarang() === 'terang' ? 'gelap' : 'terang';
  if (!gerakBoleh) return pasangTema(baru);
  if (!document.startViewTransition) {
    document.documentElement.classList.add('ganti-tema');
    pasangTema(baru);
    return setTimeout(() => document.documentElement.classList.remove('ganti-tema'), 500);
  }
  const r = e.currentTarget.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const jari = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(() => pasangTema(baru)).ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${jari}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(.65, 0, .35, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
});

// ---------- menu HP ----------
const tombolMenu = document.querySelector('.nav__buka');
const menu = document.getElementById('menu');
tombolMenu.addEventListener('click', () => {
  const buka = tombolMenu.getAttribute('aria-expanded') !== 'true';
  tombolMenu.setAttribute('aria-expanded', buka);
  menu.classList.toggle('buka', buka);
});
menu.addEventListener('click', (e) => {
  if (e.target.closest('a')) { tombolMenu.setAttribute('aria-expanded', 'false'); menu.classList.remove('buka'); }
});

// ---------- bara ngumpul jadi logo R9 (hero) ----------
// Titik logo diambil dari bentuk simbol di sprite. Bara naik dari bawah, muter, terus nempel ke titiknya.
// Kursor/jari nyebarin bara di sekitarnya; dilepas = balik ke bentuk logo. Gerak dikurangi = logo diam (SVG).
(async () => {
  const kanvas = document.querySelector('.hero__bara');
  const wadah = document.querySelector('.hero__logo');
  if (!kanvas || !wadah || !gerakBoleh) return;
  const c = kanvas.getContext('2d');
  const sprite = await fetch(`gambar/logo.svg?v=${VERSI}`).then((r) => r.text()).catch(() => '');
  const m = sprite.match(/id="tegak" viewBox="([^"]+)">(.*?)<\/symbol>/);
  if (!m) return;
  const vb = m[1].split(' ').map(Number), bentuk = [...m[2].matchAll(/ d="([^"]+)"/g)].map((x) => new Path2D(x[1]));
  // dominan merah; oranye & kuning cuma sedikit buat kesan inti api
  const WARNA = [['#da1617', 34], ['#ff1f1f', 22], ['#b30d10', 18], ['#ff3b26', 14], ['#ff6a2a', 8], ['#ffb04a', 4]];
  const pilihWarna = () => { let n = Math.random() * 100; for (const [w, b] of WARNA) { if ((n -= b) < 0) return w; } return WARNA[0][0]; };
  let w, h, butir = [], lepas = [], px = -999, py = -999, jalan = true, mulai = performance.now();

  const titikLogo = () => {
    const r = wadah.getBoundingClientRect(), k = kanvas.getBoundingClientRect();
    const lw = Math.round(r.width), lh = Math.round(r.height);
    // OffscreenCanvas belum ada di Safari lama: pakai kanvas biasa
    const o = typeof OffscreenCanvas === 'function' ? new OffscreenCanvas(lw, lh) : Object.assign(document.createElement('canvas'), { width: lw, height: lh });
    const oc = o.getContext('2d', { willReadFrequently: true });
    const s = Math.min(lw / vb[2], lh / vb[3]);
    oc.translate((lw - vb[2] * s) / 2, 0); oc.scale(s, s); oc.translate(-vb[0], -vb[1]);
    bentuk.forEach((b) => oc.fill(b, 'evenodd'));
    // tulisan (di bawah pedang) dicuplik lebih rapat biar huruf INTERNATIONAL yang tipis tetap kebaca
    const data = oc.getImageData(0, 0, lw, lh).data, batasTeks = (355 - vb[1]) * s, hasil = [];
    const jarakSimbol = lw < 320 ? 3 : 3.5, jarakTeks = 2;
    for (let y = 0; y < lh; y += (y < batasTeks ? jarakSimbol : jarakTeks)) {
      const j = y < batasTeks ? jarakSimbol : jarakTeks;
      for (let x = 0; x < lw; x += j) {
        if (data[(Math.round(y) * lw + Math.round(x)) * 4 + 3] > 128) hasil.push([r.left - k.left + x, r.top - k.top + y, y >= batasTeks]);
      }
    }
    return hasil;
  };
  const ukur = () => {
    const rasio = Math.min(devicePixelRatio || 1, 2);
    w = kanvas.clientWidth; h = kanvas.clientHeight;
    kanvas.width = w * rasio; kanvas.height = h * rasio; c.setTransform(rasio, 0, 0, rasio, 0, 0);
    const titik = titikLogo();
    butir = titik.map(([tx, ty, teks], i) => butir[i] ? Object.assign(butir[i], { tx, ty }) : {
      x: Math.random() * w, y: h + Math.random() * h * .6, vx: 0, vy: 0, tx, ty,
      r: teks ? Math.random() * .35 + .9 : Math.random() * .9 + 1.05, warna: pilihWarna(),
      tunda: Math.random() * 900 + (teks ? 350 : 0), kedip: Math.random() * 6.28,
    });
    lepas = Array.from({ length: Math.round(w / 16) }, () => baraLepas(true));
  };
  const baraLepas = (acak) => ({
    x: Math.random() * w, y: acak ? Math.random() * h : h + 10, r: Math.random() * 1.8 + .5,
    v: Math.random() * .6 + .25, goyang: Math.random() * 6.28, umur: Math.random() * .5 + .4,
  });
  const gambar = (t) => {
    if (!jalan) return;
    const umur = t - mulai;
    c.clearRect(0, 0, w, h);
    const terang = temaSekarang() === 'terang';
    c.globalCompositeOperation = terang ? 'source-over' : 'lighter';
    for (const b of lepas) {
      b.y -= b.v; b.goyang += .02; b.x += Math.sin(b.goyang) * .35;
      c.globalAlpha = Math.max(0, Math.min(1, b.y / h)) * b.umur * (terang ? .55 : 1);
      c.fillStyle = '#ff2a1a'; c.beginPath(); c.arc(b.x, b.y, b.r, 0, 6.29); c.fill();
      if (b.y < -10) Object.assign(b, baraLepas(false));
    }
    c.globalCompositeOperation = 'source-over'; // butir logo gak ditumpuk 'lighter' biar merahnya gak pudar jadi oranye
    for (const b of butir) {
      if (umur > b.tunda) {
        // pegas ke titik logo + putaran kecil biar kerasa kayak bara ketiup
        const dx = b.tx - b.x, dy = b.ty - b.y;
        b.vx += dx * .012 - dy * .002; b.vy += dy * .012 + dx * .002;
        const ex = b.x - px, ey = b.y - py, d2 = ex * ex + ey * ey;
        if (d2 < 6400) { const f = (6400 - d2) / 6400 * 2.4, d = Math.sqrt(d2) || 1; b.vx += ex / d * f; b.vy += ey / d * f; }
        b.vx *= .86; b.vy *= .86;
      } else { b.vy -= .02; }
      b.x += b.vx; b.y += b.vy; b.kedip += .08;
      c.globalAlpha = terang ? .93 + Math.sin(b.kedip) * .07 : .75 + Math.sin(b.kedip) * .25;
      c.fillStyle = b.warna; c.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    requestAnimationFrame(gambar);
  };
  const hero = kanvas.closest('.hero');
  hero.addEventListener('pointermove', (e) => { const k = kanvas.getBoundingClientRect(); px = e.clientX - k.left; py = e.clientY - k.top; });
  hero.addEventListener('pointerleave', () => { px = py = -999; });
  hero.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') px = py = -999; });
  new IntersectionObserver(([e]) => { const tadi = jalan; jalan = e.isIntersecting; if (jalan && !tadi) requestAnimationFrame(gambar); }).observe(kanvas);
  let tunggu; addEventListener('resize', () => { clearTimeout(tunggu); tunggu = setTimeout(ukur, 150); });
  // logo SVG asli baru disembunyiin kalau bara udah pasti kegambar; gagal = logo biasa tetap tampil
  try {
    ukur();
    if (!butir.length) throw new Error('titik logo kosong');
    document.documentElement.classList.add('bara-hidup');
    requestAnimationFrame(gambar);
  } catch (e) {
    document.documentElement.classList.remove('bara-hidup');
    kanvas.remove();
  }
})();

// ---------- maskot rubah ekor sembilan (BELUM DISETUJUI OWNER: cuma muncul di pratinjau lokal pakai ?rubah) ----------
(async () => {
  if (!new URLSearchParams(location.search).has('rubah')) {
    // tanpa maskot: podium pakai pedang R9, rubah ngintip di form dibuang
    document.querySelector('.rubah-intip')?.remove();
    const podium = document.querySelector('.podium__rubah');
    if (podium) podium.outerHTML = '<svg class="podium__pedang" viewBox="0 0 105.63 183.98" aria-hidden="true"><use href="gambar/logo.svg#simbol"/></svg><span class="podium__bendera" aria-hidden="true"><span>9</span></span>';
    return;
  }
  document.documentElement.classList.add('pakai-rubah');
  const tempat = [...document.querySelectorAll('[data-rubah]')];
  if (!tempat.length) return;
  const svg = await fetch('gambar/rubah.svg').then((r) => r.text()).catch(() => '');
  tempat.forEach((el) => { el.innerHTML = svg; });
  const lirik = (el, dx, dy) => el.querySelectorAll('.pupil').forEach((p) => {
    p.style.transform = `translate(${Math.max(-3.5, Math.min(3.5, dx)).toFixed(2)}px, ${Math.max(-2, Math.min(2, dy)).toFixed(2)}px)`;
  });
  addEventListener('pointermove', (e) => {
    for (const el of tempat) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) continue;
      lirik(el, (e.clientX - (r.left + r.width / 2)) / 50, (e.clientY - (r.top + r.height * .4)) / 70);
    }
  }, { passive: true });
  tempat.forEach((el) => {
    const kedip = () => { el.classList.add('kedip'); setTimeout(() => el.classList.remove('kedip'), 150); setTimeout(kedip, 2500 + Math.random() * 4000); };
    setTimeout(kedip, 2000 + Math.random() * 2000);
  });
  // rubah di form: nongol pas form keliatan, ngeliat kolom yang lagi diisi
  const intip = document.querySelector('.rubah-intip');
  if (intip) {
    const form = intip.closest('form');
    new IntersectionObserver((d, o) => { if (d.some((e) => e.isIntersecting)) { intip.classList.add('muncul'); o.disconnect(); } }, { threshold: .3 }).observe(form);
    form.addEventListener('focusin', (e) => {
      const a = intip.getBoundingClientRect(), b = e.target.getBoundingClientRect();
      lirik(intip, (b.left + b.width / 2 - (a.left + a.width / 2)) / 30, 3);
    });
  }
})();

// ---------- podium balik pas keliatan ----------
const podium = document.querySelector('.podium');
new IntersectionObserver((daftar, o) => {
  if (daftar.some((e) => e.isIntersecting)) { podium.classList.add('keliatan'); o.disconnect(); }
}, { threshold: .15 }).observe(podium);

// ---------- pembuat banner ----------
(async () => {
  const kanvas = document.querySelector('.banner__kanvas');
  const c = kanvas.getContext('2d');
  const isian = document.querySelector('[name=tag]');
  const W = 1500, H = 500;
  // Ambil bentuk logo dari sprite, biar banner pakai vektor asli.
  const sprite = await fetch(`gambar/logo.svg?v=${VERSI}`).then((r) => r.text()).catch(() => '');
  const bentuk = (id) => {
    const m = sprite.match(new RegExp(`id="${id}" viewBox="([^"]+)">(.*?)</symbol>`));
    return m ? { vb: m[1].split(' ').map(Number), p: [...m[2].matchAll(/ d="([^"]+)"/g)].map((x) => new Path2D(x[1])) } : null;
  };
  const simbol = bentuk('simbol'), datar = bentuk('datar');
  await document.fonts.load('700 80px Oxanium');

  const logo = (b, x, y, tinggi, warna) => {
    if (!b) return;
    const s = tinggi / b.vb[3];
    c.save(); c.translate(x, y); c.scale(s, s); c.translate(-b.vb[0], -b.vb[1]);
    c.fillStyle = warna; b.p.forEach((p) => c.fill(p, 'evenodd')); c.restore();
  };
  const garisLayar = () => {
    c.fillStyle = 'rgba(0,0,0,.18)';
    for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 1);
  };
  const gaya = {
    bara() {
      const g = c.createRadialGradient(1060, 250, 20, 1060, 250, 620);
      g.addColorStop(0, '#DA1617'); g.addColorStop(.55, '#7A0A10'); g.addColorStop(1, '#170406');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      logo(simbol, 930, 40, 420, 'rgba(0,0,0,.55)');
      garisLayar();
      return { teks: '#F3E9DC', aksen: '#DA1617' };
    },
    takhta() {
      c.fillStyle = '#DA1617'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#000';
      for (let i = 0; i < 9; i++) c.fillRect(780 + i * 78, 0, 30, H);
      logo(simbol, 1150, 60, 380, '#F3E9DC');
      return { teks: '#000', aksen: '#F3E9DC' };
    },
    malam() {
      c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(218,22,23,.35)'; c.lineWidth = 2;
      for (let x = -H; x < W; x += 36) { c.beginPath(); c.moveTo(x, H); c.lineTo(x + H, 0); c.stroke(); }
      c.fillStyle = '#000'; c.fillRect(0, 0, 820, H);
      logo(simbol, 1080, 50, 400, '#DA1617');
      return { teks: '#F3E9DC', aksen: '#DA1617' };
    },
  };
  const gambar = () => {
    const pilih = document.querySelector('[name=gaya]:checked').value;
    const warna = gaya[pilih]();
    const tag = (isian.value.trim() || 'GAMERTAG').toUpperCase();
    let ukuran = 150;
    c.font = `700 ${ukuran}px Oxanium`;
    while (c.measureText(tag).width > 760 && ukuran > 50) { ukuran -= 6; c.font = `700 ${ukuran}px Oxanium`; }
    c.fillStyle = warna.teks; c.textBaseline = 'alphabetic';
    c.fillText(tag, 72, 300);
    logo(datar, 76, 340, 92, warna.aksen === '#000' ? '#000' : '#DA1617');
  };
  document.querySelectorAll('[name=gaya]').forEach((r) => r.addEventListener('change', gambar));
  isian.addEventListener('input', gambar);
  document.querySelector('[data-unduh]').addEventListener('click', () => {
    const a = document.createElement('a');
    a.download = `reign9-banner-${(isian.value.trim() || 'gamertag').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    a.href = kanvas.toDataURL('image/png'); a.click();
  });
  gambar();
})();

// ---------- form gabung → WhatsApp ----------
const form = document.querySelector('.gabung__form');
const info = form.querySelector('.gabung__info');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const d = new FormData(form);
  if (!d.get('nama').trim() || !d.get('nick').trim()) { info.textContent = 'Isi nama dan nickname HoK dulu.'; return; }
  if (!WA_ADMIN) { info.textContent = 'Nomor WhatsApp admin belum dipasang. Pesanmu belum terkirim.'; return; }
  const teks = `Halo Reign 9, aku mau gabung.\nNama: ${d.get('nama')}\nNickname HoK: ${d.get('nick')}\nRole: ${d.get('role')}\n${d.get('pesan')}`;
  open(`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent(teks)}`, '_blank', 'noopener');
  info.textContent = 'WhatsApp kebuka. Tinggal tekan kirim di sana.';
});
