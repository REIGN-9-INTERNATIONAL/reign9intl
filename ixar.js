// IXAR (dibaca IK-SAR), maskot Reign 9. Kerangka hidup: kepala & mahkota dari gambar asli owner,
// mata digambar ulang (kedip, ngelirik, emosi), tangan & kaki garis lentur yang posenya dihitung tiap frame.
// Pakai: <span data-ixar="diam"></span>  (nilai = pose dasar). Interaktif: ikut kursor, diklik/disentuh bereaksi,
// didiemin lama ketiduran. Script lain bisa nyuruh: el.ixar.lakukan('tonjok', 900).
(() => {
  const MAHKOTA = 'M755.4 60.4L778.0 60.0L798.0 62.0L807.4 65.6L813.4 71.6L815.0 76.0L815.0 150.0L816.6 156.4L820.6 160.4L840.0 162.0L845.8 158.8L848.0 152.0L848.8 101.8L852.2 96.2L857.6 92.6L867.0 91.0L909.0 93.0L914.4 94.6L920.8 100.2L924.0 109.0L923.0 158.0L924.6 164.4L928.6 168.4L947.0 171.0L953.0 168.0L956.0 153.0L955.8 120.8L961.2 113.2L969.0 110.0L997.0 112.0L1018.6 118.4L1028.8 126.2L1033.4 133.6L1036.0 142.0L1038.0 218.0L1035.4 229.4L1031.6 235.6L937.0 232.0L781.0 232.0L606.0 232.0L504.0 236.0L499.6 232.4L496.0 218.0L496.0 173.0L498.0 143.0L501.6 131.6L505.2 126.2L513.6 119.6L524.8 114.8L543.0 111.0L566.0 110.0L571.4 111.6L576.8 116.2L579.0 121.0L579.0 162.0L580.4 166.6L587.0 171.0L599.0 170.0L608.2 167.2L611.0 161.0L611.0 107.0L615.2 98.2L622.6 93.6L632.0 92.0L675.0 92.0L680.4 93.6L685.8 98.2L689.0 107.0L688.0 147.0L689.6 157.4L696.0 162.0L713.0 161.0L718.8 157.8L721.0 151.0L721.6 74.6L730.6 64.6L739.0 62.0Z';
  const KEPALA = 'M652.4 245.4L973.0 246.0L1025.0 248.0L1030.6 249.4L1032.4 251.6L1041.0 297.0L1042.0 330.0L1035.0 382.0L1031.0 449.0L1024.2 478.2L1016.4 499.4L1007.4 516.4L990.8 538.8L979.8 549.8L961.8 563.8L926.4 582.4L869.6 599.6L839.8 607.8L834.0 612.0L700.0 612.0L694.2 607.8L609.8 583.2L584.6 571.4L555.2 550.8L537.2 531.8L524.6 513.4L511.8 485.2L503.0 449.0L500.0 415.0L500.0 395.0L492.0 332.0L493.0 295.0L501.6 251.6L508.0 248.0L525.0 247.0Z';
  const NS = 'http://www.w3.org/2000/svg';
  // pedang Reign: cuma bagian pedang dari simbol logo (kepala berlian, gagang, palang, bilah), tanpa huruf R & 9
  const PEDANG = ["M285.57 183.87 L296.81 172.62 L308.05 183.87 L301.31 190.61 L292.31 190.61 L285.57 183.87 L285.57 183.87 Z M300.02 191.89 L296.81 195.10 L293.60 191.89 L300.02 191.89 L300.02 191.89 Z M292.08 183.86 L296.81 188.59 L301.53 183.86 L296.81 179.14 L292.08 183.86 Z", "M270.56 226.56 C266.63 220.58 265.32 213.33 271.66 208.44 C277.44 213.36 280.30 214.06 287.84 212.89 C292.53 208.43 292.80 204.98 292.91 202.54 L292.91 191.89 L300.65 191.89 L300.65 202.51 C301.48 206.14 301.05 208.40 305.78 212.89 C313.31 214.06 316.18 213.36 321.96 208.44 C328.29 213.33 326.99 220.58 323.06 226.56 C323.06 226.56 320.74 221.14 315.84 219.21 C312.09 217.73 308.19 218.21 306.56 218.52 C306.20 220.33 307.68 222.81 309.30 224.89 L312.90 228.85 C304.37 233.77 302.17 236.70 302.17 247.44 L302.17 349.05 L296.81 352.60 L291.45 349.05 L291.45 254.04 C291.45 236.40 291.76 236.12 280.71 228.85 L284.31 224.89 C285.94 222.81 287.42 220.33 287.05 218.52 C285.43 218.21 281.53 217.73 277.78 219.21 C272.88 221.14 270.56 226.56 270.56 226.56 L270.56 226.56 Z M292.06 215.50 L296.81 220.25 L301.56 215.50 L296.81 210.76 L292.06 215.50 Z"];
  const gerakBoleh = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  // sendi (koordinat gambar asli 1536x1024)
  const BAHU = [[718, 628], [818, 628]], PINGGUL = [[746, 790], [790, 790]], LEHER = [768, 604], TAPAK = [768, 940];
  const LENGAN = [92, 100], KAKI = [86, 84];
  // sudut ruas: 0 = lurus ke bawah, positif = ke kanan layar, 180 = ke atas
  const P = (o) => ({ lk: [-35, -28], ln: [35, 28], kk: [-22, -20], kn: [22, 20], dx: 0, dy: 0, rot: 0, sx: 1, sy: 1, kep: 0, mahkota: 0, panjang: 1, mata: 'biasa', alat: '', ...o });
  const POSE = {
    diam: P({ kk: [-26, -20], kn: [26, 20] }),
    nyambut: P({ ln: [95, 122], panjang: 1.6, lk: [-55, -15], mata: 'senang', alat: 'percik-kiri', gerak: 'lambai' }),
    tunjuk: P({ dy: 6, ln: [88, 90], lk: [-62, 40], kk: [-30, -20], kn: [30, 20], mata: 'yakin', gerak: 'tunjuk' }),
    intip: P({ rot: -10, kep: -8, ln: [70, 160], lk: [-20, -5], mata: 'lirik' }),
    penasaran: P({ panjang: 1.15, ln: [28, 205], lk: [-15, 70], kep: 6, mata: 'penasaran', alat: 'tanya' }),
    pedang: P({ kep: -3, dy: 8, ln: [42, 8], lk: [-62, 40], kk: [-30, -18], kn: [30, 18], mata: 'yakin', alat: 'pedang' }),
    tonjok: P({ rot: 10, dx: 30, dy: 30, ln: [92, 90], lk: [-25, 70], kk: [-62, -62], kn: [55, 5], mata: 'marah', alat: 'percik-tinju', gerak: 'kuda' }),
    lompat: P({ dy: -130, panjang: 1.45, ln: [100, 120], lk: [-100, -120], kk: [-70, 15], kn: [70, -15], mata: 'senang' }),
    menang: P({ dy: -90, panjang: 1.6, ln: [92, 145], lk: [-92, -145], kk: [-35, -5], kn: [70, -30], mata: 'senang', alat: 'percik-atas' }),
    serbu: P({ rot: 14, dx: 40, dy: 34, ln: [80, 92], lk: [-115, -100], kk: [-66, -66], kn: [58, 4], mata: 'marah', alat: 'pedang', gerak: 'kuda' }),
    tameng: P({ dy: 22, lk: [-12, 78], ln: [55, 20], kk: [-42, -14], kn: [42, 14], mata: 'marah', alat: 'tameng', gerak: 'kuda' }),
    marah: P({ dy: 18, lk: [-32, -14], ln: [32, 14], kk: [-40, -12], kn: [40, 12], mata: 'marah', alat: 'percik-atas', gerak: 'getar' }),
    kaget: P({ dy: -24, panjang: 1.55, lk: [-95, -135], ln: [95, 135], kk: [-15, -30], kn: [30, 10], mata: 'kaget', alat: 'percik-atas' }),
    kecewa: P({ sy: .96, kep: 10, lk: [-8, -4], ln: [8, 4], mata: 'sayu', alat: 'daun' }),
    tidur: P({ kep: -9, lk: [-15, -5], ln: [15, 5], mata: 'tidur', alat: 'zzz', gerak: 'napas-tidur' }),
    regang: P({ panjang: 1.65, lk: [-92, -150], ln: [92, 150], kk: [-14, -12], kn: [14, 12], sy: 1.03, mata: 'senang' }),
    meditasi: P({ dy: 115, kk: [-105, 75], kn: [105, -75], lk: [-50, -100], ln: [50, 100], mata: 'tidur' }),
    bendera: P({ dy: 8, panjang: 1.6, ln: [92, 140], lk: [-62, 40], kk: [-32, -20], kn: [32, 20], mata: 'yakin' }),
    jalan: P({ mata: 'biasa', gerak: 'jalan' }),
    jalanCepat: P({ rot: 6, mata: 'yakin', gerak: 'jalan-cepat' }),
    santai: P({ rot: -4, lk: [-60, 40], ln: [60, -40], kn: [8, -40], mata: 'sayu' }),
  };
  const ANGKA = ['dx', 'dy', 'rot', 'sx', 'sy', 'kep', 'mahkota', 'panjang'];

  const buat = (tag, attr = {}, induk) => { const e = document.createElementNS(NS, tag); for (const k in attr) e.setAttribute(k, attr[k]); induk?.append(e); return e; };
  const ujung = ([x, y], sudut, panjang) => { const r = sudut * Math.PI / 180; return [x + Math.sin(r) * panjang, y + Math.cos(r) * panjang]; };
  const lerp = (a, b, t) => a + (b - a) * t;
  // bentuk mata (jendela kastil) per emosi. kotak: [x0, y0, x1, y1]
  const MATA = [[604, 300, 696, 439], [838, 300, 930, 439]];
  function bentukMata(jenis, i, buka) {
    const [x0, y0, x1, y1] = MATA[i], w = x1 - x0, r = w / 2, cx = (x0 + x1) / 2;
    const tinggi = (y1 - y0) * Math.max(.06, buka), atas = y1 - tinggi;
    const jendela = (a) => tinggi > r ? `M${x0} ${y1}V${a + r}A${r} ${r} 0 0 1 ${x1} ${a + r}V${y1}Z` : `M${x0} ${y1}L${x0} ${a}L${x1} ${a}L${x1} ${y1}Z`;
    const dalam = i === 0 ? 1 : -1; // sisi mata yang dekat tengah wajah
    switch (jenis) {
      case 'senang': return `M${x0 - 4} ${y1 - 20}Q${cx} ${y0 + 30} ${x1 + 4} ${y1 - 20}Q${cx} ${y0 + 70} ${x0 - 4} ${y1 - 20}Z`;
      case 'tidur': return `M${x0} ${y1 - 46}Q${cx} ${y1 - 16} ${x1} ${y1 - 46}Q${cx} ${y1 - 30} ${x0} ${y1 - 46}Z`;
      case 'marah': { const tinggiDalam = i === 0 ? [y1 - 40, y1 - 90] : [y1 - 90, y1 - 40]; return `M${x0} ${y1}L${x0} ${tinggiDalam[0]}L${x1} ${tinggiDalam[1]}L${x1} ${y1}Z`; }
      case 'kaget': return jendela(Math.min(atas, y0) - 18).replace(/A/, `A`) ;
      case 'sayu': case 'yakin': return `M${x0} ${y1}L${x0} ${y1 - Math.min(tinggi, 62)}L${x1} ${y1 - Math.min(tinggi, 62)}L${x1} ${y1}Z`;
      case 'penasaran': return i === 0 ? `M${x0} ${y1 - 18}L${x0} ${y1 - 58}L${x1} ${y1 - 52}L${x1} ${y1 - 18}Z` : jendela(atas);
      case 'lirik': return jendela(atas + 10);
      default: return jendela(atas);
    }
  }

  class Ixar {
    constructor(el) {
      this.el = el; this.dasar = el.dataset.ixar || 'diam'; this.pose = this.dasar;
      this.n = { ...POSE[this.pose], lk: [...POSE[this.pose].lk], ln: [...POSE[this.pose].ln], kk: [...POSE[this.pose].kk], kn: [...POSE[this.pose].kn] };
      this.lirikX = 0; this.lirikY = 0; this.tujuanLirik = [0, 0]; this.buka = 1; this.diamSejak = performance.now(); this.t0 = performance.now();
      this.bangun();
      if (el.hasAttribute('data-ixar-interaktif')) this.interaktif();
      this.langkah(performance.now()); // gambar lengkap dari awal, walau belum keliatan di layar
    }
    bangun() {
      const s = buat('svg', { viewBox: '360 -40 820 1000', class: 'ixar', 'aria-hidden': 'true' });
      this.akar = buat('g', {}, s);
      this.badan = buat('g', { fill: 'currentColor', stroke: 'currentColor', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, this.akar);
      this.kaki = [buat('path', { fill: 'none', 'stroke-width': 48 }, this.badan), buat('path', { fill: 'none', 'stroke-width': 48 }, this.badan)];
      this.telapak = [buat('ellipse', { rx: 52, ry: 22, stroke: 'none' }, this.badan), buat('ellipse', { rx: 52, ry: 22, stroke: 'none' }, this.badan)];
      buat('path', { d: 'M690 596Q720 700 730 800L806 800Q816 700 846 596Z', stroke: 'none' }, this.badan);
      this.lengan = [buat('path', { fill: 'none', 'stroke-width': 44 }, this.badan), buat('path', { fill: 'none', 'stroke-width': 44 }, this.badan)];
      this.tangan = [buat('circle', { r: 32, stroke: 'none' }, this.badan), buat('circle', { r: 32, stroke: 'none' }, this.badan)];
      this.kepala = buat('g', {}, this.akar);
      buat('path', { d: KEPALA, fill: 'currentColor' }, this.kepala);
      this.mahkota = buat('path', { d: MAHKOTA, fill: 'currentColor' }, this.kepala);
      this.mata = [buat('path', { class: 'ixar__mata' }, this.kepala), buat('path', { class: 'ixar__mata' }, this.kepala)];
      // perlengkapan
      this.alat = {};
      const alat = 'var(--ixar-alat, #DA1617)'; // warna atribut ikut tema (aturan logo)
      // pedang Reign digenggam di gagang (bawah kepala pedang), ujung ke bawah
      const pedang = this.alat.pedang = buat('g', { class: 'ixar__alat', fill: alat }, this.akar);
      const bilah = buat('g', { transform: 'scale(1.75) translate(-297.1 -197)' }, pedang);
      PEDANG.forEach((d) => buat('path', { d, 'fill-rule': 'evenodd' }, bilah));
      const tameng = this.alat.tameng = buat('g', { class: 'ixar__alat' }, this.akar);
      buat('path', { d: 'M-95 -120L95 -120L95 10Q95 110 0 160Q-95 110 -95 10Z', fill: 'currentColor', stroke: 'var(--ixar-mata)', 'stroke-width': 10 }, tameng);
      buat('path', { d: 'M-95 -120V-160H-60V-135H-25V-160H25V-135H60V-160H95V-120Z', fill: 'currentColor' }, tameng);
      buat('path', { d: 'M-24 60V-10A24 24 0 0 1 24 -10V60Z', fill: 'var(--ixar-mata)' }, tameng);
      const percik = (d) => { const g = buat('g', { class: 'ixar__alat', stroke: alat, 'stroke-width': 14, 'stroke-linecap': 'round', fill: 'none' }, this.akar); buat('path', { d }, g); return g; };
      this.alat['percik-atas'] = percik('M560 40L520 -10M600 10L590 -50M980 40L1020 -10M940 10L950 -50');
      this.alat['percik-kiri'] = percik('M520 470L460 440M530 410L490 360M560 380L560 320');
      this.alat['percik-tinju'] = percik('M0 -50L40 -90M20 0L80 0M0 50L40 90');
      const teks = (isi, x, y, uk) => { const t = buat('text', { class: 'ixar__alat', x, y, fill: alat, 'font-size': uk, 'font-weight': 800, 'font-family': 'Oxanium, sans-serif' }, this.akar); t.textContent = isi; return t; };
      this.alat.tanya = teks('?', 1010, 200, 170);
      this.alat.zzz = buat('g', { class: 'ixar__alat ixar__zzz', fill: alat, 'font-family': 'Oxanium, sans-serif', 'font-weight': 800 }, this.akar);
      [['z', 1000, 230, 70], ['z', 1050, 160, 95], ['Z', 1110, 70, 120]].forEach(([z, x, y, u]) => { const t = buat('text', { x, y, 'font-size': u }, this.alat.zzz); t.textContent = z; });
      this.alat.daun = buat('path', { class: 'ixar__alat', d: 'M1010 420Q1060 380 1080 440Q1040 470 1010 420Z', fill: alat }, this.akar);
      // versi bara (layar pembuka): badan diisi butiran api kelap-kelip, warnanya ikut tema lewat --bara-1..4
      if (this.el.hasAttribute('data-ixar-bara')) {
        const id = `bara-${Math.random().toString(36).slice(2, 8)}`, defs = buat('defs', {}), pola = buat('pattern', { id, width: 34, height: 34, patternUnits: 'userSpaceOnUse' }, defs);
        [[0, 0, 1], [17, 0, 2], [8, 17, 3], [25, 17, 1], [0, 17, 4], [17, 17, 2], [8, 0, 3], [25, 0, 4]].forEach(([x, y, k], i) => {
          const r = buat('rect', { x: x + 2, y: y + 2, width: 11, height: 11, style: `fill:var(--bara-${k})` }, pola);
          if (gerakBoleh) buat('animate', { attributeName: 'opacity', values: '1;.35;1', dur: `${(.9 + (i * .37) % 1.3).toFixed(2)}s`, repeatCount: 'indefinite', begin: `${(i * .23).toFixed(2)}s` }, r);
        });
        s.prepend(defs);
        this.badan.setAttribute('fill', `url(#${id})`); this.badan.setAttribute('stroke', `url(#${id})`);
        this.kepala.querySelectorAll('path:not(.ixar__mata)').forEach((p) => p.setAttribute('fill', `url(#${id})`));
      }
      this.svg = s; this.el.append(s);
      Object.values(this.alat).forEach((a) => a.style.opacity = 0);
    }
    set(pose) { if (POSE[pose]) { this.pose = pose; this.el.dataset.pose = pose; } }
    lakukan(pose, lama = 1400) {
      clearTimeout(this.balik); this.set(pose);
      this.balik = setTimeout(() => this.set(this.dasar), lama);
    }
    lihat(x, y) {
      const r = this.svg.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height * .38;
      this.tujuanLirik = [Math.max(-1, Math.min(1, (x - cx) / 500)), Math.max(-1, Math.min(1, (y - cy) / 400))];
      this.diamSejak = performance.now();
      if (this.pose === 'tidur' && this.dasar !== 'tidur') this.lakukan('kaget', 700);
    }
    interaktif() {
      const el = this.el;
      el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); el.setAttribute('aria-label', el.dataset.label || 'IXAR, maskot Reign 9');
      const reaksi = ['lompat', 'menang', 'kaget', 'pedang', 'tameng', 'marah', 'regang', 'tonjok'];
      let urut = Math.floor(Math.random() * reaksi.length);
      const sentuh = () => { this.lakukan(reaksi[urut++ % reaksi.length], 1300); this.diamSejak = performance.now(); };
      el.addEventListener('click', sentuh);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sentuh(); } });
      el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && ['diam', 'santai', 'intip', 'tidur'].includes(this.pose)) this.lakukan('nyambut', 1600); });
    }
    langkah(t) {
      const tujuan = POSE[this.pose], n = this.n, k = gerakBoleh ? .16 : 1, w = (t - this.t0) / 1000;
      for (const a of ANGKA) n[a] = lerp(n[a], tujuan[a], k);
      for (const a of ['lk', 'ln', 'kk', 'kn']) for (let i = 0; i < 2; i++) n[a][i] = lerp(n[a][i], tujuan[a][i], k);
      // gerak hidup: napas, ayun tangan, gerak khusus pose
      const ln = [...n.ln], lk = [...n.lk], kk = [...n.kk], kn = [...n.kn];
      let dy = n.dy, sy = n.sy, rot = n.rot, kep = n.kep, mahkota = n.mahkota;
      if (gerakBoleh) {
        const napas = Math.sin(w * 2.2);
        sy += napas * .012; dy += napas * -3; kep += Math.sin(w * 1.1) * 1.5; lk[1] -= napas * 3; ln[1] += napas * 3;
        mahkota = Math.max(0, Math.sin(w * 2.2 + 1)) * 4;
        if (tujuan.gerak === 'lambai') ln[1] += Math.sin(w * 11) * 22;
        if (tujuan.gerak === 'tunjuk') { ln[0] += Math.sin(w * 3) * 3; }
        if (tujuan.gerak === 'getar') { rot += Math.sin(w * 40) * 1.2; mahkota += 6 + Math.sin(w * 30) * 6; }
        if (tujuan.gerak === 'napas-tidur') { sy += Math.sin(w * 1.2) * .015; kep += Math.sin(w * 1.2) * 3; }
        if (tujuan.gerak === 'jalan' || tujuan.gerak === 'jalan-cepat') {
          // langkah: kaki maju-mundur gantian, lutut nekuk pas kaki diangkat, tangan ngayun berlawanan
          const cepat = tujuan.gerak === 'jalan-cepat', f = w * (cepat ? 13 : 8.5), a = cepat ? 34 : 24, sf = Math.sin(f), cf = Math.cos(f);
          kk[0] = -6 + sf * a; kk[1] = kk[0] - 4 - Math.max(0, cf) * (cepat ? 34 : 22);
          kn[0] = 6 - sf * a; kn[1] = kn[0] + 4 + Math.max(0, -cf) * (cepat ? 34 : 22);
          lk[0] = -24 - sf * (cepat ? 34 : 20); lk[1] = lk[0] + 18; ln[0] = 24 - sf * (cepat ? 34 : 20); ln[1] = ln[0] - 18;
          dy -= Math.abs(Math.cos(f)) * (cepat ? 16 : 9);
        }
        if (tujuan.gerak === 'kuda') { const f = Math.sin(w * 3.2); dy += f * 6; rot += f * .8; kn[0] += f * 3; kk[0] -= f * 2; }
        if (['lompat', 'menang'].includes(this.pose)) dy += Math.sin(w * 9) * 14;
      }
      this.akar.setAttribute('transform', `translate(${n.dx} ${dy}) rotate(${rot} ${TAPAK[0]} ${TAPAK[1]}) translate(${TAPAK[0]} ${TAPAK[1]}) scale(${n.sx} ${sy}) translate(${-TAPAK[0]} ${-TAPAK[1]})`);
      // anggota badan
      [lk, ln].forEach((s, i) => { const a = BAHU[i], b = ujung(a, s[0], LENGAN[0] * n.panjang), c = ujung(b, s[1], LENGAN[1] * n.panjang); this.lengan[i].setAttribute('d', `M${a}L${b}L${c}`); this.tangan[i].setAttribute('cx', c[0]); this.tangan[i].setAttribute('cy', c[1]); (i ? this : this)[i ? 'ujungKanan' : 'ujungKiri'] = { titik: c, sudut: s[1] }; });
      [kk, kn].forEach((s, i) => { const a = PINGGUL[i], b = ujung(a, s[0], KAKI[0]), c = ujung(b, s[1], KAKI[1]); this.kaki[i].setAttribute('d', `M${a}L${b}L${c}`); this.telapak[i].setAttribute('cx', c[0] + (i ? 24 : -24)); this.telapak[i].setAttribute('cy', c[1] + 4); this.telapak[i].setAttribute('transform', `rotate(${(s[1]) * .4 * (i ? 1 : 1)} ${c[0]} ${c[1]})`); });
      // kepala & mata
      this.lirikX = lerp(this.lirikX, this.tujuanLirik[0], .12); this.lirikY = lerp(this.lirikY, this.tujuanLirik[1], .12);
      this.kepala.setAttribute('transform', `rotate(${kep} ${LEHER[0]} ${LEHER[1]}) translate(${this.lirikX * 10} ${this.lirikY * 6})`);
      this.mahkota.setAttribute('transform', `translate(0 ${-mahkota})`);
      if (gerakBoleh && t > (this.kedipBerikut || 0)) { this.kedipMulai = t; this.kedipBerikut = t + 2600 + Math.random() * 3500; }
      const fase = this.kedipMulai ? (t - this.kedipMulai) / 160 : 2;
      const buka = fase < 1 ? Math.abs(1 - fase * 2) : 1;
      this.mata.forEach((m, i) => { m.setAttribute('d', bentukMata(tujuan.mata, i, buka)); m.setAttribute('transform', `translate(${this.lirikX * 22} ${this.lirikY * 14})`); });
      // perlengkapan
      for (const [nama, el] of Object.entries(this.alat)) {
        const aktif = tujuan.alat === nama; el.style.opacity = aktif ? 1 : 0;
        if (!aktif) continue;
        const kanan = this.ujungKanan, kiri = this.ujungKiri;
        if (nama === 'pedang') el.setAttribute('transform', `translate(${kanan.titik[0]} ${kanan.titik[1]}) rotate(${-kanan.sudut + (this.pose === 'serbu' ? 0 : 0)})`);
        if (nama === 'tameng') el.setAttribute('transform', `translate(${kiri.titik[0] + 40} ${kiri.titik[1] - 10}) scale(.9)`);
        if (nama === 'percik-tinju') el.setAttribute('transform', `translate(${kanan.titik[0] + 50} ${kanan.titik[1]})`);
        if (nama === 'zzz') el.setAttribute('transform', `translate(0 ${-((w * 40) % 60)})`);
      }
      // ketiduran kalau lama gak ada yang gerak (yang interaktif aja)
      if (this.el.hasAttribute('data-ixar-interaktif') && !this.el.hasAttribute('data-ixar-otak') && this.pose === this.dasar && this.dasar !== 'tidur' && t - this.diamSejak > 25000) this.set('tidur');
    }
  }

  const semua = [];
  const keliatan = new Set();
  const io = new IntersectionObserver((d) => d.forEach((e) => (e.isIntersecting ? keliatan.add(e.target.ixar) : keliatan.delete(e.target.ixar))), { rootMargin: '100px' });
  window.IXAR = {
    pasang(el) { if (el.ixar) return el.ixar; const x = new Ixar(el); el.ixar = x; semua.push(x); io.observe(el); return x; },
    pose: Object.keys(POSE),
  };
  document.querySelectorAll('[data-ixar]').forEach((el) => window.IXAR.pasang(el));
  addEventListener('pointermove', (e) => keliatan.forEach((x) => x.lihat(e.clientX, e.clientY)), { passive: true });
  addEventListener('pointerdown', (e) => keliatan.forEach((x) => x.lihat(e.clientX, e.clientY)), { passive: true });
  const jalan = (t) => { keliatan.forEach((x) => x.langkah(t)); requestAnimationFrame(jalan); };
  requestAnimationFrame(jalan);
})();
