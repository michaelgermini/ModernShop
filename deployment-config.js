// Deployment Configuration and Monitoring
// Features: Performance monitoring, Error tracking, Analytics, PWA enhancements

class DeploymentManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupPerformanceMonitoring();
        this.setupErrorTracking();
        this.setupAnalytics();
        this.setupPWAMonitoring();
        this.setupNetworkMonitoring();
        this.logDeploymentInfo();
    }

    // Performance Monitoring
    setupPerformanceMonitoring() {
        // Monitor Core Web Vitals
        this.monitorCoreWebVitals();

        // Monitor page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.logPerformanceMetrics();
            }, 0);
        });

        // Monitor user interactions
        this.setupInteractionMonitoring();
    }

    monitorCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'largest-contentful-paint') {
                    this.logMetric('LCP', entry.startTime);
                }
            }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.logMetric('FID', entry.processingStart - entry.startTime);
            }
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            this.logMetric('CLS', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }

    logPerformanceMetrics() {
        const perfData = performance.getEntriesByType('navigation')[0];

        const metrics = {
            'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
            'TCP Connect': perfData.connectEnd - perfData.connectStart,
            'Server Response': perfData.responseStart - perfData.requestStart,
            'Page Load': perfData.loadEventEnd - perfData.navigationStart,
            'DOM Ready': perfData.domContentLoadedEventEnd - perfData.navigationStart
        };

        console.log('🚀 Performance Metrics:', metrics);
        this.sendAnalytics('performance', metrics);
    }

    setupInteractionMonitoring() {
        // Monitor user interactions for performance
        let interactionCount = 0;

        document.addEventListener('click', () => {
            interactionCount++;
            if (interactionCount % 10 === 0) {
                this.logMetric('Interactions', interactionCount);
            }
        });

        // Monitor scroll performance
        let scrollCount = 0;
        let lastScrollTime = Date.now();

        window.addEventListener('scroll', () => {
            scrollCount++;
            const now = Date.now();
            if (now - lastScrollTime > 1000) {
                this.logMetric('Scroll Events', scrollCount);
                scrollCount = 0;
                lastScrollTime = now;
            }
        });
    }

    // Error Tracking
    setupErrorTracking() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });

        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.logError('Resource Loading Error', {
                    resource: event.target.src || event.target.href,
                    type: event.target.tagName
                });
            }
        }, true);
    }

    // Analytics
    setupAnalytics() {
        this.analyticsQueue = [];
        this.setupPageViews();
        this.setupEventTracking();
        this.setupConversionTracking();
    }

    setupPageViews() {
        // Track page views
        this.trackEvent('page_view', {
            page: window.location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
        });

        // Track time on page
        let startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeSpent = Date.now() - startTime;
            this.trackEvent('time_on_page', {
                duration: timeSpent,
                page: window.location.pathname
            });
        });
    }

    setupEventTracking() {
        // Track product views
        document.addEventListener('click', (e) => {
            if (e.target.closest('.product-card')) {
                const card = e.target.closest('.product-card');
                const productName = card.querySelector('.product-title')?.textContent;
                if (productName) {
                    this.trackEvent('product_view', { product: productName });
                }
            }
        });

        // Track cart actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                this.trackEvent('add_to_cart', {
                    product: e.target.closest('.product-card').querySelector('.product-title')?.textContent
                });
            }
        });
    }

    setupConversionTracking() {
        // Track search usage
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (searchInput.value.length > 0) {
                        this.trackEvent('search_used', {
                            query: searchInput.value,
                            results_count: document.querySelectorAll('.product-card').length
                        });
                    }
                }, 1000);
            });
        }
    }

    trackEvent(eventName, data) {
        const event = {
            event: eventName,
            data: data,
            timestamp: Date.now(),
            sessionId: this.getSessionId(),
            userId: this.getUserId()
        };

        this.analyticsQueue.push(event);
        console.log('📊 Event tracked:', event);

        // Send to analytics service (could be Google Analytics, Mixpanel, etc.)
        this.sendAnalytics(eventName, data);
    }

    // PWA Monitoring
    setupPWAMonitoring() {
        // Check if PWA is installable
        window.addEventListener('beforeinstallprompt', (e) => {
            this.trackEvent('pwa_installable', {
                platform: navigator.platform,
                userAgent: navigator.userAgent
            });
            e.preventDefault();
        });

        // Track PWA installation
        window.addEventListener('appinstalled', () => {
            this.trackEvent('pwa_installed', {
                timestamp: Date.now()
            });
        });

        // Monitor service worker status
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(() => {
                this.trackEvent('service_worker_ready', {
                    state: 'activated'
                });
            });
        }
    }

    // Network Monitoring
    setupNetworkMonitoring() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.trackEvent('network_status', { status: 'online' });
            this.showNotification('Connexion rétablie', 'success');
        });

        window.addEventListener('offline', () => {
            this.trackEvent('network_status', { status: 'offline' });
            this.showNotification('Connexion perdue', 'error');
        });

        // Monitor network speed
        this.measureNetworkSpeed();
    }

    async measureNetworkSpeed() {
        try {
            const startTime = Date.now();
            const response = await fetch(window.location.href, {
                method: 'HEAD',
                cache: 'no-cache'
            });
            const endTime = Date.now();

            const speed = response.headers.get('content-length') / (endTime - startTime);
            this.logMetric('Network Speed', speed);
        } catch (error) {
            console.warn('Network speed measurement failed:', error);
        }
    }

    // Utility Methods
    logMetric(name, value) {
        const metric = {
            name: name,
            value: value,
            timestamp: Date.now(),
            url: window.location.href
        };

        console.log('📈 Metric:', metric);
        this.sendAnalytics('metric', metric);
    }

    logError(type, details) {
        const error = {
            type: type,
            details: details,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        console.error('❌ Error:', error);
        this.sendAnalytics('error', error);
    }

    sendAnalytics(eventType, data) {
        // In a real application, this would send data to your analytics service
        // For now, we'll just store in localStorage for demo purposes

        try {
            const analyticsData = JSON.parse(localStorage.getItem('shop_analytics') || '[]');
            analyticsData.push({
                type: eventType,
                data: data,
                timestamp: Date.now()
            });

            // Keep only last 1000 events
            if (analyticsData.length > 1000) {
                analyticsData.splice(0, analyticsData.length - 1000);
            }

            localStorage.setItem('shop_analytics', JSON.stringify(analyticsData));
        } catch (e) {
            console.warn('Failed to store analytics data:', e);
        }
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('shop_session_id');
        if (!sessionId) {
            sessionId = Date.now().toString() + Math.random().toString(36);
            sessionStorage.setItem('shop_session_id', sessionId);
        }
        return sessionId;
    }

    getUserId() {
        let userId = localStorage.getItem('shop_user_id');
        if (!userId) {
            userId = Date.now().toString() + Math.random().toString(36);
            localStorage.setItem('shop_user_id', userId);
        }
        return userId;
    }

    logDeploymentInfo() {
        const deploymentInfo = {
            version: '1.0.0',
            environment: window.location.hostname === 'localhost' ? 'development' : 'production',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            online: navigator.onLine,
            screenResolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        };

        console.log('🚀 Deployment Info:', deploymentInfo);
        this.sendAnalytics('deployment', deploymentInfo);
    }

    showNotification(message, type = 'info') {
        // Use existing notification system or create a simple one
        if (window.shopFeatures && window.shopFeatures.showNotification) {
            window.shopFeatures.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                font-weight: 500;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        }
    }

    // Export analytics data
    exportAnalyticsData() {
        try {
            const analyticsData = JSON.parse(localStorage.getItem('shop_analytics') || '[]');
            const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showNotification('Données analytics exportées!');
        } catch (e) {
            this.showNotification('Erreur lors de l\'export', 'error');
        }
    }
}

// Initialize deployment monitoring
document.addEventListener('DOMContentLoaded', function() {
    window.deploymentManager = new DeploymentManager();
});
