/**
 * Utility functions for formatting and bitwise operations.
 */

// Convert number to 4-digit Hex string (e.g. "00FF")
export function toHex16(num) {
    if (num < 0) num = 0xFFFF + num + 1; // Handle 2's complement visual
    return num.toString(16).toUpperCase().padStart(4, '0');
}

// Convert number to 2-digit Hex string (e.g. "FF")
export function toHex8(num) {
    return num.toString(16).toUpperCase().padStart(2, '0');
}

// Check if a string looks like a register
export function isRegister(str) {
    return ['AX', 'BX', 'CX', 'DX', 'SP', 'IP'].includes(str.toUpperCase());
}

// Parse a number from string (handles 0x, 0b, or decimal)
export function parseNumber(str) {
    str = str.trim();
    if (str.startsWith('0x') || str.endsWith('h')) {
        return parseInt(str.replace('h', ''), 16);
    }
    if (str.startsWith('0b')) {
        return parseInt(str.slice(2), 2);
    }
    return parseInt(str, 10);
}

// Convert byte value to safe ASCII char
export function getSafeChar(code) {
    if (code >= 32 && code <= 126) {
        return String.fromCharCode(code);
    }
    return '.';
}