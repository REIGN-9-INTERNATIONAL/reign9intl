// Bagian tambahan reign9.site (T-63): tombol akun, Management + jobdesc, berita turnamen otomatis (News),
// total hadiah, prestasi di kartu roster, Content Creator Hub (TikTok dimuat saat diklik), galeri, jersey, sponsor.
// Jalan setelah app.js: tiap gambarData() selesai, bagian di sini ikut digambar ulang.
(() => {
  const semuaPemain = (d) => [...(d.pemain?.aktif || []), ...(d.pemain?.nonaktif || [])];
  const ganti = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
  const juaraTeks = (t) => R9.teks(t.peringkat);
  // turnamen yang ada hasilnya otomatis jadi berita
  const beritaTurnamen = (d) => (d.prestasi || []).filter((t) => t.juara > 0).map((t) => ({
    id: `t${t.id}`, tanggal: t.tanggal, gambar: t.gambar, turnamen: t,
    judul: ganti(R9.t('turnamen.judulBerita'), { peringkat: juaraTeks(t), nama: R9.teks(t.turnamen) }),
    ringkas: ganti(R9.t('turnamen.ringkas'), { tim: t.tim || 'Reign 9', peringkat: juaraTeks(t), nama: R9.teks(t.turnamen) }),
  }));
  const kartuBeritaTurnamen = (n) => `<a id="berita-${esc(n.id)}" class="berita berita--turnamen" href="news.html?id=${esc(n.id)}">
    ${n.gambar ? `<img src="${esc(urlMedia(n.gambar))}" alt="${esc(n.judul)}" loading="lazy" width="800" height="450">` : ''}
    <span class="berita__isi"><time datetime="${esc(n.tanggal)}">${esc(R9.tanggal(n.tanggal))}</time>
      <span class="berita__lencana">🏆 ${esc(R9.t('turnamen.lencana'))}</span>
      <h3>${esc(n.judul)}</h3><p>${esc(n.ringkas)}</p><span class="berita__baca">${esc(R9.t('news.baca'))}</span></span></a>`;
  const daftarJuara = (d, ids) => {
    const peta = new Map(semuaPemain(d).map((p) => [p.id, p]));
    return ids.map((i) => peta.get(i)).filter(Boolean).map((p) => `<li class="juara-pemain">
      ${p.foto ? `<img src="${esc(urlMedia(p.foto))}" alt="" loading="lazy" width="160" height="200">` : '<span class="juara-pemain__kosong"></span>'}
      <span>${esc(p.nickname)}</span></li>`).join('');
  };

  // alamat portal member
  const PORTAL = 'https://user.reign9.site/';
  function akunLink() {
    for (const a of $$('[data-akun-link]')) {
      const u = new URL(a.getAttribute('href').replace('https://user.reign9.site/', PORTAL), location.href); u.searchParams.set('l', R9.bahasa); a.href = u.href;
    }
  }
  // Management: nama & foto pengurus per divisi (jobdesc cuma di admin)
  const DIVISI_MIRIP = /^(media and publication|media & publication|hr & community|hr and community|secretariat|bizdev|business development|competitive( division)?|community leader)$/i;
  const DIVISI_WEB = [['Community Leader', 1], ['Competitive', 2], ['Media and Publication', 3], ['HR & Community', 4], ['Secretariat', 5], ['BizDev', 6]];
  function management(d) {
    const w = $('[data-management]'); if (!w) return;
    const orang = (d.pemain?.aktif || []).filter((p) => apakahManagement(p) || /community leader/i.test(`${p.kelompok} ${p.role}`));
    const grup = new Map();
    for (const p of orang) {
      const k = /community leader/i.test(`${p.kelompok} ${p.role}`) ? 'Community Leader' : namaTimPemain(p, 'management');
      if (!grup.has(k)) grup.set(k, []); grup.get(k).push(p);
    }
    // 6 divisi resmi selalu tampil sesuai struktur (Community Leader paling atas); yang belum ada orangnya ditandai 'segera diumumkan'
    const urut = [...DIVISI_WEB.map(([k]) => k), ...[...grup.keys()].filter((k) => !DIVISI_WEB.some(([x]) => x === k))];
    w.closest('section').hidden = !urut.length;
    let n = 0;
    w.innerHTML = urut.map((k, i) => {
      const no = DIVISI_WEB.find(([x]) => x === k)?.[1], nama = no ? R9.t(`mgmt.${no}.nama`) : (R9.t(`kelompok.${k}`) !== `kelompok.${k}` ? R9.t(`kelompok.${k}`) : k);
      const daftar = grup.get(k) || [];
      return `<section class="mgmt__divisi"><div class="mgmt__kepala"><span class="mgmt__no">${String(i + 1).padStart(2, '0')}</span><h3 class="mgmt__nama">${esc(nama)}</h3>
        <span class="mgmt__jumlah">${daftar.length ? `${daftar.length} ${esc(R9.t('roster.pemain'))}` : esc(R9.t('mgmt.segera'))}</span></div>
        <ul class="mgmt__orang">${daftar.length ? '' : `<li class="orang orang--kosong" style="--i:${n++}"><div class="orang__bingkai"><div class="orang__ixar"><span data-ixar="diam" data-ixar-interaktif aria-hidden="true"></span></div></div><span class="orang__nama">${esc(R9.t('mgmt.segera'))}</span></li>`}${daftar.map((p) => `<li class="orang" style="--i:${n++}">
          <div class="orang__bingkai">${p.foto ? `<img src="${esc(urlMedia(p.foto))}" alt="${esc(p.nickname)}" loading="lazy" width="400" height="500">`
            : `<div class="orang__ixar"><span data-ixar="manajer" data-ixar-interaktif aria-hidden="true"></span></div>`}</div>
          <span class="orang__nama">${esc(p.nickname)}</span>${p.role && !DIVISI_MIRIP.test(p.role) ? `<span class="orang__peran">${esc(R9.t(`role.${p.role}`) !== `role.${p.role}` ? R9.t(`role.${p.role}`) : p.role)}</span>` : ''}</li>`).join('')}</ul></section>`;
    }).join('');
    // foto gagal dimuat → IXAR (rasio tetap 4:5)
    $$('.orang__bingkai img', w).forEach((img) => img.addEventListener('error', () => { img.outerHTML = '<div class="orang__ixar"><span data-ixar="manajer" data-ixar-interaktif aria-hidden="true"></span></div>'; }, { once: true }));
    $$('[data-ixar]', w).forEach((el) => window.IXAR?.pasang(el));
  }
  function news(d) {
    const w = $('[data-news]'); if (!w || $('[data-artikel-berita]')) return;
    const semua = [...(d.news || []).map((n) => ({ ...n, biasa: true })), ...beritaTurnamen(d)].sort((a, b) => (b.tanggal > a.tanggal ? 1 : b.tanggal < a.tanggal ? -1 : 0));
    const n = typeof newsTampil === 'number' ? newsTampil : 6;
    w.innerHTML = semua.slice(0, n).map((x) => (x.biasa ? renderKartuBerita(x) : kartuBeritaTurnamen(x))).join('');
    const kosong = $('[data-news-kosong]'); if (kosong) kosong.hidden = semua.length > 0;
    const lebih = $('[data-news-lebih]'); if (lebih) lebih.hidden = semua.length <= n;
  }
  function artikelTurnamen(d) {
    const w = $('[data-artikel-berita]'), id = new URLSearchParams(location.search).get('id') || '';
    if (!w || !/^t\d+$/.test(id)) return;
    const n = beritaTurnamen(d).find((x) => x.id === id); if (!n) return;
    const t = n.turnamen;
    document.title = `${n.judul} · Reign 9 International News`;
    w.innerHTML = `${t.gambar ? `<img class="artikel-berita__gambar" src="${esc(urlMedia(t.gambar))}" alt="${esc(n.judul)}" width="1200" height="675">` : ''}
      <div class="artikel-berita__badan">
        <div class="artikel-berita__meta"><span class="artikel-berita__lencana">🏆 ${esc(R9.t('turnamen.lencana'))}</span>
          <time class="artikel-berita__tanggal" datetime="${esc(t.tanggal)}">${esc(R9.tanggal(t.tanggal))}</time></div>
        <h1 class="artikel-berita__judul">${esc(n.judul)}</h1>
        <dl class="turnamen-fakta">
          <div><dt>${esc(R9.t('turnamen.peringkat'))}</dt><dd>${esc(juaraTeks(t))}</dd></div>
          ${t.tim ? `<div><dt>${esc(R9.t('turnamen.tim'))}</dt><dd>${esc(t.tim)}</dd></div>` : ''}
          ${t.hadiah ? `<div><dt>${esc(R9.t('turnamen.hadiah'))}</dt><dd>${esc(R9.rupiah(t.hadiah))}</dd></div>` : ''}
        </dl>
        ${t.pemain?.length ? `<h2 class="turnamen-sub">${esc(R9.t('turnamen.pemain'))}</h2><ul class="juara-daftar">${daftarJuara(d, t.pemain)}</ul>` : ''}
        ${R9.teks(t.keterangan) ? `<div class="artikel-berita__isi">${String(R9.teks(t.keterangan)).split(/\n\s*\n/).map((p) => `<p>${esc(p.trim())}</p>`).join('')}</div>` : ''}
        <div class="artikel-berita__aksi"><a class="tombol tombol--garis tombol--kecil" href="index.html#news">${esc(R9.t('news.kembali'))}</a></div>
      </div>`;
    const lain = $('[data-news-lainnya]');
    if (lain) { const x = [...(d.news || []).map(renderKartuBerita), ...beritaTurnamen(d).filter((b) => b.id !== id).map(kartuBeritaTurnamen)]; lain.innerHTML = x.join(''); lain.closest('section').hidden = !x.length; }
  }
  function prestasiTotal(d) {
    const w = $('[data-prestasi-total]'); if (!w) return;
    const total = d.ringkas?.totalHadiah || 0;
    w.hidden = !total; $('[data-prestasi-total-angka]').textContent = R9.rupiah(total);
  }
  function rosterJuara(d) {
    const prestasi = new Map((d.prestasi || []).map((t) => [t.id, t]));
    for (const p of semuaPemain(d)) {
      const li = document.getElementById(`pemain-${p.id}`), info = li?.querySelector('.kartu-pemain__info');
      if (!info || info.querySelector('.kartu-pemain__juara') || !p.turnamen?.length) continue;
      const daftar = p.turnamen.map((i) => prestasi.get(i)).filter((t) => t && t.juara > 0);
      if (!daftar.length) continue;
      info.insertAdjacentHTML('beforeend', `<div class="kartu-pemain__juara"><span>${esc(R9.t('roster.juara'))}</span>${daftar.slice(0, 4).map((t) =>
        `<a href="news.html?id=t${t.id}">🏆 ${esc(juaraTeks(t))} · ${esc(R9.teks(t.turnamen))}</a>`).join('')}</div>`);
    }
  }
  function creator(d) {
    const w = $('[data-creator]'); if (!w) return;
    const v = d.creator || [];
    $('[data-creator-kosong]').hidden = v.length > 0;
    w.innerHTML = v.map((c) => `<div class="creator-kartu">
      <button type="button" class="creator-kartu__putar creator-kartu__putar--${c.jenis === 'youtube' ? 'yt' : 'tt'}" data-video="${c.jenis === 'youtube' ? 'youtube' : 'tiktok'}:${esc(c.vid)}" aria-label="${esc(ganti(R9.t('creator.putar'), { ign: c.ign }))}">
        ${c.jenis === 'youtube' && /^[\w-]{11}$/.test(c.vid) ? `<img src="https://i.ytimg.com/vi/${c.vid}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">` : c.foto ? `<img src="${esc(urlMedia(c.foto))}" alt="" loading="lazy" width="320" height="400">` : ''}
        <span class="creator-kartu__label">${c.jenis === 'youtube' ? 'YouTube' : 'TikTok'}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></button>
      <span class="creator-kartu__nama">${esc(c.ign)}</span></div>`).join('');
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-video]'); if (!b) return;
    const [jenis, id] = b.dataset.video.split(':'); if (!/^[\w-]{8,25}$/.test(id)) return;
    const f = document.createElement('iframe');
    f.src = jenis === 'youtube' ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1` : `https://www.tiktok.com/embed/v2/${id}`;
    f.title = b.getAttribute('aria-label') || 'Video'; f.allow = 'encrypted-media; fullscreen; picture-in-picture'; f.allowFullscreen = true; f.loading = 'lazy';
    f.className = `creator-kartu__video creator-kartu__video--${jenis}`;
    b.replaceWith(f);
  });
  function galeri(d) {
    const w = $('[data-galeri]'); if (!w) return;
    const g = d.galeri || [];
    w.closest('section').hidden = !g.length;
    w.innerHTML = g.map((x) => `<figure><img src="${esc(urlMedia(x.foto))}" alt="${esc(R9.teks(x.judul))}" loading="lazy" decoding="async">${R9.teks(x.judul) ? `<figcaption>${esc(R9.teks(x.judul))}</figcaption>` : ''}</figure>`).join('');
  }
  function jersey(d) {
    const w = $('[data-jersey]'); if (!w) return;
    const j = d.jersey; w.hidden = !j; if (!j) return;
    const img = $('[data-jersey-foto]'); img.hidden = !j.foto; if (j.foto) img.src = urlMedia(j.foto);
    $('[data-jersey-nama]').textContent = j.nama || '';
    $('[data-jersey-harga]').textContent = j.harga ? R9.rupiah(j.harga) : '';
    $('[data-jersey-catatan]').textContent = j.catatan || '';
    const a = $('[data-jersey-link]'); const link = tautanAman(j.link); a.hidden = !link; if (link) a.href = link;
  }
  function sponsor(d) {
    const w = $('[data-sponsor]'); if (!w) return;
    const s = (d.sponsor || []).filter((x) => x.logo || x.nama);
    w.hidden = !s.length;
    $('[data-sponsor-baris]').innerHTML = s.map((x) => {
      const isi = x.logo ? `<img src="${esc(urlMedia(x.logo))}" alt="${esc(x.nama)}" loading="lazy" height="56">` : `<span>${esc(x.nama)}</span>`;
      const link = tautanAman(x.link);
      return link ? `<a href="${esc(link)}" target="_blank" rel="noopener sponsored">${isi}</a>` : `<span class="sponsor-logo__item">${isi}</span>`;
    }).join('');
  }
  // detail prestasi (dialog dari app.js): tambahin tim & foto pemain yang juara
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-buka-prestasi]'); if (!b) return;
    setTimeout(() => {
      const p = (DATA?.prestasi || []).find((x) => String(x.id) === b.dataset.bukaPrestasi), meta = $('[data-baca-meta]');
      if (!p || !meta) return;
      if (p.tim) meta.insertAdjacentHTML('beforeend', `<span>${esc(R9.t('turnamen.tim'))}: ${esc(p.tim)}</span>`);
      if (p.pemain?.length) meta.insertAdjacentHTML('afterend', `<ul class="juara-daftar juara-daftar--dialog">${daftarJuara(DATA, p.pemain)}</ul>`);
    });
  });
  $('[data-baca]')?.addEventListener('close', () => $$('.juara-daftar--dialog').forEach((x) => x.remove()));

  function gambarBaru() {
    const d = DATA || {};
    akunLink(); management(d); news(d); artikelTurnamen(d); prestasiTotal(d); rosterJuara(d); creator(d); galeri(d); jersey(d); sponsor(d);
  }
  const asli = gambarData;
  gambarData = function () { asli(); try { gambarBaru(); } catch (e) { console.error(e); } };
  document.addEventListener('r9:bahasa', () => { try { gambarBaru(); } catch (e) { console.error(e); } });
  gambarBaru();
})();
