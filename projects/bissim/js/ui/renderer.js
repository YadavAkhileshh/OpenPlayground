/**
 * @fileoverview Main UI Rendering module.
 * Responsible for generating HTML from data and updating the DOM.
 */

import { $, createElement, clearElement, on } from '../utils/dom.js';
import { getIcon, formatCurrency } from '../data/products.js';
import { mouseTracker } from '../engine/tracking/mouseTracker.js';
import { logger } from '../engine/tracking/interactLog.js';

export class ProductRenderer {
    constructor() {
        this.container = $('#product-grid');
    }

    /**
     * Renders a list of products into the grid.
     * @param {Array} products - List of product objects
     * @param {Function} onSelect - Callback when a product is chosen
     */
    render(products, onSelect) {
        // Clear loading state
        this.container.classList.remove('loading');
        clearElement(this.container);

        products.forEach(product => {
            const card = this.createCard(product, onSelect);
            this.container.appendChild(card);
        });
    }

    /**
     * Creates a single product card element.
     * @param {Object} product 
     * @param {Function} onSelect 
     * @returns {HTMLElement}
     */
    createCard(product, onSelect) {
        const card = createElement('article', 'product-card');
        if (product.isDecoy) card.classList.add('is-decoy');
        card.dataset.id = product.id;

        // --- Badges ---
        if (product.badges) {
            product.badges.forEach(type => {
                const badge = createElement('div', `badge ${type}`, type.replace('_', ' '));
                if (type === 'scarcity') badge.textContent = 'Only 2 Left!';
                if (type === 'popular') badge.textContent = 'Most Popular';
                card.appendChild(badge);
            });
        }

        // --- Image Area ---
        const imgContainer = createElement('div', 'card-image');
        imgContainer.innerHTML = getIcon(product.image) || getIcon('default');
        card.appendChild(imgContainer);

        // --- Content ---
        const title = createElement('h3', 'card-title', product.name);
        card.appendChild(title);

        const price = createElement('div', 'card-price');
        price.innerHTML = `${formatCurrency(product.price)} <span>/mo</span>`; // Assuming sub for cleaner look, or just price
        if (product.price > 100) price.innerHTML = formatCurrency(product.price); // One-time purchase
        card.appendChild(price);

        const desc = createElement('p', 'card-description');
        // Render features list
        let featureHtml = '<ul class="feature-list">';
        product.features.forEach(f => {
            featureHtml += `<li class="feature-item">${f}</li>`;
        });
        featureHtml += '</ul>';

        // Add extra text if needed
        if (product.subtitle) {
            featureHtml += `<p class="text-small font-medium" style="color:var(--color-danger)">${product.subtitle}</p>`;
        }

        // Social Proof Text
        if (product.viewCount) {
            featureHtml += `<p class="text-small text-muted" style="margin-top:8px">🔥 ${product.viewCount} people viewing this</p>`;
        }

        desc.innerHTML = featureHtml;
        card.appendChild(desc);

        // --- Action Button ---
        const btn = createElement('button', 'btn primary btn-cta', 'Select Plan');

        // --- Event Listeners ---
        // 1. Hover Tracking
        on(card, 'mouseenter', () => mouseTracker.startHover(product.id));
        on(card, 'mouseleave', () => mouseTracker.endHover());

        // 2. Click Selection
        on(btn, 'click', (e) => {
            e.stopPropagation(); // Prevent bubbling if card also clicks
            onSelect(product.id);
        });

        // Make whole card clickable for better UX, but usually specific buttons are better for tracking intention
        // We'll leave button as primary trigger.

        card.appendChild(btn);

        return card;
    }

    /**
     * Shows a notification toast (for Social Proof).
     * @param {string} message 
     */
    showNotification(message) {
        const toast = createElement('div', 'toast animate-slide-in', message);
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            background: 'white',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        });
        // simplistic implementation for now
        document.body.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }
}

export const renderer = new ProductRenderer();
