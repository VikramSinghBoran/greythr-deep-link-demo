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

    // Debug logger that shows both in console and on page
    function debugLog(message, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        
        // Console log
        console.log('🎯 greytHR Debug:', logMessage, data || '');
        
        // Visual log on page
        addVisualLog(logMessage, data);
    }

    // Add visual log to debug panel
    function addVisualLog(message, data = null) {
        let debugPanel = document.getElementById('debug-panel');
        if (!debugPanel) {
            createDebugPanel();
            debugPanel = document.getElementById('debug-panel');
        }
        
        const logEntry = document.createElement('div');
        logEntry.className = 'debug-log-entry';
        logEntry.innerHTML = `
            <span class="debug-timestamp">${new Date().toLocaleTimeString()}</span>
            <span class="debug-message">${message}</span>
            ${data ? <pre class="debug-data">${JSON.stringify(data, null, 2)}</pre> : ''}
        `;
        
        debugPanel.appendChild(logEntry);
        debugPanel.scrollTop = debugPanel.scrollHeight;
    }

    // Create debug panel
    function createDebugPanel() {
        const debugContainer = document.createElement('div');
        debugContainer.id = 'debug-container';
        debugContainer.innerHTML = `
            <div class="debug-header">
                <h3>🔍 Debug Console</h3>
                <button id="toggle-debug" class="debug-toggle">Hide</button>
                <button id="clear-debug" class="debug-clear">Clear</button>
            </div>
            <div id="debug-panel" class="debug-panel"></div>
            <div class="debug-status">
                <div id="platform-status" class="status-item">Platform: Detecting...</div>
                <div id="linking-status" class="status-item">Linking: Not tested</div>
                <div id="app-status" class="status-item">App: Unknown</div>
            </div>
        `;
        
        document.body.appendChild(debugContainer);
        
        // Add debug panel styles
        const debugStyles = document.createElement('style');
        debugStyles.textContent = `
            #debug-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 400px;
                max-width: 90vw;
                background: rgba(0,0,0,0.9);
                border: 2px solid #ff6b35;
                border-radius: 10px;
                color: white;
                font-family: monospace;
                font-size: 12px;
                z-index: 10000;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            }
            
            .debug-header {
                background: #ff6b35;
                padding: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 8px 8px 0 0;
            }
            
            .debug-header h3 {
                margin: 0;
                font-size: 14px;
            }
            
            .debug-toggle, .debug-clear {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 11px;
                cursor: pointer;
                margin-left: 5px;
            }
            
            .debug-toggle:hover, .debug-clear:hover {
                background: rgba(255,255,255,0.3);
            }
            
            .debug-panel {
                max-height: 300px;
                overflow-y: auto;
                padding: 10px;
                background: rgba(0,0,0,0.5);
            }
            
            .debug-log-entry {
                margin-bottom: 8px;
                padding: 5px;
                background: rgba(255,255,255,0.1);
                border-radius: 4px;
                border-left: 3px solid #ff6b35;
            }
            
            .debug-timestamp {
                color: #90EE90;
                font-weight: bold;
                margin-right: 5px;
            }
            
            .debug-message {
                color: white;
            }
            
            .debug-data {
                color: #FFD700;
                font-size: 10px;
                margin: 5px 0 0 0;
                padding: 5px;
                background: rgba(0,0,0,0.3);
                border-radius: 3px;
                overflow-x: auto;
            }
            
            .debug-status {
                background: rgba(0,0,0,0.5);
                padding: 10px;
                border-radius: 0 0 8px 8px;
            }
            
            .status-item {
                margin: 3px 0;
                padding: 3px 6px;
                background: rgba(255,255,255,0.1);
                border-radius: 3px;
                font-size: 11px;
            }
            
            @media (max-width: 768px) {
                #debug-container {
                    width: 95vw;
                    bottom: 10px;
                    right: 2.5vw;
                }
            }
        `;
        
        document.head.appendChild(debugStyles);
        
        // Add event listeners
        document.getElementById('toggle-debug').addEventListener('click', function() {
            const panel = document.getElementById('debug-panel');
            const status = document.querySelector('.debug-status');
            const button = this;
            
            if (panel.style.display === 'none') {
                panel.style.display = 'block';
                status.style.display = 'block';
                button.textContent = 'Hide';
            } else {
                panel.style.display = 'none';
                status.style.display = 'none';
                button.textContent = 'Show';
            }
        });
        
        document.getElementById('clear-debug').addEventListener('click', function() {
            document.getElementById('debug-panel').innerHTML = '';
            debugLog('Debug panel cleared');
        });
    }

    // Update status displays
    function updateStatus(type, message, isSuccess = null) {
        const statusElement = document.getElementById(`${type}-status`);
        if (statusElement) {
            statusElement.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${message}`;
            if (isSuccess === true) {
                statusElement.style.background = 'rgba(0,255,0,0.2)';
            } else if (isSuccess === false) {
                statusElement.style.background = 'rgba(255,0,0,0.2)';
            }
        }
    }

    // Enhanced platform detection
    function detectPlatform() {
        debugLog('🔍 Starting platform detection...');
        
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const platform = {
            isIOS: /iPad|iPhone|iPod/.test(userAgent),
            isAndroid: /android/i.test(userAgent),
            isMobile: /Mobi|Android/i.test(userAgent),
            isDesktop: !/Mobi|Android/i.test(userAgent),
            userAgent: userAgent,
            vendor: navigator.vendor,
            platform: navigator.platform
        };
        
        debugLog('✅ Platform detected', platform);
        
        // Update UI class
        let platformClass = 'desktop platform-desktop';
        if (platform.isIOS) {
            platformClass = 'ios platform-ios';
        } else if (platform.isAndroid) {
            platformClass = 'android platform-android';
        }
        
        document.body.className = platformClass;
        debugLog(`📱 Applied platform class: ${platformClass}`);
        
        // Update status
        const platformName = platform.isIOS ? 'iOS' : platform.isAndroid ? 'Android' : 'Desktop';
        updateStatus('platform', platformName, true);
        
        return platform;
    }

    // Test if linking is available
    function testLinkingCapabilities() {
        debugLog('🔗 Testing linking capabilities...');
        
        const capabilities = {
            canOpenURL: typeof window.location !== 'undefined',
            hasLinking: 'Linking' in window,
            canChangeLocation: true
        };
        
        debugLog('🔗 Linking capabilities', capabilities);
        updateStatus('linking', 'Browser linking available', true);
        
        return capabilities;
    }

    // Enhanced demo initialization
    function initDemo() {
        debugLog('🚀 Initializing greytHR deep link demo...');
        
        const platform = detectPlatform();
        const linkingCaps = testLinkingCapabilities();
        
        debugLog('⚙️ Configuration loaded', CONFIG);
        
        const demoBtn = document.getElementById('demo-btn');
        const btnText = document.getElementById('btn-text');
        const storeBadges = document.getElementById('store-badges');
        
        if (!demoBtn) {
            debugLog('❌ Demo button not found! Check HTML structure');
            return;
        } else {
            debugLog('✅ Demo button found and ready');
        }
        
        // Update button text
        updateButtonText(platform, btnText);
        
        // Add click listener with detailed logging
        demoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            debugLog('👆 Demo button clicked!', { 
                platform: platform,
                timestamp: new Date().toISOString(),
                buttonText: btnText.textContent
            });
            
            handleDemoClick(platform);
        });
        
        debugLog('✅ Demo initialization complete');
        
        // Auto-show store badges on desktop after delay
        if (platform.isDesktop) {
            debugLog('💻 Desktop detected - will show store options after delay');
            setTimeout(() => {
                showStoreOptions();
                debugLog('💻 Desktop store options displayed');
            }, 2000);
        }
    }

    function updateButtonText(platform, btnText) {
        let newText = '';
        
        if (platform.isMobile) {
            if (platform.isIOS) {
                newText = '📱 Test Universal Links (iOS)';
            } else if (platform.isAndroid) {
                newText = '🤖 Test App Links (Android)';
            } else {
                newText = '📱 Test Mobile Deep Link';
            }
        } else {
            newText = '💻 Experience Desktop Demo';
        }
        
        if (btnText) {
            btnText.textContent = newText;
            debugLog(`🎨 Button text updated to: "${newText}"`);
        }
    }

    function handleDemoClick(platform) {
        debugLog('🎯 Handling demo click', { platform });
        updateStatus('app', 'Testing...', null);
        
        if (platform.isMobile) {
            debugLog('📱 Mobile platform detected - attempting app open');
            attemptAppOpen(platform);
        } else {
            debugLog('💻 Desktop platform - showing store options');
            showStoreOptions();
            updateStatus('app', 'Desktop - Store options shown', true);
        }
    }

    function attemptAppOpen(platform) {
        debugLog('🚀 Attempting to open greytHR app...');
        
        const startTime = Date.now();
        const appUrl = CONFIG.appScheme;
        
        debugLog(`🔗 Trying app scheme: ${appUrl}`);
        
        // Try to open app
        try {
            window.location.href = appUrl;
            debugLog('✅ App scheme redirect initiated');
            updateStatus('app', 'Attempting to open...', null);
        } catch (error) {
            debugLog('❌ Error opening app scheme', error);
            updateStatus('app', 'Failed to open', false);
            showStoreOptions();
            return;
        }
        
        // Set up fallback detection
        const fallbackTimer = setTimeout(() => {
            const timeElapsed = Date.now() - startTime;
            debugLog('⏱️ App open timeout - ${timeElapsed}ms elapsed');
            
            if (timeElapsed < 2500) {
                debugLog('❌ App likely not installed (quick return)');
                updateStatus('app', 'Not installed', false);
                showStoreOptions();
            } else {
                debugLog('✅ App likely opened successfully (slow return)');
                updateStatus('app', 'Opened successfully', true);
            }
        }, 2000);
        
        // Clear timer if page becomes hidden (app opened)
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                clearTimeout(fallbackTimer);
                debugLog('✅ Page hidden - app likely opened successfully');
                updateStatus('app', 'Opened (page hidden)', true);
            }
        }, { once: true });
    }

    function showStoreOptions() {
        debugLog('🏪 Showing store download options');
        
        const demoBtn = document.getElementById('demo-btn');
        const storeBadges = document.getElementById('store-badges');
        
        if (!demoBtn || !storeBadges) {
            debugLog('❌ Store elements not found', { 
                demoBtn: !!demoBtn, 
                storeBadges: !!storeBadges 
            });
            return;
        }
        
        // Animate button out
        demoBtn.style.transition = 'all 0.3s ease';
        demoBtn.style.opacity = '0';
        demoBtn.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            demoBtn.style.display = 'none';
            storeBadges.style.display = 'block';
            
            // Animate badges in
            storeBadges.style.opacity = '0';
            storeBadges.style.transform = 'translateY(20px)';
            
            requestAnimationFrame(() => {
                storeBadges.style.transition = 'all 0.5s ease';
                storeBadges.style.opacity = '1';
                storeBadges.style.transform = 'translateY(0)';
            });
            
            debugLog('✅ Store options animation complete');
        }, 300);
    }

    // Enhanced page load handler
    document.addEventListener('DOMContentLoaded', function() {
        debugLog('📄 DOM loaded - starting demo setup');
        
        // Wait a bit for all resources to load
        setTimeout(() => {
            initDemo();
            
            // Add some demo info to help debugging
            debugLog('🎯 Demo ready!', {
                url: window.location.href,
                timestamp: new Date().toISOString(),
                config: CONFIG
            });
            
            // Test button availability
            const testElements = {
                demoBtn: !!document.getElementById('demo-btn'),
                btnText: !!document.getElementById('btn-text'),
                storeBadges: !!document.getElementById('store-badges')
            };
            
            debugLog('🔍 Element availability check', testElements);
            
        }, 500);
    });
    
    // Global error handler
    window.addEventListener('error', function(e) {
        debugLog('❌ JavaScript Error', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            error: e.error
        });
    });
    
    // Make debug functions globally available
    window.greytHRDebug = {
        log: debugLog,
        config: CONFIG,
        detectPlatform: detectPlatform,
        testApp: () => attemptAppOpen(detectPlatform()),
        showStores: showStoreOptions
    };
    
    debugLog('🎯 greytHR Debug system loaded');
    
})()