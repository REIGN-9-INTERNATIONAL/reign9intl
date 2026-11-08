// Reign 9: menu HP, bara di hero, podium balik, pembuat banner, form gabung lewat WhatsApp.
// Nomor WA admin diisi owner (format 62xxxxxxxxxx). Kosong = form ngasih tau belum dipasang.
const WA_ADMIN = '';

const gerakBoleh = !matchMedia('(prefers-reduced-motion: reduce)').matches;

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

// ---------- bara naik di hero ----------
(() => {
  const kanvas = document.querySelector('.hero__bara');
  if (!kanvas || !gerakBoleh) return;
  const c = kanvas.getContext('2d');
  let w, h, bara = [], jalan = true;
  const ukur = () => {
    const r = devicePixelRatio > 1 ? 2 : 1;
    w = kanvas.clientWidth; h = kanvas.clientHeight;
    kanvas.width = w * r; kanvas.height = h * r; c.setTransform(r, 0, 0, r, 0, 0);
    bara = Array.from({ length: Math.round(w / 14) }, () => baru(true));
  };
  const baru = (acak) => ({
    x: Math.random() * w, y: acak ? Math.random() * h : h + 10,
    r: Math.random() * 2 + .6, v: Math.random() * .6 + .25, goyang: Math.random() * 6.28, umur: Math.random() * .5 + .5,
  });
  const gambar = () => {
    if (!jalan) return;
    c.clearRect(0, 0, w, h);
    for (const b of bara) {
      b.y -= b.v; b.goyang += .02; b.x += Math.sin(b.goyang) * .35;
      const a = Math.max(0, Math.min(1, b.y / h)) * b.umur;
      c.fillStyle = `rgba(255, ${90 + b.r * 40 | 0}, 60, ${a})`;
      c.beginPath(); c.arc(b.x, b.y, b.r, 0, 6.29); c.fill();
      if (b.y < -10) Object.assign(b, baru(false));
    }
    requestAnimationFrame(gambar);
  };
  new IntersectionObserver(([e]) => { jalan = e.isIntersecting; if (jalan) gambar(); }).observe(kanvas);
  addEventListener('resize', ukur);
  ukur();
})();

// ---------- aula geser ikut kursor & scroll (lapis dekat geser lebih jauh) ----------
(() => {
  const hero = document.querySelector('.hero');
  const lapis = [...document.querySelectorAll('.lapis')];
  if (!gerakBoleh || !lapis.length) return;
  let mx = 0, my = 0, sy = 0, antre = false;
  const pasang = () => {
    antre = false;
    for (const l of lapis) {
      const k = +l.dataset.dalam;
      l.style.setProperty('--gx', `${(-mx * k).toFixed(1)}px`);
      l.style.setProperty('--gy', `${(-my * k + sy * k * .04).toFixed(1)}px`);
    }
  };
  const minta = () => { if (!antre) { antre = true; requestAnimationFrame(pasang); } };
  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = hero.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; minta();
  });
  hero.addEventListener('pointerleave', () => { mx = my = 0; minta(); });
  addEventListener('scroll', () => { sy = Math.min(scrollY, innerHeight); minta(); }, { passive: true });
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
  const sprite = await fetch('gambar/logo.svg').then((r) => r.text()).catch(() => '');
  const bentuk = (id) => {
    const m = sprite.match(new RegExp(`id="${id}" viewBox="([^"]+)"><path[^>]* d="([^"]+)"`));
    return m ? { vb: m[1].split(' ').map(Number), p: new Path2D(m[2]) } : null;
  };
  const simbol = bentuk('simbol'), datar = bentuk('datar');
  await document.fonts.load('80px "Jersey 10"');

  const logo = (b, x, y, tinggi, warna) => {
    if (!b) return;
    const s = tinggi / b.vb[3];
    c.save(); c.translate(x, y); c.scale(s, s); c.translate(-b.vb[0], -b.vb[1]);
    c.fillStyle = warna; c.fill(b.p, 'evenodd'); c.restore();
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
    let ukuran = 210;
    c.font = `${ukuran}px "Jersey 10"`;
    while (c.measureText(tag).width > 760 && ukuran > 60) { ukuran -= 6; c.font = `${ukuran}px "Jersey 10"`; }
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
