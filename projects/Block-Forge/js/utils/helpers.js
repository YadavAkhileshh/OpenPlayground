export function shuffleArray(array) {
    // Only shuffle non-fixed items
    // Since our logic handles fixed items separately, we'll just implement a generic shuffle
    // and let the generator handle the fixed logic.
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}