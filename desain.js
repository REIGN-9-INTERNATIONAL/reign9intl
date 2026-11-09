// Hanya data terstruktur yang bisa mengubah tampilan. HTML, skrip, dan CSS bebas tidak diterima.
(() => {
  const m = window.R9Desain, admin = 'https://admin.reign9.site';
  const page = location.pathname.endsWith('news.html') ? 'berita' : 'beranda';
  const sheet = document.createElement('style');
  document.head.append(sheet);
  let published = [], draft = null, fingerprint = '';
  const key = r => JSON.stringify([r.halaman,r.sasaran,r.tema,r.layar]);
  function valid(r) {
    return r && m.validSelector(r.sasaran) && ['semua',page].includes(r.halaman) &&
      ['semua','gelap','terang'].includes(r.tema) && ['semua','hp','desktop'].includes(r.layar) && r.nilai && typeof r.nilai === 'object';
  }
  function cssFor(row) {
    const fields = row.sasaran === ':root' ? m.theme : m.fields, pairs = [];
    const selector = row.sasaran === ':root' ? '' : ' ' + row.sasaran;
    const activeRoot = row.tema === 'semua' ? ':root' : ':root[data-tema="' + row.tema + '"]';
    for (const [k,v] of Object.entries(row.nilai)) {
      const f = fields[k];
      if (!Object.hasOwn(fields,k) || !m.validValue(f,v)) continue;
      if (!f.css) continue;
      pairs.push(f.css + ':' + v + (f.unit || '') + ' !important');
    }
    // Specificity for visitor-selected and system-selected themes must match.
    const rule = root => {
      const target = root + selector;
      let result = target + '{' + pairs.join(';') + '}';
      if (m.mediaPath.test(row.nilai.photo)) {
        result += target + ':is(img,canvas){--r9-foto:' + row.nilai.photo.slice(7) + '}';
        const url = 'url("' + admin + row.nilai.photo + '")';
        result += target + ':is(img,svg){content:' + url + '!important}' +
          target + ':not(img,svg){background-image:' + url + '!important;background-size:cover;background-position:center}';
      }
      if (row.sasaran === '#atas' && pairs.length && row.nilai.height) result += root + ' #menu{top:' + Number(row.nilai.height) + 'px}';
      return result;
    };
    let css = rule(activeRoot);
    if (row.tema !== 'semua') css += '@media(prefers-color-scheme:' + (row.tema === 'terang'?'light':'dark') + '){' + rule(':root:not([data-tema])') + '}';
    if (row.layar !== 'semua') css = '@media(' + (row.layar === 'hp'?'max-width:767px':'min-width:768px') + '){' + css + '}';
    return css;
  }
  let applied = [], originals = new Map(), watch = null;
  const sections = Array.from(document.querySelector('main')?.children || []).filter(e=>e.matches('section,.pita'));
  const themeNow = () => document.documentElement.dataset.tema || (matchMedia('(prefers-color-scheme:light)').matches?'terang':'gelap');
  function reconcile() {
    watch?.disconnect();
    const desired = new Map(), lang = (document.documentElement.lang || 'id').split('-')[0];
    for (const row of applied) {
      if (row.tema !== 'semua' && row.tema !== themeNow()) continue;
      if (row.layar !== 'semua' && (row.layar === 'hp') !== matchMedia('(max-width:767px)').matches) continue;
      const val = row.nilai;
      if (!val.url && !val.alt && !val.idText && !val.enText && !val.zhText) continue;
      for (const el of document.querySelectorAll(row.sasaran)) {
        const set=desired.get(el) || {};
        if (el.matches('a') && m.validValue(m.fields.url,val.url)) set.href=val.url;
        if (el.matches('img') && m.validValue(m.fields.alt,val.alt)) set.alt=val.alt;
        const copy=val[lang+'Text']||val.idText;
        if (!el.children.length && el.matches('p,span,small,strong,b,button,a,h1,h2,h3,h4,label,li,dt,dd,figcaption') && m.validValue(m.fields.idText,copy)) set.text=copy;
        desired.set(el,set);
      }
    }
    for (const [el,base] of originals) {
      for (const [k,v] of Object.entries(base)) if(!Object.hasOwn(desired.get(el)||{},k)) {
        if (el.isConnected) { if(k==='text')el.textContent=v;else if(v===null)el.removeAttribute(k);else el.setAttribute(k,v); }
        delete base[k];
      }
      if (!el.isConnected || !Object.keys(base).length) originals.delete(el);
    }
    for (const [el,set] of desired) for (const [k,v] of Object.entries(set)) {
      const base=originals.get(el)||{},current=k==='text'?el.textContent:el.getAttribute(k);
      if (!Object.hasOwn(base,k))base[k]=current;
      originals.set(el,base);if(current===v)continue;
      if(k==='text')el.textContent=v;else el.setAttribute(k,v);
    }
    if(applied.some(r=>['url','alt','idText','enText','zhText'].some(k=>r.nilai[k]))) {
      watch ||= new MutationObserver(reconcile);
      watch.observe(document.body,{childList:true,subtree:true});
    }
  }
  let ordered=false;
  function applyWidgets() {
    const needsOrder=applied.some(r=>r.nilai.rank);
    if (sections.length && (needsOrder||ordered)) {
      const sorted=sections.map((el,i)=>({el,n:Number(getComputedStyle(el).getPropertyValue('--r9-rank').trim()) || (i+1)*10})).sort((a,b)=>a.n-b.n);
      const parent=sections[0].parentElement;
      if(sorted.some(({el},i)=>Array.from(parent.children).filter(e=>sections.includes(e))[i]!==el)) sorted.forEach(({el})=>parent.append(el));
    }
    ordered=needsOrder;
    for(const el of document.querySelectorAll('[data-ixar]')) {
      if(!el.ixar)continue;
      const st=getComputedStyle(el),pose=st.getPropertyValue('--r9-pose').trim() || el.dataset.ixar;
      if(pose && pose!==el.ixar.dasar && window.IXAR?.pose.includes(pose)){el.ixar.dasar=pose;el.ixar.set(pose);}
      const speed=st.getPropertyValue('--r9-tempo').trim();el.ixar.tempo=speed===''?1:Number(speed)/100;
    }
    reconcile();document.dispatchEvent(new Event('r9:desain'));
  }
  document.addEventListener('r9:bahasa',()=>queueMicrotask(reconcile));
  document.addEventListener('r9:tema',applyWidgets);
  for (const query of ['(prefers-color-scheme:light)','(max-width:767px)'])matchMedia(query).addEventListener('change',applyWidgets);
  function render() {
    const rows = published.filter(r => !draft || key(r) !== key(draft));
    if (draft) rows.push(draft);
    const weight = r => (r.halaman !== 'semua') * 4 + (r.tema !== 'semua') * 2 + (r.layar !== 'semua');
    applied=rows.filter(valid).sort((a,b)=>weight(a)-weight(b));
    const rules=applied.map(cssFor).join('\n');
    if (rules !== sheet.textContent) sheet.textContent = rules;
    applyWidgets();
  }
  window.R9Tampilan = {
    apply(rows) {
      const next = JSON.stringify(rows || []);
      if (next === fingerprint) return;
      fingerprint = next; published = Array.isArray(rows) ? rows : []; render();
    }
  };
  // Pratinjau hanya dapat menerima pesan dari induk admin yang tepat.
  if (window.parent === window || document.referrer.split('/').slice(0,3).join('/') !== admin ||
      !new URLSearchParams(location.search).has('editor')) return;
  const send = data => parent.postMessage({r9Editor:true,...data},admin);
  let picking = true, selected;
  const marker = document.createElement('style');
  marker.textContent = '[data-editor-selected]{outline:3px solid #09b9dd!important;outline-offset:-3px!important}';
  document.head.append(marker);
  function select(el,scroll) {
    selected?.removeAttribute('data-editor-selected');
    selected = el;
    if (el) {el.setAttribute('data-editor-selected',''); if (scroll && el !== document.documentElement) el.scrollIntoView({block:'center',behavior:'instant'});}
  }
  function selector(el) {
    const pieces = [];
    for (let node=el; node && node !== document.body; node=node.parentElement) {
      if (node.id && /^[A-Za-z][\w-]*$/.test(node.id)) { pieces.unshift('#'+node.id); break; }
      const tag = node.localName;
      if (!/^[a-z][a-z0-9-]*$/.test(tag)) return '';
      const siblings = [...node.parentElement.children].filter(child=>child.localName===tag);
      pieces.unshift(tag + (siblings.length>1 ? ':nth-of-type('+(siblings.indexOf(node)+1)+')':''));
    }
    const path = pieces[0]?.startsWith('#') ? pieces.join(' > ') : ['body',...pieces].join(' > ');
    return m.validSelector(path) ? path : '';
  }
  function picked(el) {
    const path = selector(el); if (!path) return;
    select(el,false);
    const txt = el.closest('[data-i18n],[data-i18n-html]');
    const region = el.closest('section,header,footer,article,dialog');
    const label = (el.getAttribute('aria-label') || el.getAttribute('alt') || el.textContent.trim()).slice(0,50) || el.localName;
    send({type:'pick',selector:path,page,label, textKey:txt?.dataset.i18n || txt?.dataset.i18nHtml || '',
      tag:el.localName,leaf:el.children.length===0,mascot:el.matches('[data-ixar]'),section:sections.includes(el), region:region && selector(region),regionLabel:(region?.querySelector('h2,h1')?.textContent || region?.localName || '').slice(0,50)});
  }
  document.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();},true);
  document.addEventListener('click',e=>{
    if (!picking) return;
    const el=e.target.closest('[data-ixar]') || e.target.closest('svg') || e.target;
    if (!(el instanceof Element)) return;
    e.preventDefault(); e.stopImmediatePropagation(); picked(el);
  },true);
  window.addEventListener('message',e=>{
    if (e.source!==parent || e.origin!==admin || !e.data?.r9Editor) return;
    const d=e.data;
    if (d.type==='draft') {draft=valid(d.row)?d.row:null;render();}
    if (d.type==='mode') picking=!!d.pick;
    if (d.type==='theme' && ['gelap','terang'].includes(d.value)) {document.documentElement.dataset.tema=d.value;document.dispatchEvent(new Event('r9:tema'));}
    if (d.type==='focus' && m.validSelector(d.selector)) select(document.querySelector(d.selector),true);
    if (d.type==='parent' && selected?.parentElement && selected.parentElement !== document.documentElement) picked(selected.parentElement);
  });
  send({type:'ready',page});
})();
