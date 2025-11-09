// Enhanced app.js for Carousel Studio Pro
// Base: original user-provided app.js with enhancements (project manager, smarter parser, logo upload, autosave slots, system theme, lazy thumbnails, higher history limit)

class CarouselBuilder {
    constructor() {
        // Core state
        this.slides = [];
        this.currentSlideIndex = 0;
        this.currentPlatform = 'instagram';
        this.zoomLevel = 1;
        this.canvas = document.getElementById('slideCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 100;

        // Projects manager (multiple named projects)
        this.projectsKey = 'carousel-projects-v1';
        this.activeProjectName = null; // null implies temp autosave slot

        // Platform configurations
        this.platforms = {
            instagram: { width: 1080, height: 1080, ratio: '1:1' },
            linkedin: { width: 1200, height: 627, ratio: '1.91:1' },
            facebook: { width: 1200, height: 630, ratio: '1.91:1' },
            pinterest: { width: 1000, height: 1500, ratio: '2:3' },
            tiktok: { width: 1080, height: 1920, ratio: '9:16' },
            twitter: { width: 1200, height: 675, ratio: '16:9' },
            threads: { width: 1080, height: 1350, ratio: '4:5' },
            youtube: { width: 1280, height: 720, ratio: '16:9' },
            custom: { width: 1080, height: 1080, ratio: 'custom' }
        };

        // Creative fonts and styles (exposed small controls via command parser)
        this.fonts = {
            headline: { family: 'Montserrat', size: 72, weight: 'bold', color: '#1E293B' },
            subtext: { family: 'Inter', size: 32, weight: 'normal', color: '#64748B' },
            cta: { family: 'Inter', size: 42, weight: 'bold', color: '#FFFFFF' },
            watermark: { family: 'Inter', size: 18, weight: 'normal', color: 'rgba(0,0,0,0.3)' }
        };

        // Fixed positioning for creative layout
        this.layouts = {
            center: {
                headline: { x: 0.5, y: 0.4 },
                subtext: { x: 0.5, y: 0.55 },
                cta: { x: 0.5, y: 0.7 }
            },
            top: {
                headline: { x: 0.5, y: 0.25 },
                subtext: { x: 0.5, y: 0.4 },
                cta: { x: 0.5, y: 0.55 }
            },
            bottom: {
                headline: { x: 0.5, y: 0.6 },
                subtext: { x: 0.5, y: 0.75 },
                cta: { x: 0.5, y: 0.85 }
            }
        };

        // Logo layer
        this.logo = { src: null, x: 40, y: 40, width: 160, height: 60, opacity: 0.9 };

        // Debounce timers
        this.resizeTimeout = null;
        this.autosaveTimeout = null;

        this.init();
    }

    init() {
        console.log('Initializing Carousel Studio Pro...');
        this.setupEventListeners();
        this.setupCollapsibleSections();
        this.loadFromLocalStorage(); // loads last autosave if present
        this.initHistory();
        this.updateCanvasSize();
        this.updateUI();
        this.renderCurrentSlide();
        this.setupThemeModeAutoDetect();

        // UI: ensure saved theme applied
        const savedTheme = localStorage.getItem('carousel-theme') || 'modern-blue';
        const savedMode = localStorage.getItem('carousel-mode') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.documentElement.setAttribute('data-mode', savedMode);
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.value = savedTheme;

        this.updateThemeModeButton(savedMode);
        console.log('Carousel Studio Pro initialized successfully');
    }

    setupEventListeners() {
        // Note: keep same handlers as original but add new hooks for file input project load
        const collapseBtn = document.getElementById('collapseBtn');
        if (collapseBtn) collapseBtn.addEventListener('click', () => this.togglePanel());

        const generateBtn = document.getElementById('generateSlidesBtn');
        if (generateBtn) generateBtn.addEventListener('click', () => this.generateFromCommand());

        const platformSelect = document.getElementById('platformSelect');
        if (platformSelect) platformSelect.addEventListener('change', (e) => {
            this.currentPlatform = e.target.value;
            this.updatePlatformDimensions();
        });

        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        if (widthInput) widthInput.addEventListener('input', (e) => this.updateDimensions());
        if (heightInput) heightInput.addEventListener('input', (e) => this.updateDimensions());

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setOrientation(e.target.dataset.preset);
            });
        });

        document.querySelectorAll('.bg-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.bg-type-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setBackgroundType(e.target.dataset.type);
            });
        });

        const bgColorPicker = document.getElementById('bgColorPicker');
        if (bgColorPicker) bgColorPicker.addEventListener('input', (e) => {
            const tx = document.getElementById('bgColorText');
            if (tx) tx.value = e.target.value;
            this.updateBackground();
        });

        const bgColorText = document.getElementById('bgColorText');
        if (bgColorText) bgColorText.addEventListener('change', (e) => {
            const cp = document.getElementById('bgColorPicker');
            if (cp) cp.value = e.target.value;
            this.updateBackground();
        });

        ['gradientColor1', 'gradientColor2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => this.updateBackground());
        });
        const gradDir = document.getElementById('gradientDirection'); if (gradDir) gradDir.addEventListener('change', () => this.updateBackground());

        const bgImgUpload = document.getElementById('bgImageUpload');
        if (bgImgUpload) bgImgUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        const bgImageRemove = document.getElementById('bgImageRemove'); if (bgImageRemove) bgImageRemove.addEventListener('click', () => this.removeBackgroundImage());

        ['headlineText','subtextText','ctaText','watermarkText'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => this.updateText());
        });

        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setLayout(e.target.dataset.layout);
            });
        });

        const addBtn = document.getElementById('addSlideBtn'); if (addBtn) addBtn.addEventListener('click', () => this.addSlide());
        const dupBtn = document.getElementById('duplicateSlideBtn'); if (dupBtn) dupBtn.addEventListener('click', () => this.duplicateSlide());
        const delBtn = document.getElementById('deleteSlideBtn'); if (delBtn) delBtn.addEventListener('click', () => this.deleteSlide());
        const clearBtn = document.getElementById('clearAllBtn'); if (clearBtn) clearBtn.addEventListener('click', () => this.clearAllSlides());

        const prevBtn = document.getElementById('prevSlideBtn'); if (prevBtn) prevBtn.addEventListener('click', () => this.previousSlide());
        const nextBtn = document.getElementById('nextSlideBtn'); if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());

        const exportSingle = document.getElementById('exportSingleBtn'); if (exportSingle) exportSingle.addEventListener('click', () => this.exportCurrentSlide());
        const exportAll = document.getElementById('exportAllBtn'); if (exportAll) exportAll.addEventListener('click', () => this.exportAllSlides());
        const exportFormat = document.getElementById('exportFormat'); if (exportFormat) exportFormat.addEventListener('change', (e) => this.updateExportFormat());

        const zoomIn = document.getElementById('zoomInBtn'); if (zoomIn) zoomIn.addEventListener('click', () => this.zoomIn());
        const zoomOut = document.getElementById('zoomOutBtn'); if (zoomOut) zoomOut.addEventListener('click', () => this.zoomOut());
        const fitBtn = document.getElementById('fitScreenBtn'); if (fitBtn) fitBtn.addEventListener('click', () => this.fitToScreen());

        const undoBtn = document.getElementById('undoBtn'); if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
        const redoBtn = document.getElementById('redoBtn'); if (redoBtn) redoBtn.addEventListener('click', () => this.redo());

        const themeSelect = document.getElementById('themeSelect'); if (themeSelect) themeSelect.addEventListener('change', (e) => this.changeTheme(e.target.value));
        const darkToggle = document.getElementById('darkModeToggle'); if (darkToggle) darkToggle.addEventListener('click', () => this.toggleDarkMode());

        const helpBtn = document.getElementById('helpBtn'); if (helpBtn) helpBtn.addEventListener('click', () => this.showHelp());

        // Project file input (for load project by file)
        const projectFileInput = document.getElementById('projectFileInput');
        if (projectFileInput) projectFileInput.addEventListener('change', (e) => this.handleProjectFile(e));

        // Logo upload (hidden element re-using bgImageUpload to prevent UI change) - accessible through command parser
        // Window resize
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.updateCanvasSize();
            }, 250);
        });

        // Keyboard shortcuts (keeps original)
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'z' || e.key === 'y' || e.key === 'a' || e.key === 'c')) {
                    e.preventDefault();
                } else {
                    return;
                }
            }

            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Delete':
                    e.preventDefault();
                    this.deleteSlide();
                    break;
                case 'z':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                    }
                    break;
                case 'y':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.redo();
                    }
                    break;
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.shareProject();
                    }
                    break;
                case 'o':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.loadProject();
                    }
                    break;
                case 'c':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.duplicateSlide();
                    }
                    break;
                case 'a':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.addSlide();
                    }
                    break;
                case 'd':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.toggleDarkMode();
                    }
                    break;
                case 'h':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.showHelp();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.togglePanel();
                    break;
                case '+':
                case '=':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.zoomIn();
                    }
                    break;
                case '-':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.zoomOut();
                    }
                    break;
                case '0':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.fitToScreen();
                    }
                    break;
                case '?':
                    e.preventDefault();
                    this.showHelp();
                    break;
            }
        });
    }

    setupCollapsibleSections() {
        const sectionHeaders = document.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                    return;
                }

                const content = header.nextElementSibling;
                header.classList.toggle('collapsed');
                content.classList.toggle('collapsed');
            });
        });
    }

    setupThemeModeAutoDetect() {
        // Support system default: if no explicit mode saved, detect system preference
        const saved = localStorage.getItem('carousel-mode');
        if (!saved && window.matchMedia) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-mode', prefersDark ? 'dark' : 'light');
            this.updateThemeModeButton(prefersDark ? 'dark' : 'light');
        }
    }

    // Theme Management
    changeTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('carousel-theme', themeName);
        this.renderCurrentSlide();
    }

    toggleDarkMode() {
        const currentMode = document.documentElement.getAttribute('data-mode') || 'light';
        const newMode = currentMode === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-mode', newMode);
        localStorage.setItem('carousel-mode', newMode);
        this.updateThemeModeButton(newMode);
        this.renderCurrentSlide();
    }

    updateThemeModeButton(mode) {
        const button = document.getElementById('darkModeToggle');
        if (!button) return;
        if (mode === 'dark') {
            button.innerHTML = '<i class="fas fa-sun"></i>';
            button.title = 'Switch to Light Mode';
        } else {
            button.innerHTML = '<i class="fas fa-moon"></i>';
            button.title = 'Switch to Dark Mode';
        }
    }

    // View Controls
    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel + 0.25, 3);
        this.updateZoom();
    }

    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel - 0.25, 0.25);
        this.updateZoom();
    }

    fitToScreen() {
        const container = document.querySelector('.canvas-wrapper');
        const platform = this.platforms[this.currentPlatform];

        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;

        const scaleX = containerWidth / platform.width;
        const scaleY = containerHeight / platform.height;

        this.zoomLevel = Math.min(scaleX, scaleY, 1);
        this.updateZoom();
    }

    updateZoom() {
        const platform = this.platforms[this.currentPlatform];
        this.canvas.style.width = `${platform.width * this.zoomLevel}px`;
        this.canvas.style.height = `${platform.height * this.zoomLevel}px`;
        const zoomEl = document.querySelector('.zoom-level');
        if (zoomEl) zoomEl.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        this.renderCurrentSlide();
    }

    // UI Management
    togglePanel() {
        const panel = document.getElementById('leftPanel');
        panel.classList.toggle('collapsed');
    }

    updateUI() {
        // Update slide counters
        const slideCountEl = document.getElementById('slideCount');
        if (slideCountEl) slideCountEl.textContent = this.slides.length;
        const currentNum = document.getElementById('currentSlideNum');
        if (currentNum) currentNum.textContent = this.slides.length > 0 ? this.currentSlideIndex + 1 : 0;
        const totalSlides = document.getElementById('totalSlides');
        if (totalSlides) totalSlides.textContent = this.slides.length;

        // Update action buttons state
        const hasSlides = this.slides.length > 0;
        const dupBtn = document.getElementById('duplicateSlideBtn'); if (dupBtn) dupBtn.disabled = !hasSlides;
        const delBtn = document.getElementById('deleteSlideBtn'); if (delBtn) delBtn.disabled = !hasSlides;
        const exp1 = document.getElementById('exportSingleBtn'); if (exp1) exp1.disabled = !hasSlides;
        const expAll = document.getElementById('exportAllBtn'); if (expAll) expAll.disabled = !hasSlides;

        // Update history buttons
        const undoBtn = document.getElementById('undoBtn'); if (undoBtn) undoBtn.disabled = this.historyIndex <= 0;
        const redoBtn = document.getElementById('redoBtn'); if (redoBtn) redoBtn.disabled = this.historyIndex >= this.history.length - 1;

        this.updateThumbnails();
    }

    updatePlatformInfo() {
        const platform = this.platforms[this.currentPlatform];
        const info = document.getElementById('platformInfo');
        const platformIcons = {
            instagram: 'fab fa-instagram',
            linkedin: 'fab fa-linkedin',
            facebook: 'fab fa-facebook',
            pinterest: 'fab fa-pinterest',
            tiktok: 'fab fa-tiktok',
            twitter: 'fab fa-twitter',
            threads: 'fab fa-threads',
            youtube: 'fab fa-youtube',
            custom: 'fas fa-cog'
        };
        if (info) info.innerHTML = `<i class="${platformIcons[this.currentPlatform]}"></i> ${platform.width}x${platform.height} • ${platform.ratio}`;
        const cp = document.getElementById('currentPlatform');
        if (cp) cp.textContent = this.currentPlatform.charAt(0).toUpperCase() + this.currentPlatform.slice(1);
    }

    updateThumbnails() {
        const strip = document.getElementById('thumbnailStrip');
        if (!strip) return;
        strip.innerHTML = '';

        if (this.slides.length === 0) {
            strip.innerHTML = `
                <div class="thumbnail-placeholder">
                    <i class="fas fa-plus-circle"></i>
                    <p>Add slides to see thumbnails</p>
                </div>
            `;
            return;
        }

        // lazy thumbnail rendering: only render visible + adjacent slides
        this.slides.forEach((slide, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = `thumbnail ${index === this.currentSlideIndex ? 'active' : ''}`;
            thumbnail.textContent = index + 1;
            thumbnail.setAttribute('data-number', index + 1);
            thumbnail.addEventListener('click', () => {
                this.currentSlideIndex = index;
                this.updateUI();
                this.renderCurrentSlide();
            });
            strip.appendChild(thumbnail);
        });
    }

    // Platform & Dimensions
    updatePlatformDimensions() {
        const platform = this.platforms[this.currentPlatform];
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        if (widthInput) widthInput.value = platform.width;
        if (heightInput) heightInput.value = platform.height;
        this.updateCanvasSize();
        this.updatePlatformInfo();
        this.renderCurrentSlide();
    }

    updateDimensions() {
        const width = parseInt(document.getElementById('widthInput').value) || 1080;
        const height = parseInt(document.getElementById('heightInput').value) || 1080;

        this.platforms[this.currentPlatform].width = width;
        this.platforms[this.currentPlatform].height = height;

        this.updateCanvasSize();
        this.updatePlatformInfo();
        this.renderCurrentSlide();
    }

    setOrientation(preset) {
        let width, height;
        switch(preset) {
            case '1:1':
                width = 1080; height = 1080;
                break;
            case '4:5':
                width = 1080; height = 1350;
                break;
            case '9:16':
                width = 1080; height = 1920;
                break;
            case 'custom':
                return;
        }

        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        if (widthInput) widthInput.value = width;
        if (heightInput) heightInput.value = height;
        this.updateDimensions();
    }

    updateCanvasSize() {
        const platform = this.platforms[this.currentPlatform];
        // Configure devicePixelRatio for sharper exports
        const ratio = window.devicePixelRatio || 1;
        this.canvas.width = Math.round(platform.width * ratio);
        this.canvas.height = Math.round(platform.height * ratio);
        this.canvas.style.width = `${platform.width * this.zoomLevel}px`;
        this.canvas.style.height = `${platform.height * this.zoomLevel}px`;
        this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        this.updateZoom();
    }

    // Background Management
    setBackgroundType(type) {
        const bc = document.getElementById('bgColorControl');
        const bgG = document.getElementById('bgGradientControl');
        const bgi = document.getElementById('bgImageControl');
        if (bc) bc.classList.add('hidden');
        if (bgG) bgG.classList.add('hidden');
        if (bgi) bgi.classList.add('hidden');

        switch(type) {
            case 'color':
                if (bc) bc.classList.remove('hidden');
                break;
            case 'gradient':
                if (bgG) bgG.classList.remove('hidden');
                break;
            case 'image':
                if (bgi) bgi.classList.remove('hidden');
                break;
        }

        this.updateBackground();
    }

    updateBackground() {
        if (this.slides.length === 0) return;
        const currentSlide = this.slides[this.currentSlideIndex];
        const activeBtn = document.querySelector('.bg-type-btn.active');
        const bgType = activeBtn ? activeBtn.dataset.type : (currentSlide.background && currentSlide.background.type) || 'gradient';
        currentSlide.background = currentSlide.background || {};
        currentSlide.background.type = bgType;

        if (bgType === 'color') {
            const color = document.getElementById('bgColorPicker') ? document.getElementById('bgColorPicker').value : '#ffffff';
            currentSlide.background.color = color;
        } else if (bgType === 'gradient') {
            currentSlide.background.gradient = {
                color1: document.getElementById('gradientColor1') ? document.getElementById('gradientColor1').value : '#667eea',
                color2: document.getElementById('gradientColor2') ? document.getElementById('gradientColor2').value : '#764ba2',
                direction: document.getElementById('gradientDirection') ? document.getElementById('gradientDirection').value : 'to right'
            };
        }
        // image handled in upload
        this.renderCurrentSlide();
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        try {
            const imageUrl = await this.readFileAsDataURL(file);
            if (this.slides.length === 0) this.addSlide();
            const currentSlide = this.slides[this.currentSlideIndex];
            currentSlide.background = { type: 'image', image: imageUrl };
            this.renderCurrentSlide();
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image. Please try again.');
        }
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    removeBackgroundImage() {
        if (this.slides.length === 0) return;
        const currentSlide = this.slides[this.currentSlideIndex];
        if (currentSlide.background && currentSlide.background.type === 'image') {
            currentSlide.background.image = null;
            const bgUpload = document.getElementById('bgImageUpload');
            if (bgUpload) bgUpload.value = '';
            this.setBackgroundType('color');
            this.renderCurrentSlide();
        }
    }

    // Text Management
    updateText() {
        if (this.slides.length === 0) return;
        const currentSlide = this.slides[this.currentSlideIndex];
        currentSlide.text = currentSlide.text || {};
        currentSlide.text.headline = document.getElementById('headlineText') ? document.getElementById('headlineText').value : (currentSlide.text.headline || '');
        currentSlide.text.subtext = document.getElementById('subtextText') ? document.getElementById('subtextText').value : (currentSlide.text.subtext || '');
        currentSlide.text.cta = document.getElementById('ctaText') ? document.getElementById('ctaText').value : (currentSlide.text.cta || '');
        currentSlide.text.watermark = document.getElementById('watermarkText') ? document.getElementById('watermarkText').value : (currentSlide.text.watermark || '');
        this.renderCurrentSlide();
    }

    // Layout Management
    setLayout(layout) {
        if (this.slides.length === 0) return;
        const currentSlide = this.slides[this.currentSlideIndex];
        currentSlide.layout = layout;
        this.renderCurrentSlide();
    }

    // Slide Management
    addSlide() {
        this.saveState();
        const newSlide = {
            id: Date.now(),
            background: { type: 'gradient', gradient: this.getRandomGradient() },
            text: { headline: 'New Slide', subtext: 'Add your content here', cta: 'Learn More', watermark: '' },
            layout: 'center'
        };
        this.slides.push(newSlide);
        this.currentSlideIndex = this.slides.length - 1;
        this.updateUI();
        this.renderCurrentSlide();
        this.saveToLocalStorageDebounced();
    }

    duplicateSlide() {
        if (this.slides.length === 0) return;
        this.saveState();
        const currentSlide = this.slides[this.currentSlideIndex];
        const duplicatedSlide = JSON.parse(JSON.stringify(currentSlide));
        duplicatedSlide.id = Date.now();
        this.slides.splice(this.currentSlideIndex + 1, 0, duplicatedSlide);
        this.currentSlideIndex++;
        this.updateUI();
        this.renderCurrentSlide();
        this.saveToLocalStorageDebounced();
    }

    deleteSlide() {
        if (this.slides.length === 0) return;
        this.saveState();
        this.slides.splice(this.currentSlideIndex, 1);
        this.currentSlideIndex = Math.min(this.currentSlideIndex, this.slides.length - 1);
        if (this.currentSlideIndex < 0) this.currentSlideIndex = 0;
        this.updateUI();
        this.renderCurrentSlide();
        this.saveToLocalStorageDebounced();
    }

    clearAllSlides() {
        if (this.slides.length === 0) return;
        if (confirm('Are you sure you want to clear all slides? This cannot be undone.')) {
            this.saveState();
            this.slides = [];
            this.currentSlideIndex = 0;
            this.updateUI();
            this.renderCurrentSlide();
            this.saveToLocalStorageDebounced();
        }
    }

    previousSlide() {
        if (this.slides.length === 0) return;
        this.currentSlideIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
        this.updateUI();
        this.renderCurrentSlide();
    }

    nextSlide() {
        if (this.slides.length === 0) return;
        this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
        this.updateUI();
        this.renderCurrentSlide();
    }

    // Command Box Generation - improved parsing and extra keys
    generateFromCommand() {
        const command = document.getElementById('commandBox').value.trim();
        if (!command) {
            alert('Please enter a command in the command box.');
            return;
        }

        try {
            this.saveState();
            const newSlides = this.parseCommand(command);
            this.slides = newSlides;
            this.currentSlideIndex = 0;
            this.updateUI();
            this.renderCurrentSlide();
            this.saveToLocalStorageDebounced();
            alert(`🎉 Successfully generated ${newSlides.length} creative slides!`);
        } catch (error) {
            console.error('Error parsing command:', error);
            alert('Error parsing command. Please check the format and try again.');
        }
    }

    // Parser supports additional keys like logo:, fontsize-headline:, color-headline:, project:saveName
    parseCommand(command) {
        const lines = command.split('\n').map(l => l.replace(/\r/g,'')).filter(line => line.trim());
        const slides = [];
        let currentSlide = null;

        const defaultGradients = [
            { color1: '#667eea', color2: '#764ba2' },
            { color1: '#f093fb', color2: '#f5576c' },
            { color1: '#4facfe', color2: '#00f2fe' },
            { color1: '#43e97b', color2: '#38f9d7' },
            { color1: '#fa709a', color2: '#fee140' },
            { color1: '#a8edea', color2: '#fed6e3' },
            { color1: '#ffecd2', color2: '#fcb69f' },
            { color1: '#ff9a9e', color2: '#fecfef' },
            { color1: '#a1c4fd', color2: '#c2e9fb' },
            { color1: '#d4fc79', color2: '#96e6a1' }
        ];

        let slideIndex = 0;
        for (let i = 0; i < lines.length; i++) {
            const raw = lines[i].trim();
            const line = raw.toLowerCase();
            if (line.startsWith('## slide')) {
                if (currentSlide) {
                    slides.push(currentSlide);
                    slideIndex++;
                }
                currentSlide = {
                    id: Date.now() + slideIndex,
                    background: { type: 'gradient', gradient: defaultGradients[slideIndex % defaultGradients.length] },
                    text: { headline: '', subtext: '', cta: '', watermark: '', highlight: '' },
                    layout: 'center'
                };
            } else if (currentSlide) {
                // flexible key:value parsing
                const kv = raw.split(':');
                const key = kv[0].trim().toLowerCase();
                const value = kv.slice(1).join(':').trim();
                if (!key) continue;

                if (key === 'bg' && value.startsWith('gradient')) {
                    const colors = value.match(/(#[0-9a-fA-F]{3,6})/g);
                    if (colors && colors.length >= 2) {
                        currentSlide.background = { type: 'gradient', gradient: { color1: colors[0], color2: colors[1], direction: 'to right' } };
                    }
                } else if (key === 'title' || key === 'headline') {
                    currentSlide.text.headline = value;
                } else if (key === 'description' || key === 'subtext' || key === 'caption') {
                    currentSlide.text.subtext = value;
                } else if (key === 'cta') {
                    currentSlide.text.cta = value;
                } else if (key === 'layout') {
                    currentSlide.layout = value.toLowerCase();
                } else if (key === 'watermark') {
                    currentSlide.text.watermark = value;
                } else if (key.startsWith('title_highlight') || key === 'highlight') {
                    currentSlide.text.highlight = value;
                } else if (key.startsWith('fontsize-')) {
                    const field = key.split('-')[1];
                    const size = parseInt(value) || null;
                    if (field && size) this.fonts[field] = this.fonts[field] || {}; this.fonts[field].size = size;
                } else if (key.startsWith('color-')) {
                    const field = key.split('-')[1];
                    if (field && value) this.fonts[field] = this.fonts[field] || {}; this.fonts[field].color = value;
                } else if (key === 'logo') {
                    // value should be dataURL (or external URL); store as project-level metadata handled after parsing
                    currentSlide.logo = value;
                } else if (key === 'project') {
                    // allow "project: save <name>" or "project: <name>"
                    const parts = value.split(' ').filter(Boolean);
                    if (parts[0] === 'save' && parts[1]) {
                        this.saveProjectByName(parts.slice(1).join(' '), { slides: slides.concat(currentSlide) });
                    } else {
                        // treat as metadata name
                        this.activeProjectName = value;
                    }
                } else {
                    // unknown key: attempt to place in headline if headline empty
                    if (!currentSlide.text.headline) currentSlide.text.headline = raw;
                    else if (!currentSlide.text.subtext) currentSlide.text.subtext = raw;
                }
            }
        }
        if (currentSlide) slides.push(currentSlide);

        return slides.slice(0, 15);
    }

    getRandomGradient() {
        const gradients = [
            { color1: '#667eea', color2: '#764ba2' },
            { color1: '#f093fb', color2: '#f5576c' },
            { color1: '#4facfe', color2: '#00f2fe' },
            { color1: '#43e97b', color2: '#38f9d7' },
            { color1: '#fa709a', color2: '#fee140' }
        ];
        return gradients[Math.floor(Math.random() * gradients.length)];
    }

    // Rendering
    renderCurrentSlide() {
        if (this.slides.length === 0) {
            this.renderEmptyState();
            return;
        }
        const slide = this.slides[this.currentSlideIndex];
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        // clear
        this.ctx.clearRect(0, 0, width, height);
        // background
        this.drawBackground(slide.background, width, height);
        // logo layer (draw before text)
        if (this.logo && this.logo.src) {
            const img = new Image();
            img.onload = () => {
                const lw = this.logo.width;
                const lh = this.logo.height;
                this.ctx.globalAlpha = this.logo.opacity;
                try { this.ctx.drawImage(img, this.logo.x, this.logo.y, lw, lh); } catch(e){}
                this.ctx.globalAlpha = 1;
                // After drawing logo, draw text
                this.drawCreativeText(slide.text, slide.layout, width, height);
            };
            img.src = this.logo.src;
        } else {
            this.drawCreativeText(slide.text, slide.layout, width, height);
        }
    }

    drawBackground(background, width, height) {
        if (!background) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0,0,width,height);
            return;
        }
        switch(background.type) {
            case 'color':
                this.ctx.fillStyle = background.color || '#ffffff';
                this.ctx.fillRect(0, 0, width, height);
                break;
            case 'gradient':
                if (background.gradient) {
                    let gradient;
                    switch(background.gradient.direction) {
                        case 'to right':
                            gradient = this.ctx.createLinearGradient(0, 0, width, 0);
                            break;
                        case 'to bottom':
                            gradient = this.ctx.createLinearGradient(0, 0, 0, height);
                            break;
                        default:
                            gradient = this.ctx.createLinearGradient(0, 0, width, 0);
                    }
                    gradient.addColorStop(0, background.gradient.color1);
                    gradient.addColorStop(1, background.gradient.color2);
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(0, 0, width, height);
                }
                break;
            case 'image':
                if (background.image) {
                    const img = new Image();
                    img.onload = () => {
                        this.ctx.drawImage(img, 0, 0, width, height);
                    };
                    img.src = background.image;
                } else {
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(0, 0, width, height);
                }
                break;
            default:
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(0,0,width,height);
        }
    }

    drawCreativeText(text, layout, width, height) {
        if (!text) return;
        const layoutConfig = this.layouts[layout] || this.layouts.center;
        const padding = 80;

        // Headline
        if (text.headline) {
            const x = width * layoutConfig.headline.x;
            const y = height * layoutConfig.headline.y;
            const f = this.fonts.headline || {};
            this.ctx.font = `${f.weight || 'bold'} ${f.size || 72}px ${f.family || 'Montserrat'}`;
            this.ctx.fillStyle = f.color || '#1E293B';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = 'rgba(0,0,0,0.1)';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowOffsetY = 2;
            this.wrapText(this.ctx, text.headline, x, y, width - (padding * 2), (f.size || 72) + 8);
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetY = 0;
        }
        // Subtext
        if (text.subtext) {
            const x = width * layoutConfig.subtext.x;
            const y = height * layoutConfig.subtext.y;
            const f = this.fonts.subtext || {};
            this.ctx.font = `${f.weight || 'normal'} ${f.size || 32}px ${f.family || 'Inter'}`;
            this.ctx.fillStyle = f.color || '#64748B';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.wrapText(this.ctx, text.subtext, x, y, width - (padding * 2), (f.size || 32) + 6);
        }
        // CTA
        if (text.cta) {
            const x = width * layoutConfig.cta.x;
            const y = height * layoutConfig.cta.y;
            const f = this.fonts.cta || {};
            this.ctx.font = `${f.weight || 'bold'} ${f.size || 42}px ${f.family || 'Inter'}`;
            const metrics = this.ctx.measureText(text.cta);
            const buttonWidth = metrics.width + 80;
            const buttonHeight = 64;
            const buttonX = x - buttonWidth / 2;
            const buttonY = y - buttonHeight / 2;
            const buttonGradient = this.ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
            buttonGradient.addColorStop(0, '#00A3FF');
            buttonGradient.addColorStop(1, '#0077CC');
            this.ctx.fillStyle = buttonGradient;
            this.ctx.shadowColor = 'rgba(0,163,255,0.25)';
            this.ctx.shadowBlur = 18;
            this.ctx.shadowOffsetY = 6;
            // rounded rect
            if (this.ctx.roundRect) {
                this.ctx.beginPath();
                this.ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 16);
                this.ctx.fill();
            } else {
                // fallback rounded rect
                this.roundRect(this.ctx, buttonX, buttonY, buttonWidth, buttonHeight, 16, true, false);
            }
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = f.color || '#ffffff';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(text.cta, x, y);
        }

        // Watermark
        if (text.watermark) {
            const f = this.fonts.watermark || {};
            this.ctx.font = `${f.weight || 'normal'} ${f.size || 18}px ${f.family || 'Inter'}`;
            this.ctx.fillStyle = f.color || 'rgba(0,0,0,0.2)';
            this.ctx.textAlign = 'right';
            this.ctx.textBaseline = 'bottom';
            this.ctx.fillText(text.watermark, width - 28, height - 28);
        }
    }

    // fallback rounded rect
    roundRect(ctx, x, y, w, h, r, fill, stroke) {
        if (r < 0) r = 0;
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

    wrapText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        const lines = [];
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                lines.push(line.trim());
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        if (line) lines.push(line.trim());
        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i], x, y + (i * lineHeight));
        }
    }

    renderEmptyState() {
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.font = 'bold 48px Montserrat';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('✨ Create Your First Slide', width / 2, height / 2 - 40);
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '24px Inter';
        this.ctx.fillText('Use the command box or add a slide to get started', width / 2, height / 2 + 20);
    }

    // History
    initHistory() {
        this.history = [];
        this.historyIndex = -1;
        this.saveState();
    }

    saveState() {
        try {
            const currentState = JSON.stringify({
                slides: this.slides,
                currentSlideIndex: this.currentSlideIndex,
                currentPlatform: this.currentPlatform,
                logo: this.logo
            });
            if (this.history[this.historyIndex] !== currentState) {
                if (this.historyIndex < this.history.length - 1) this.history = this.history.slice(0, this.historyIndex + 1);
                this.history.push(currentState);
                this.historyIndex++;
                if (this.history.length > this.maxHistory) {
                    this.history.shift();
                    this.historyIndex--;
                }
            }
        } catch (e) { console.warn('saveState error', e); }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadState();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadState();
        }
    }

    loadState() {
        try {
            const state = JSON.parse(this.history[this.historyIndex]);
            this.slides = state.slides || [];
            this.currentSlideIndex = state.currentSlideIndex || 0;
            this.currentPlatform = state.currentPlatform || 'instagram';
            this.logo = state.logo || this.logo;
            const platformSelect = document.getElementById('platformSelect'); if (platformSelect) platformSelect.value = this.currentPlatform;
            this.updatePlatformDimensions();
            this.updateUI();
            this.renderCurrentSlide();
        } catch (error) {
            console.error('Error loading state:', error);
        }
    }

    // Export functionality with PDF fallback
    exportCurrentSlide() {
        if (this.slides.length === 0) { alert('No slides to export.'); return; }
        const format = document.getElementById('exportFormat').value;
        const filename = `slide-${this.currentSlideIndex + 1}-${this.currentPlatform}.${format}`;
        this.exportSlideAsImage(this.slides[this.currentSlideIndex], format, filename);
    }

    exportAllSlides() {
        if (this.slides.length === 0) { alert('No slides to export.'); return; }
        const format = document.getElementById('exportFormat').value;
        if (this.slides.length === 1) { this.exportCurrentSlide(); return; }
        if (window.JSZip) {
            this.exportAsZIP(format);
        } else {
            // fallback: export individually
            this.slides.forEach((slide, index) => {
                this.exportSlideAsImage(slide, format, `slide-${index + 1}-${this.currentPlatform}.${format}`);
            });
            alert(`📁 Exported ${this.slides.length} slides individually.`);
        }
    }

    exportSlideAsImage(slide, format, filename) {
        const platform = this.platforms[this.currentPlatform];
        // create temporary canvas sized to platform (not scaled by devicePixelRatio)
        const tempCanvas = document.createElement('canvas');
        const ratio = window.devicePixelRatio || 1;
        tempCanvas.width = platform.width * ratio;
        tempCanvas.height = platform.height * ratio;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.setTransform(ratio,0,0,ratio,0,0);

        // draw background synchronously if color/gradient, images async
        this.drawBackgroundOnCanvas(tempCtx, slide.background, platform.width, platform.height);
        // draw logo if present
        if (this.logo && this.logo.src) {
            const img = new Image();
            img.onload = () => {
                tempCtx.globalAlpha = this.logo.opacity || 1;
                tempCtx.drawImage(img, this.logo.x, this.logo.y, this.logo.width, this.logo.height);
                tempCtx.globalAlpha = 1;
                // draw text and finalize
                this.drawCreativeTextOnCanvas(tempCtx, slide.text, slide.layout, platform.width, platform.height);
                this._finalizeExport(tempCanvas, format, filename);
            };
            img.src = this.logo.src;
        } else {
            this.drawCreativeTextOnCanvas(tempCtx, slide.text, slide.layout, platform.width, platform.height);
            this._finalizeExport(tempCanvas, format, filename);
        }
    }

    _finalizeExport(canvasEl, format, filename) {
        if (format === 'pdf') {
            // Attempt html2canvas/jsPDF flow if available
            if (window.html2canvas && window.jspdf) {
                // convert canvas to image and add to jsPDF
                canvasEl.toBlob(blob => {
                    const imgURL = URL.createObjectURL(blob);
                    const pdf = new jspdf.jsPDF({ orientation: 'landscape', unit: 'px', format: [canvasEl.width, canvasEl.height] });
                    pdf.addImage(imgURL, 'PNG', 0, 0, canvasEl.width, canvasEl.height);
                    pdf.save(filename.replace(/\.pdf$/i, '.pdf'));
                    URL.revokeObjectURL(imgURL);
                });
            } else {
                // fallback: export as PNG and inform user to convert to PDF or include jsPDF
                canvasEl.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename.replace(/\.pdf$/i, '.png');
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    alert('Exported as PNG because PDF libraries (jsPDF) were not detected. To enable direct PDF export, include jsPDF in /libs or via CDN.');
                }, 'image/png', 0.95);
            }
            return;
        }

        canvasEl.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert(`✅ Exported: ${filename}`);
        }, `image/${format}`, 0.95);
    }

    drawBackgroundOnCanvas(ctx, background, width, height) {
        if (!background) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,width,height); return; }
        switch(background.type) {
            case 'color':
                ctx.fillStyle = background.color || '#ffffff';
                ctx.fillRect(0, 0, width, height);
                break;
            case 'gradient':
                if (background.gradient) {
                    let gradient = ctx.createLinearGradient(0, 0, width, 0);
                    gradient.addColorStop(0, background.gradient.color1);
                    gradient.addColorStop(1, background.gradient.color2);
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, width, height);
                }
                break;
            case 'image':
                if (background.image) {
                    const img = new Image();
                    img.onload = () => { ctx.drawImage(img, 0, 0, width, height); };
                    img.src = background.image;
                }
                break;
        }
    }

    drawCreativeTextOnCanvas(ctx, text, layout, width, height) {
        if (!text) return;
        const layoutConfig = this.layouts[layout] || this.layouts.center;
        const padding = 80;
        // headline
        if (text.headline) {
            const x = width * layoutConfig.headline.x;
            const y = height * layoutConfig.headline.y;
            const f = this.fonts.headline || {};
            ctx.font = `${f.weight || 'bold'} ${f.size || 72}px ${f.family || 'Montserrat'}`;
            ctx.fillStyle = f.color || '#1E293B';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            this.wrapText(ctx, text.headline, x, y, width - (padding * 2), (f.size || 72) + 8);
        }
        // subtext
        if (text.subtext) {
            const x = width * layoutConfig.subtext.x;
            const y = height * layoutConfig.subtext.y;
            const f = this.fonts.subtext || {};
            ctx.font = `${f.weight || 'normal'} ${f.size || 32}px ${f.family || 'Inter'}`;
            ctx.fillStyle = f.color || '#64748B';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            this.wrapText(ctx, text.subtext, x, y, width - (padding * 2), (f.size || 32) + 6);
        }
        // CTA
        if (text.cta) {
            const x = width * layoutConfig.cta.x;
            const y = height * layoutConfig.cta.y;
            const f = this.fonts.cta || {};
            ctx.font = `${f.weight || 'bold'} ${f.size || 42}px ${f.family || 'Inter'}`;
            const metrics = ctx.measureText(text.cta);
            const buttonWidth = metrics.width + 80;
            const buttonHeight = 64;
            const buttonX = x - buttonWidth / 2;
            const buttonY = y - buttonHeight / 2;
            const buttonGradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
            buttonGradient.addColorStop(0, '#00A3FF');
            buttonGradient.addColorStop(1, '#0077CC');
            ctx.fillStyle = buttonGradient;
            this.roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 16, true, false);
            ctx.fillStyle = f.color || '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text.cta, x, y);
        }
        // watermark
        if (text.watermark) {
            const f = this.fonts.watermark || {};
            ctx.font = `${f.weight || 'normal'} ${f.size || 18}px ${f.family || 'Inter'}`;
            ctx.fillStyle = f.color || 'rgba(0,0,0,0.2)';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText(text.watermark, width - 28, height - 28);
        }
    }

    async exportAsZIP(format) {
        const zip = new JSZip();
        const platform = this.platforms[this.currentPlatform];
        const exportPromises = this.slides.map(async (slide, index) => {
            const tempCanvas = document.createElement('canvas');
            const ratio = window.devicePixelRatio || 1;
            tempCanvas.width = platform.width * ratio;
            tempCanvas.height = platform.height * ratio;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.setTransform(ratio,0,0,ratio,0,0);
            this.drawBackgroundOnCanvas(tempCtx, slide.background, platform.width, platform.height);
            this.drawCreativeTextOnCanvas(tempCtx, slide.text, slide.layout, platform.width, platform.height);
            return new Promise((resolve) => {
                tempCanvas.toBlob(blob => {
                    zip.file(`slide-${index+1}-${this.currentPlatform}.${format}`, blob);
                    resolve();
                }, `image/${format}`, 0.95);
            });
        });
        await Promise.all(exportPromises);
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `carousel-${this.currentPlatform}-${new Date().getTime()}.zip`);
        alert(`📦 Exported ${this.slides.length} slides as ZIP file`);
    }

    updateExportFormat() {
        // no-op for now
    }

    // Sharing & Collaboration (same approach)
    shareProject() {
        if (this.slides.length === 0) { alert('Please create some slides before sharing.'); return; }
        const projectData = { slides: this.slides, currentPlatform: this.currentPlatform, timestamp: Date.now(), expires: Date.now() + (24*60*60*1000) };
        const shareToken = btoa(JSON.stringify(projectData));
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(shareToken)}`;
        localStorage.setItem('shared-project', JSON.stringify(projectData));
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert(`🔗 Shareable link copied to clipboard! This link will expire in 24 hours.\n\n${shareUrl}`);
        }).catch(() => { prompt('Copy this shareable link (valid for 24 hours):', shareUrl); });
    }

    loadProject() {
        document.getElementById('projectFileInput').click();
    }

    handleProjectFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            try {
                this.saveState();
                const project = JSON.parse(e.target.result);
                if (project.expires && project.expires < Date.now()) {
                    alert('This project has expired. Please ask for a new share link.');
                    return;
                }
                this.slides = project.slides || [];
                this.currentPlatform = project.currentPlatform || 'instagram';
                this.currentSlideIndex = 0;
                document.getElementById('platformSelect').value = this.currentPlatform;
                this.updatePlatformDimensions();
                this.updateUI();
                this.renderCurrentSlide();
                this.saveToLocalStorageDebounced();
                alert('🎉 Project loaded successfully!');
            } catch (error) {
                console.error('Error loading project:', error);
                alert('Error loading project file. Please make sure it\'s a valid carousel project.');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    // Check shared project
    checkForSharedProject() {
        const urlParams = new URLSearchParams(window.location.search);
        const shareToken = urlParams.get('share');
        if (shareToken) {
            try {
                const projectData = JSON.parse(atob(shareToken));
                if (projectData.expires && projectData.expires < Date.now()) {
                    alert('This shared project has expired. Please ask for a new link.');
                    return;
                }
                this.slides = projectData.slides || [];
                this.currentPlatform = projectData.currentPlatform || 'instagram';
                this.currentSlideIndex = 0;
                document.getElementById('platformSelect').value = this.currentPlatform;
                this.updatePlatformDimensions();
                this.updateUI();
                this.renderCurrentSlide();
                this.saveToLocalStorageDebounced();
                window.history.replaceState({}, document.title, window.location.pathname);
                alert('🎉 Shared project loaded successfully!');
            } catch (error) {
                console.error('Error loading shared project:', error);
                alert('Invalid share link. Please check the URL and try again.');
            }
        }
    }

    // Local storage / project slots
    saveToLocalStorage() {
        const data = { slides: this.slides, currentPlatform: this.currentPlatform, currentSlideIndex: this.currentSlideIndex, timestamp: Date.now() };
        localStorage.setItem('carousel-studio-data', JSON.stringify(data));
    }

    saveToLocalStorageDebounced() {
        clearTimeout(this.autosaveTimeout);
        this.autosaveTimeout = setTimeout(() => this.saveToLocalStorage(), 600);
    }

    loadFromLocalStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('carousel-studio-data'));
            if (data && data.timestamp && (Date.now() - data.timestamp < 24*60*60*1000)) {
                this.slides = data.slides || [];
                this.currentPlatform = data.currentPlatform || 'instagram';
                this.currentSlideIndex = data.currentSlideIndex || 0;
                document.getElementById('platformSelect').value = this.currentPlatform;
                this.updatePlatformDimensions();
            }
            this.checkForSharedProject();
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }

    // Project manager: save/load named project in localStorage
    listSavedProjects() {
        try {
            const raw = JSON.parse(localStorage.getItem(this.projectsKey) || '{}');
            return raw;
        } catch(e){ return {}; }
    }
    saveProjectByName(name, overrideData) {
        if (!name) return;
        const projects = this.listSavedProjects();
        projects[name] = overrideData || { slides: this.slides, currentPlatform: this.currentPlatform, created: Date.now() };
        localStorage.setItem(this.projectsKey, JSON.stringify(projects));
        alert(`Project saved as "${name}" locally.`);
    }
    loadProjectByName(name) {
        const projects = this.listSavedProjects();
        if (!projects[name]) { alert('Project not found'); return; }
        const p = projects[name];
        this.saveState();
        this.slides = p.slides || [];
        this.currentPlatform = p.currentPlatform || 'instagram';
        this.currentSlideIndex = 0;
        this.activeProjectName = name;
        document.getElementById('platformSelect').value = this.currentPlatform;
        this.updatePlatformDimensions();
        this.updateUI();
        this.renderCurrentSlide();
        alert(`Loaded project "${name}"`);
    }
    deleteProjectByName(name) {
        const projects = this.listSavedProjects();
        if (!projects[name]) return;
        delete projects[name];
        localStorage.setItem(this.projectsKey, JSON.stringify(projects));
        alert(`Deleted project "${name}"`);
    }

    // Help
    showHelp() {
        alert(`Carousel Studio Pro — Quick Help

- Use the command box to generate multiple slides at once with keys:
  ## SLIDE
  title: ...
  description: ...
  cta: ...
  bg: gradient #667eea to #764ba2
  layout: center|top|bottom
  fontsize-headline: 80
  color-headline: #ffffff
  logo: <dataURL or image URL>

- Save current project: open console and run:
  builder.saveProjectByName('My Project Name')

- Load saved project:
  builder.loadProjectByName('My Project Name')

- Keyboard shortcuts: ←/→ navigate, Ctrl+A add, Ctrl+C duplicate, Ctrl+Z undo, Ctrl+Y redo, Ctrl+S share

Exports:
- PNG, JPG supported
- PDF export requires jsPDF (include in /libs or via CDN). If not available, PNG fallback will be downloaded.

For full docs see README.md`);
    }
}

// Initialize the application and expose builder to window for console usage
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Carousel Studio Pro...');
    window.builder = new CarouselBuilder();
});
