/**
 * GhostImage Application Constants
 * 
 * Centralized definition of all constant values used throughout the application.
 * This ensures consistency and makes configuration changes easier.
 */

export const APP_CONFIG = {
    NAME: "GhostImage",
    VERSION: "1.0.0",
    MAX_IMAGE_WIDTH: 2048,
    MAX_IMAGE_HEIGHT: 2048,
};

// Steganography Configuration
export const STEG_CONFIG = {
    // Number of bits used per channel for hiding data
    // Higher bits = more storage, less quality
    HEADER_LENGTH: 32, // Length of the header in bits (stores width/height)
    HEADER_MARKER: "GI", // GhostImage marker
    HEADER_SIZE_BITS: 16, // Bits allocated for width/height in header
};

// DOM Event Names
export const EVENTS = {
    IMAGE_LOADED: 'ghost:image-loaded',
    ENCODE_START: 'ghost:encode-start',
    ENCODE_COMPLETE: 'ghost:encode-complete',
    ENCODE_ERROR: 'ghost:encode-error',
    DECODE_START: 'ghost:decode-start',
    DECODE_COMPLETE: 'ghost:decode-complete',
    DECODE_ERROR: 'ghost:decode-error',
    RESET_APP: 'ghost:reset',
    UI_NOTIFY: 'ghost:notify'
};

// UI Element IDs
export const UI = {
    VIEWS: {
        ENCODE: 'view-encode',
        DECODE: 'view-decode',
    },
    DROPZONES: {
        COVER: 'dropzone-cover',
        SECRET: 'dropzone-secret',
        DECODE: 'dropzone-decode',
    },
    CANVAS: {
        COVER: 'canvas-cover',
        SECRET: 'canvas-secret',
        DECODE_SOURCE: 'canvas-decode-source',
        DECODE_RESULT: 'canvas-decode-result',
    },
    INPUTS: {
        COVER: 'input-cover',
        SECRET: 'input-secret',
        DECODE: 'input-decode',
    }
};

// Error Messages
export const ERRORS = {
    FILE_TOO_LARGE: "The selected file is too large. Please choose a smaller image.",
    INVALID_FILE_TYPE: "Invalid file type. Please upload a valid PNG or JPG image.",
    SECRET_TOO_BIG: "The secret image is too large to fit inside the cover image.",
    NO_DATA_FOUND: "No hidden data could be found in this image.",
    BROWSER_SUPPORT: "Your browser does not support the required Canvas APIs.",
    ENCODE_FAILED: "An error occurred during the encoding process.",
    DECODE_FAILED: "An error occurred during the decoding process.",
};

// Notification Types
export const NOTIFY = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};
