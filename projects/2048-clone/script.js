    (function() {
      const SIZE = 4;
      let grid = [];
      let score = 0;
      let gameOver = false;

      // DOM
      const gridContainer = document.getElementById('gridContainer');
      const scoreDisplay = document.getElementById('scoreDisplay');
      const hintDisplay = document.getElementById('hintDisplay');
      const hintBtn = document.getElementById('hintBtn');
      const newGameBtn = document.getElementById('newGameBtn');

      // initialize grid
      function initGrid() {
        grid = Array(SIZE).fill().map(() => Array(SIZE).fill(0));
        score = 0;
        gameOver = false;
        addRandomTile();
        addRandomTile();
        renderGrid();
        updateScore();
        hintDisplay.innerText = '—';
      }

      // add random 2 or 4
      function addRandomTile() {
        const empty = [];
        for (let r = 0; r < SIZE; r++) {
          for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) empty.push([r, c]);
          }
        }
        if (empty.length === 0) return;
        const [r, c] = empty[Math.floor(Math.random() * empty.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
      }

      // render grid
      function renderGrid() {
        gridContainer.innerHTML = '';
        for (let r = 0; r < SIZE; r++) {
          const rowDiv = document.createElement('div');
          rowDiv.className = 'grid-row';
          for (let c = 0; c < SIZE; c++) {
            const val = grid[r][c];
            const cellDiv = document.createElement('div');
            cellDiv.className = `grid-cell ${val ? 'tile-' + val : ''}`;
            cellDiv.textContent = val || '';
            rowDiv.appendChild(cellDiv);
          }
          gridContainer.appendChild(rowDiv);
        }
      }

      // move and merge logic
      function moveLeft() {
        let moved = false;
        for (let r = 0; r < SIZE; r++) {
          const row = grid[r].filter(v => v !== 0);
          const merged = [];
          for (let i = 0; i < row.length; i++) {
            if (i < row.length - 1 && row[i] === row[i + 1]) {
              merged.push(row[i] * 2);
              score += row[i] * 2;
              i++; // skip next
            } else {
              merged.push(row[i]);
            }
          }
          while (merged.length < SIZE) merged.push(0);
          if (JSON.stringify(grid[r]) !== JSON.stringify(merged)) moved = true;
          grid[r] = merged;
        }
        return moved;
      }

      function moveRight() {
        let moved = false;
        for (let r = 0; r < SIZE; r++) {
          const row = grid[r].filter(v => v !== 0);
          const merged = [];
          for (let i = row.length - 1; i >= 0; i--) {
            if (i > 0 && row[i] === row[i - 1]) {
              merged.unshift(row[i] * 2);
              score += row[i] * 2;
              i--; // skip next
            } else {
              merged.unshift(row[i]);
            }
          }
          while (merged.length < SIZE) merged.unshift(0);
          if (JSON.stringify(grid[r]) !== JSON.stringify(merged)) moved = true;
          grid[r] = merged;
        }
        return moved;
      }

      function moveUp() {
        let moved = false;
        for (let c = 0; c < SIZE; c++) {
          const col = [];
          for (let r = 0; r < SIZE; r++) col.push(grid[r][c]);
          const filtered = col.filter(v => v !== 0);
          const merged = [];
          for (let i = 0; i < filtered.length; i++) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
              merged.push(filtered[i] * 2);
              score += filtered[i] * 2;
              i++;
            } else {
              merged.push(filtered[i]);
            }
          }
          while (merged.length < SIZE) merged.push(0);
          for (let r = 0; r < SIZE; r++) {
            if (grid[r][c] !== merged[r]) moved = true;
            grid[r][c] = merged[r];
          }
        }
        return moved;
      }

      function moveDown() {
        let moved = false;
        for (let c = 0; c < SIZE; c++) {
          const col = [];
          for (let r = 0; r < SIZE; r++) col.push(grid[r][c]);
          const filtered = col.filter(v => v !== 0);
          const merged = [];
          for (let i = filtered.length - 1; i >= 0; i--) {
            if (i > 0 && filtered[i] === filtered[i - 1]) {
              merged.unshift(filtered[i] * 2);
              score += filtered[i] * 2;
              i--;
            } else {
              merged.unshift(filtered[i]);
            }
          }
          while (merged.length < SIZE) merged.unshift(0);
          for (let r = 0; r < SIZE; r++) {
            if (grid[r][c] !== merged[r]) moved = true;
            grid[r][c] = merged[r];
          }
        }
        return moved;
      }

      // check if game over
      function isGameOver() {
        for (let r = 0; r < SIZE; r++) {
          for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) return false;
            if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false;
            if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false;
          }
        }
        return true;
      }

      // make move with direction
      function makeMove(direction) {
        if (gameOver) return false;

        let moved = false;
        switch (direction) {
          case 'left': moved = moveLeft(); break;
          case 'right': moved = moveRight(); break;
          case 'up': moved = moveUp(); break;
          case 'down': moved = moveDown(); break;
        }

        if (moved) {
          addRandomTile();
          renderGrid();
          updateScore();
          gameOver = isGameOver();
          if (gameOver) hintDisplay.innerText = '💀 game over';
        }
        return moved;
      }

      function updateScore() {
        scoreDisplay.innerText = score;
      }

      // ----- AI HINT system (advanced) -----
      function evaluateBoard(board) {
        // heuristic: sum of values + merge potential
        let sum = 0;
        let empty = 0;
        let smooth = 0;
        for (let r = 0; r < SIZE; r++) {
          for (let c = 0; c < SIZE; c++) {
            const val = board[r][c];
            sum += val;
            if (val === 0) empty++;
            // smoothness: adjacent same values are good
            if (c < SIZE - 1 && val === board[r][c + 1] && val !== 0) smooth += val * 2;
            if (r < SIZE - 1 && val === board[r + 1][c] && val !== 0) smooth += val * 2;
          }
        }
        return sum + empty * 100 + smooth * 2;
      }

      function cloneGrid() {
        return grid.map(row => [...row]);
      }

      function getBestHint() {
        if (gameOver) return 'game over';

        const directions = ['up', 'down', 'left', 'right'];
        let bestDir = null;
        let bestScore = -Infinity;

        for (let dir of directions) {
          const savedGrid = cloneGrid();
          const savedScore = score;

          let moved = false;
          switch (dir) {
            case 'left': moved = moveLeft(); break;
            case 'right': moved = moveRight(); break;
            case 'up': moved = moveUp(); break;
            case 'down': moved = moveDown(); break;
          }

          if (moved) {
            // evaluate resulting board
            const evalScore = evaluateBoard(grid);
            if (evalScore > bestScore) {
              bestScore = evalScore;
              bestDir = dir;
            }
          }

          // restore
          grid = savedGrid;
          score = savedScore;
        }

        if (bestDir) {
          const arrows = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' };
          return arrows[bestDir];
        }
        return '⚠️ stuck';
      }

      // hint button
      hintBtn.addEventListener('click', () => {
        const hint = getBestHint();
        hintDisplay.innerText = hint;
      });

      // move buttons
      document.getElementById('moveUp').addEventListener('click', () => makeMove('up'));
      document.getElementById('moveDown').addEventListener('click', () => makeMove('down'));
      document.getElementById('moveLeft').addEventListener('click', () => makeMove('left'));
      document.getElementById('moveRight').addEventListener('click', () => makeMove('right'));

      // keyboard support
      window.addEventListener('keydown', (e) => {
        const key = e.key;
        e.preventDefault();
        if (key.startsWith('Arrow')) {
          const dir = key.slice(5).toLowerCase();
          makeMove(dir);
        }
      });

      newGameBtn.addEventListener('click', () => {
        initGrid();
      });

      // start game
      initGrid();
    })();