/**
 * LindenArboretum - StringBuilder Module
 * High-performance string concatenation using array chunks rather than 
 * native JS string appending, which can be slow for millions of characters.
 * Useful for deep iterations of L-Systems where strings grow exponentially.
 */

export class StringBuilder {
    constructor(capacity = 100000) {
        // Allocate an array of strings to join later
        this.buffer = new Array(capacity);
        this.length = 0;

        // Tracking string length to avoid memory blowouts
        this.totalCharCount = 0;
        // Limit to ~50MB of string data roughly (50,000,000 chars)
        this.MAX_CHARS = 50000000;
    }

    /**
     * Appends a string to the buffer.
     * @param {string} str 
     */
    append(str) {
        if (this.totalCharCount + str.length > this.MAX_CHARS) {
            throw new Error(`StringBuilder limit exceeded. The resulting L-System string is too massive (> ${this.MAX_CHARS} chars). Please reduce recursion depth.`);
        }

        if (this.length >= this.buffer.length) {
            // Expand buffer size by 50%
            const newBuffer = new Array(Math.floor(this.buffer.length * 1.5));
            for (let i = 0; i < this.length; i++) {
                newBuffer[i] = this.buffer[i];
            }
            this.buffer = newBuffer;
        }

        this.buffer[this.length++] = str;
        this.totalCharCount += str.length;
    }

    /**
     * Appends a single character (faster path if needed).
     * @param {string} char 
     */
    appendChar(char) {
        this.append(char);
    }

    /**
     * Clears the buffer for reuse.
     */
    clear() {
        this.length = 0;
        this.totalCharCount = 0;
        // Allows GC to reclaim string memory
        for (let i = 0; i < this.buffer.length; i++) {
            this.buffer[i] = undefined;
        }
    }

    /**
     * Joins all chunks and returns the final string.
     * @returns {string} Complete generated string
     */
    build() {
        return this.buffer.slice(0, this.length).join('');
    }
}
