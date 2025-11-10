class MarkTikaStudio {
    constructor() {
        this.currentCategory = 'all';
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
        this.setupCategoryFiltering();
        this.setupFooterLinks();
        this.setupHeroButtons();
        this.setupSmoothScrolling();
        this.setupQuickCategories();
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
                const sectionId = section.id;
                
                // Update mobile nav
                const mobileItems = document.querySelectorAll('.nav-item');
                mobileItems.forEach(item => {
                    if (item.getAttribute('data-target') === sectionId) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }

    // Category Filtering
    setupCategoryFiltering() {
        const categoryFilters = document.querySelectorAll('.category-filter');
        const categorySections = document.querySelectorAll('.category-section');

        categoryFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                const category = filter.getAttribute('data-category');
                
                // Update active filter
                categoryFilters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                
                // Filter sections
                categorySections.forEach(section => {
                    if (category === 'all' || section.getAttribute('data-category') === category) {
                        section.style.display = 'block';
                        setTimeout(() => {
                            section.style.opacity = '1';
                            section.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        section.style.opacity = '0';
                        section.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            section.style.display = 'none';
                        }, 300);
                    }
                });
                
                // Scroll to first visible section
                if (category !== 'all') {
                    const firstVisible = document.querySelector(`.category-section[data-category="${category}"]`);
                    if (firstVisible) {
                        this.scrollToSection(`#${firstVisible.id}`);
                    }
                } else {
                    this.scrollToSection('#categories');
                }
            });
        });
    }

    // Quick Categories
    setupQuickCategories() {
        const quickCategoryCards = document.querySelectorAll('.quick-category-card');
        
        quickCategoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.getAttribute('data-category');
                
                if (category) {
                    // Filter to specific category
                    const filter = document.querySelector(`.category-filter[data-category="${category}"]`);
                    if (filter) {
                        filter.click();
                    }
                } else {
                    // View all categories
                    const allFilter = document.querySelector('.category-filter[data-category="all"]');
                    if (allFilter) {
                        allFilter.click();
                    }
                }
            });
        });
    }

    // Hero Buttons
    setupHeroButtons() {
        const exploreAllBtn = document.getElementById('exploreAllBtn');
        const watchDemoBtn = document.getElementById('watchDemoBtn');

        if (exploreAllBtn) {
            exploreAllBtn.addEventListener('click', () => {
                this.scrollToSection('#categories');
            });
        }

        if (watchDemoBtn) {
            watchDemoBtn.addEventListener('click', () => {
                this.showDemoModal();
            });
        }
    }

    showDemoModal() {
        this.showLoading('Loading demo video...');
        
        setTimeout(() => {
            this.hideLoading();
            alert('🎬 Demo Video\n\nIn the full version, this would open a video modal showing platform features and tool demonstrations.');
        }, 1000);
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
        const animatedElements = document.querySelectorAll('.luxury-card, .section-header, .quick-category-card');
        
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
        const categoryCards = document.querySelectorAll('.category-card');
        
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

        // Category card links
        categoryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.view-all-btn')) {
                    const categoryName = card.getAttribute('data-category');
                    this.openCategoryPage(categoryName);
                }
            });

            const button = card.querySelector('.view-all-btn');
            if (button) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const categoryName = card.getAttribute('data-category');
                    this.openCategoryPage(categoryName);
                });
            }
        });
    }

    // Footer Links
    setupFooterLinks() {
        const footerCategoryLinks = document.querySelectorAll('.footer-column a[data-category]');
        
        footerCategoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.getAttribute('data-category');
                this.filterByCategory(category);
            });
        });
    }

    filterByCategory(category) {
        const filter = document.querySelector(`.category-filter[data-category="${category}"]`);
        if (filter) {
            filter.click();
        }
    }

    // Tool Navigation
    openToolPage(toolName) {
        const toolPages = {
            'image-cropper': 'tools/design-image/image-cropper.html',
            'format-converter': 'tools/design-image/format-converter.html',
            'image-compressor': 'tools/design-image/image-compressor.html',
            'instagram-studio': 'tools/social-media/instagram-studio.html',
            'facebook-studio': 'tools/social-media/facebook-studio.html',
            'tiktok-studio': 'tools/social-media/tiktok-studio.html',
            'blog-title-generator': 'tools/content-marketing/blog-title-generator.html',
            'content-ideas': 'tools/content-marketing/content-ideas.html',
            'headline-analyzer': 'tools/content-marketing/headline-analyzer.html',
            'keyword-research': 'tools/seo-analytics/keyword-research.html',
            'seo-audit': 'tools/seo-analytics/seo-audit.html',
            'backlink-checker': 'tools/seo-analytics/backlink-checker.html',
            'email-subject-generator': 'tools/email-marketing/email-subject-generator.html',
            'email-template-designer': 'tools/email-marketing/email-template-designer.html',
            'pomodoro-timer': 'tools/productivity/pomodoro-timer.html',
            'task-manager': 'tools/productivity/task-manager.html'
        };

        const pageUrl = toolPages[toolName];
        if (pageUrl) {
            this.navigateToPage(pageUrl, toolName);
        }
    }

    // Category Navigation
    openCategoryPage(categoryName) {
        const categoryPages = {
            'design-image': 'tools/design-image/index.html',
            'social-media': 'tools/social-media/index.html',
            'content-marketing': 'tools/content-marketing/index.html',
            'seo-analytics': 'tools/seo-analytics/index.html',
            'email-marketing': 'tools/email-marketing/index.html',
            'productivity': 'tools/productivity/index.html'
        };

        const pageUrl = categoryPages[categoryName];
        if (pageUrl) {
            this.navigateToPage(pageUrl, `${categoryName} category`);
        }
    }

    // Page Navigation
    navigateToPage(url, pageName) {
        this.showLoading(`Loading ${pageName}...`);
        
        setTimeout(() => {
            this.hideLoading();
            // In production, this would be: window.location.href = url;
            console.log(`Navigating to: ${url}`);
            
            // Simulate page navigation for demo
            const formattedName = pageName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            alert(`🚀 Opening: ${formattedName}\n\nIn production, this would navigate to:\n${url}\n\nAll tools and categories are properly linked.`);
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

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main application
    const studio = new MarkTikaStudio();
    
    // Setup additional features
    setupKeyboardShortcuts();
    initTouchOptimizations();
    setupPerformanceMonitoring();
    setupErrorHandling();
    
    // Performance optimizations
    studio.optimizePerformance();
    
    console.log('MarkTika Studio initialized successfully');
});

// Additional Utility Functions
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

function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function initTouchOptimizations() {
    if (isTouchDevice()) {
        // Add touch-specific optimizations
        document.body.classList.add('touch-device');
        
        // Increase tap targets for mobile
        const interactiveElements = document.querySelectorAll('.glass-btn, .nav-item, .luxury-card, .quick-category-card');
        interactiveElements.forEach(el => {
            el.style.cursor = 'pointer';
        });
    }
}

function setupPerformanceMonitoring() {
    // Log page load performance
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
    });
}

function setupErrorHandling() {
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
    });
}

// Global Functions for tool pages
window.MarkTikaStudio = MarkTikaStudio;

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MarkTikaStudio };
}
