/**
 * Generates a maze using Recursive Division.
 */
export function recursiveDivisionMaze(grid, startNode, endNode) {
    // 1. Clear existing walls / weights first (keep start/end)
    grid.clearBoard();

    // 2. Add border walls
    for (let r = 0; r < grid.rows; r++) {
        grid.nodes[r][0].isWall = true;
        grid.nodes[r][grid.cols - 1].isWall = true;
    }
    for (let c = 0; c < grid.cols; c++) {
        grid.nodes[0][c].isWall = true;
        grid.nodes[grid.rows - 1][c].isWall = true;
    }

    // 3. Recursive division
    divide(grid, 1, grid.rows - 2, 1, grid.cols - 2);

    // Ensure start/end are not walls
    startNode.isWall = false;
    endNode.isWall = false;
}

function divide(grid, rowStart, rowEnd, colStart, colEnd) {
    if (rowEnd < rowStart || colEnd < colStart) return;

    if (rowEnd - rowStart > colEnd - colStart) {
        divideHorizontal(grid, rowStart, rowEnd, colStart, colEnd);
    } else {
        divideVertical(grid, rowStart, rowEnd, colStart, colEnd);
    }
}

function divideHorizontal(grid, rowStart, rowEnd, colStart, colEnd) {
    const splitRow = Math.floor(Math.random() * (rowEnd - rowStart + 1)) + rowStart;
    // Keep internal walls on even indices if possible to avoid blocking paths in some variants, 
    // but for simple grid, just avoiding blocking *everything*. 
    // Actually, "recursive division" normally mandates walls on even coordinates and passages on odd, or vice versa.
    // Let's simplify: just draw a wall and a hole.

    const holeCol = Math.floor(Math.random() * (colEnd - colStart + 1)) + colStart;

    for (let c = colStart; c <= colEnd; c++) {
        if (c !== holeCol) {
            grid.nodes[splitRow][c].isWall = true;
        }
    }

    // Recurse
    divide(grid, rowStart, splitRow - 1, colStart, colEnd);
    divide(grid, splitRow + 1, rowEnd, colStart, colEnd);
}

function divideVertical(grid, rowStart, rowEnd, colStart, colEnd) {
    const splitCol = Math.floor(Math.random() * (colEnd - colStart + 1)) + colStart;
    const holeRow = Math.floor(Math.random() * (rowEnd - rowStart + 1)) + rowStart;

    for (let r = rowStart; r <= rowEnd; r++) {
        if (r !== holeRow) {
            grid.nodes[r][splitCol].isWall = true;
        }
    }

    // Recurse
    divide(grid, rowStart, rowEnd, colStart, splitCol - 1);
    divide(grid, rowStart, rowEnd, splitCol + 1, colEnd);
}
