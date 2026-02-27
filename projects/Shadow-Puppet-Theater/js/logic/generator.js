import { generateRandomColor, interpolateColor, rgbString } from '../utils/color.js';
import { shuffleArray } from '../utils/helpers.js';

export function generateLevel(size) {
    // 1. Pick 4 corner colors 
    const tl = generateRandomColor(); // Top Left
    const tr = generateRandomColor(); // Top Right
    const bl = generateRandomColor(); // Bottom Left
    const br = generateRandomColor(); // Bottom Right

    const solvedGrid = [];

    // 2. Generate Gradient Grid
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const xFactor = x / (size - 1);
            const yFactor = y / (size - 1);

            // Interpolate Top and Bottom edges X-wise
            const topColor = interpolateColor(tl, tr, xFactor);
            const bottomColor = interpolateColor(bl, br, xFactor);

            // Interpolate Y-wise
            const finalColor = interpolateColor(topColor, bottomColor, yFactor);
            
            // Is this a corner?
            const isCorner = (x===0 && y===0) || (x===size-1 && y===0) || 
                             (x===0 && y===size-1) || (x===size-1 && y===size-1);

            solvedGrid.push({
                id: y * size + x, // Original Correct Index
                color: rgbString(finalColor),
                isFixed: isCorner
            });
        }
    }

    // 3. Shuffle (keep corners fixed)
    const corners = solvedGrid.filter(t => t.isFixed);
    let movable = solvedGrid.filter(t => !t.isFixed);
    
    movable = shuffleArray(movable);

    // Reassemble
    const finalGrid = Array(size * size).fill(null);
    
    // Place corners
    solvedGrid.forEach((t, i) => {
        if (t.isFixed) finalGrid[i] = t;
    });

    // Place movable
    let mIdx = 0;
    for(let i=0; i<finalGrid.length; i++) {
        if (!finalGrid[i]) {
            finalGrid[i] = movable[mIdx++];
        }
    }

    return finalGrid;
}