// Storage Manager - Handles localStorage and data persistence

const STORAGE_KEYS = {
    THEME: 'asciiForgeDarkMode',
    SETTINGS: 'asciiForgeSettings',
    RECENT_IMAGES: 'asciiForgeRecentImages',
    OUTPUT_HISTORY: 'asciiForgeOutputHistory'
};

/**
 * Save theme preference to localStorage
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 */
function saveThemePreference(isDarkMode) {
    try {
        localStorage.setItem(STORAGE_KEYS.THEME, isDarkMode.toString());
    } catch (e) {
        console.warn('Failed to save theme preference:', e);
    }
}

/**
 * Load theme preference from localStorage
 * @returns {boolean} Whether dark mode should be enabled
 */
function loadThemePreference() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.THEME);
        return saved === 'true';
    } catch (e) {
        console.warn('Failed to load theme preference:', e);
        return false;
    }
}

/**
 * Save app settings to localStorage
 * @param {Object} settings - App settings object
 */
function saveAppSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
        console.warn('Failed to save app settings:', e);
    }
}

/**
 * Load app settings from localStorage
 * @returns {Object} App settings object
 */
function loadAppSettings() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.warn('Failed to load app settings:', e);
        return null;
    }
}

/**
 * Save recent image data URL
 * @param {string} dataUrl - Image data URL
 */
function saveRecentImage(dataUrl) {
    try {
        // Get existing recent images
        const recent = getRecentImages();
        
        // Add new image to beginning of array
        recent.unshift({
            dataUrl,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 5 images
        const trimmed = recent.slice(0, 5);
        
        localStorage.setItem(STORAGE_KEYS.RECENT_IMAGES, JSON.stringify(trimmed));
    } catch (e) {
        console.warn('Failed to save recent image:', e);
    }
}

/**
 * Get recent images from localStorage
 * @returns {Array} Array of recent images
 */
function getRecentImages() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.RECENT_IMAGES);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.warn('Failed to load recent images:', e);
        return [];
    }
}

/**
 * Save ASCII output to history
 * @param {string} ascii - ASCII art
 * @param {Object} metadata - Metadata about the generation
 */
function saveToOutputHistory(ascii, metadata = {}) {
    try {
        // Get existing history
        const history = getOutputHistory();
        
        // Add new entry
        history.unshift({
            ascii: ascii.substring(0, 1000), // Limit size
            metadata: {
                timestamp: new Date().toISOString(),
                width: metadata.width || 0,
                height: metadata.height || 0,
                chars: ascii.length,
                ...metadata
            }
        });
        
        // Keep only last 20 entries
        const trimmed = history.slice(0, 20);
        
        localStorage.setItem(STORAGE_KEYS.OUTPUT_HISTORY, JSON.stringify(trimmed));
    } catch (e) {
        console.warn('Failed to save output history:', e);
    }
}

/**
 * Get ASCII output history
 * @returns {Array} Array of historical outputs
 */
function getOutputHistory() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.OUTPUT_HISTORY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.warn('Failed to load output history:', e);
        return [];
    }
}

/**
 * Clear all stored data
 */
function clearAllStorage() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    } catch (e) {
        console.warn('Failed to clear storage:', e);
    }
}

/**
 * Export all stored data as JSON file
 */
function exportStorageData() {
    try {
        const data = {};
        Object.values(STORAGE_KEYS).forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    data[key] = JSON.parse(value);
                } catch {
                    data[key] = value;
                }
            }
        });
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `asciiforge-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully', 'success');
    } catch (e) {
        console.warn('Failed to export data:', e);
        showNotification('Failed to export data', 'error');
    }
}

/**
 * Import data from JSON file
 * @param {File} file - JSON file to import
 */
function importStorageData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (typeof data !== 'object') {
                    throw new Error('Invalid data format');
                }
                
                // Import each key
                Object.entries(data).forEach(([key, value]) => {
                    if (Object.values(STORAGE_KEYS).includes(key)) {
                        if (typeof value === 'string') {
                            localStorage.setItem(key, value);
                        } else {
                            localStorage.setItem(key, JSON.stringify(value));
                        }
                    }
                });
                
                showNotification('Data imported successfully', 'success');
                resolve();
            } catch (e) {
                console.warn('Failed to import data:', e);
                showNotification('Failed to import data: Invalid format', 'error');
                reject(e);
            }
        };
        
        reader.onerror = function() {
            showNotification('Failed to read file', 'error');
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
    });
}

/**
 * Get storage usage statistics
 * @returns {Object} Storage statistics
 */
function getStorageStats() {
    try {
        let totalBytes = 0;
        Object.values(STORAGE_KEYS).forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                totalBytes += new Blob([value]).size;
            }
        });
        
        return {
            totalBytes,
            formatted: formatFileSize(totalBytes),
            items: Object.values(STORAGE_KEYS).length
        };
    } catch (e) {
        console.warn('Failed to get storage stats:', e);
        return { totalBytes: 0, formatted: '0 Bytes', items: 0 };
    }
}

// Export storage manager functions
window.storageManager = {
    STORAGE_KEYS,
    saveThemePreference,
    loadThemePreference,
    saveAppSettings,
    loadAppSettings,
    saveRecentImage,
    getRecentImages,
    saveToOutputHistory,
    getOutputHistory,
    clearAllStorage,
    exportStorageData,
    importStorageData,
    getStorageStats
};