// script.js - Luxury Glassmorphism Interactions - FIXED & FUNCTIONAL

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
        this.setupFooterLinks();
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
        const goToTopBtn = document.querySelector('.go-to-top');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down - hide mobile nav
                mobileNav.style.transform = 'translateY(100%)';
                if (goToTopBtn) goToTopBtn.style.bottom = '20px';
            } else {
                // Scrolling up - show mobile nav
                mobileNav.style.transform = 'translateY(0)';
                if (goToTopBtn) goToTopBtn.style.bottom = '80px';
            }
            
            lastScrollTop = scrollTop;
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

    // Go to Top functionality
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

    // Card linking functionality
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

            // Button click
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

            // Button click
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

    // Footer links
    setupFooterLinks() {
        const footerToolLinks = document.querySelectorAll('.footer-column a[data-tool]');
        
        footerToolLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const toolName = link.getAttribute('data-tool');
                this.openToolPage(toolName);
            });
        });
    }

    openToolPage(toolName) {
        // Map tool names to their page URLs
        const toolPages = {
            'background-generator': 'tools/background-generator.html',
            'abstract-generator': 'tools/abstract-generator.html',
            'gradient-generator': 'tools/gradient-generator.html',
            'logo-generator': 'tools/logo-generator.html',
            'typography-generator': 'tools/typography-generator.html',
            'pattern-generator': 'tools/pattern-generator.html',
            'image-cropper': 'tools/image-cropper.html',
            'format-converter': 'tools/format-converter.html'
        };

        const pageUrl = toolPages[toolName] || 'tools/coming-soon.html';
        const toolTitle = document.querySelector(`[data-tool="${toolName}"] .card-title`)?.textContent || toolName;
        
        // Show loading state
        this.showLoading(`Opening ${toolTitle}...`);
        
        // Simulate navigation (in real implementation, this would be actual navigation)
        setTimeout(() => {
            // For demo purposes, just hide loading
            this.hideLoading();
            
            // In production, use: window.location.href = pageUrl;
            console.log(`Navigating to: ${pageUrl}`);
            
            // Show demo message
            alert(`In the full version, this would open the ${toolTitle} tool at ${pageUrl}`);
        }, 1500);
    }

    openPlatformStudio(platformName) {
        // Map platform names to their studio URLs
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
            'quora': 'studios/quora-studio.html',
            'medium': 'studios/medium-studio.html',
            'reddit': 'studios/reddit-studio.html',
            'amazon': 'studios/amazon-studio.html',
            'shopify': 'studios/shopify-studio.html',
            'etsy': 'studios/etsy-studio.html',
            'ebay': 'studios/ebay-studio.html',
            'apple-app-store': 'studios/apple-app-store.html',
            'google-play-store': 'studios/google-play-store.html'
        };

        const studioUrl = platformStudios[platformName] || 'studios/coming-soon.html';
        const platformTitle = document.querySelector(`[data-platform="${platformName}"] .platform-name`)?.textContent || platformName;
        
        // Show loading state
        this.showLoading(`Opening ${platformTitle} Studio...`);
        
        // Simulate navigation
        setTimeout(() => {
            this.hideLoading();
            console.log(`Navigating to: ${studioUrl}`);
            alert(`In the full version, this would open the ${platformTitle} Studio at ${studioUrl}`);
        }, 1500);
    }

    showLoading(message) {
        // Remove existing loading overlay
        this.hideLoading();
        
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
    }

    hideLoading() {
        const existingOverlay = document.querySelector('.loading-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
    }

    // Stats counter animation
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

    // Card animations
    setupCardAnimations() {
        const cards = document.querySelectorAll('.luxury-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) {
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

    // Scroll animations
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

// File picker function for canvas
function openFilePicker() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Handle file upload
            console.log('File selected:', file.name);
            // In actual implementation, this would process the image
        }
    };
    input.click();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LuxuryStudio();
});

// Global functions for tool pages
window.addWatermark = addWatermark;
window.createCanvasDefaultText = createCanvasDefaultText;
window.openFilePicker = openFilePicker;

// Handle page visibility for better performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause animations if needed
    } else {
        // Page is visible, resume animations
    }
});
