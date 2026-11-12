// Satu daftar kontrol dipakai editor, validasi server, dan website publik.
(() => {
  const ukuran = (label, css, min, max, unit = 'px') => ({ label, css, min, max, unit, type: 'number' });
  const warna = (label, css) => ({ label, css, type: 'color' });
  const pilihan = (label, css, options) => ({ label, css, type: 'select', options });
  const fonts = { Reign9Display: 'Reign 9 Display', Oxanium: 'Oxanium', 'Uncut Sans': 'Uncut Sans', 'system-ui': 'Font perangkat' };
  const fields = {
    ink: warna('Warna tulisan', 'color'), fill: warna('Warna latar', 'background-color'), border: warna('Warna garis', 'border-color'),
    size: ukuran('Ukuran tulisan', 'font-size', 8, 240), font: pilihan('Jenis huruf', 'font-family', fonts),
    align: pilihan('Rata tulisan', 'text-align', {left:'Kiri',center:'Tengah',right:'Kanan'}),
    width: ukuran('Lebar', 'width', 1, 8000), height: ukuran('Tinggi', 'height', 1, 8000),
    padX: ukuran('Ruang kiri dan kanan', 'padding-inline', 0, 1000), padY: ukuran('Ruang atas dan bawah', 'padding-block', 0, 1000),
    gap: ukuran('Jarak antarisi', 'gap', 0, 500), margin: ukuran('Jarak luar vertikal', 'margin-block', 0, 500),
    radius: ukuran('Lengkung sudut', 'border-radius', 0, 500), line: ukuran('Tebal garis', 'border-width', 0, 60),
    opacity: ukuran('Transparansi (100 = penuh)', 'opacity', 0, 100, '%'),
    fit: pilihan('Cara foto mengisi bingkai', 'object-fit', {cover:'Penuhi bingkai', contain:'Tampilkan utuh',fill:'Rentangkan'}),
    visible: pilihan('Tampilan', 'display', {none:'Sembunyikan'}),
    namaElemen:{label:'Nama bagian',type:'text'}, url: {label:'Tujuan tautan',type:'url'}, alt: {label:'Keterangan foto',type:'text'},
    idText:{label:'Bahasa Indonesia',type:'text'},enText:{label:'English',type:'text'},zhText:{label:'中文',type:'text'},
    pose:pilihan('Pose dasar IXAR','--r9-pose',{diam:'Berdiri',nyambut:'Menyambut',pedang:'Pedang',menang:'Menang',tameng:'Tameng',meditasi:'Meditasi',tidur:'Tidur',roster:'Bermain gim',duduk:'Duduk'}),
    tempo:ukuran('Kecepatan gerak IXAR (%)','--r9-tempo',0,300,''),
    rank:ukuran('Urutan bagian','--r9-rank',1,999,''),
    photo: {label:'Foto atau gambar latar', type:'image'},
  };
  const theme = {
    accent:warna('Aksen utama','--merah'),soft:warna('Aksen pada tulisan','--teks-merah'),text:warna('Tulisan utama','--teks'),
    muted:warna('Tulisan pendamping','--teks-redup'), start:warna('Awal gradasi','--gradasi-a'),end:warna('Akhir gradasi','--gradasi-b'),
    panel:warna('Kartu','--kartu'),button:warna('Tombol utama','--tombol'),buttonText:warna('Tulisan tombol','--tombol-teks'),
    stroke:warna('Garis pemisah','--garis'), mascot:warna('Badan IXAR','--ixar'),eyes:warna('Mata IXAR','--ixar-mata'),item:warna('Perlengkapan IXAR','--ixar-alat'),
    heading:pilihan('Font judul','--judul',fonts),body:pilihan('Font isi','--badan',fonts),wrap:ukuran('Lebar area isi','--lebar',240,4000)
  };
  const targets = [
    ['Seluruh website',':root'],['Bilah navigasi','#atas'],['Logo navigasi','.atas__logo svg'],['Menu navigasi','#menu'],['Pembuka','.hero'],
    ['Pita berjalan','.pita'],['Tentang Reign 9','#about'],['Nilai komunitas','.ethos'],['Panggung IXAR','#ixar'],['IXAR di pembuka','.hero__ixar'],
    ['IXAR penjelajah','.jelajah__ixar'],['IXAR di panggung','.kenal__ixar'],['Ucapan IXAR','.ixar-gelembung'],
    ['Tombol kemampuan IXAR','.skill-ixar'],['Podium','.podium'],['Daftar tim','#rosters'],['Foto pemain','.kartu-pemain__foto'],
    ['Jadwal dan prestasi','#schedule'],['Berita','#news'],['Kartu berita','.berita'],['Foto kartu berita','.berita img'],
    ['Foto artikel','.artikel-berita__gambar'],['Judul bagian','.judul'],['Tombol utama','.tombol--utama'],['Pembuat banner','#banner'],...Array.from({length:5},(_,i)=>['Foto banner '+(i+1),'#banner-foto-'+(i+1)]),['Latar foto profil','.pfp__kanvas'],
    ['Pembuat foto profil','#pfp'],['Toko','#shop'],['Prestasi','#prestasi'],['Management','#management'],['Content Creator Hub','#creator'],['Galeri','#galeri'],['Jersey R9','#jersey'],['Sponsor','#sponsor'],['Kontak','#contact'],['Bagian bawah','.kaki']
  ];
  const mediaPath = /^\/media\/[a-f0-9]{32}\.(?:jpg|png|webp|gif|avif)$/;
  // Pilihan manual memakai selector tetap. Pilihan dari pratinjau memakai jalur ID/kelas/tag sederhana.
  const part = /^(?:#[\w-]+|\.[\w-]+|[a-z][a-z0-9-]*)(?::nth-of-type\([1-9]\d{0,3}\))?$/;
  const validSelector = s => typeof s === 'string' && (targets.some(t => t[1] === s) ||
    (s.length <= 650 && s.split(' > ').every(p => part.test(p))));
  function validValue(f, v) {
    if (!f || typeof v !== 'string') return false;
    if (f.type === 'text') return v.length <= 3000;
    if (f.type === 'url') {try { return /^#[a-zA-Z][\w-]*$/.test(v) || new URL(v).protocol === 'https:'; } catch {return false;}}
    if (f.type === 'color') return /^#[0-9a-f]{6}$/i.test(v);
    if (f.type === 'number') return /^\d{1,4}$/.test(v) && Number(v) >= f.min && Number(v) <= f.max;
    if (f.type === 'image') return mediaPath.test(v);
    return Object.hasOwn(f.options, v);
  }
  const model = {fields, theme, targets, validSelector, validValue, mediaPath};
  if (typeof module === 'object' && module.exports) module.exports = model;
  else window.R9Desain = model;
})();
