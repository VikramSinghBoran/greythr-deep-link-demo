(function() {
    'use strict';
    
    // Gateway Configuration
    const GATEWAY_CONFIG = {
        appScheme: 'greythr://app',
        androidPackage: 'com.greytip.ghress',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.greytip.ghress',
        appStoreUrl: 'https://apps.apple.com/app/idUFXTNUWB5S',
        
        // Timing configuration
        appOpenTimeout: 2500,  // ms to wait before assuming app didn't open
        redirectDelay: 1000,   // ms delay before redirecting to store
        
        // Debug mode (set to false for production)
        debugMode: true
    };

    // Debug logging system
    function debugLog(message, data = null) {
        if (!GATEWAY_CONFIG.debugMode) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        
        // Console log
        console.log('🌉 Gateway:', logMessage, data || '');
        
        // Visual debug log
        const debugPanel = document.getElementById('debug-logs');
        if (debugPanel) {
            const logEntry = document.createElement('div');
            logEntry.className = 'debug-log';
            logEntry.innerHTML = `
                <span class="debug-timestamp">${timestamp}</span>
                <span>${message}</span>
            `;
            debugPanel.appendChild(logEntry);
            debugPanel.scrollTop = debugPanel.scrollHeight;
            
            // Keep only last 10 logs
            while (debugPanel.children.length > 10) {
                debugPanel.removeChild(debugPanel.firstChild);
            }
        }
    }

    // Update UI progress steps
    function updateStep(stepId, status, text = null) {
        const step = document.getElementById(stepId);
        if (!step) return;
        
        step.className = `progress-step ${status}`;
        if (text) {
            step.textContent = text;
        }
        
        debugLog(`Step ${stepId}: ${status}, { text }`);
    }

    // Update main status text
    function updateStatus(text) {
        const statusElement = document.getElementById('status-text');
        if (statusElement) {
            statusElement.textContent = text;
        }
        debugLog(`Status: ${text}`);
    }

    // Platform detection
    function detectPlatform() {
        debugLog('🔍 Starting platform detection...');
        updateStep('step-detection', 'active', '🔍 Detecting platform...');
        
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const platform = {
            isIOS: /iPad|iPhone|iPod/.test(userAgent),
            isAndroid: /android/i.test(userAgent),
            isMobile: /Mobi|Android/i.test(userAgent),
            isDesktop: !/Mobi|Android/i.test(userAgent),
            userAgent: userAgent.substring(0, 100) + '...' // Truncate for logging
        };
        
        debugLog('✅ Platform detected', platform);
        
        const platformName = platform.isIOS ? 'iOS' : 
                            platform.isAndroid ? 'Android' : 'Desktop';
        
        updateStep('step-detection', 'completed', `✅ Platform: ${platformName}`);
        
        return platform;
    }

    // Get appropriate store URL for platform
    function getStoreUrl(platform) {
        if (platform.isIOS) {
            return GATEWAY_CONFIG.appStoreUrl;
        } else if (platform.isAndroid) {
            return GATEWAY_CONFIG.playStoreUrl;
        } else {
            // Desktop - default to Android store
            return GATEWAY_CONFIG.playStoreUrl;
        }
    }

    // Attempt to open the app
    function attemptAppOpen(platform) {
        debugLog('🚀 Attempting to open app...', { platform: platform.isIOS ? 'iOS' : platform.isAndroid ? 'Android' : 'Desktop' });
        updateStep('step-attempt', 'active', '🚀 Attempting to open app...');
        updateStatus('Trying to open greytHR app...');
        
        if (platform.isDesktop) {
            // Desktop users go straight to store
            debugLog('💻 Desktop detected - skipping app open, going to store');
            updateStep('step-attempt', 'completed', '💻 Desktop - redirecting to store');
            redirectToStore(platform);
            return;
        }
        
        const startTime = Date.now();
        const appUrl = GATEWAY_CONFIG.appScheme;
        
        // Set up app visibility detection
        const visibilityHandler = function() {
            if (document.hidden) {
                debugLog('✅ Page hidden - app likely opened successfully');
                updateStep('step-attempt', 'completed', '✅ App opened successfully');
                updateStatus('greytHR app opened!');
                document.removeEventListener('visibilitychange', visibilityHandler);
            }
        };
        
        document.addEventListener('visibilitychange', visibilityHandler);
        
        // Set up fallback timer
        const fallbackTimer = setTimeout(() => {
            const timeElapsed = Date.now() - startTime;
            debugLog(`⏱️ App open timeout after ${timeElapsed}ms`);
            
            document.removeEventListener('visibilitychange', visibilityHandler);
            
            if (timeElapsed < GATEWAY_CONFIG.appOpenTimeout) {
                // Quick return suggests app not installed
                debugLog('❌ App likely not installed (quick return)');
                updateStep('step-attempt', 'failed', '❌ App not installed');
                redirectToStore(platform);
            } else {
                // Slow return might mean app opened
                debugLog('⚠️ Uncertain app state (slow return)');
                updateStep('step-attempt', 'completed', '⚠️ App might have opened');
                updateStatus('App opening... If not redirected, greytHR might have opened');
            }
        }, GATEWAY_CONFIG.appOpenTimeout);
        
        // Attempt to open app
        try {
            debugLog(`🔗 Redirecting to: ${appUrl}`);
            window.location.href = appUrl;
            updateStatus('Opening greytHR app...');
        } catch (error) {
            debugLog('❌ Failed to redirect to app', error);
            updateStep('step-attempt', 'failed', '❌ Redirect failed');
            clearTimeout(fallbackTimer);
            document.removeEventListener('visibilitychange', visibilityHandler);
            redirectToStore(platform);
        }
    }

    // Redirect to appropriate app store
    function redirectToStore(platform) {
        debugLog('🏪 Preparing store redirect...', { platform: platform.isIOS ? 'iOS' : platform.isAndroid ? 'Android' : 'Desktop' });
        updateStep('step-fallback', 'active', '🏪 Preparing store redirect...');
        
        const storeUrl = getStoreUrl(platform);
        const storeName = platform.isIOS ? 'App Store' : 'Google Play Store';
        
        updateStatus(`Redirecting to ${storeName}...`);
        updateStep('step-fallback', 'completed', `✅ Store URL ready: ${storeName}`);
        
        // Add small delay to show the transition
        setTimeout(() => {
            debugLog(`🔗 Redirecting to store: ${storeUrl}`);
            updateStep('step-redirect', 'active', `↗️ Redirecting to ${storeName}...`);
            
            try {
                window.location.href = storeUrl;
                updateStep('step-redirect', 'completed', `✅ Redirected to ${storeName}`);
            } catch (error) {
                debugLog('❌ Store redirect failed', error);
                updateStep('step-redirect', 'failed', '❌ Store redirect failed');
                updateStatus('Error: Unable to redirect to store');
            }
        }, GATEWAY_CONFIG.redirectDelay);
    }

    // Handle URL parameters for context
    function handleUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const context = {
            source: urlParams.get('source'),
            action: urlParams.get('action'),
            demo: urlParams.get('demo'),
            platform: urlParams.get('platform'),
            fullUrl: window.location.href
        };
        
        debugLog('🔗 URL context detected', context);
        return context;
    }

    // Main gateway initialization
    function initGateway() {
        debugLog('🌉 Gateway initialization started');
        debugLog('⚙️ Gateway configuration', GATEWAY_CONFIG);
        
        // Handle URL context
        const urlContext = handleUrlParams();
        
        // Small delay to show loading state
        setTimeout(() => {
            // Detect platform
            const platform = detectPlatform();
            
            // Attempt app open
            setTimeout(() => {
                attemptAppOpen(platform);
            }, 500);
            
        }, 300);
    }

    // Error handler
    window.addEventListener('error', function(e) {
        debugLog('❌ JavaScript Error', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno
        });
        updateStatus('Error occurred during redirect');
    });

    // Page load handler
    document.addEventListener('DOMContentLoaded', function() {
        debugLog('📄 Gateway page loaded');
        initGateway();
    });

    // Make gateway functions globally available for testing
    window.greytHRGateway = {
        config: GATEWAY_CONFIG,
        detectPlatform: detectPlatform,
        attemptAppOpen: attemptAppOpen,
        redirectToStore: redirectToStore,
        log: debugLog
    };
    
    debugLog('🌉 Gateway system ready');
    
})();
