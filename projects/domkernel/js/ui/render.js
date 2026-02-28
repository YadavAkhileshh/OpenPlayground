/**
 * UI Renderer Utility (Virtual DOM-lite representation helper)
 * Allows declarative UI element creation for apps.
 */
class UIRenderer {
    static h(tag, props, ...children) {
        const el = document.createElement(tag);

        if (props) {
            for (const key in props) {
                if (key.startsWith('on') && typeof props[key] === 'function') {
                    el.addEventListener(key.substring(2).toLowerCase(), props[key]);
                } else if (key === 'className') {
                    el.className = props[key];
                } else if (key === 'style' && typeof props[key] === 'object') {
                    for (const s in props[key]) {
                        el.style[s] = props[key][s];
                    }
                } else if (key === 'innerHTML') {
                    el.innerHTML = props[key];
                } else if (key === 'dataset') {
                    for (const d in props[key]) {
                        el.dataset[d] = props[key][d];
                    }
                } else {
                    el.setAttribute(key, props[key]);
                }
            }
        }

        children.forEach(child => {
            if (child === null || child === undefined || child === false) return;
            if (typeof child === 'string' || typeof child === 'number') {
                el.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement || child instanceof SVGElement) {
                el.appendChild(child);
            } else if (Array.isArray(child)) {
                child.forEach(c => {
                    if (c instanceof HTMLElement || c instanceof SVGElement) el.appendChild(c);
                    else if (typeof c === 'string' || typeof c === 'number') el.appendChild(document.createTextNode(c));
                });
            }
        });

        return el;
    }

    static mount(parent, child) {
        parent.innerHTML = '';
        if (child) {
            parent.appendChild(child);
        }
    }
}

window.h = UIRenderer.h;
window.UIRenderer = UIRenderer;
