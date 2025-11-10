// script.js - Complete Functional Interactions

class MarkTikaStudio {
    constructor() {
        this.currentSection = 'design-tools';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupMobileNavigation();
        this.setupStatsCounter();
        this.setupCardAnimations();
        this.setupScrollAnimations();
        this.setupGoToTop();
        this.setupCardLinks();
        this.setupFooterLinks();
        this.setupSmoothScrolling();
    }

    // Navigation Setup
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const mobileNavItems = document.querySelectorAll('.nav-item');
        
        // Desktop navigation
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                this.scrollToSection(targetId);
            });
        });

        // Mobile navigation
        mobileNavItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetId = item.getAttribute('data-target');
                this.scrollToSection('#' + targetId);
                
                // Update active state
                mobileNavItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Active section tracking
        window.addEventListener('scroll', () => {
            this.updateActiveSection();
        });
    }

    setupMobileNavigation() {
        const mobileNav = document.querySelector('.mobile-nav');
        const goToTopBtn = document.querySelector('.go-to-top');
        
        if (!mobileNav) return;
        
        let lastScrollTop = 0;
        let isScrolling;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Clear timeout
            window.clearTimeout(isScrolling);
            
            // Show/hide mobile nav
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                mobileNav.style.transform = 'translateY(100%)';
                if (goToTopBtn) {
                    goToTopBtn.style.bottom = '20px';
                }
            } else {
                // Scrolling up
                mobileNav.style.transform = 'translateY(0)';
                if (goToTopBtn) {
                    goToTopBtn.style.bottom = '80px';
                }
            }
            
            // Set timeout
            isScrolling = setTimeout(() => {
                mobileNav.style.transform = 'translateY(0)';
                if (goToTopBtn && scrollTop > 300) {
                    goToTopBtn.style.bottom = '80px';
                }
            }, 66);
            
            lastScrollTop = scrollTop;
        }, { passive: true });
    }

    setupSmoothScrolling() {
        // Add smooth scrolling to all internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offset = window.innerWidth <= 768 ? 60 : 80;
                    const targetPosition = target.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    scrollToSection(sectionId) {
        const targetSection = document.querySelector(sectionId);
        if (targetSection) {
            const offset = window.innerWidth <= 768 ? 60 : 80;
            const targetPosition = targetSection.offsetTop - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    updateActiveSection() {
        const sections = document.querySelectorAll('.luxury-section');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                this.currentSection = section.id;
                
                // Update mobile nav
                const mobileItems = document.querySelectorAll('.nav-item');
                mobileItems.forEach(item => {
                    if (item.getAttribute('data-target') === section.id) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }

    // Go to Top Functionality
    setupGoToTop() {
        const goToTopBtn = document.querySelector('.go-to-top');
        if (!goToTopBtn) return;
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                goToTopBtn.style.display = 'flex';
            } else {
                goToTopBtn.style.display = 'none';
            }
        });

        goToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Stats Counter
    setupStatsCounter() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(stat => {
            if (stat.textContent === '0') {
                observer.observe(stat);
            }
        });
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    // Card Animations
    setupCardAnimations() {
        const cards = document.querySelectorAll('.luxury-card');
        
        cards.forEach(card => {
            if (window.innerWidth > 768) {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-10px) scale(1.02)';
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0) scale(1)';
                });
            }
        });
    }

    // Scroll Animations
    setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('.luxury-card, .section-header');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // Card Links
    setupCardLinks() {
        const toolCards = document.querySelectorAll('.tool-card');
        const platformCards = document.querySelectorAll('.platform-card');
        
        // Tool card links
        toolCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-btn')) {
                    const toolName = card.getAttribute('data-tool');
                    this.openToolPage(toolName);
                }
            });

            const button = card.querySelector('.card-btn');
            if (button) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const toolName = card.getAttribute('data-tool');
                    this.openToolPage(toolName);
                });
            }
        });

        // Platform card links
        platformCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.platform-btn')) {
                    const platformName = card.getAttribute('data-platform');
                    this.openPlatformStudio(platformName);
                }
            });

            const button = card.querySelector('.platform-btn');
            if (button) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const platformName = card.getAttribute('data-platform');
                    this.openPlatformStudio(platformName);
                });
            }
        });
    }

    // Footer Links
    setupFooterLinks() {
        const footerToolLinks = document.querySelectorAll('.footer-column a[href*="tools/"]');
        const footerSectionLinks = document.querySelectorAll('.footer-column a[href^="#"]');
        
        footerToolLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const toolUrl = link.getAttribute('href');
                this.navigateToPage(toolUrl);
            });
        });

        footerSectionLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                this.scrollToSection(targetId);
            });
        });
    }

    // Tool Navigation
    openToolPage(toolName) {
        const toolPages = {
            'image-cropper': 'tools/image-cropper.html',
            'format-converter': 'tools/format-converter.html',
            'image-compressor': 'tools/image-compressor.html',
            'canvas-size-adjuster': 'tools/canvas-size-adjuster.html',
            'bulk-image-processor': 'tools/bulk-image-processor.html',
            'color-adjustment': 'tools/color-adjustment.html',
            'color-temperature': 'tools/color-temperature.html',
            'exposure-corrector': 'tools/exposure-corrector.html',
            'vibrance-tool': 'tools/vibrance-tool.html',
            'color-channel-mixer': 'tools/color-channel-mixer.html',
            'black-white-converter': 'tools/black-white-converter.html',
            'sepia-tone-generator': 'tools/sepia-tone-generator.html',
            'color-inverter': 'tools/color-inverter.html',
            'threshold-tool': 'tools/threshold-tool.html',
            'background-generator': 'tools/background-generator.html',
            'vintage-filter': 'tools/vintage-filter.html',
            'view-all-tools': 'tools/index.html'
        };

        const pageUrl = toolPages[toolName];
        if (pageUrl) {
            this.navigateToPage(pageUrl);
        }
    }

    // Platform Navigation
    openPlatformStudio(platformName) {
        const platformStudios = {
            'instagram': 'studios/instagram-studio.html',
            'facebook': 'studios/facebook-studio.html',
            'linkedin': 'studios/linkedin-studio.html',
            'tiktok': 'studios/tiktok-studio.html',
            'pinterest': 'studios/pinterest-studio.html',
            'twitter': 'studios/twitter-studio.html',
            'youtube': 'studios/youtube-studio.html',
            'google-ads': 'studios/google-ads-studio.html',
            'microsoft-ads': 'studios/microsoft-ads-studio.html',
            'amazon': 'studios/amazon-studio.html',
            'apple-app-store': 'studios/apple-app-store-studio.html',
            'view-all-social': 'studios/index.html'
        };

        const studioUrl = platformStudios[platformName];
        if (studioUrl) {
            this.navigateToPage(studioUrl);
        }
    }

    // Page Navigation
    navigateToPage(url) {
        this.showLoading(`Loading ${url.split('/').pop()}...`);
        
        setTimeout(() => {
            this.hideLoading();
            // In production, this would be: window.location.href = url;
            console.log(`Navigating to: ${url}`);
            
            // Simulate page navigation for demo
            const pageName = url.split('/').pop().replace('.html', '').replace(/-/g, ' ');
            alert(`🚀 Opening: ${pageName}\n\nIn production, this would navigate to:\n${url}\n\nAll tools and studios are properly linked.`);
        }, 800);
    }

    // Loading States
    showLoading(message) {
        this.hideLoading();
        
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(loadingOverlay);
        
        // Prevent scrolling while loading
        document.body.style.overflow = 'hidden';
    }

    hideLoading() {
        const existingOverlay = document.querySelector('.loading-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Restore scrolling
        document.body.style.overflow = '';
    }

    // Utility Methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Performance optimization
    optimizePerformance() {
        // Debounce scroll events
        const optimizedScrollHandler = this.debounce(() => {
            this.updateActiveSection();
        }, 10);

        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    }
}

