// marketing-automation.js - Universal Marketing Automation for MarkTika
class MarketingAutomation {
    constructor() {
        this.referralCode = this.getReferralCode();
        this.visitorId = this.getVisitorId();
        this.init();
    }

    init() {
        this.setupReferralSystem();
        this.setupAnalytics();
        this.setupSocialSharing();
        this.setupExitIntent();
        this.setupEmailCapture();
        this.setupUserTracking();
    }

    // 🔄 REFERRAL SYSTEM
    setupReferralSystem() {
        // Check if this is a referral visit
        const referringUser = this.getReferringUser();
        
        if (referringUser) {
            this.showThankYouPopup(referringUser);
            this.trackReferral(referringUser);
        }

        // Generate referral code for current user
        this.generateReferralCode();
    }

    getReferralCode() {
        return localStorage.getItem('marktika_referral_code') || this.generateReferralCode();
    }

    generateReferralCode() {
        const code = 'MT' + Math.random().toString(36).substr(2, 8).toUpperCase();
        localStorage.setItem('marktika_referral_code', code);
        return code;
    }

    getReferringUser() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('ref') || localStorage.getItem('referring_user');
    }

    showThankYouPopup(referringUser) {
        // Store referring user for future visits
        localStorage.setItem('referring_user', referringUser);
        
        // Show popup after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.createThankYouPopup(referringUser);
            }, 2000);
        });
    }

    createThankYouPopup(referringUser) {
        const popup = document.createElement('div');
        popup.className = 'referral-popup';
        popup.innerHTML = `
            <div class="popup-overlay"></div>
            <div class="popup-content">
                <div class="popup-header">
                    <i class="fas fa-gift"></i>
                    <h3>Welcome to MarkTika! 🎉</h3>
                    <button class="close-popup">&times;</button>
                </div>
                <div class="popup-body">
                    <p>Thank you <strong>${referringUser}</strong> for referring you to MarkTika Studio!</p>
                    <div class="referral-benefits">
                        <div class="benefit-item">
                            <i class="fas fa-rocket"></i>
                            <span>Premium features unlocked</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-gem"></i>
                            <span>Special referral bonus</span>
                        </div>
                    </div>
                    <div class="referral-actions">
                        <button class="btn-primary" onclick="marketing.createReferralInvite()">
                            <i class="fas fa-share-alt"></i>
                            Invite Friends & Earn Rewards
                        </button>
                        <button class="btn-secondary close-popup">
                            Explore Tools
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        this.injectReferralStyles();
        
        document.body.appendChild(popup);

        // Close popup handlers
        popup.querySelectorAll('.close-popup').forEach(btn => {
            btn.addEventListener('click', () => {
                popup.remove();
            });
        });

        // Auto-close after 10 seconds
        setTimeout(() => {
            if (document.body.contains(popup)) {
                popup.remove();
            }
        }, 10000);
    }

    createReferralInvite() {
        const inviteModal = document.createElement('div');
        inviteModal.className = 'referral-modal';
        inviteModal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-users"></i> Invite Friends & Earn Rewards</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="referral-stats">
                        <div class="stat">
                            <div class="stat-number" id="referralCount">0</div>
                            <div class="stat-label">Friends Invited</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number" id="rewardPoints">0</div>
                            <div class="stat-label">Reward Points</div>
                        </div>
                    </div>
                    
                    <div class="referral-code-section">
                        <label>Your Referral Code:</label>
                        <div class="code-container">
                            <input type="text" value="${this.referralCode}" readonly id="referralCodeInput">
                            <button onclick="marketing.copyReferralCode()" class="copy-btn">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                    </div>

                    <div class="referral-link-section">
                        <label>Your Referral Link:</label>
                        <div class="link-container">
                            <input type="text" value="${window.location.origin}?ref=${this.referralCode}" readonly id="referralLinkInput">
                            <button onclick="marketing.copyReferralLink()" class="copy-btn">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                    </div>

                    <div class="share-buttons">
                        <button onclick="marketing.shareOnWhatsApp()" class="share-btn whatsapp">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </button>
                        <button onclick="marketing.shareOnEmail()" class="share-btn email">
                            <i class="fas fa-envelope"></i> Email
                        </button>
                        <button onclick="marketing.shareOnTwitter()" class="share-btn twitter">
                            <i class="fab fa-twitter"></i> Twitter
                        </button>
                    </div>

                    <div class="rewards-info">
                        <h4>🎁 Referral Rewards</h4>
                        <ul>
                            <li>5 friends → Premium features for 1 month</li>
                            <li>10 friends → All Pro tools unlocked</li>
                            <li>25 friends → Lifetime 50% discount</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(inviteModal);

        // Close modal
        inviteModal.querySelector('.close-modal').addEventListener('click', () => {
            inviteModal.remove();
        });

        inviteModal.querySelector('.modal-overlay').addEventListener('click', () => {
            inviteModal.remove();
        });

        this.loadReferralStats();
    }

    // 📊 ANALYTICS & TRACKING
    setupAnalytics() {
        // Track page views
        this.trackPageView();
        
        // Track user interactions
        this.trackUserBehavior();
        
        // Track conversion events
        this.trackConversions();
    }

    trackPageView() {
        const analyticsData = {
            page: window.location.pathname,
            referral: this.getReferringUser(),
            visitorId: this.visitorId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        // Send to analytics service
        this.sendToAnalytics('page_view', analyticsData);
    }

    trackUserBehavior() {
        // Track tool usage
        document.addEventListener('click', (e) => {
            if (e.target.closest('.tool-card, .card-btn, .copy-btn')) {
                this.trackEvent('tool_usage', {
                    tool: e.target.closest('[data-tool]')?.getAttribute('data-tool'),
                    action: e.target.textContent.trim()
                });
            }
        });

        // Track social shares
        document.addEventListener('click', (e) => {
            if (e.target.closest('.share-btn')) {
                this.trackEvent('social_share', {
                    platform: e.target.closest('.share-btn').classList[1]
                });
            }
        });
    }

    trackReferral(referringUser) {
        this.trackEvent('referral_visit', {
            referring_user: referringUser,
            new_visitor: this.visitorId
        });
    }

    // 📱 SOCIAL SHARING
    setupSocialSharing() {
        // Add social sharing buttons to all pages
        this.injectSocialShareWidget();
    }

    injectSocialShareWidget() {
        const shareWidget = document.createElement('div');
        shareWidget.className = 'social-share-widget';
        shareWidget.innerHTML = `
            <div class="share-label">Share this tool:</div>
            <div class="share-buttons">
                <button class="share-btn twitter" onclick="marketing.shareOnTwitter()">
                    <i class="fab fa-twitter"></i>
                </button>
                <button class="share-btn linkedin" onclick="marketing.shareOnLinkedIn()">
                    <i class="fab fa-linkedin"></i>
                </button>
                <button class="share-btn facebook" onclick="marketing.shareOnFacebook()">
                    <i class="fab fa-facebook"></i>
                </button>
                <button class="share-btn copy-link" onclick="marketing.copyPageLink()">
                    <i class="fas fa-link"></i>
                </button>
            </div>
        `;

        // Inject into page if not already present
        if (!document.querySelector('.social-share-widget')) {
            document.body.appendChild(shareWidget);
            this.injectSocialShareStyles();
        }
    }

    // 🚪 EXIT INTENT CAPTURE
    setupExitIntent() {
        document.addEventListener('mouseout', (e) => {
            if (e.clientY < 0) {
                this.showExitIntentPopup();
            }
        });
    }

    showExitIntentPopup() {
        if (this.hasSeenExitPopup()) return;

        const popup = document.createElement('div');
        popup.className = 'exit-intent-popup';
        popup.innerHTML = `
            <div class="popup-overlay"></div>
            <div class="popup-content">
                <button class="close-popup">&times;</button>
                <div class="popup-body">
                    <i class="fas fa-gift"></i>
                    <h3>Wait! Get 10% Off 🎁</h3>
                    <p>Subscribe to our newsletter and get exclusive discounts and early access to new tools!</p>
                    <form class="email-capture-form" onsubmit="marketing.handleEmailCapture(event)">
                        <input type="email" placeholder="Enter your email" required>
                        <button type="submit">Get My Discount</button>
                    </form>
                    <p class="small-text">No spam, unsubscribe anytime</p>
                </div>
            </div>
        `;

        document.body.appendChild(popup);
        this.markExitPopupSeen();
    }

    // 📧 EMAIL CAPTURE
    setupEmailCapture() {
        // Add email capture to tool pages
        this.injectEmailCaptureForms();
    }

    injectEmailCaptureForms() {
        // Add to tool pages automatically
        if (window.location.pathname.includes('/tools/')) {
            const captureForm = document.createElement('div');
            captureForm.className = 'email-capture-section';
            captureForm.innerHTML = `
                <div class="capture-content">
                    <h4>💌 Get Pro Tips & Updates</h4>
                    <p>Join our newsletter for design resources and tool updates</p>
                    <form class="capture-form" onsubmit="marketing.handleEmailCapture(event)">
                        <input type="email" placeholder="Your email address" required>
                        <button type="submit">Subscribe</button>
                    </form>
                </div>
            `;

            // Insert before footer
            const footer = document.querySelector('footer');
            if (footer) {
                footer.parentNode.insertBefore(captureForm, footer);
            }
        }
    }

    // 👤 USER TRACKING & PERSONALIZATION
    setupUserTracking() {
        this.trackUserPreferences();
        this.personalizeContent();
    }

    trackUserPreferences() {
        // Track user's tool preferences
        const toolPreferences = JSON.parse(localStorage.getItem('tool_preferences') || '{}');
        
        document.addEventListener('click', (e) => {
            const toolCard = e.target.closest('[data-tool]');
            if (toolCard) {
                const toolName = toolCard.getAttribute('data-tool');
                toolPreferences[toolName] = (toolPreferences[toolName] || 0) + 1;
                localStorage.setItem('tool_preferences', JSON.stringify(toolPreferences));
            }
        });
    }

    personalizeContent() {
        // Personalize based on user behavior
        const preferences = JSON.parse(localStorage.getItem('tool_preferences') || '{}');
        const favoriteTools = Object.entries(preferences)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([tool]) => tool);

        if (favoriteTools.length > 0) {
            this.highlightFavoriteTools(favoriteTools);
        }
    }

    // 🔧 UTILITY FUNCTIONS
    getVisitorId() {
        let visitorId = localStorage.getItem('marktika_visitor_id');
        if (!visitorId) {
            visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('marktika_visitor_id', visitorId);
        }
        return visitorId;
    }

    copyReferralCode() {
        navigator.clipboard.writeText(this.referralCode).then(() => {
            this.showToast('Referral code copied! 📋');
        });
    }

    copyReferralLink() {
        const link = `${window.location.origin}?ref=${this.referralCode}`;
        navigator.clipboard.writeText(link).then(() => {
            this.showToast('Referral link copied! 📋');
        });
    }

    copyPageLink() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            this.showToast('Page link copied! 📋');
        });
    }

    // 📤 SHARING FUNCTIONS
    shareOnWhatsApp() {
        const text = `Check out MarkTika Studio - Amazing design tools! Use my referral code: ${this.referralCode}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }

    shareOnEmail() {
        const subject = 'Check out MarkTika Studio - Amazing Design Tools!';
        const body = `Hi! I thought you'd love MarkTika Studio - they have incredible design tools that are super helpful.\n\nUse my referral code for special benefits: ${this.referralCode}\n\nCheck it out: ${window.location.origin}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }

    shareOnTwitter() {
        const text = `Check out MarkTika Studio - Amazing design tools with glass morphism effects! 🎨\n\nUse my referral code for special benefits: ${this.referralCode}\n\n#DesignTools #WebDesign`;
        const url = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }

    shareOnLinkedIn() {
        const url = window.location.href;
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    }

    shareOnFacebook() {
        const url = window.location.href;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }

    // 🎯 EVENT HANDLERS
    handleEmailCapture(event) {
        event.preventDefault();
        const email = event.target.querySelector('input[type="email"]').value;
        
        this.trackEvent('email_capture', { email });
        this.showToast('Thanks for subscribing! 🎉');
        
        // Reset form
        event.target.reset();
    }

    // 📈 LOAD REFERRAL STATS
    async loadReferralStats() {
        // Simulate API call
        const stats = await this.fetchReferralStats();
        
        document.getElementById('referralCount').textContent = stats.referralCount;
        document.getElementById('rewardPoints').textContent = stats.rewardPoints;
    }

    async fetchReferralStats() {
        // Simulate API response
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    referralCount: Math.floor(Math.random() * 10),
                    rewardPoints: Math.floor(Math.random() * 100)
                });
            }, 500);
        });
    }

    // 🎨 STYLE INJECTION
    injectReferralStyles() {
        const styles = `
            .referral-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                font-family: 'Inter', sans-serif;
            }
            
            .popup-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
            }
            
            .popup-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 20px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                color: white;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            
            .popup-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .popup-header h3 {
                margin: 0;
                flex: 1;
            }
            
            .close-popup {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
            }
            
            .referral-benefits {
                margin: 1.5rem 0;
            }
            
            .benefit-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
            }
            
            .referral-actions {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }
            
            .btn-primary, .btn-secondary {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 600;
                transition: transform 0.2s;
            }
            
            .btn-primary {
                background: #F59E0B;
                color: #0F172A;
            }
            
            .btn-secondary {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            .btn-primary:hover, .btn-secondary:hover {
                transform: translateY(-2px);
            }
            
            /* Modal Styles */
            .referral-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
            }
            
            .modal-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #1E293B;
                border-radius: 20px;
                padding: 2rem;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 1rem;
            }
            
            .close-modal {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
            }
            
            .referral-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .stat {
                text-align: center;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
            }
            
            .stat-number {
                font-size: 2rem;
                font-weight: bold;
                color: #F59E0B;
            }
            
            .code-container, .link-container {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }
            
            .code-container input, .link-container input {
                flex: 1;
                padding: 0.75rem;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                color: white;
            }
            
            .copy-btn {
                background: #F59E0B;
                border: none;
                padding: 0 1rem;
                border-radius: 8px;
                color: #0F172A;
                cursor: pointer;
                font-weight: 600;
            }
            
            .share-buttons {
                display: flex;
                gap: 0.5rem;
                margin: 1.5rem 0;
                flex-wrap: wrap;
            }
            
            .share-btn {
                flex: 1;
                padding: 0.75rem;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                min-width: 120px;
            }
            
            .share-btn.whatsapp { background: #25D366; color: white; }
            .share-btn.email { background: #EA4335; color: white; }
            .share-btn.twitter { background: #1DA1F2; color: white; }
            
            .rewards-info {
                background: rgba(245, 158, 11, 0.1);
                padding: 1.5rem;
                border-radius: 10px;
                margin-top: 1.5rem;
            }
            
            .rewards-info ul {
                margin: 1rem 0 0 0;
                padding-left: 1.5rem;
            }
            
            .rewards-info li {
                margin-bottom: 0.5rem;
            }
            
            /* Toast notifications */
            .toast {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                background: #10B981;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                z-index: 10002;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            /* Social Share Widget */
            .social-share-widget {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                background: rgba(15, 23, 42, 0.9);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 50px;
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                z-index: 9999;
            }
            
            .share-label {
                color: white;
                font-weight: 500;
                white-space: nowrap;
            }
            
            .social-share-widget .share-buttons {
                display: flex;
                gap: 0.5rem;
                margin: 0;
            }
            
            .social-share-widget .share-btn {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .social-share-widget .share-btn:hover {
                transform: scale(1.1);
                background: #F59E0B;
                color: #0F172A;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    injectSocialShareStyles() {
        // Styles are included in injectReferralStyles
    }

    // 🎪 TOAST NOTIFICATIONS
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // 📊 ANALYTICS HELPERS
    sendToAnalytics(event, data) {
        // Simulate sending to analytics service
        console.log('Analytics Event:', event, data);
        
        // In production, this would send to Google Analytics, Mixpanel, etc.
        if (typeof gtag !== 'undefined') {
            gtag('event', event, data);
        }
    }

    trackEvent(event, data) {
        this.sendToAnalytics(event, {
            ...data,
            visitorId: this.visitorId,
            page: window.location.pathname
        });
    }

    // 🚫 EXIT INTENT HELPERS
    hasSeenExitPopup() {
        return localStorage.getItem('exit_popup_seen') === 'true';
    }

    markExitPopupSeen() {
        localStorage.setItem('exit_popup_seen', 'true');
    }

    // 🎨 CONTENT PERSONALIZATION
    highlightFavoriteTools(favoriteTools) {
        favoriteTools.forEach(tool => {
            const toolElement = document.querySelector(`[data-tool="${tool}"]`);
            if (toolElement) {
                toolElement.style.border = '2px solid #F59E0B';
                toolElement.style.position = 'relative';
                
                const badge = document.createElement('div');
                badge.style.position = 'absolute';
                badge.style.top = '10px';
                badge.style.right = '10px';
                badge.style.background = '#F59E0B';
                badge.style.color = '#0F172A';
                badge.style.padding = '2px 8px';
                badge.style.borderRadius = '10px';
                badge.style.fontSize = '0.8rem';
                badge.style.fontWeight = 'bold';
                badge.textContent = 'FAVORITE';
                
                toolElement.appendChild(badge);
            }
        });
    }
}

// Initialize marketing automation
const marketing = new MarketingAutomation();

// Make available globally
window.marketing = marketing;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MarketingAutomation };
}
