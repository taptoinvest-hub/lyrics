// script.js - Luxury Glassmorphism Interactions

class LuxuryStudio {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupStatsCounter();
        this.setupCardAnimations();
        this.setupScrollAnimations();
        this.setupAdSense();
    }

    // Smooth navigation with gold underline
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Active link highlighting
        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY + 100;
            
            navLinks.forEach(link => {
                const section = document.querySelector(link.getAttribute('href'));
                if (section) {
                    const sectionTop = section.offsetTop;
                    const sectionBottom = sectionTop + section.offsetHeight;
                    
                    if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                }
            });
        });
    }
// script.js - Enhanced with Mobile Navigation & Interactions

class LuxuryStudio {
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
        this.setupAdSense();
    }

    // Enhanced navigation with mobile support
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
        // Show/hide mobile nav based on scroll
        let lastScrollTop = 0;
        const mobileNav = document.querySelector('.mobile-nav');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                mobileNav.style.transform = 'translateY(100%)';
            } else {
                // Scrolling up
                mobileNav.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    scrollToSection(sectionId) {
        const targetSection = document.querySelector(sectionId);
        if (targetSection) {
            const offset = 80; // Account for fixed elements
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

    // Go to Top functionality
    setupGoToTop() {
        const goToTopBtn = document.querySelector('.go-to-top');
        
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

    // Card linking functionality
    setupCardLinks() {
        const toolCards = document.querySelectorAll('.tool-card');
        const platformCards = document.querySelectorAll('.platform-card');
        
        // Tool card links
        toolCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-btn')) {
                    const toolName = card.querySelector('.card-title').textContent;
                    this.openToolPage(toolName);
                }
            });
        });

        // Platform card links
        platformCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.platform-btn')) {
                    const platformName = card.querySelector('.platform-name').textContent;
                    this.openPlatformStudio(platformName);
                }
            });
        });

        // Button clicks
        document.querySelectorAll('.card-btn, .platform-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.luxury-card');
                if (card.classList.contains('tool-card')) {
                    const toolName = card.querySelector('.card-title').textContent;
                    this.openToolPage(toolName);
                } else {
                    const platformName = card.querySelector('.platform-name').textContent;
                    this.openPlatformStudio(platformName);
                }
            });
        });
    }

    openToolPage(toolName) {
        // Map tool names to their page URLs
        const toolPages = {
            'Background Generator': 'tools/background-generator.html',
            'Abstract Generator': 'tools/abstract-generator.html',
            'Gradient Generator': 'tools/gradient-generator.html',
            'Logo Generator': 'tools/logo-generator.html',
            'Typography Generator': 'tools/typography-generator.html',
            'Pattern Generator': 'tools/pattern-generator.html',
            'Image Cropper': 'tools/image-cropper.html',
            'Format Converter': 'tools/format-converter.html'
        };

        const pageUrl = toolPages[toolName] || 'tools/coming-soon.html';
        
        // Show loading state
        this.showLoading(`Opening ${toolName}...`);
        
        // Navigate to tool page
        setTimeout(() => {
            window.location.href = pageUrl;
        }, 1000);
    }

    openPlatformStudio(platformName) {
        // Map platform names to their studio URLs
        const platformStudios = {
            'Instagram': 'studios/instagram-studio.html',
            'Facebook': 'studios/facebook-studio.html',
            'LinkedIn': 'studios/linkedin-studio.html',
            'TikTok': 'studios/tiktok-studio.html',
            'Pinterest': 'studios/pinterest-studio.html',
            'Twitter / X': 'studios/twitter-studio.html',
            'YouTube': 'studios/youtube-studio.html',
            'Google Ads': 'studios/google-ads-studio.html',
            'Microsoft Ads': 'studios/microsoft-ads-studio.html',
            'Quora': 'studios/quora-studio.html',
            'Medium': 'studios/medium-studio.html',
            'Reddit': 'studios/reddit-studio.html',
            'Amazon': 'studios/amazon-studio.html',
            'Shopify': 'studios/shopify-studio.html',
            'Etsy': 'studios/etsy-studio.html',
            'eBay': 'studios/ebay-studio.html',
            'Apple App Store': 'studios/apple-app-store.html',
            'Google Play Store': 'studios/google-play-store.html'
        };

        const studioUrl = platformStudios[platformName] || 'studios/coming-soon.html';
        
        // Show loading state
        this.showLoading(`Opening ${platformName} Studio...`);
        
        // Navigate to studio page
        setTimeout(() => {
            window.location.href = studioUrl;
        }, 1000);
    }

    showLoading(message) {
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(loadingOverlay);
        
        // Add loading styles
        const style = document.createElement('style');
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            .loading-content {
                text-align: center;
                color: white;
            }
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid rgba(255,255,255,0.3);
                border-top: 3px solid var(--gold);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // Keep existing methods (stats counter, animations, etc.)
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

        statNumbers.forEach(stat => observer.observe(stat));
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

    setupCardAnimations() {
        const cards = document.querySelectorAll('.luxury-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) { // Only on desktop
                    card.style.transform = 'translateY(-10px) scale(1.02)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (window.innerWidth > 768) {
                    card.style.transform = 'translateY(0) scale(1)';
                }
            });
        });
    }

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

    setupAdSense() {
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.log('AdSense loading:', e);
        }
    }
}

// Watermark functionality for generated images
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

// Canvas default text template
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LuxuryStudio();
});

// Global functions for tool pages
window.addWatermark = addWatermark;
window.createCanvasDefaultText = createCanvasDefaultText;
    // Animated stats counter
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

        statNumbers.forEach(stat => observer.observe(stat));
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

    // Card hover animations
    setupCardAnimations() {
        const cards = document.querySelectorAll('.luxury-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Tilt effect on mousemove
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const angleY = (x - centerX) / 25;
                const angleX = (centerY - y) / 25;
                
                card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-10px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    // Scroll-triggered animations
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

    // AdSense initialization
    setupAdSense() {
        // AdSense ads are loaded automatically by the script in head
        // This function can be used for additional ad management
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.log('AdSense loading:', e);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LuxuryStudio();
});

// Additional utility functions
function openTool(toolName) {
    // Tool opening logic will be implemented in individual tool pages
    console.log(`Opening tool: ${toolName}`);
    // Show loading state or redirect to tool page
}

function openPlatform(platformName) {
    // Platform studio opening logic
    console.log(`Opening platform studio: ${platformName}`);
    // Show loading state or redirect to platform studio
}

// Export for global access
window.LuxuryStudio = LuxuryStudio;
window.openTool = openTool;
window.openPlatform = openPlatform;
