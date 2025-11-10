// ads/ad-manager.js
class AdManager {
    constructor() {
        this.adSlots = new Map();
        this.init();
    }

    init() {
        this.setupAdSlots();
        this.loadAds();
        this.setupAdRefresh();
    }

    setupAdSlots() {
        // Define ad slots and their configurations
        this.adSlots.set('leaderboard', {
            element: null,
            config: {
                adClient: 'ca-pub-XXXXXXXXXXXXXXXX',
                adSlot: '1234567890',
                format: 'auto',
                responsive: true
            }
        });

        this.adSlots.set('rectangle', {
            element: null,
            config: {
                adClient: 'ca-pub-XXXXXXXXXXXXXXXX',
                adSlot: '0987654321',
                format: 'rectangle',
                responsive: true
            }
        });
    }

    loadAds() {
        // Load ads when they come into viewport
        this.setupLazyLoading();
    }

    setupLazyLoading() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const adElement = entry.target;
                    this.loadAd(adElement);
                    observer.unobserve(adElement);
                }
            });
        });

        // Observe all ad containers
        document.querySelectorAll('.adsbygoogle').forEach(ad => {
            observer.observe(ad);
        });
    }

    loadAd(adElement) {
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('Ad loading error:', e);
        }
    }

    setupAdRefresh() {
        // Refresh ads every 30 seconds (AdSense policy compliant)
        setInterval(() => {
            this.refreshAds();
        }, 30000);
    }

    refreshAds() {
        try {
            // Only refresh visible ads
            document.querySelectorAll('.adsbygoogle').forEach(ad => {
                if (this.isElementInViewport(ad)) {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                }
            });
        } catch (e) {
            console.error('Ad refresh error:', e);
        }
    }

    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Method to track ad performance
    trackAdEvent(eventType, adSlot) {
        // Here you could integrate with Google Analytics
        console.log(`Ad event: ${eventType} for slot: ${adSlot}`);
    }
}

// Initialize ad manager
document.addEventListener('DOMContentLoaded', () => {
    window.adManager = new AdManager();
});
