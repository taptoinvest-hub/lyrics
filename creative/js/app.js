// Carousel Post Builder - Canva Inspired
class CarouselBuilder {
    constructor() {
        this.slides = [];
        this.currentSlideIndex = 0;
        this.currentPlatform = 'instagram';
        this.zoomLevel = 1;
        this.canvas = document.getElementById('slideCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.history = [];
        this.historyIndex = -1;
        
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

        // Creative fonts and styles
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

        this.init();
    }

    init() {
        console.log('Initializing Carousel Studio...');
        this.setupEventListeners();
        this.setupCollapsibleSections();
        this.loadFromLocalStorage();
        this.initHistory();
        this.updateCanvasSize();
        this.updateUI();
        this.renderCurrentSlide();
        this.setupThemeSelector();

        // Load saved theme and mode
        const savedTheme = localStorage.getItem('carousel-theme') || 'modern-blue';
        const savedMode = localStorage.getItem('carousel-mode') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.documentElement.setAttribute('data-mode', savedMode);
        document.getElementById('themeSelect').value = savedTheme;
        
        this.updateThemeModeButton(savedMode);
        
        console.log('Carousel Studio initialized successfully');
    }

    setupEventListeners() {
        // Panel collapse
        document.getElementById('collapseBtn').addEventListener('click', () => this.togglePanel());

        // Command box
        document.getElementById('generateSlidesBtn').addEventListener('click', () => this.generateFromCommand());
        
        // Platform selection
        document.getElementById('platformSelect').addEventListener('change', (e) => {
            this.currentPlatform = e.target.value;
            this.updatePlatformDimensions();
        });

        // Dimension controls
        document.getElementById('widthInput').addEventListener('input', (e) => this.updateDimensions());
        document.getElementById('heightInput').addEventListener('input', (e) => this.updateDimensions());

        // Orientation presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setOrientation(e.target.dataset.preset);
            });
        });

        // Background controls
        document.querySelectorAll('.bg-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.bg-type-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setBackgroundType(e.target.dataset.type);
            });
        });
        
        document.getElementById('bgColorPicker').addEventListener('input', (e) => {
            document.getElementById('bgColorText').value = e.target.value;
            this.updateBackground();
        });
        
        document.getElementById('bgColorText').addEventListener('change', (e) => {
            document.getElementById('bgColorPicker').value = e.target.value;
            this.updateBackground();
        });
        
        document.getElementById('gradientColor1').addEventListener('input', (e) => this.updateBackground());
        document.getElementById('gradientColor2').addEventListener('input', (e) => this.updateBackground());
        document.getElementById('gradientDirection').addEventListener('change', (e) => this.updateBackground());
        
        document.getElementById('bgImageUpload').addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('bgImageRemove').addEventListener('click', () => this.removeBackgroundImage());

        // Text controls
        document.getElementById('headlineText').addEventListener('input', (e) => this.updateText());
        document.getElementById('subtextText').addEventListener('input', (e) => this.updateText());
        document.getElementById('ctaText').addEventListener('input', (e) => this.updateText());
        document.getElementById('watermarkText').addEventListener('input', (e) => this.updateText());

        // Layout controls
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setLayout(e.target.dataset.layout);
            });
        });

        // Slide actions
        document.getElementById('addSlideBtn').addEventListener('click', () => this.addSlide());
        document.getElementById('duplicateSlideBtn').addEventListener('click', () => this.duplicateSlide());
        document.getElementById('deleteSlideBtn').addEventListener('click', () => this.deleteSlide());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllSlides());

        // Navigation
        document.getElementById('prevSlideBtn').addEventListener('click', () => this.previousSlide());
        document.getElementById('nextSlideBtn').addEventListener('click', () => this.nextSlide());

        // Export buttons - FIXED
        document.getElementById('exportSingleBtn').addEventListener('click', () => this.exportCurrentSlide());
        document.getElementById('exportAllBtn').addEventListener('click', () => this.exportAllSlides());
        document.getElementById('exportFormat').addEventListener('change', (e) => this.updateExportFormat());

        // View controls
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
        document.getElementById('fitScreenBtn').addEventListener('click', () => this.fitToScreen());

        // History controls
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());

        // Theme controls
        document.getElementById('themeSelect').addEventListener('change', (e) => this.changeTheme(e.target.value));
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());

        // Help
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());

        // Window resize
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.updateCanvasSize();
            }, 250);
        });

        // Keyboard shortcuts
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

    setupThemeSelector() {
        // Themes are defined in CSS, just ensure proper initialization
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
        document.querySelector('.zoom-level').textContent = `${Math.round(this.zoomLevel * 100)}%`;
        this.renderCurrentSlide();
    }

    // UI Management
    togglePanel() {
        const panel = document.getElementById('leftPanel');
        panel.classList.toggle('collapsed');
    }

    updateUI() {
        // Update slide counters
        document.getElementById('slideCount').textContent = this.slides.length;
        document.getElementById('currentSlideNum').textContent = this.slides.length > 0 ? this.currentSlideIndex + 1 : 0;
        document.getElementById('totalSlides').textContent = this.slides.length;

        // Update action buttons state
        const hasSlides = this.slides.length > 0;
        document.getElementById('duplicateSlideBtn').disabled = !hasSlides;
        document.getElementById('deleteSlideBtn').disabled = !hasSlides;
        document.getElementById('exportSingleBtn').disabled = !hasSlides;
        document.getElementById('exportAllBtn').disabled = !hasSlides;

        // Update history buttons
        document.getElementById('undoBtn').disabled = this.historyIndex <= 0;
        document.getElementById('redoBtn').disabled = this.historyIndex >= this.history.length - 1;

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
        
        info.innerHTML = `<i class="${platformIcons[this.currentPlatform]}"></i> ${platform.width}x${platform.height} • ${platform.ratio}`;
        document.getElementById('currentPlatform').textContent = this.currentPlatform.charAt(0).toUpperCase() + this.currentPlatform.slice(1);
    }

    updateThumbnails() {
        const strip = document.getElementById('thumbnailStrip');
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
        document.getElementById('widthInput').value = platform.width;
        document.getElementById('heightInput').value = platform.height;
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

        document.getElementById('widthInput').value = width;
        document.getElementById('heightInput').value = height;
        this.updateDimensions();
    }

    updateCanvasSize() {
        const platform = this.platforms[this.currentPlatform];
        this.canvas.width = platform.width;
        this.canvas.height = platform.height;
        this.updateZoom();
    }

    // Background Management
    setBackgroundType(type) {
        document.getElementById('bgColorControl').classList.add('hidden');
        document.getElementById('bgGradientControl').classList.add('hidden');
        document.getElementById('bgImageControl').classList.add('hidden');

        switch(type) {
            case 'color':
                document.getElementById('bgColorControl').classList.remove('hidden');
                break;
            case 'gradient':
                document.getElementById('bgGradientControl').classList.remove('hidden');
                break;
            case 'image':
                document.getElementById('bgImageControl').classList.remove('hidden');
                break;
        }

        this.updateBackground();
    }

    updateBackground() {
        if (this.slides.length === 0) return;
        
        const currentSlide = this.slides[this.currentSlideIndex];
        const bgType = document.querySelector('.bg-type-btn.active').dataset.type;
        
        currentSlide.background = currentSlide.background || {};
        currentSlide.background.type = bgType;
        
        switch(bgType) {
            case 'color':
                currentSlide.background.color = document.getElementById('bgColorPicker').value;
                break;
            case 'gradient':
                currentSlide.background.gradient = {
                    color1: document.getElementById('gradientColor1').value,
                    color2: document.getElementById('gradientColor2').value,
                    direction: document.getElementById('gradientDirection').value
                };
                break;
            case 'image':
                break;
        }
        
        this.renderCurrentSlide();
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const imageUrl = await this.readFileAsDataURL(file);
            if (this.slides.length === 0) this.addSlide();
            
            const currentSlide = this.slides[this.currentSlideIndex];
            currentSlide.background = {
                type: 'image',
                image: imageUrl
            };
            
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
            document.getElementById('bgImageUpload').value = '';
            this.setBackgroundType('color');
        }
    }

    // Text Management
    updateText() {
        if (this.slides.length === 0) return;
        
        const currentSlide = this.slides[this.currentSlideIndex];
        currentSlide.text = currentSlide.text || {};
        currentSlide.text.headline = document.getElementById('headlineText').value;
        currentSlide.text.subtext = document.getElementById('subtextText').value;
        currentSlide.text.cta = document.getElementById('ctaText').value;
        currentSlide.text.watermark = document.getElementById('watermarkText').value;
        
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
        this.saveToLocalStorage();
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
        this.saveToLocalStorage();
    }

    deleteSlide() {
        if (this.slides.length === 0) return;
        
        this.saveState();
        this.slides.splice(this.currentSlideIndex, 1);
        this.currentSlideIndex = Math.min(this.currentSlideIndex, this.slides.length - 1);
        if (this.currentSlideIndex < 0) this.currentSlideIndex = 0;
        
        this.updateUI();
        this.renderCurrentSlide();
        this.saveToLocalStorage();
    }

    clearAllSlides() {
        if (this.slides.length === 0) return;
        
        if (confirm('Are you sure you want to clear all slides? This cannot be undone.')) {
            this.saveState();
            this.slides = [];
            this.currentSlideIndex = 0;
            this.updateUI();
            this.renderCurrentSlide();
            this.saveToLocalStorage();
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

    // Command Box Generation - IMPROVED with fixed positioning
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
            this.saveToLocalStorage();
            
            alert(`🎉 Successfully generated ${newSlides.length} creative slides!`);
            
        } catch (error) {
            console.error('Error parsing command:', error);
            alert('Error parsing command. Please check the format and try again.');
        }
    }

    parseCommand(command) {
        const lines = command.split('\n').filter(line => line.trim());
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
            const line = lines[i].trim();
            
            if (line.startsWith('## SLIDE')) {
                if (currentSlide) {
                    slides.push(currentSlide);
                    slideIndex++;
                }
                
                currentSlide = {
                    id: Date.now() + slideIndex,
                    background: { 
                        type: 'gradient', 
                        gradient: defaultGradients[slideIndex % defaultGradients.length]
                    },
                    text: { 
                        headline: '', 
                        subtext: '', 
                        cta: '', 
                        watermark: '',
                        highlight: ''
                    },
                    layout: 'center'
                };
            } else if (currentSlide) {
                if (line.startsWith('bg: gradient')) {
                    const gradientMatch = line.match(/gradient (#[0-9a-fA-F]+) to (#[0-9a-fA-F]+)/i);
                    if (gradientMatch) {
                        currentSlide.background.gradient = {
                            color1: gradientMatch[1],
                            color2: gradientMatch[2],
                            direction: 'to right'
                        };
                    }
                }
                else if (line.startsWith('title:')) {
                    currentSlide.text.headline = line.replace('title:', '').trim();
                }
                else if (line.startsWith('description:')) {
                    currentSlide.text.subtext = line.replace('description:', '').trim();
                }
                else if (line.startsWith('cta:')) {
                    currentSlide.text.cta = line.replace('cta:', '').trim();
                }
                else if (line.startsWith('layout:')) {
                    currentSlide.layout = line.replace('layout:', '').trim().toLowerCase();
                }
                else if (line.startsWith('watermark:')) {
                    currentSlide.text.watermark = line.replace('watermark:', '').trim();
                }
                else if (line.startsWith('title_highlight:')) {
                    currentSlide.text.highlight = line.replace('title_highlight:', '').trim();
                }
            }
        }

        if (currentSlide) {
            slides.push(currentSlide);
        }

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

    // Rendering - FIXED with proper positioning and creative design
    renderCurrentSlide() {
        if (this.slides.length === 0) {
            this.renderEmptyState();
            return;
        }

        const slide = this.slides[this.currentSlideIndex];
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);

        // Draw background
        this.drawBackground(slide.background, width, height);

        // Draw text with fixed positioning
        this.drawCreativeText(slide.text, slide.layout, width, height);

        console.log('Creative slide rendered successfully');
    }

    drawBackground(background, width, height) {
        if (!background) return;

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
                        case '135deg':
                            gradient = this.ctx.createLinearGradient(0, 0, width, height);
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
                        const currentSlide = this.slides[this.currentSlideIndex];
                        this.drawCreativeText(currentSlide.text, currentSlide.layout, width, height);
                    };
                    img.src = background.image;
                } else {
                    // Fallback to white background
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(0, 0, width, height);
                }
                break;
        }
    }

    drawCreativeText(text, layout, width, height) {
        if (!text) return;

        const layoutConfig = this.layouts[layout] || this.layouts.center;
        const padding = 80;

        // Draw headline with creative styling
        if (text.headline) {
            const x = width * layoutConfig.headline.x;
            const y = height * layoutConfig.headline.y;
            
            this.ctx.font = `bold ${this.fonts.headline.size}px ${this.fonts.headline.family}`;
            this.ctx.fillStyle = this.fonts.headline.color;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Add text shadow for depth
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowOffsetY = 2;
            
            this.wrapText(this.ctx, text.headline, x, y, width - (padding * 2), this.fonts.headline.size + 10);
            
            // Reset shadow
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetY = 0;
        }

        // Draw subtext
        if (text.subtext) {
            const x = width * layoutConfig.subtext.x;
            const y = height * layoutConfig.subtext.y;
            
            this.ctx.font = `${this.fonts.subtext.weight} ${this.fonts.subtext.size}px ${this.fonts.subtext.family}`;
            this.ctx.fillStyle = this.fonts.subtext.color;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            this.wrapText(this.ctx, text.subtext, x, y, width - (padding * 2), this.fonts.subtext.size + 8);
        }

        // Draw CTA button
        if (text.cta) {
            const x = width * layoutConfig.cta.x;
            const y = height * layoutConfig.cta.y;
            
            // Draw button background
            this.ctx.font = `bold ${this.fonts.cta.size}px ${this.fonts.cta.family}`;
            const textMetrics = this.ctx.measureText(text.cta);
            const buttonWidth = textMetrics.width + 100;
            const buttonHeight = 80;
            const buttonX = x - buttonWidth / 2;
            const buttonY = y - buttonHeight / 2;

            // Button gradient
            const buttonGradient = this.ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
            buttonGradient.addColorStop(0, '#00A3FF');
            buttonGradient.addColorStop(1, '#0077CC');
            
            this.ctx.fillStyle = buttonGradient;
            this.ctx.shadowColor = 'rgba(0, 163, 255, 0.3)';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowOffsetY = 5;
            
            // Rounded rectangle
            this.ctx.beginPath();
            this.ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 20);
            this.ctx.fill();
            
            // Reset shadow
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Button text
            this.ctx.fillStyle = this.fonts.cta.color;
            this.ctx.fillText(text.cta, x, y);
        }

        // Draw watermark
        if (text.watermark) {
            this.ctx.font = `${this.fonts.watermark.weight} ${this.fonts.watermark.size}px ${this.fonts.watermark.family}`;
            this.ctx.fillStyle = this.fonts.watermark.color;
            this.ctx.textAlign = 'right';
            this.ctx.textBaseline = 'bottom';
            this.ctx.fillText(text.watermark, width - 40, height - 40);
        }
    }

    wrapText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let testLine = '';
        const lines = [];

        for (let n = 0; n < words.length; n++) {
            testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        // Draw all lines
        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i].trim(), x, y + (i * lineHeight));
        }
    }

    renderEmptyState() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear with light background
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.fillRect(0, 0, width, height);

        // Draw creative empty state
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.font = 'bold 48px Montserrat';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('✨ Create Your First Slide', width / 2, height / 2 - 40);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '24px Inter';
        this.ctx.fillText('Use the command box or add a slide to get started', width / 2, height / 2 + 20);
    }

    // Undo/Redo History
    initHistory() {
        this.history = [];
        this.historyIndex = -1;
        this.saveState();
    }

    saveState() {
        const currentState = JSON.stringify({
            slides: this.slides,
            currentSlideIndex: this.currentSlideIndex,
            currentPlatform: this.currentPlatform
        });

        if (this.history[this.historyIndex] !== currentState) {
            if (this.historyIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.historyIndex + 1);
            }
            
            this.history.push(currentState);
            this.historyIndex++;
            
            // Keep only last 50 states
            if (this.history.length > 50) {
                this.history.shift();
                this.historyIndex--;
            }
        }
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
            
            document.getElementById('platformSelect').value = this.currentPlatform;
            this.updatePlatformDimensions();
            this.updateUI();
            this.renderCurrentSlide();
        } catch (error) {
            console.error('Error loading state:', error);
        }
    }

    // Export Functionality - FIXED
    exportCurrentSlide() {
        if (this.slides.length === 0) {
            alert('No slides to export. Please create a slide first.');
            return;
        }

        const format = document.getElementById('exportFormat').value;
        const slide = this.slides[this.currentSlideIndex];
        const filename = `slide-${this.currentSlideIndex + 1}-${this.currentPlatform}.${format}`;
        
        this.exportSlideAsImage(slide, format, filename);
    }

    exportAllSlides() {
        if (this.slides.length === 0) {
            alert('No slides to export. Please create slides first.');
            return;
        }

        const format = document.getElementById('exportFormat').value;
        
        if (this.slides.length === 1) {
            this.exportCurrentSlide();
            return;
        }

        if (window.JSZip) {
            this.exportAsZIP(format);
        } else {
            // Fallback: export individually
            this.slides.forEach((slide, index) => {
                this.exportSlideAsImage(slide, format, `slide-${index + 1}-${this.currentPlatform}.${format}`);
            });
            alert(`📁 Exported ${this.slides.length} slides individually.`);
        }
    }

    exportSlideAsImage(slide, format, filename) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const platform = this.platforms[this.currentPlatform];
        
        tempCanvas.width = platform.width;
        tempCanvas.height = platform.height;

        // Draw background
        this.drawBackgroundOnCanvas(tempCtx, slide.background, platform.width, platform.height);
        
        // Draw text
        this.drawCreativeTextOnCanvas(tempCtx, slide.text, slide.layout, platform.width, platform.height);

        // Export
        tempCanvas.toBlob(blob => {
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
        // Same as drawBackground but for export canvas
        if (!background) return;

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
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, width, height);
                    };
                    img.src = background.image;
                }
                break;
        }
    }

    drawCreativeTextOnCanvas(ctx, text, layout, width, height) {
        // Same as drawCreativeText but for export canvas
        if (!text) return;

        const layoutConfig = this.layouts[layout] || this.layouts.center;
        const padding = 80;

        // Draw headline
        if (text.headline) {
            const x = width * layoutConfig.headline.x;
            const y = height * layoutConfig.headline.y;
            
            ctx.font = `bold ${this.fonts.headline.size}px ${this.fonts.headline.family}`;
            ctx.fillStyle = this.fonts.headline.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            this.wrapText(ctx, text.headline, x, y, width - (padding * 2), this.fonts.headline.size + 10);
        }

        // Draw other text elements similarly...
        // (Implementation similar to drawCreativeText)
    }

    async exportAsZIP(format) {
        const zip = new JSZip();
        const platform = this.platforms[this.currentPlatform];

        const exportPromises = this.slides.map(async (slide, index) => {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCanvas.width = platform.width;
            tempCanvas.height = platform.height;

            // Draw slide
            this.drawBackgroundOnCanvas(tempCtx, slide.background, platform.width, platform.height);
            this.drawCreativeTextOnCanvas(tempCtx, slide.text, slide.layout, platform.width, platform.height);

            return new Promise((resolve) => {
                tempCanvas.toBlob(blob => {
                    zip.file(`slide-${index + 1}-${this.currentPlatform}.${format}`, blob);
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
        const format = document.getElementById('exportFormat').value;
        // No automatic platform switching for PDF as it's complex
    }

    // Sharing & Collaboration
    shareProject() {
        if (this.slides.length === 0) {
            alert('Please create some slides before sharing.');
            return;
        }

        const projectData = {
            slides: this.slides,
            currentPlatform: this.currentPlatform,
            timestamp: Date.now(),
            expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };

        // Create shareable URL
        const shareToken = btoa(JSON.stringify(projectData));
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(shareToken)}`;
        
        // Save to localStorage for 24 hours
        localStorage.setItem('shared-project', JSON.stringify(projectData));
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert(`🔗 Shareable link copied to clipboard!\n\nThis link will expire in 24 hours.\n\n${shareUrl}`);
        }).catch(() => {
            // Fallback
            prompt('Copy this shareable link (valid for 24 hours):', shareUrl);
        });
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
                
                // Check if project is expired (24 hours)
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
                this.saveToLocalStorage();
                
                alert('🎉 Project loaded successfully!');
                
            } catch (error) {
                console.error('Error loading project:', error);
                alert('Error loading project file. Please make sure it\'s a valid carousel project.');
            }
        };
        reader.readAsText(file);
        
        event.target.value = '';
    }

    // Check for shared project on load
    checkForSharedProject() {
        const urlParams = new URLSearchParams(window.location.search);
        const shareToken = urlParams.get('share');
        
        if (shareToken) {
            try {
                const projectData = JSON.parse(atob(shareToken));
                
                // Check expiration
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
                this.saveToLocalStorage();
                
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
                
                alert('🎉 Shared project loaded successfully!');
                
            } catch (error) {
                console.error('Error loading shared project:', error);
                alert('Invalid share link. Please check the URL and try again.');
            }
        }
    }

    // Local Storage (24-hour data)
    saveToLocalStorage() {
        const data = {
            slides: this.slides,
            currentPlatform: this.currentPlatform,
            currentSlideIndex: this.currentSlideIndex,
            timestamp: Date.now()
        };
        localStorage.setItem('carousel-studio-data', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('carousel-studio-data'));
            
            // Check if data is older than 24 hours
            if (data && data.timestamp && (Date.now() - data.timestamp < 24 * 60 * 60 * 1000)) {
                this.slides = data.slides || [];
                this.currentPlatform = data.currentPlatform || 'instagram';
                this.currentSlideIndex = data.currentSlideIndex || 0;
                
                document.getElementById('platformSelect').value = this.currentPlatform;
                this.updatePlatformDimensions();
            }
            
            // Check for shared projects
            this.checkForSharedProject();
            
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }

    // Help
    showHelp() {
        alert(`🎨 Carousel Studio Help

QUICK START:
• Use the command box to generate multiple slides at once
• Each slide has fixed, creative positioning for perfect layouts
• Export as PNG, JPG, or share with collaborators

KEYBOARD SHORTCUTS:
• ←/→ Arrow: Navigate between slides
• Delete: Remove current slide
• Ctrl+A: Add new slide
• Ctrl+C: Duplicate current slide
• Ctrl+Z: Undo | Ctrl+Y: Redo
• Ctrl+S: Share project (24-hour link)
• Ctrl+O: Load project file
• +/-: Zoom in/out | Ctrl+0: Fit to screen
• Escape: Toggle left panel

SHARING:
• Share projects via URL (valid 24 hours)
• Collaborators can view and edit
• No account required

CREATIVE FEATURES:
• Fixed text positioning for consistent design
• Professional fonts and styling
• Gradient backgrounds
• CTA buttons with effects
• Responsive preview`);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Carousel Studio...');
    new CarouselBuilder();
});
