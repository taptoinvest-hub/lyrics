// marketing-automation.js - Universal Marketing Functions for MarkTika
class MarkTikaMarketing {
    constructor() {
        this.version = '1.0.0';
        this.init();
    }

    init() {
        this.setupAnalytics();
        this.setupUserTracking();
        this.setupSocialSharing();
        this.setupEmailCapture();
        this.setupExitIntent();
        this.setupScrollTracking();
        this.setupCTAOptimization();
        this.setupABTesting();
        console.log('MarkTika Marketing Automation v' + this.version + ' initialized');
    }

    // ==================== ANALYTICS & TRACKING ====================

    setupAnalytics() {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            this.trackEvent('page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }

        // Custom event tracking
        this.trackPageView();
        this.setupPerformanceTracking();
    }

    trackPageView() {
        const pageData = {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            language: navigator.language
        };

        this.saveToStorage('page_views', pageData);
        this.sendToAnalytics('page_view', pageData);
    }

    trackEvent(eventName, eventData = {}) {
        const event = {
            name: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId()
        };

        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }

        // Custom analytics
        this.saveToStorage('events', event);
        this.sendToAnalytics('event', event);

        console.log('Tracked event:', eventName, eventData);
    }

    trackToolUsage(toolName, action = 'used') {
        this.trackEvent('tool_usage', {
            tool_name: toolName,
            action: action,
            duration: this.getToolUsageDuration(toolName),
            features_used: this.getUsedFeatures()
        });
    }

    // ==================== USER BEHAVIOR TRACKING ====================

    setupUserTracking() {
        this.generateUserId();
        this.trackSession();
        this.setupClickTracking();
        this.setupFormTracking();
    }