// Hero Slider Functionality
class HeroSlider {
    constructor() {
        this.slides = document.querySelectorAll('.hero-slide');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.querySelector('.prev-control');
        this.nextBtn = document.querySelector('.next-control');
        this.currentSlide = 0;
        this.slideInterval = null;
        
        this.init();
    }
    
    init() {
        // Start auto-sliding
        this.startAutoSlide();
        
        // Event listeners
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        // Dot click events
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Pause on hover
        const slider = document.querySelector('.hero-slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => this.stopAutoSlide());
            slider.addEventListener('mouseleave', () => this.startAutoSlide());
            
            // Touch support for mobile
            this.setupTouchEvents(slider);
        }
    }
    
    startAutoSlide() {
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // Change slide every 5 seconds
    }
    
    stopAutoSlide() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateSlider();
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.updateSlider();
    }
    
    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlider();
    }
    
    updateSlider() {
        // Update slides
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });
        
        // Update dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
        
        // Restart auto-slide timer
        this.stopAutoSlide();
        this.startAutoSlide();
    }
    
    setupTouchEvents(slider) {
        let startX = 0;
        let endX = 0;
        
        slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        slider.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe(startX, endX);
        });
    }
    
    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        
        if (startX - endX > swipeThreshold) {
            this.nextSlide(); // Swipe left
        } else if (endX - startX > swipeThreshold) {
            this.prevSlide(); // Swipe right
        }
    }
}

// Category Navigation
function setupCategoryNavigation() {
    const viewAllButtons = document.querySelectorAll('.view-all-btn');
    const categoryCards = document.querySelectorAll('.category-card');
    const footerLinks = document.querySelectorAll('.footer-column a[data-category]');
    
    // View All buttons
    viewAllButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const category = button.getAttribute('data-category');
            openCategoryPage(category);
        });
    });
    
    // Category cards
    categoryCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.card-btn')) {
                const category = card.getAttribute('data-category');
                openCategoryPage(category);
            }
        });
    });
    
    // Footer category links
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-category');
            openCategoryPage(category);
        });
    });
}

