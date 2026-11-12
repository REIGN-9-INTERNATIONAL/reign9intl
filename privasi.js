// Ganti bahasa halaman privasi (ikut pilihan bahasa web / ?l=)
(() => {
  const pasang = (l) => {
    for (const s of document.querySelectorAll('main > section')) s.hidden = s.lang !== (l === 'zh' ? 'zh-CN' : l);
    for (const b of document.querySelectorAll('[data-l]')) b.setAttribute('aria-pressed', String(b.dataset.l === l));
    document.documentElement.lang = l === 'zh' ? 'zh-CN' : l;
    try { localStorage.setItem('bahasa', l); } catch (e) {}
  };
  let awal = new URLSearchParams(location.search).get('l');
  try { awal ||= localStorage.getItem('bahasa'); } catch (e) {}
  awal ||= (navigator.language || '').startsWith('zh') ? 'zh' : (navigator.language || '').startsWith('id') ? 'id' : 'en';
  pasang(['id', 'en', 'zh'].includes(awal) ? awal : 'id');
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-l]'); if (b) pasang(b.dataset.l); });
})();
