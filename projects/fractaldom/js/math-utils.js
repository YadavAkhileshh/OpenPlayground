export function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

export function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

// Coordinate mapping: Screen <-> World
// Note: Since our "World" scales recursively, "World" coords are relative to the current interaction level
export function screenToWorld(screenX, screenY, windowWidth, windowHeight, scale) {
    // Center is (0,0)
    const centerX = windowWidth / 2;
    const centerY = windowHeight / 2;

    return {
        x: (screenX - centerX) / scale,
        y: (screenY - centerY) / scale
    };
}

export function generateRandomId() {
    return Math.random().toString(36).substr(2, 9);
}

export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
