/**
 * @fileoverview Product registry and helper functions for product data manipulation.
 * Used to fetch icons or normalize product data structures.
 */

// Simple mapping of image keywords to SVG paths (simplified for Vanilla JS without external assets)
// In a real app these would be actual image URLs. We will use these keys to render SVGs in the UI.
export const ICON_MAP = {
    'headset-mic': '<path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>',
    'headphones': '<path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>',
    'volume-low': '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>',
    'plane-tail': '<path d="M2 12h20"></path><path d="M13 2l9 20"></path>',
    'plane': '<path d="M2 12h20"></path><path d="M13 2l9 20"></path><path d="M13 12l9-10"></path>',
    'wine': '<path d="M8 22h8"></path><path d="M7 10h10"></path><path d="M12 15v7"></path><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5z"></path>',
    'monitor': '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
    'monitor-play': '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><polygon points="10 8 16 12 10 16 10 8"></polygon>',
    'collection-play': '<polygon points="5 3 19 12 5 21 5 3"></polygon>',
    'default': '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>'
};

/**
 * Gets the SVG content for a given icon key.
 * @param {string} key - Icon key
 * @returns {string} SVG path content
 */
export function getIcon(key) {
    return ICON_MAP[key] || ICON_MAP['default'];
}

/**
 * Formats a number as a currency string.
 * @param {number} amount - Amount to format
 * @param {string} [currency='$'] - Currency symbol
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = '$') {
    return `${currency}${amount.toFixed(2)}`;
}
