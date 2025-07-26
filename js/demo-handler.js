(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        appScheme: 'greythr://app',
        demoBaseUrl: 'https://greythr-deep-link-demo.vercel.app',
        androidPackage: 'com.greytip.ghress',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.greytip.ghress',
        appStoreUrl: 'https://apps.apple.com/app/idUFXTNUWB5S'
    };

    // Platform detection
    function detectPlatform() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const platform = {
            isIOS: /iPad|iPhone|iPod/.test(userAgent),
            isAndroid: /android/i.test(userAgent),
            isMobile: /Mobi|Android/i.test(userAgent),
            isDesktop: !/Mobi|Android/i.test(userAgent)
        };
        
        // Add platform class to body for CSS targeting
        document.body.className = platform.isIOS ? 'ios platform-ios' : 
                                 platform.isAndroid ? 'android platform-android' : 
                                 'desktop platform-desktop';
        
        return platform;
    }

    // Log demo activity
    function logDemo(action, data = {}) {
        const logData = {
            timestamp: new Date().toISOString(),
            action: action,
            url: window.location.href,
            userAgent: navigator.userAgent,
            platform: detectPlatform(),
            ...data
        };
        
        console.log('🎯 greytHR Demo:', action, logData);
        
        // In a real implementation, you'd send this to analytics
        // analytics.track('deep_link_demo', logData);
    }

    // Initialize demo functionality
    function initDemo() {
        const platform = detectPlatform();
        logDemo('demo_page_loaded', { platform });
        
        const demoBtn = document.getElementById('demo-btn');
        const btnText = document.getElementById('btn-text');
        const storeBadges = document.getElementById('store-badges');
        
        if (!demoBtn) return; // Not on main demo page
        
        // Update button text based on platform
        updateButtonText(platform, btnText);
        
        // Demo button click handler
        demoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleDemoClick(platform);
        });
        
        // Show store badges immediately on desktop
        if (platform.isDesktop) {
            setTimeout(() => {
                showStoreOptions();
                logDemo('desktop_store_options_shown');
            }, 1500);
        }
    }

    function updateButtonText(platform, btnText) {
        if (platform.isMobile) {
            if (platform.isIOS) {
                btnText.textContent = '📱 Test Universal Links (iOS)';
            } else if (platform.isAndroid) {
                btnText.textContent = '🤖 Test App Links (Android)';
            }
        } else {
            btnText.textContent = '💻 Experience Desktop Demo';
        }
    }

    function handleDemoClick(platform) {
        logDemo('demo_button_clicked', { platform });
        
        if (platform.isMobile) {
            // Mobile: Try app scheme first, then show fallback
            attemptAppOpen(platform);
        } else {
            // Desktop: Show explanation and store options
            showStoreOptions();
            logDemo('desktop_demo_clicked');
        }
    }

    function attemptAppOpen(platform) {
        logDemo('attempting_app_open', { platform });
        
        const startTime = Date.now();
        
        // Method 1: Try direct Universal/App Link first
        const universalLink = ${CONFIG.demoBaseUrl}/open?source=demo&platform=${platform.isIOS ? 'ios' : 'android'};
        
        // For demo purposes, we'll use the app scheme
        // In production, the Universal/App Link would handle this automatically
        window.location.href = CONFIG.appScheme;
        
        // Fallback detection
        setTimeout(() => {
            const timeElapsed = Date.now() - startTime;
            logDemo('app_open_timeout', { timeElapsed, platform });
            
            if (timeElapsed < 2500) {
                // Likely app didn't open
                showStoreOptions();
                logDemo('app_not_installed_fallback_shown', { platform });
            } else {
                // App likely opened successfully
                logDemo('app_likely_opened', { platform });
            }
        }, 2000);
    }

    function showStoreOptions() {
        const demoBtn = document.getElementById('demo-btn');
        const storeBadges = document.getElementById('store-badges');
        
        if (!demoBtn || !storeBadges) return;
        
        // Hide button and show store options with animation
        demoBtn.style.transition = 'all 0.3s ease';
        demoBtn.style.opacity = '0';
        demoBtn.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            demoBtn.style.display = 'none';
            storeBadges.style.display = 'block';
            
            // Animate in store badges
            storeBadges.style.opacity = '0';
            storeBadges.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                storeBadges.style.transition = 'all 0.5s ease';
                storeBadges.style.opacity = '1';
                storeBadges.style.transform = 'translateY(0)';
            }, 100);
        }, 300);
        
        logDemo('store_options_displayed');
    }

    // Handle URL parameters for demo tracking
    function handleUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const source = urlParams.get('source');
        const demo = urlParams.get('demo');
        const action = urlParams.get('action');
        
        if (demo || source) {
            logDemo('demo_deep_link_accessed', { 
                source, 
                demo, 
                action,
                fullUrl: window.location.href 
            });
        }
    }

    // Add click tracking to store badges
    function addStoreTraking() {
        document.addEventListener('click', function(e) {
            const target = e.target.closest('.store-badge');
            if (target) {
                const store = target.href.includes('play.google.com') ? 'google_play' : 'app_store';
                logDemo('store_link_clicked', { store, href: target.href });
            }
        });
    }

    // Initialize everything when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        logDemo('dom_loaded');
        
        initDemo();
        handleUrlParams();
        addStoreTraking();
        
        // Global demo info
        window.greytHRDemo = {
            config: CONFIG,
            platform: detectPlatform(),
            log: logDemo
        };
        
        logDemo('demo_initialized', { 
            config: CONFIG,
            platform: detectPlatform()
        });
    });
    
    // Handle page visibility changes (useful for detecting app opens)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            logDemo('page_hidden', { reason: 'possible_app_open' });
        } else {
            logDemo('page_visible', { reason: 'returned_to_browser' });
        }
    });
    
})();