function openCategoryPage(categoryName) {
    const categoryPages = {
        'design-image': 'categories/design-image-tools.html',
        'social-media': 'categories/social-media-tools.html',
        'content-marketing': 'categories/content-marketing-tools.html',
        'seo-analytics': 'categories/seo-analytics-tools.html',
        'email-marketing': 'categories/email-marketing-tools.html',
        'advertising-ppc': 'categories/advertising-ppc-tools.html',
        'business-strategy': 'categories/business-strategy-tools.html',
        'productivity': 'categories/productivity-tools.html',
        'development': 'categories/development-tools.html',
        'writing-tools': 'categories/writing-tools.html',
        'finance-calculators': 'categories/finance-calculators.html',
        'health-fitness': 'categories/health-fitness-tools.html',
        'education-learning': 'categories/education-learning-tools.html',
        'personal-relationship': 'categories/personal-relationship-tools.html',
        'greeting-cards': 'categories/greeting-cards-tools.html',
        'fake-generators': 'categories/fake-generators-tools.html',
        'utility-tools': 'categories/utility-tools.html',
        'ecommerce-studios': 'categories/ecommerce-studios-tools.html'
    };
    
    const pageUrl = categoryPages[categoryName];
    if (pageUrl) {
        // Use the navigateToPage method from MarkTikaStudio
        if (window.studioInstance && typeof window.studioInstance.navigateToPage === 'function') {
            window.studioInstance.navigateToPage(pageUrl);
        } else {
            // Fallback navigation
            console.log(`Navigating to category: ${pageUrl}`);
            alert(`🚀 Opening Category: ${categoryName.replace(/-/g, ' ')}\n\nIn production, this would navigate to:\n${pageUrl}`);
        }
    }
}

// Watermark Function
function addWatermark(canvas) {
    const ctx = canvas.getContext('2d');
    const watermark = "MarkTika Studio";
    
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(watermark, canvas.width - 10, canvas.height - 10);
    ctx.restore();
}

// Canvas Default Text
function createCanvasDefaultText() {
    return `
        <div class="canvas-default-text">
            <i class="fas fa-cloud-upload-alt"></i>
            <h3>Upload Your Image</h3>
            <p>Drag & drop, paste from clipboard, or click to browse</p>
            <div style="margin-top: 1rem;">
                <button class="glass-btn" onclick="openFilePicker()">
                    <i class="fas fa-folder-open"></i>
                    Choose Image
                </button>
            </div>
        </div>
    `;
}

// File Picker
function openFilePicker() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('File selected:', file.name);
            alert(`📁 File Selected: ${file.name}\n\nIn tool pages, this would process the image.`);
        }
    };
    input.click();
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Escape key to close modals/overlays
        if (e.key === 'Escape') {
            const loadingOverlay = document.querySelector('.loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.remove();
                document.body.style.overflow = '';
            }
        }
        
        // Space bar to scroll down (when not in input)
        if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            window.scrollBy(0, window.innerHeight * 0.8);
        }
    });
}

// Touch Device Detection
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Initialize touch device optimizations
function initTouchOptimizations() {
    if (isTouchDevice()) {
        // Add touch-specific optimizations
        document.body.classList.add('touch-device');
        
        // Increase tap targets for mobile
        const interactiveElements = document.querySelectorAll('.glass-btn, .nav-item, .luxury-card');
        interactiveElements.forEach(el => {
            el.style.cursor = 'pointer';
        });
    }
}

// Performance Monitoring
function setupPerformanceMonitoring() {
    // Log page load performance
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
    });
}

// Error Handling
function setupErrorHandling() {
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize main application
        const studio = new MarkTikaStudio();
        window.studioInstance = studio; // Make it globally accessible
        
        // Initialize hero slider
        const heroSlider = new HeroSlider();
        
        // Setup category navigation
        setupCategoryNavigation();
        
        // Setup additional features
        setupKeyboardShortcuts();
        initTouchOptimizations();
        setupPerformanceMonitoring();
        setupErrorHandling();
        
        // Performance optimizations
        studio.optimizePerformance();
        
        console.log('MarkTika Studio with Hero Slider initialized successfully');
    } catch (error) {
        console.error('Error initializing MarkTika Studio:', error);
    }
});

// Global Functions for tool pages
window.MarkTikaStudio = MarkTikaStudio;
window.addWatermark = addWatermark;
window.createCanvasDefaultText = createCanvasDefaultText;
window.openFilePicker = openFilePicker;

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MarkTikaStudio, addWatermark, createCanvasDefaultText, openFilePicker };
}
