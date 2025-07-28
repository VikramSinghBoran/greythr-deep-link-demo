(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        appScheme: 'greythr://app',
        androidPackage: 'com.greytip.ghress',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.greytip.ghress',
        appStoreUrl: 'https://apps.apple.com/app/idUFXTNUWB5S'
    };

    // Debug logger
    function debugLog(message, data) {
        if (data !== undefined) {
            console.log('[greytHR deep link]', message, data);
        } else {
            console.log('[greytHR deep link]', message);
        }
    }

    // Platform detection (minimal)
    function detectPlatform() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const platform = {
            isIOS: /iPad|iPhone|iPod/.test(userAgent),
            isAndroid: /android/i.test(userAgent),
            isMobile: /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent),
            userAgent
        };
        debugLog('Platform detected', platform);
        return platform;
    }

    // Attempt to open app, fallback to store
    function openAppOrStore() {
        const platform = detectPlatform();
        const appUrl = CONFIG.appScheme;
        let storeUrl = '';
        if (platform.isIOS) {
            storeUrl = CONFIG.appStoreUrl;
        } else if (platform.isAndroid) {
            storeUrl = CONFIG.playStoreUrl;
        } else {
            debugLog('Not a mobile device. No action taken.');
            return;
        }

        let didHide = false;
        const now = Date.now();
        debugLog('Attempting to open app via deep link', appUrl);
        window.location.href = appUrl;

        // Fallback: if app not installed, redirect to store after short delay
        const fallback = setTimeout(function() {
            if (!didHide && Date.now() - now < 2500) {
                debugLog('App not detected, redirecting to store', storeUrl);
                window.location.href = storeUrl;
            }
        }, 1500);

        // If the page is hidden (app opened), cancel fallback
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                didHide = true;
                clearTimeout(fallback);
                debugLog('Page hidden, app likely opened successfully');
            }
        }, { once: true });
    }

    // Run immediately
    openAppOrStore();

})(); 