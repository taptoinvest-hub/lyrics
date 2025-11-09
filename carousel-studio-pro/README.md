# Carousel Studio Pro (GitHub-ready)

Enhanced, GitHub-ready version of the Carousel Post Builder — **same design, enhanced functionality**.

## What this package contains
- `index.html` — Main UI (kept visually identical to the original).
- `base.css`, `components.css`, `layout.css`, `responsive.css` — Styling files (same design).
- `app.js` — Enhanced JavaScript (features listed below).
- `README.md` — This file.

## Enhancements (keeps same visual design)
- Smart command parser (supports `title:`, `description:`, `cta:`, `bg: gradient #hex to #hex`, `fontsize-...`, `color-...`, `logo:`).
- Multiple named local projects (save/load via console API).
- Autosave with 24-hour local storage retention.
- Logo/watermark overlay support.
- Higher undo/redo history (100 states).
- Export improvements: PNG/JPG, ZIP (via JSZip), PDF fallback (jsPDF recommended).
- Device-pixel-ratio aware canvas (sharper exports).
- Lazy thumbnail rendering and minor UX polish.
- System theme auto-detection (light/dark).

## How to run locally
1. Clone this repository.
2. Open `index.html` in a browser. (No server required for core features.)
3. For full export-as-ZIP support, include `jszip` and `FileSaver` via CDN (already referenced in `index.html`).
4. For direct PDF export include `jsPDF` via CDN and `html2canvas` for improved capture.

### Example CDN includes (recommended)
Add to the end of `<body>` in `index.html` if not present:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

## GitHub Pages
To host on GitHub Pages:
1. Create a repository (e.g. `carousel-studio-pro`).
2. Push this folder's files to the repository root.
3. Enable GitHub Pages (branch `main` / folder `/`).
4. Visit `https://<username>.github.io/<repo>/`

## Console API (quick)
Open the browser console after page load:
- `builder.saveProjectByName('My Project')`
- `builder.loadProjectByName('My Project')`
- `builder.listSavedProjects()`
- `builder.saveProjectByName('Name', { slides: ..., currentPlatform: ... })`

## License
MIT — feel free to adapt and publish.

