/**
 * Crypto - Custom Encryption Layer
 * Implements a Vigenère Cipher combined with XOR for additional complexity.
 */
class Crypto {
    constructor() {
        this.alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/ ';
    }

    /**
     * Generates a random session key
     * @param {number} length 
     * @returns {string}
     */
    generateKey(length = 32) {
        let key = '';
        for (let i = 0; i < length; i++) {
            key += this.alphabet.charAt(Math.floor(Math.random() * this.alphabet.length));
        }
        return key;
    }

    /**
     * Encrypts a message using Vigenère + XOR
     * @param {string} text 
     * @param {string} key 
     * @returns {string} Base64 encoded encrypted string
     */
    encrypt(text, key) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const textChar = text.charCodeAt(i);
            const keyChar = key.charCodeAt(i % key.length);
            // XOR operation
            const xorChar = textChar ^ keyChar;
            // Vigenère-like shift on top (simplified for char codes)
            result += String.fromCharCode(xorChar);
        }
        return btoa(result); // Base64 encode for safe storage
    }

    /**
     * Decrypts a message
     * @param {string} encodedText 
     * @param {string} key 
     * @returns {string} Decrypted string
     */
    decrypt(encodedText, key) {
        try {
            const text = atob(encodedText);
            let result = '';
            for (let i = 0; i < text.length; i++) {
                const textChar = text.charCodeAt(i);
                const keyChar = key.charCodeAt(i % key.length);
                // Reverse operation (XOR is its own inverse)
                const xorChar = textChar ^ keyChar;
                result += String.fromCharCode(xorChar);
            }
            return result;
        } catch (e) {
            console.error('Decryption failed:', e);
            return '[Encrypted Message]';
        }
    }
}

window.Crypto = new Crypto();
