/* js/app.js - final functional script for Carousel Studio
   Dependencies included in index.html:
     - JSZip
     - FileSaver
     - jsPDF (for PDF export)
*/

(() => {
  // Helpers
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const create = (t) => document.createElement(t);
  const deep = (o) => JSON.parse(JSON.stringify(o));

  // DOM refs
  const canvas = $('#slideCanvas');
  const ctx = canvas.getContext('2d');
  const thumbnailStrip = $('#thumbnailStrip');
  const slideCount = $('#slideCount');
  const commandBox = $('#commandBox');
  const generateSlidesBtn = $('#generateSlidesBtn');
  const platformSelect = $('#platformSelect');
  const bgColorPicker = $('#bgColorPicker');
  const headlineText = $('#headlineText');
  const subtextText = $('#subtextText');
  const ctaText = $('#ctaText');
  const watermarkText = $('#watermarkText');
  const addSlideBtn = $('#addSlideBtn');
  const deleteSlideBtn = $('#deleteSlideBtn');
  const exportSlideBtn = $('#exportSlideBtn');
  const exportFormat = $('#exportFormat');
  const prevSlideBtn = $('#prevSlideBtn');
  const nextSlideBtn = $('#nextSlideBtn');
  const slideIndicator = $('#slideIndicator');
  const darkModeToggle = $('#darkModeToggle');

  // State
  const MAX_SLIDES = 15;
  let slides = [];
  let idx = 0;
  let zoom = 1;
  let undoStack = [], redoStack = [];

  // Default slide factory
  function emptySlide(w = 1080, h = 1080) {
    return {
      width: w, height: h,
      bg: { type: 'color', color: '#667eea', image: null },
      text: { headline: '', subtext: '', cta: '', watermark: '' },
      layout: 'center', created: Date.now()
    };
  }

  // Undo/redo
  function pushUndo() { undoStack.push(deep({ slides, idx })); if (undoStack.length>60) undoStack.shift(); redoStack=[]; }
  function undo(){ if(!undoStack.length) return; redoStack.push(deep({slides,idx})); const s=undoStack.pop(); slides=s.slides; idx=s.idx; renderAll(); }
  function redo(){ if(!redoStack.length) return; undoStack.push(deep({slides,idx})); const s=redoStack.pop(); slides=s.slides; idx=s.idx; renderAll(); }

  // Canvas sizing
  function setCanvasSize(s){
    canvas.width = s.width;
    canvas.height = s.height;
    canvas.style.maxWidth = '100%';
  }

  // Render slide
  async function renderSlide(s){
    setCanvasSize(s);
    // clear
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // background
    if(s.bg.type==='color'){ ctx.fillStyle = s.bg.color||'#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); }
    else if(s.bg.type==='image' && s.bg.image){ try{ const img = await loadImage(s.bg.image); // cover
        const sw=img.width, sh=img.height, cr = canvas.width / canvas.height, ir = sw / sh;
        let dw, dh; if(ir>cr){ dh = canvas.height; dw = (sw/sh)*dh; } else { dw = canvas.width; dh = (sh/sw)*dw; }
        ctx.drawImage(img, (canvas.width-dw)/2, (canvas.height-dh)/2, dw, dh);
      }catch(e){ ctx.fillStyle='#ddd'; ctx.fillRect(0,0,canvas.width,canvas.height); } }
    else { ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); }

    // text styling
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = Math.round(canvas.width*0.01);

    // headline
    if(s.text.headline){
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${Math.round(canvas.width/10)}px "Inter", sans-serif`;
      wrapText(ctx, s.text.headline, canvas.width/2, canvas.height/2 - 40, canvas.width * 0.88, Math.round(canvas.width/10)+6);
    }
    // subtext
    if(s.text.subtext){
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = `500 ${Math.round(canvas.width/22)}px "Inter", sans-serif`;
      wrapText(ctx, s.text.subtext, canvas.width/2, canvas.height/2 + 60, canvas.width * 0.84, Math.round(canvas.width/22)+6);
    }
    // CTA
    if(s.text.cta){
      const ctaSize = Math.round(canvas.width/18);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      // button rect
      const textWidth = ctx.measureText(s.text.cta).width;
      const pad = 28;
      const bw = Math.min(canvas.width-80, textWidth + pad*2);
      const bx = (canvas.width - bw)/2;
      const by = canvas.height - 110;
      roundRect(ctx, bx, by, bw, ctaSize+20, 12, true);
      ctx.fillStyle = '#111';
      ctx.font = `600 ${ctaSize}px "Inter", sans-serif`;
      ctx.fillText(s.text.cta, canvas.width/2, by + (ctaSize+20)/2);
    }
    // watermark
    if(s.text.watermark){
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.font = `600 ${Math.round(canvas.width/35)}px "Inter", sans-serif`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(s.text.watermark, canvas.width - 18, canvas.height - 12);
    }
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight){
    const words = String(text).split(' ');
    let line = '', lines = [];
    for(let i=0;i<words.length;i++){
      const test = line + words[i] + ' ';
      if(ctx.measureText(test).width > maxWidth && i>0){ lines.push(line.trim()); line = words[i] + ' '; }
      else line = test;
    }
    lines.push(line.trim());
    const blockH = lines.length * lineHeight;
    let startY = y - blockH/2 + lineHeight/2;
    for(let i=0;i<lines.length;i++) ctx.fillText(lines[i], x, startY + i*lineHeight);
  }

  function roundRect(ctx, x, y, w, h, r, fill){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.closePath();
    if(fill) ctx.fill();
  }

  function loadImage(src){ return new Promise((res,rej)=>{ const img=new Image(); img.crossOrigin='anonymous'; img.onload=()=>res(img); img.onerror=rej; img.src=src; }); }

  // Thumbnails
  async function makeThumb(s,i){
    const off = document.createElement('canvas');
    off.width = s.width; off.height = s.height;
    const c = off.getContext('2d');
    // bg
    if(s.bg.type==='color'){ c.fillStyle=s.bg.color; c.fillRect(0,0,off.width,off.height); }
    else if(s.bg.type==='image'&&s.bg.image){ try{ const img = await loadImage(s.bg.image); const sw=img.width, sh=img.height, cr=off.width/off.height, ir=sw/sh; let dw,dh; if(ir>cr){ dh=off.height; dw=(sw/sh)*dh } else { dw=off.width; dh=(sh/sw)*dw } c.drawImage(img,(off.width-dw)/2,(off.height-dh)/2,dw,dh); }catch(e){ c.fillStyle='#ddd'; c.fillRect(0,0,off.width,off.height); } }
    else { c.fillStyle='#fff'; c.fillRect(0,0,off.width,off.height); }
    c.fillStyle = '#fff'; c.font = `600 ${Math.round(off.width/14)}px "Inter"`; c.textAlign='center'; c.fillText(s.text.headline? s.text.headline.split(' ').slice(0,5).join(' ') : `Slide ${i+1}`, off.width/2, off.height/2);
    const thumbCan = document.createElement('canvas'), tw=160, th=Math.round(tw*(off.height/off.width)); thumbCan.width=tw; thumbCan.height=th;
    const tctx=thumbCan.getContext('2d'); tctx.drawImage(off,0,0,tw,th);
    const url = thumbCan.toDataURL('image/png');
    const el = document.createElement('div'); el.className='thumbnail'; el.style.backgroundImage = `url(${url})`; el.dataset.index = i;
    el.addEventListener('click',()=>{ idx = i; renderAll(); });
    const overlay = document.createElement('div'); overlay.className='thumb-overlay'; overlay.innerHTML = `<button class="thumb-btn" title="Duplicate">⎘</button><button class="thumb-btn" title="Delete">✕</button>`;
    overlay.querySelectorAll('.thumb-btn')[0].addEventListener('click',(e)=>{ e.stopPropagation(); duplicateAt(i); });
    overlay.querySelectorAll('.thumb-btn')[1].addEventListener('click',(e)=>{ e.stopPropagation(); deleteAt(i); });
    el.appendChild(overlay);
    return el;
  }

  async function refreshThumbs(){
    thumbnailStrip.innerHTML='';
    if(!slides.length){ thumbnailStrip.innerHTML = `<div class="thumbnail" style="display:flex;align-items:center;justify-content:center"><small class="small-muted">No slides</small></div>`; return; }
    for(let i=0;i<slides.length;i++){ const t = await makeThumb(slides[i],i); if(i===idx) t.classList.add('active'); thumbnailStrip.appendChild(t); }
  }

  // Slide operations
  function addSlide(after = null, s = null){
    if(slides.length>=MAX_SLIDES){ alert(`Max ${MAX_SLIDES} slides`); return; }
    pushUndo();
    const slide = s || emptySlide(parseInt(canvas.width,10) || 1080, parseInt(canvas.height,10) || 1080);
    if(after===null){ slides.push(slide); idx = slides.length-1; } else { slides.splice(after+1,0,slide); idx = after+1; }
    renderAll();
  }
  function duplicateAt(i){ if(slides.length>=MAX_SLIDES){ alert('max reached'); return; } pushUndo(); const cp = deep(slides[i]); cp.created = Date.now(); slides.splice(i+1,0,cp); idx = i+1; renderAll(); }
  function deleteAt(i){ if(!confirm('Delete this slide?')) return; pushUndo(); slides.splice(i,1); if(slides.length===0) idx=0; else idx = clamp(i-1,0,slides.length-1); renderAll(); }

  // parse command box (simple)
  function parseCommands(txt){
    const blocks = txt.split(/##\s*SLIDE/i).map(b=>b.trim()).filter(Boolean);
    return blocks.map(b=>{
      const props = {};
      b.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).forEach(line=>{
        const m=line.match(/^([\w\- ]+)\s*:\s*(.*)$/); if(m){ props[m[1].toLowerCase().trim()] = m[2].trim(); }
      });
      const s = emptySlide(parseInt(props.width||1080,10), parseInt(props.height||1080,10));
      s.text.headline = props.title || props.headline || '';
      s.text.subtext = props.description || props.subtext || '';
      s.text.cta = props.cta || '';
      s.text.watermark = props.brand || props.watermark || '';
      if(props['bg-color']) s.bg.color = props['bg-color'];
      if((props['bg-type']||'').toLowerCase()==='image' && props['bg']) s.bg = { type:'image', image: props['bg'] };
      return s;
    });
  }

  // export single
  function exportCurrent(fmt='png'){
    if(!slides.length){ alert('No slides'); return; }
    const s = slides[idx];
    return renderSlide(s).then(()=> new Promise((res)=>{
      const mime = fmt==='jpg' ? 'image/jpeg' : 'image/png';
      canvas.toBlob(blob=>{ saveAs(blob, `slide-${idx+1}.${fmt==='jpg'?'jpg':'png'}`); res(); }, mime, fmt==='jpg'?0.92:1);
    }));
  }

  // export all -> zip or pdf
  async function exportAll(fmt='png'){
    if(!slides.length){ alert('No slides'); return; }
    if(fmt==='pdf' && typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined'){
      if(!confirm('PDF requires jsPDF library. Export PNG zip instead?')) return;
    }
    const zip = new JSZip();
    for(let i=0;i<slides.length;i++){ await renderSlide(slides[i]); const blob = await new Promise(r=>canvas.toBlob(r, fmt==='jpg'?'image/jpeg':'image/png', fmt==='jpg'?0.92:1)); zip.file(`slide-${i+1}.${fmt==='jpg'?'jpg':'png'}`, blob); }
    const blob = await zip.generateAsync({type:'blob'}); saveAs(blob, 'carousel-slides.zip');
  }

  // sync UI -> slide
  function bindToUI(){
    if(!slides.length) return;
    const s = slides[idx];
    bgColorPicker.value = s.bg.color || '#667eea';
    headlineText.value = s.text.headline || '';
    subtextText.value = s.text.subtext || '';
    ctaText.value = s.text.cta || '';
    watermarkText.value = s.text.watermark || '';
  }

  function updateFromUI(){
    if(!slides.length) return;
    const s = slides[idx];
    s.bg.color = bgColorPicker.value;
    s.text.headline = headlineText.value;
    s.text.subtext = subtextText.value;
    s.text.cta = ctaText.value;
    s.text.watermark = watermarkText.value;
    renderAll();
  }

  // render all
  async function renderAll(){
    slideCount.textContent = slides.length;
    slideIndicator.textContent = `Slide ${slides.length?idx+1:0}/${slides.length||0}`;
    if(!slides.length){ ctx.clearRect(0,0,canvas.width,canvas.height); thumbnailStrip.innerHTML=''; return; }
    idx = clamp(idx, 0, slides.length-1);
    bindToUI();
    await renderSlide(slides[idx]);
    await refreshThumbs();
  }

  // init
  function init(){
    slides = [ emptySlide(1080,1080) ];
    idx = 0; renderAll();
  }

  // events
  addSlideBtn.addEventListener('click', ()=>{ pushUndo(); addSlide(); });
  deleteSlideBtn.addEventListener('click', ()=>{ if(slides.length) { pushUndo(); deleteAt(idx); }});
  prevSlideBtn.addEventListener('click', ()=>{ if(slides.length){ idx = clamp(idx-1,0,slides.length-1); renderAll(); }});
  nextSlideBtn.addEventListener('click', ()=>{ if(slides.length){ idx = clamp(idx+1,0,slides.length-1); renderAll(); }});
  generateSlidesBtn.addEventListener('click', ()=>{ const parsed = parseCommands(commandBox.value); if(!parsed.length){ alert('No slide blocks found. Use ## SLIDE blocks.'); return; } pushUndo(); parsed.forEach(s=>{ if(slides.length<MAX_SLIDES) slides.push(s); }); idx = slides.length-1; renderAll(); });
  bgColorPicker.addEventListener('input', ()=>{ pushUndo(); updateFromUI(); });
  headlineText.addEventListener('input', ()=>{ scheduleUpdate(); });
  subtextText.addEventListener('input', ()=>{ scheduleUpdate(); });
  ctaText.addEventListener('input', ()=>{ scheduleUpdate(); });
  watermarkText.addEventListener('input', ()=>{ scheduleUpdate(); });

  exportSlideBtn.addEventListener('click', ()=>{ const fmt = exportFormat.value; if(fmt==='pdf'){ exportAll('png').then(()=>alert('PDF requires jsPDF - zip of PNGs exported instead.')); } else exportCurrent(fmt); });
  // quick export all: ctrl+shift+e
  window.addEventListener('keydown',(e)=>{ if((e.ctrlKey||e.metaKey) && e.shiftKey && e.key.toLowerCase()==='e'){ e.preventDefault(); exportAll(exportFormat.value); } });
  darkModeToggle.addEventListener('click', ()=>{ document.body.classList.toggle('dark-mode'); });

  // debounce input
  let tmr=null;
  function scheduleUpdate(){ if(tmr) clearTimeout(tmr); tmr=setTimeout(()=>{ pushUndo(); updateFromUI(); tmr=null; },300); }

  // keyboard shortcuts
  window.addEventListener('keydown',(e)=>{ if(e.ctrlKey||e.metaKey){ if(e.key.toLowerCase()==='z'){ e.preventDefault(); undo(); } else if(e.key.toLowerCase()==='y'){ e.preventDefault(); redo(); } } else { if(e.key==='ArrowRight') nextSlideBtn.click(); if(e.key==='ArrowLeft') prevSlideBtn.click(); } });

  // expose for debugging
  window.CarouselStudio = { getSlides: () => slides, addSlide, deleteAt, duplicateAt, exportCurrent, exportAll };

  // start
  init();

})();
