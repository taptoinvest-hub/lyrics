/* app.js for Carousel Studio
   Dependencies:
     - jszip (already included in HTML)
     - FileSaver.js (already included in HTML)
   Notes:
     - PDF export requires jsPDF; if absent, user is notified.
     - Max slides default = 15
*/

(() => {
  // ----- Utilities -----
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const el = (sel) => document.querySelector(sel);
  const els = (sel) => Array.from(document.querySelectorAll(sel));
  const create = (tag, attrs = {}) => {
    const node = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    }
    return node;
  };
  const deepCopy = (o) => JSON.parse(JSON.stringify(o));

  // ----- DOM refs -----
  const canvas = el('#slideCanvas');
  const ctx = canvas.getContext('2d');
  const thumbnailStrip = el('#thumbnailStrip');
  const slideCountEl = el('#slideCount');
  const totalSlidesEl = el('#totalSlides');
  const currentSlideNumEl = el('#currentSlideNum');
  const platformSelect = el('#platformSelect');
  const platformInfo = el('#platformInfo');
  const widthInput = el('#widthInput');
  const heightInput = el('#heightInput');
  const presetBtns = els('.preset-btn');
  const addSlideBtn = el('#addSlideBtn');
  const duplicateSlideBtn = el('#duplicateSlideBtn');
  const deleteSlideBtn = el('#deleteSlideBtn');
  const clearAllBtn = el('#clearAllBtn');
  const headlineText = el('#headlineText');
  const subtextText = el('#subtextText');
  const ctaText = el('#ctaText');
  const watermarkText = el('#watermarkText');
  const bgColorPicker = el('#bgColorPicker');
  const bgColorText = el('#bgColorText');
  const bgTypeBtns = els('.bg-type-btn');
  const bgGradientControl = el('#bgGradientControl');
  const bgColorControl = el('#bgColorControl');
  const bgImageControl = el('#bgImageControl');
  const gradientColor1 = el('#gradientColor1');
  const gradientColor2 = el('#gradientColor2');
  const gradientDirection = el('#gradientDirection');
  const bgImageUpload = el('#bgImageUpload');
  const bgImageRemove = el('#bgImageRemove');
  const generateSlidesBtn = el('#generateSlidesBtn');
  const commandBox = el('#commandBox');
  const prevSlideBtn = el('#prevSlideBtn');
  const nextSlideBtn = el('#nextSlideBtn');
  const exportSingleBtn = el('#exportSingleBtn');
  const exportAllBtn = el('#exportAllBtn');
  const exportFormat = el('#exportFormat');
  const thumbnailPlaceholder = el('.thumbnail-placeholder') || null;
  const zoomOutBtn = el('#zoomOutBtn');
  const zoomInBtn = el('#zoomInBtn');
  const fitScreenBtn = el('#fitScreenBtn');
  const zoomLevelEl = els('.zoom-level')[0] || null;
  const themeSelect = el('#themeSelect');
  const darkModeToggle = el('#darkModeToggle');
  const undoBtn = el('#undoBtn');
  const redoBtn = el('#redoBtn');
  const currentPlatformEl = el('#currentPlatform');

  // ----- State -----
  const MAX_SLIDES = 15;
  let slides = []; // array of slide objects
  let currentIndex = 0;
  let zoom = 1;
  let undoStack = [];
  let redoStack = [];

  // slide object structure:
  // {
  //   width, height,
  //   bg: { type: 'color'|'gradient'|'image', color, gradient: {c1,c2,dir}, imageDataUrl, imageScale, imageX,imageY },
  //   text: { headline, subtext, cta, watermark },
  //   layout: 'center'|'top'|'bottom',
  //   theme: string,
  //   platform: 'instagram' etc.
  // }

  // ----- Default slide -----
  function createEmptySlide(w = 1080, h = 1080) {
    return {
      width: w,
      height: h,
      bg: {
        type: 'color',
        color: '#667eea',
        gradient: { c1: '#667eea', c2: '#764ba2', dir: 'to right' },
        imageDataUrl: null,
        imageScale: 1,
        imageX: 0,
        imageY: 0
      },
      text: {
        headline: '',
        subtext: '',
        cta: '',
        watermark: ''
      },
      layout: 'center',
      theme: 'modern-blue',
      created: Date.now()
    };
  }

  // ----- State helpers -----
  function pushUndo() {
    undoStack.push(deepCopy({ slides, currentIndex }));
    if (undoStack.length > 50) undoStack.shift();
    // clear redo on new action
    redoStack = [];
    updateHistoryButtons();
  }
  function undo() {
    if (!undoStack.length) return;
    redoStack.push(deepCopy({ slides, currentIndex }));
    const state = undoStack.pop();
    slides = state.slides;
    currentIndex = state.currentIndex;
    renderAll();
    updateHistoryButtons();
  }
  function redo() {
    if (!redoStack.length) return;
    undoStack.push(deepCopy({ slides, currentIndex }));
    const state = redoStack.pop();
    slides = state.slides;
    currentIndex = state.currentIndex;
    renderAll();
    updateHistoryButtons();
  }
  function updateHistoryButtons() {
    undoBtn.disabled = !undoStack.length;
    redoBtn.disabled = !redoStack.length;
  }

  // ----- Canvas rendering -----
  function setCanvasSizeForSlide(slide) {
    canvas.width = slide.width;
    canvas.height = slide.height;
    canvas.style.width = Math.round(slide.width * zoom) + 'px';
    canvas.style.height = Math.round(slide.height * zoom) + 'px';
  }

  // Draw a single slide to canvas
  async function renderSlideToCanvas(slide) {
    // set size
    setCanvasSizeForSlide(slide);

    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    if (slide.bg.type === 'color') {
      ctx.fillStyle = slide.bg.color || '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (slide.bg.type === 'gradient') {
      // gradient direction handling: support 'to right', 'to bottom', '135deg' etc
      let g;
      if (slide.bg.gradient.dir === 'to right') {
        g = ctx.createLinearGradient(0, 0, canvas.width, 0);
      } else if (slide.bg.gradient.dir === 'to bottom') {
        g = ctx.createLinearGradient(0, 0, 0, canvas.height);
      } else {
        // parse degrees -> compute direction
        const degree = parseFloat(slide.bg.gradient.dir) || 135;
        const rad = (degree * Math.PI) / 180;
        const x = Math.cos(rad);
        const y = Math.sin(rad);
        g = ctx.createLinearGradient(0.5 * canvas.width * (1 - x), 0.5 * canvas.height * (1 - y), 0.5 * canvas.width * (1 + x), 0.5 * canvas.height * (1 + y));
      }
      g.addColorStop(0, slide.bg.gradient.c1);
      g.addColorStop(1, slide.bg.gradient.c2);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (slide.bg.type === 'image' && slide.bg.imageDataUrl) {
      // draw image with scaling and centering options
      try {
        const img = await loadImage(slide.bg.imageDataUrl);
        const scale = slide.bg.imageScale || 1;
        // fit by cover behavior
        const sw = img.width;
        const sh = img.height;
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = sw / sh;
        let dw, dh;
        if (imgRatio > canvasRatio) {
          // image wider -> height fit
          dh = canvas.height * scale;
          dw = (sw / sh) * dh;
        } else {
          // image taller -> width fit
          dw = canvas.width * scale;
          dh = (sh / sw) * dw;
        }
        const dx = (canvas.width - dw) / 2 + (slide.bg.imageX || 0);
        const dy = (canvas.height - dh) / 2 + (slide.bg.imageY || 0);
        ctx.drawImage(img, dx, dy, dw, dh);
      } catch (err) {
        console.warn('Image draw failed', err);
        ctx.fillStyle = '#ddd';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      // fallback color
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Text rendering - layout aware
    const padding = Math.round(canvas.width * 0.06);
    const centerX = canvas.width / 2;
    let yStart = padding;
    if (slide.layout === 'center') yStart = canvas.height / 2;
    else if (slide.layout === 'bottom') yStart = canvas.height - padding - 200;

    // Headline (big)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // dynamic font size based on canvas size
    const headlineFontSize = Math.round(canvas.width / 10); // e.g., 108 for 1080 width
    const subtextFontSize = Math.round(canvas.width / 22);
    const ctaFontSize = Math.round(canvas.width / 18);
    const watermarkFontSize = Math.round(canvas.width / 35);

    // Apply simple drop shadow for better readability
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = Math.round(canvas.width * 0.01);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(canvas.width * 0.005);

    if (slide.text.headline) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${headlineFontSize}px "Playfair Display", serif`;
      wrapText(ctx, slide.text.headline, centerX, yStart - (slide.layout === 'center' ? headlineFontSize : 0), canvas.width - padding * 2, headlineFontSize + 8);
    }

    // Subtext below headline
    if (slide.text.subtext) {
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = `500 ${subtextFontSize}px "Inter", sans-serif`;
      const subY = (slide.layout === 'center') ? yStart + headlineFontSize : yStart + subtextFontSize + 24;
      wrapText(ctx, slide.text.subtext, centerX, subY, canvas.width - padding * 2, subtextFontSize + 6);
    }

    // CTA near bottom area of canvas (if present)
    if (slide.text.cta) {
      const ctaY = canvas.height - padding - ctaFontSize;
      // draw rounded rect behind CTA
      const textMetrics = ctx.measureText(slide.text.cta);
      const ctaWidth = Math.min(canvas.width - padding * 2, textMetrics.width + 60);
      const cx = centerX - ctaWidth / 2;
      const cy = ctaY - ctaFontSize;
      // button background
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, cx, ctaY - ctaFontSize - 12, ctaWidth, ctaFontSize + 24, 12, true, false);
      // CTA text
      ctx.fillStyle = '#222';
      ctx.font = `600 ${ctaFontSize}px "Inter", sans-serif`;
      ctx.fillText(slide.text.cta, centerX, ctaY);
    }

    // Watermark/brand
    if (slide.text.watermark) {
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = `500 ${watermarkFontSize}px "Montserrat", sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(slide.text.watermark, canvas.width - padding, canvas.height - 12);
      ctx.restore();
    }

    // reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // Helpers for drawing
  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (typeof r === 'undefined') r = 5;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // text wrap function (centered)
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text).split(' ');
    let line = '';
    let lines = [];
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    // compute start y for centered block: if x is center and baseline middle, start from y - half block
    const blockHeight = lines.length * lineHeight;
    let startY = y - (blockHeight / 2) + lineHeight / 2;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, startY + i * lineHeight);
    }
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  }

  // ----- Thumbnail creation -----
  async function createThumbnail(slide, index) {
    // create an offscreen canvas scaled down
    const thumbWidth = 220;
    const ratio = slide.width / slide.height;
    const thumbHeight = Math.round(thumbWidth / ratio);
    const off = document.createElement('canvas');
    off.width = slide.width;
    off.height = slide.height;
    const offCtx = off.getContext('2d');

    // reuse render logic but minimal: background + headline text
    // background
    if (slide.bg.type === 'color') {
      offCtx.fillStyle = slide.bg.color || '#fff';
      offCtx.fillRect(0, 0, off.width, off.height);
    } else if (slide.bg.type === 'gradient') {
      let g;
      if (slide.bg.gradient.dir === 'to right') g = offCtx.createLinearGradient(0, 0, off.width, 0);
      else g = offCtx.createLinearGradient(0, 0, 0, off.height);
      g.addColorStop(0, slide.bg.gradient.c1);
      g.addColorStop(1, slide.bg.gradient.c2);
      offCtx.fillStyle = g;
      offCtx.fillRect(0, 0, off.width, off.height);
    } else if (slide.bg.type === 'image' && slide.bg.imageDataUrl) {
      try {
        const img = await loadImage(slide.bg.imageDataUrl);
        // cover fit
        const sw = img.width;
        const sh = img.height;
        const canvasRatio = off.width / off.height;
        const imgRatio = sw / sh;
        let dw, dh;
        if (imgRatio > canvasRatio) {
          dh = off.height;
          dw = (sw / sh) * dh;
        } else {
          dw = off.width;
          dh = (sh / sw) * dw;
        }
        const dx = (off.width - dw) / 2;
        const dy = (off.height - dh) / 2;
        offCtx.drawImage(img, dx, dy, dw, dh);
      } catch (e) {
        offCtx.fillStyle = '#ddd';
        offCtx.fillRect(0, 0, off.width, off.height);
      }
    } else {
      offCtx.fillStyle = '#fff';
      offCtx.fillRect(0, 0, off.width, off.height);
    }

    // headline small
    offCtx.font = `600 ${Math.round(off.width / 12)}px "Playfair Display", serif`;
    offCtx.fillStyle = '#fff';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    if (slide.text.headline) {
      offCtx.fillText(slide.text.headline.split(' ').slice(0, 6).join(' '), off.width / 2, off.height / 2);
    }

    // scale down to thumbnail
    const thumb = document.createElement('canvas');
    thumb.width = thumbWidth;
    thumb.height = thumbHeight;
    const tctx = thumb.getContext('2d');
    tctx.drawImage(off, 0, 0, thumb.width, thumb.height);

    const dataUrl = thumb.toDataURL('image/png');

    // create DOM element
    const thumbEl = document.createElement('div');
    thumbEl.className = 'thumbnail';
    thumbEl.dataset.index = index;
    thumbEl.style.backgroundImage = `url(${dataUrl})`;
    thumbEl.style.backgroundSize = 'cover';
    thumbEl.title = `Slide ${index + 1}`;
    thumbEl.innerHTML = `<div class="thumb-index">${index + 1}</div>`;
    thumbEl.addEventListener('click', () => {
      selectSlide(index);
    });
    return thumbEl;
  }

  // Regenerate all thumbnails
  async function refreshThumbnails() {
    thumbnailStrip.innerHTML = '';
    if (!slides.length) {
      const placeholder = document.createElement('div');
      placeholder.className = 'thumbnail-placeholder';
      placeholder.innerHTML = `<i class="fas fa-plus-circle"></i><p>Add slides to see thumbnails</p>`;
      thumbnailStrip.appendChild(placeholder);
      return;
    }
    for (let i = 0; i < slides.length; i++) {
      const thumbEl = await createThumbnail(slides[i], i);
      // add controls overlay: duplicate/delete on each thumbnail (optional)
      const overlay = document.createElement('div');
      overlay.className = 'thumb-overlay';
      overlay.innerHTML = `<button class="thumb-btn thumb-dup" title="Duplicate">⎘</button>
                           <button class="thumb-btn thumb-del" title="Delete">✕</button>`;
      overlay.querySelector('.thumb-dup').addEventListener('click', (e) => {
        e.stopPropagation();
        duplicateSlideAt(i);
      });
      overlay.querySelector('.thumb-del').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteSlideAt(i);
      });
      thumbEl.appendChild(overlay);
      if (i === currentIndex) thumbEl.classList.add('active');
      thumbnailStrip.appendChild(thumbEl);
    }
  }

  // ----- Slide actions -----
  function addSlide(afterIndex = null, initial = null) {
    if (slides.length >= MAX_SLIDES) {
      alert(`Maximum slides (${MAX_SLIDES}) reached`);
      return;
    }
    pushUndo();
    const base = initial || createEmptySlide(parseInt(widthInput.value, 10) || 1080, parseInt(heightInput.value, 10) || 1080);
    if (afterIndex === null) {
      slides.push(base);
      currentIndex = slides.length - 1;
    } else {
      slides.splice(afterIndex + 1, 0, base);
      currentIndex = afterIndex + 1;
    }
    renderAll();
  }

  function duplicateSlide() {
    if (typeof currentIndex !== 'number' || currentIndex < 0 || currentIndex >= slides.length) return;
    duplicateSlideAt(currentIndex);
  }

  function duplicateSlideAt(i) {
    if (slides.length >= MAX_SLIDES) {
      alert(`Maximum slides (${MAX_SLIDES}) reached`);
      return;
    }
    pushUndo();
    const copy = deepCopy(slides[i]);
    copy.created = Date.now();
    slides.splice(i + 1, 0, copy);
    currentIndex = i + 1;
    renderAll();
  }

  function deleteSlide() {
    if (!slides.length || currentIndex < 0) return;
    deleteSlideAt(currentIndex);
  }

  function deleteSlideAt(i) {
    pushUndo();
    slides.splice(i, 1);
    if (slides.length === 0) {
      currentIndex = 0;
    } else {
      currentIndex = clamp(i - 1, 0, slides.length - 1);
    }
    renderAll();
  }

  function clearAll() {
    if (!confirm('Clear all slides?')) return;
    pushUndo();
    slides = [];
    currentIndex = 0;
    renderAll();
  }

  function selectSlide(i) {
    if (i < 0 || i >= slides.length) return;
    currentIndex = i;
    renderAll();
  }

  function prevSlide() {
    if (!slides.length) return;
    currentIndex = clamp(currentIndex - 1, 0, slides.length - 1);
    renderAll();
  }
  function nextSlide() {
    if (!slides.length) return;
    currentIndex = clamp(currentIndex + 1, 0, slides.length - 1);
    renderAll();
  }

  // ----- Bind controls to current slide (inputs) -----
  function bindInputsToSlide() {
    if (!slides.length) return;
    const s = slides[currentIndex];

    // populate inputs
    headlineText.value = s.text.headline || '';
    subtextText.value = s.text.subtext || '';
    ctaText.value = s.text.cta || '';
    watermarkText.value = s.text.watermark || '';

    // bg controls
    bgColorPicker.value = s.bg.color || '#667eea';
    bgColorText.value = bgColorPicker.value;
    gradientColor1.value = s.bg.gradient.c1 || '#667eea';
    gradientColor2.value = s.bg.gradient.c2 || '#764ba2';
    gradientDirection.value = s.bg.gradient.dir || 'to right';
    // set bg type active
    bgTypeBtns.forEach(b => b.classList.toggle('active', b.dataset.type === s.bg.type));
    // hide/show relevant controls
    updateBgUI();
    // platform & dimension
    platformSelect.value = s.platform || 'instagram';
    widthInput.value = s.width || 1080;
    heightInput.value = s.height || 1080;
    // layout
    els('.layout-btn').forEach(b => b.classList.toggle('active', b.dataset.layout === s.layout));
    // theme
    themeSelect.value = s.theme || 'modern-blue';
  }

  // propagate inputs to slide object and re-render
  function updateSlideFromInputs() {
    if (!slides.length) return;
    const s = slides[currentIndex];
    s.text.headline = headlineText.value;
    s.text.subtext = subtextText.value;
    s.text.cta = ctaText.value;
    s.text.watermark = watermarkText.value;
    s.bg.color = bgColorPicker.value;
    s.bg.gradient.c1 = gradientColor1.value;
    s.bg.gradient.c2 = gradientColor2.value;
    s.bg.gradient.dir = gradientDirection.value;
    s.width = parseInt(widthInput.value, 10) || s.width;
    s.height = parseInt(heightInput.value, 10) || s.height;
    s.platform = platformSelect.value;
    s.theme = themeSelect.value;
    renderAll({ updateThumbnails: true });
  }

  // update elements visibility for bg type
  function updateBgUI() {
    const activeType = bgTypeBtns.find(b => b.classList.contains('active'))?.dataset.type || 'color';
    bgColorControl.classList.toggle('hidden', activeType !== 'color');
    bgGradientControl.classList.toggle('hidden', activeType !== 'gradient');
    bgImageControl.classList.toggle('hidden', activeType !== 'image');

    // set in slide
    if (slides.length) {
      slides[currentIndex].bg.type = activeType;
    }
  }

  // ----- Command box parsing for quick create -----
  // Example expected:
  // ## SLIDE 1
  // title: Welcome
  // description: Get started
  // cta: Begin
  // bg-color: #ff0000
  // bg-type: gradient
  // gradient1: #667eea
  // gradient2: #764ba2
  function parseCommandBox(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim());
    const slideBlocks = [];
    let current = null;
    for (const ln of lines) {
      if (/^##\s*SLIDE/i.test(ln)) {
        if (current) slideBlocks.push(current);
        current = { raw: [], props: {} };
        continue;
      }
      if (current) {
        if (ln === '') continue;
        current.raw.push(ln);
        const m = ln.match(/^([\w\- ]+)\s*:\s*(.*)$/);
        if (m) {
          const key = m[1].toLowerCase().trim().replace(/\s+/g, '-');
          const value = m[2].trim();
          current.props[key] = value;
        }
      }
    }
    if (current) slideBlocks.push(current);

    // map to slide objects
    const parsed = slideBlocks.map(b => {
      const w = parseInt(b.props['width'] || b.props['w'] || 1080, 10);
      const h = parseInt(b.props['height'] || b.props['h'] || 1080, 10);
      const s = createEmptySlide(w, h);
      s.text.headline = b.props['title'] || b.props['headline'] || '';
      s.text.subtext = b.props['description'] || b.props['subtext'] || '';
      s.text.cta = b.props['cta'] || '';
      s.text.watermark = b.props['brand'] || b.props['watermark'] || '';
      const bgType = (b.props['bg-type'] || b.props['bg'] || 'color').toLowerCase();
      s.bg.type = ['color', 'gradient', 'image'].includes(bgType) ? bgType : 'color';
      if (b.props['bg-color']) s.bg.color = b.props['bg-color'];
      if (b.props['gradient1']) s.bg.gradient.c1 = b.props['gradient1'];
      if (b.props['gradient2']) s.bg.gradient.c2 = b.props['gradient2'];
      if (b.props['gradient-dir']) s.bg.gradient.dir = b.props['gradient-dir'];
      s.platform = b.props['platform'] || 'instagram';
      return s;
    });
    return parsed;
  }

  // Generate slides from command box
  function generateSlidesFromCommand() {
    const txt = commandBox.value;
    if (!txt.trim()) {
      alert('Paste commands in the command box first.');
      return;
    }
    const parsed = parseCommandBox(txt);
    if (!parsed.length) {
      alert('No slide blocks found. Use "## SLIDE" blocks with key:value pairs.');
      return;
    }
    pushUndo();
    // append or replace? We'll append as new slides (respect max)
    for (const s of parsed) {
      if (slides.length >= MAX_SLIDES) break;
      slides.push(s);
    }
    currentIndex = slides.length - 1;
    renderAll();
  }

  // ----- Export -----
  function exportCurrent(format = 'png') {
    if (!slides.length) {
      alert('No slides to export.');
      return;
    }
    const s = slides[currentIndex];
    return new Promise(async (resolve, reject) => {
      await renderSlideToCanvas(s); // ensure canvas has current slide
      const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Export failed'));
          return;
        }
        const ext = format === 'jpg' ? 'jpg' : 'png';
        const filename = `slide-${currentIndex + 1}.${ext}`;
        saveAs(blob, filename); // FileSaver
        resolve(filename);
      }, mime, format === 'jpg' ? 0.92 : 1);
    });
  }

  async function exportAllSlides(format = 'png') {
    if (!slides.length) {
      alert('No slides to export.');
      return;
    }
    if (format === 'pdf' && typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
      if (!confirm('PDF export requires jsPDF library. Export PNGs in a ZIP instead?')) return;
    }

    // gather blobs, async render each to canvas and toBlob
    pushUndo(); // not necessary but keep stack stable

    const zip = new JSZip();
    for (let i = 0; i < slides.length; i++) {
      await renderSlideToCanvas(slides[i]);
      // small delay to ensure canvas updated
      const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
      /* eslint-disable no-await-in-loop */
      /* convert to blob */
      /* wrap in promise */
      const blob = await new Promise((res) => canvas.toBlob(res, mime, format === 'jpg' ? 0.92 : 1));
      const ext = format === 'jpg' ? 'jpg' : 'png';
      zip.file(`slide-${i + 1}.${ext}`, blob);
    }

    if (format === 'pdf' && (window.jspdf || window.jsPDF)) {
      // use jsPDF to make a multipage PDF
      const jsPDFLib = window.jsPDF || window.jspdf;
      const pdf = new jsPDFLib({
        orientation: 'portrait',
        unit: 'pt',
        format: [slides[0].width, slides[0].height]
      });
      for (let i = 0; i < slides.length; i++) {
        const imgData = await new Promise((res) => {
          renderSlideToCanvas(slides[i]).then(() => res(canvas.toDataURL('image/png')));
        });
        pdf.addImage(imgData, 'PNG', 0, 0, slides[i].width, slides[i].height);
        if (i < slides.length - 1) pdf.addPage([slides[i + 1].width, slides[i + 1].height]);
      }
      const pdfBlob = pdf.output('blob');
      saveAs(pdfBlob, 'slides.pdf');
      return;
    }

    // fallback: save zip of images
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, `carousel-slides.${format === 'jpg' ? 'zip' : 'zip'}`);
    });
  }

  // ----- Platform presets & orientation presets -----
  const PLATFORM_PRESETS = {
    instagram: { w: 1080, h: 1080, label: 'Instagram • 1080x1080 • Square', icon: 'fab fa-instagram' },
    linkedin: { w: 1200, h: 627, label: 'LinkedIn • 1200x627 • Landscape', icon: 'fab fa-linkedin' },
    facebook: { w: 1200, h: 630, label: 'Facebook • 1200x630 • Landscape', icon: 'fab fa-facebook' },
    pinterest: { w: 1000, h: 1500, label: 'Pinterest • 1000x1500 • Tall', icon: 'fab fa-pinterest' },
    tiktok: { w: 1080, h: 1920, label: 'TikTok • 1080x1920 • Vertical', icon: 'fab fa-tiktok' },
    twitter: { w: 1200, h: 675, label: 'Twitter/X • 1200x675', icon: 'fab fa-x-twitter' },
    threads: { w: 1080, h: 1080, label: 'Threads • 1080x1080 • Square', icon: 'fas fa-feather' },
    youtube: { w: 1280, h: 720, label: 'YouTube • 1280x720 • 16:9', icon: 'fab fa-youtube' },
    custom: { w: 1080, h: 1080, label: 'Custom', icon: 'fas fa-cog' }
  };

  function applyPlatformPreset(platform) {
    const p = PLATFORM_PRESETS[platform] || PLATFORM_PRESETS.custom;
    platformInfo.innerHTML = `${p.label}`;
    widthInput.value = p.w;
    heightInput.value = p.h;
    if (slides.length) {
      pushUndo();
      slides[currentIndex].width = p.w;
      slides[currentIndex].height = p.h;
      slides[currentIndex].platform = platform;
      renderAll();
    }
  }

  // orientation/preset btns
  function applyOrientationPreset(preset) {
    if (preset === '1:1') {
      widthInput.value = 1080;
      heightInput.value = 1080;
    } else if (preset === '4:5') {
      widthInput.value = 1080;
      heightInput.value = 1350;
    } else if (preset === '9:16') {
      widthInput.value = 1080;
      heightInput.value = 1920;
    }
    if (slides.length) {
      pushUndo();
      slides[currentIndex].width = parseInt(widthInput.value, 10);
      slides[currentIndex].height = parseInt(heightInput.value, 10);
      renderAll();
    }
  }

  // ----- Render everything (bindings + thumbnail refresh + canvas render) -----
  async function renderAll({ updateThumbnails = true } = {}) {
    // update counters
    slideCountEl.textContent = slides.length;
    totalSlidesEl.textContent = slides.length;
    currentSlideNumEl.textContent = slides.length ? currentIndex + 1 : 0;
    // if no slides, blank canvas
    if (!slides.length) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      thumbnailStrip.innerHTML = '';
      slideCountEl.textContent = '0';
      return;
    }
    // ensure index in range
    currentIndex = clamp(currentIndex, 0, slides.length - 1);
    // populate inputs
    bindInputsToSlide();
    // render canvas for current slide
    await renderSlideToCanvas(slides[currentIndex]);
    // update thumbnails when requested
    if (updateThumbnails) await refreshThumbnails();
    // update action button states
    duplicateSlideBtn.disabled = slides.length === 0;
    deleteSlideBtn.disabled = slides.length === 0;
  }

  // ----- Event Listeners -----
  // basic controls
  addSlideBtn.addEventListener('click', () => addSlide());
  duplicateSlideBtn.addEventListener('click', () => {
    pushUndo();
    duplicateSlide();
  });
  deleteSlideBtn.addEventListener('click', () => {
    pushUndo();
    deleteSlide();
  });
  clearAllBtn.addEventListener('click', () => clearAll());

  prevSlideBtn.addEventListener('click', () => {
    prevSlide();
  });
  nextSlideBtn.addEventListener('click', () => {
    nextSlide();
  });

  // inputs -> slide updates (debounced)
  let inputDebounceTimer = null;
  function scheduleInputUpdate() {
    if (inputDebounceTimer) clearTimeout(inputDebounceTimer);
    inputDebounceTimer = setTimeout(() => {
      pushUndo();
      updateSlideFromInputs();
    }, 300);
  }
  headlineText.addEventListener('input', scheduleInputUpdate);
  subtextText.addEventListener('input', scheduleInputUpdate);
  ctaText.addEventListener('input', scheduleInputUpdate);
  watermarkText.addEventListener('input', scheduleInputUpdate);
  bgColorPicker.addEventListener('input', (e) => {
    bgColorText.value = e.target.value;
    scheduleInputUpdate();
  });
  bgColorText.addEventListener('change', (e) => {
    bgColorPicker.value = e.target.value;
    scheduleInputUpdate();
  });
  gradientColor1.addEventListener('input', scheduleInputUpdate);
  gradientColor2.addEventListener('input', scheduleInputUpdate);
  gradientDirection.addEventListener('change', scheduleInputUpdate);
  widthInput.addEventListener('change', () => {
    if (!slides.length) return;
    pushUndo();
    slides[currentIndex].width = parseInt(widthInput.value, 10) || slides[currentIndex].width;
    slides[currentIndex].height = parseInt(heightInput.value, 10) || slides[currentIndex].height;
    renderAll();
  });
  heightInput.addEventListener('change', () => {
    if (!slides.length) return;
    pushUndo();
    slides[currentIndex].width = parseInt(widthInput.value, 10) || slides[currentIndex].width;
    slides[currentIndex].height = parseInt(heightInput.value, 10) || slides[currentIndex].height;
    renderAll();
  });

  // platform change
  platformSelect.addEventListener('change', (e) => {
    applyPlatformPreset(e.target.value);
  });

  // orientation preset buttons
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyOrientationPreset(btn.dataset.preset);
    });
  });

  // bg type buttons
  bgTypeBtns.forEach(b => {
    b.addEventListener('click', () => {
      bgTypeBtns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      updateBgUI();
      pushUndo();
      updateSlideFromInputs();
    });
  });

  // bg image upload
  bgImageUpload.addEventListener('change', (evt) => {
    const f = evt.target.files && evt.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!slides.length) return;
      pushUndo();
      slides[currentIndex].bg.imageDataUrl = e.target.result;
      slides[currentIndex].bg.type = 'image';
      // set bg type UI active
      bgTypeBtns.forEach(x => x.classList.toggle('active', x.dataset.type === 'image'));
      updateBgUI();
      renderAll();
    };
    reader.readAsDataURL(f);
  });
  bgImageRemove.addEventListener('click', () => {
    if (!slides.length) return;
    pushUndo();
    slides[currentIndex].bg.imageDataUrl = null;
    slides[currentIndex].bg.type = 'color';
    bgTypeBtns.forEach(x => x.classList.toggle('active', x.dataset.type === 'color'));
    updateBgUI();
    renderAll();
  });

  // slide actions from toolbar
  generateSlidesBtn.addEventListener('click', () => generateSlidesFromCommand());
  exportSingleBtn.addEventListener('click', () => exportCurrent(exportFormat.value));
  exportAllBtn.addEventListener('click', () => exportAllSlides(exportFormat.value));

  // zoom controls
  zoomOutBtn.addEventListener('click', () => {
    zoom = clamp(zoom - 0.1, 0.25, 3);
    if (canvas.width) canvas.style.width = Math.round(canvas.width * zoom) + 'px';
    if (canvas.height) canvas.style.height = Math.round(canvas.height * zoom) + 'px';
    if (zoomLevelEl) zoomLevelEl.textContent = Math.round(zoom * 100) + '%';
  });
  zoomInBtn.addEventListener('click', () => {
    zoom = clamp(zoom + 0.1, 0.25, 3);
    if (canvas.width) canvas.style.width = Math.round(canvas.width * zoom) + 'px';
    if (canvas.height) canvas.style.height = Math.round(canvas.height * zoom) + 'px';
    if (zoomLevelEl) zoomLevelEl.textContent = Math.round(zoom * 100) + '%';
  });
  fitScreenBtn.addEventListener('click', () => {
    // attempt to fit canvas to preview container width
    const wrapper = document.querySelector('.canvas-wrapper');
    if (!wrapper) return;
    const maxW = wrapper.clientWidth - 20;
    const maxH = wrapper.clientHeight - 20;
    const s = slides[currentIndex];
    if (!s) return;
    const scaleW = maxW / s.width;
    const scaleH = maxH / s.height;
    zoom = Math.min(scaleW, scaleH);
    zoom = clamp(zoom, 0.25, 3);
    canvas.style.width = Math.round(s.width * zoom) + 'px';
    canvas.style.height = Math.round(s.height * zoom) + 'px';
    if (zoomLevelEl) zoomLevelEl.textContent = Math.round(zoom * 100) + '%';
  });

  // theme & dark mode
  themeSelect.addEventListener('change', () => {
    if (!slides.length) return;
    pushUndo();
    slides[currentIndex].theme = themeSelect.value;
    updateSlideFromInputs();
  });
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    darkModeToggle.classList.toggle('active');
  });

  // undo/redo
  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);

  // layout buttons
  els('.layout-btn').forEach(b => {
    b.addEventListener('click', () => {
      els('.layout-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      if (!slides.length) return;
      pushUndo();
      slides[currentIndex].layout = b.dataset.layout;
      renderAll();
    });
  });

  // keyboard shortcuts (basic)
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key.toLowerCase() === 'd') {
        // ctrl/cmd + d => duplicate
        e.preventDefault();
        pushUndo();
        duplicateSlide();
      }
    } else {
      if (e.key === 'Delete') {
        if (document.activeElement.tagName.toLowerCase() !== 'input' && document.activeElement.tagName.toLowerCase() !== 'textarea') {
          pushUndo();
          deleteSlide();
        }
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    }
  });

  // canvas interactions (optional: drag to pan background image if present)
  let isDragging = false;
  let dragStart = null;
  canvas.addEventListener('mousedown', (e) => {
    if (!slides.length) return;
    const s = slides[currentIndex];
    if (s.bg.type !== 'image' || !s.bg.imageDataUrl) return;
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY, startX: s.bg.imageX || 0, startY: s.bg.imageY || 0 };
    canvas.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const s = slides[currentIndex];
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    s.bg.imageX = dragStart.startX + dx;
    s.bg.imageY = dragStart.startY + dy;
    renderAll();
  });
  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      dragStart = null;
      canvas.style.cursor = 'default';
      pushUndo();
    }
  });

  // ----- Initialization -----
  function init() {
    // default single slide
    slides = [createEmptySlide(1080, 1080)];
    currentIndex = 0;
    updateHistoryButtons();
    renderAll();
  }
  init();

  // Expose some functions to global for quick debugging (optional)
  window.CarouselStudio = {
    getSlides: () => slides,
    addSlide,
    duplicateSlide,
    deleteSlide,
    exportCurrent,
    exportAllSlides,
    parseCommandBox
  };

})();