    generateUserId() {
        let userId = this.getFromStorage('user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            this.saveToStorage('user_id', userId);
        }
        return userId;
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now();
            sessionStorage.setItem('session_id', sessionId);
        }
        return sessionId;
    }

    trackSession() {
        const sessionStart = sessionStorage.getItem('session_start');
        if (!sessionStart) {
            sessionStorage.setItem('session_start', Date.now());
            this.trackEvent('session_start');
        }

        // Track session duration
        setInterval(() => {
            const startTime = parseInt(sessionStorage.getItem('session_start'));
            const duration = Date.now() - startTime;
            this.saveToStorage('session_duration', duration);
        }, 30000);
    }

    setupClickTracking() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            const clickData = {
                element: target.tagName.toLowerCase(),
                id: target.id || 'none',
                class: target.className || 'none',
                text: target.textContent?.trim().substring(0, 50) || 'none',
                href: target.href || 'none',
                position: this.getElementPosition(target)
            };

            this.trackEvent('click', clickData);
        });
    }

    setupFormTracking() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formData = {
                form_id: form.id || 'unknown',
                form_action: form.action || 'unknown',
                fields: this.getFormFields(form)
            };

            this.trackEvent('form_submit', formData);
        });

        // Track form interactions
        document.addEventListener('input', this.debounce((e) => {
            if (e.target.matches('input, textarea, select')) {
                this.trackEvent('form_interaction', {
                    field_name: e.target.name || e.target.id,
                    field_type: e.target.type,
                    value_length: e.target.value.length
                });
            }
        }, 1000));
    }

    // ==================== SOCIAL SHARING ====================

    setupSocialSharing() {
        // Auto-inject share buttons on tool pages
        this.injectShareWidgets();
        
        // Track social shares
        this.trackSocialInteractions();
    }

    injectShareWidgets() {
        if (document.querySelector('.tool-content')) {
            const shareWidget = this.createShareWidget();
            document.body.appendChild(shareWidget);
        }
    }

    createShareWidget() {
        const widget = document.createElement('div');
        widget.className = 'marketing-share-widget';
        widget.innerHTML = `
            <div class="share-buttons">
                <button onclick="marketing.shareOnTwitter()" class="share-btn twitter">
                    <i class="fab fa-twitter"></i>
                </button>
                <button onclick="marketing.shareOnLinkedIn()" class="share-btn linkedin">
                    <i class="fab fa-linkedin"></i>
                </button>
                <button onclick="marketing.shareOnFacebook()" class="share-btn facebook">
                    <i class="fab fa-facebook"></i>
                </button>
                <button onclick="marketing.copyPageLink()" class="share-btn link">
                    <i class="fas fa-link"></i>
                </button>
            </div>
        `;

        this.addShareWidgetStyles();
        return widget;
    }

    shareOnTwitter() {
        const text = `Check out this amazing tool on @MarkTikaStudio! ${document.title}`;
        const url = window.location.href;
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        
        this.trackEvent('social_share', { platform: 'twitter', content: document.title });
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    shareOnLinkedIn() {
        const url = window.location.href;
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        
        this.trackEvent('social_share', { platform: 'linkedin', content: document.title });
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    shareOnFacebook() {
        const url = window.location.href;
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        
        this.trackEvent('social_share', { platform: 'facebook', content: document.title });
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    copyPageLink() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            this.showNotification('Page link copied to clipboard! 📋', 'success');
            this.trackEvent('link_copied', { type: 'page_link' });
        }).catch(() => {
            this.showNotification('Failed to copy link', 'error');
        });
    }

    // ==================== EMAIL CAPTURE ====================

    setupEmailCapture() {
        this.setupExitIntentPopup();
        this.setupScrollBasedCapture();
        this.setupTimeBasedCapture();
    }

    setupExitIntentPopup() {
        document.addEventListener('mouseout', (e) => {
            if (e.relatedTarget === null && e.clientY < 50) {
                if (!this.getFromStorage('exit_intent_shown')) {
                    this.showEmailCaptureModal('exit_intent');
                    this.saveToStorage('exit_intent_shown', true);
                }
            }
        });
    }

    setupScrollBasedCapture() {
        let scrollTriggered = false;
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            
            if (scrollPercent > 70 && !scrollTriggered) {
                if (!this.getFromStorage('scroll_capture_shown')) {
                    this.showEmailCaptureModal('scroll_based');
                    this.saveToStorage('scroll_capture_shown', true);
                    scrollTriggered = true;
                }
            }
        });
    }

    setupTimeBasedCapture() {
        setTimeout(() => {
            if (!this.getFromStorage('time_capture_shown')) {
                this.showEmailCaptureModal('time_based');
                this.saveToStorage('time_capture_shown', true);
            }
        }, 30000); // 30 seconds
    }

    showEmailCaptureModal(triggerType) {
        const modal = document.createElement('div');
        modal.className = 'marketing-email-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                <h3>🚀 Get Free Design Resources!</h3>
                <p>Join 10,000+ designers and get weekly CSS tips, free templates, and exclusive tools.</p>
                <form onsubmit="marketing.handleEmailCapture(event)" class="email-form">
                    <input type="email" name="email" placeholder="Enter your email" required>
                    <button type="submit">Get Free Resources</button>
                </form>
                <p class="privacy-text">No spam. Unsubscribe anytime.</p>
            </div>
        `;

        document.body.appendChild(modal);
        this.trackEvent('email_capture_shown', { trigger: triggerType });
        this.addModalStyles();
    }

    async handleEmailCapture(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');

        // Validate email
        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Add to email list
        const result = await this.addToEmailList(email);
        
        if (result.success) {
            this.showNotification('🎉 Welcome! Check your email for free resources.', 'success');
            this.trackEvent('email_captured', { 
                email: email, 
                source: 'modal',
                tool: this.getCurrentToolName() 
            });
            
            // Remove modal
            event.target.closest('.marketing-email-modal').remove();
            
            // Show thank you message
            this.showThankYouMessage();
        } else {
            this.showNotification('Something went wrong. Please try again.', 'error');
        }
    }

    // ==================== EXIT INTENT & ENGAGEMENT ====================

    setupExitIntent() {
        let mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseY = e.clientY;
            
            // Trigger exit intent when moving toward top
            if (e.clientY < 100) {
                this.trackEvent('exit_intent_detected');
            }
        });

        // Track page leave attempts
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.trackEvent('page_leave_attempt');
            }
        });
    }

    setupScrollTracking() {
        let maxScroll = 0;
        
        window.addEventListener('scroll', this.debounce(() => {
            const currentScroll = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            maxScroll = Math.max(maxScroll, currentScroll);
            
            // Track scroll milestones
            [25, 50, 75, 90, 100].forEach(milestone => {
                if (currentScroll >= milestone && maxScroll < milestone + 5) {
                    this.trackEvent('scroll_milestone', { percentage: milestone });
                }
            });
        }, 500));
    }

    // ==================== CTA OPTIMIZATION ====================

    setupCTAOptimization() {
        this.enhanceCTAs();
        this.trackCTAInteractions();
    }

    enhanceCTAs() {
        // Add tracking to all CTA buttons
        document.querySelectorAll('button, a').forEach(element => {
            if (this.isCTA(element)) {
                element.addEventListener('click', () => {
                    this.trackEvent('cta_click', {
                        text: element.textContent?.trim(),
                        type: this.getCTAType(element),
                        position: this.getElementPosition(element)
                    });
                });
            }
        });
    }

    trackCTAInteractions() {
        // Track CTA visibility
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.isCTA(entry.target)) {
                    this.trackEvent('cta_view', {
                        text: entry.target.textContent?.trim(),
                        type: this.getCTAType(entry.target)
                    });
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('button, a').forEach(element => {
            if (this.isCTA(element)) observer.observe(element);
        });
    }

    // ==================== A/B TESTING ====================

    setupABTesting() {
        this.initializeABTests();
    }

    initializeABTests() {
        // Example A/B test for CTA button color
        const testVariation = this.getABTestVariation('cta_color');
        
        if (testVariation === 'B') {
            document.querySelectorAll('.cta-btn, .primary-btn').forEach(btn => {
                btn.style.background = 'linear-gradient(135deg, #10B981, #059669)'; // Green variation
            });
        }
    }

    getABTestVariation(testName) {
        let variation = this.getFromStorage(`ab_test_${testName}`);
        if (!variation) {
            variation = Math.random() > 0.5 ? 'A' : 'B';
            this.saveToStorage(`ab_test_${testName}`, variation);
        }
        return variation;
    }

    // ==================== UTILITY FUNCTIONS ====================

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

    saveToStorage(key, value) {
        try {
            const data = JSON.parse(localStorage.getItem('marketing_data') || '{}');
            data[key] = value;
            localStorage.setItem('marketing_data', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save to storage:', e);
        }
    }

    getFromStorage(key) {
        try {
            const data = JSON.parse(localStorage.getItem('marketing_data') || '{}');
            return data[key];
        } catch (e) {
            return null;
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    getCurrentToolName() {
        return document.title.split(' - ')[0] || 'unknown';
    }

    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: Math.round(rect.left),
            y: Math.round(rect.top),
            visible: rect.top < window.innerHeight && rect.bottom > 0
        };
    }

    isCTA(element) {
        const text = element.textContent?.toLowerCase() || '';
        const ctaKeywords = ['sign up', 'get started', 'download', 'try now', 'learn more', 'buy now', 'subscribe'];
        return ctaKeywords.some(keyword => text.includes(keyword)) || 
               element.classList.contains('cta') ||
               element.classList.contains('primary-btn');
    }

    getCTAType(element) {
        if (element.classList.contains('primary-btn')) return 'primary';
        if (element.classList.contains('secondary-btn')) return 'secondary';
        return 'default';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `marketing-notification marketing-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // ==================== STYLES ====================

    addShareWidgetStyles() {
        if (!document.getElementById('marketing-styles')) {
            const styles = document.createElement('style');
            styles.id = 'marketing-styles';
            styles.textContent = `
                .marketing-share-widget {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    background: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 50px;
                    padding: 1rem;
                    display: flex;
                    gap: 0.5rem;
                    z-index: 10000;
                }

                .share-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #F59E0B, #FBBF24);
                    color: #0F172A;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }

                .share-btn:hover {
                    transform: scale(1.1);
                }

                .marketing-email-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10001;
                }

                .marketing-email-modal .modal-content {
                    background: linear-gradient(135deg, #1E293B, #0F172A);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                    padding: 2rem;
                    max-width: 400px;
                    width: 90%;
                    position: relative;
                }

                .marketing-email-modal .close-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                }

                .marketing-email-modal .email-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin: 1.5rem 0;
                }

                .marketing-email-modal input {
                    padding: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .marketing-email-modal button {
                    background: linear-gradient(135deg, #F59E0B, #FBBF24);
                    color: #0F172A;
                    border: none;
                    padding: 1rem;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .marketing-notification {
                    position: fixed;
                    top: 2rem;
                    right: 2rem;
                    padding: 1rem 1.5rem;
                    border-radius: 10px;
                    color: white;
                    z-index: 10002;
                    max-width: 300px;
                }

                .marketing-notification-success {
                    background: linear-gradient(135deg, #10B981, #059669);
                }

                .marketing-notification-error {
                    background: linear-gradient(135deg, #EF4444, #DC2626);
                }

                .marketing-notification-info {
                    background: linear-gradient(135deg, #3B82F6, #2563EB);
                }
            `;
            document.head.appendChild(styles);
        }
    }

    addModalStyles() {
        // Styles are already added in addShareWidgetStyles
    }

    // ==================== API INTEGRATIONS ====================

    async sendToAnalytics(eventType, data) {
        // In production, this would send to your analytics platform
        console.log('Analytics Event:', eventType, data);
        
        // Example: Send to your backend
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventType, data, timestamp: new Date().toISOString() })
            });
        } catch (error) {
            console.warn('Analytics send failed:', error);
        }
    }

    async addToEmailList(email) {
        // In production, this would integrate with your email service
        try {
            const response = await fetch('/api/email/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    source: 'marketing_automation',
                    tool: this.getCurrentToolName()
                })
            });
            return await response.json();
        } catch (error) {
            console.warn('Email subscription failed:', error);
            return { success: false };
        }
    }

    // ==================== PERFORMANCE TRACKING ====================

    setupPerformanceTracking() {
        // Track page load performance
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            this.trackEvent('page_performance', {
                load_time: loadTime,
                page: window.location.pathname
            });
        });

        // Track Core Web Vitals (simplified)
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.trackEvent('web_vital', {
                        name: entry.name,
                        value: entry.value,
                        rating: this.getVitalRating(entry.name, entry.value)
                    });
                });
            });
            observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        }
    }

    getVitalRating(name, value) {
        // Simplified rating logic
        if (name === 'LCP') return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
        if (name === 'FID') return value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor';
        if (name === 'CLS') return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
        return 'unknown';
    }
}

// Initialize marketing automation
const marketing = new MarkTikaMarketing();

// Make available globally
window.MarkTikaMarketing = MarkTikaMarketing;
window.marketing = marketing;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => marketing.init());
} else {
    marketing.init();
}
