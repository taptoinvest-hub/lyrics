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
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Dot click events
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Pause on hover
        const slider = document.querySelector('.hero-slider');
        slider.addEventListener('mouseenter', () => this.stopAutoSlide());
        slider.addEventListener('mouseleave', () => this.startAutoSlide());
        
        // Touch support for mobile
        this.setupTouchEvents();
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
    
    setupTouchEvents() {
        const slider = document.querySelector('.hero-slider');
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
        MarkTikaStudio.prototype.navigateToPage(pageUrl);
    }
}

// Update the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main application
    const studio = new MarkTikaStudio();
    
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
});
