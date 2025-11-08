// script.js -- homepage
(async function(){
  const DATA_URL = 'data/lyrics.json';
  const BATCH = 12;
  let ALL = [];
  let filtered = [];
  let offset = 0;
  const results = document.getElementById('results');
  const loader = document.getElementById('loader');
  const chips = document.getElementById('chips');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  function slug(s){
    return String(s||'').toLowerCase().trim()
      .replace(/[^\w\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-');
  }
  function isJunkName(n){
    if(!n) return true;
    const junk = [/httrack/i,/website copier/i,/wget/i,/bot/i,/crawler/i,/curl/i,/generator/i];
    return junk.some(r=>r.test(n));
  }

  async function loadData(){
    try{
      const res = await fetch(DATA_URL);
      if(!res.ok) throw new Error('no json');
      ALL = await res.json();
    }catch(e){
      console.warn('lyrics.json not found or failed, falling back to embedded sample', e);
      ALL = [
        {id:1,title:"Ya Hussain",reciter:"Nadeem Sarwar",year:"2023",tags:["Ashura","Karbala"],lyrics:"Ya Hussain\nYa Hussain\nAshk..."}
      ];
    }
    // normalize
    ALL.forEach(it=>{
      it.title = it.title || '';
      it.reciter = it.reciter || '';
      it.tags = it.tags || [];
      it.lyrics = it.lyrics || '';
      it.slug = it.slug || slug(it.title + '-' + (it.reciter||''));
      it._search = (it.title + ' ' + it.reciter + ' ' + it.tags.join(' ') + ' ' + it.lyrics).toLowerCase();
    });
    // build chips from top tags
    buildChips();
    // initial render
    filtered = ALL.slice();
    renderBatch();
    buildRecitersList();
  }

  function buildChips(){
    const tagCounts = {};
    ALL.forEach(it=> (it.tags||[]).forEach(t=> tagCounts[t] = (tagCounts[t]||0)+1));
    const topTags = Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).slice(0,20).map(x=>x[0]);
    chips.innerHTML = '';
    topTags.forEach(t=>{
      const el = document.createElement('div'); el.className='chip'; el.textContent = t;
      el.onclick = ()=> { applyTagFilter(t); };
      chips.appendChild(el);
    });
  }

  function buildRecitersList(){
    // We also add reciters as chips (cleaned)
    const recMap = {};
    ALL.forEach(it=>{
      const r = (it.reciter||'').trim();
      if(r && !isJunkName(r)) recMap[r] = (recMap[r]||0) + 1;
    });
    const reciters = Object.entries(recMap).sort((a,b)=>b[1]-a[1]).slice(0,40).map(x=>x[0]);
    // append reciters to chips area
    reciters.forEach(r=>{
      const el = document.createElement('div'); el.className='chip'; el.textContent = r;
      el.onclick = ()=> applyReciterFilter(r);
      chips.appendChild(el);
    });
  }

  function applyTagFilter(tag){
    filtered = ALL.filter(it => (it.tags||[]).map(x=>x.toLowerCase()).includes(String(tag).toLowerCase()));
    resetAndRender();
  }
  function applyReciterFilter(rec){
    filtered = ALL.filter(it => (it.reciter||'').toLowerCase() === rec.toLowerCase());
    resetAndRender();
  }

  function resetAndRender(){
    offset = 0; results.innerHTML=''; renderBatch();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function renderBatch(){
    if(offset >= filtered.length) return;
    loader.hidden = false;
    const end = Math.min(offset + BATCH, filtered.length);
    const batch = filtered.slice(offset, end);
    for(const it of batch){
      const card = document.createElement('article');
      card.className = 'card';
      const slug = 'lyrics/' + (it.slug || (it.id ? 'id-'+it.id : encodeURIComponent(it.title)));
      card.innerHTML = `<h3><a href="${slug}.html">${escapeHtml(it.title)}</a></h3>
        <p>${escapeHtml((it.lyrics||'').slice(0,140))}...</p>
        <div class="meta"><span>${escapeHtml(it.reciter||'')}</span><span>${escapeHtml(it.year||'')}</span></div>
        <div class="tags">${(it.tags||[]).map(t=>`<span class="tag" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</span>`).join('')}</div>`;
      // tag click inside card
      card.querySelectorAll('.tag').forEach(tn=> tn.addEventListener('click', e=> { e.preventDefault(); e.stopPropagation(); applyTagFilter(tn.dataset.tag); }));
      results.appendChild(card);
    }
    offset = end;
    loader.hidden = true;
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])); }

  // infinite scroll
  document.addEventListener('scroll', ()=>{
    if((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 300)){
      renderBatch();
    }
  });

  // search
  searchBtn.addEventListener('click', ()=> {
    const q = (searchInput.value||'').toLowerCase().trim();
    if(!q){ filtered = ALL.slice(); resetAndRender(); return; }
    const tokens = q.split(/\s+/).filter(Boolean);
    filtered = ALL.filter(it => tokens.every(t => it._search.includes(t)));
    resetAndRender();
  });
  searchInput.addEventListener('keyup', (e)=> { if(e.key==='Enter') searchBtn.click(); });

  await loadData();
})();
