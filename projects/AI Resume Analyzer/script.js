function normalizeText(text) {
    return text
        .toLowerCase()
        // keep + . # for tech skills
        .replace(/[^a-z0-9+.#\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 0);
}
