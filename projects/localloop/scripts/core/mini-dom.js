/**
 * MiniDOM - A lightweight DOM manipulation library
 * "Because we don't need the whole kitchen sink."
 */
class MiniDOM {
    constructor(selector) {
        if (typeof selector === 'string') {
            this.elements = Array.from(document.querySelectorAll(selector));
        } else if (selector instanceof HTMLElement || selector === document || selector === window) {
            this.elements = [selector];
        } else if (selector instanceof MiniDOM) {
            this.elements = selector.elements;
        } else {
            this.elements = [];
        }
    }

    on(event, handler) {
        this.elements.forEach(el => el.addEventListener(event, handler));
        return this;
    }

    css(property, value) {
        if (typeof property === 'string' && value === undefined) {
            return this.elements[0] ? getComputedStyle(this.elements[0])[property] : undefined;
        }

        this.elements.forEach(el => {
            if (typeof property === 'object') {
                Object.assign(el.style, property);
            } else {
                el.style[property] = value;
            }
        });
        return this;
    }

    html(html) {
        if (html === undefined) {
            return this.elements[0] ? this.elements[0].innerHTML : '';
        }
        this.elements.forEach(el => el.innerHTML = html);
        return this;
    }

    text(text) {
        if (text === undefined) {
            return this.elements[0] ? this.elements[0].textContent : '';
        }
        this.elements.forEach(el => el.textContent = text);
        return this;
    }

    append(child) {
        this.elements.forEach(el => {
            if (child instanceof MiniDOM) {
                child.elements.forEach(c => el.appendChild(c));
            } else if (typeof child === 'string') {
                el.insertAdjacentHTML('beforeend', child);
            } else {
                el.appendChild(child);
            }
        });
        return this;
    }

    addClass(className) {
        this.elements.forEach(el => el.classList.add(className));
        return this;
    }

    removeClass(className) {
        this.elements.forEach(el => el.classList.remove(className));
        return this;
    }

    toggleClass(className) {
        this.elements.forEach(el => el.classList.toggle(className));
        return this;
    }

    attr(name, value) {
        if (value === undefined) {
            return this.elements[0] ? this.elements[0].getAttribute(name) : undefined;
        }
        this.elements.forEach(el => el.setAttribute(name, value));
        return this;
    }

    val(value) {
        if (value === undefined) {
            return this.elements[0] ? this.elements[0].value : undefined;
        }
        this.elements.forEach(el => el.value = value);
        return this;
    }

    focus() {
        if (this.elements[0]) this.elements[0].focus();
        return this;
    }

    remove() {
        this.elements.forEach(el => el.remove());
        return this;
    }

    scrollToBottom() {
        this.elements.forEach(el => {
            el.scrollTop = el.scrollHeight;
        });
        return this;
    }
}

const $ = (selector) => new MiniDOM(selector);
window.$ = $;
