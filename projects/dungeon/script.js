    (function() {
        // ---------- DUNGEON ESCAPE GAME ----------
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const statusText = document.getElementById('statusText');
        const keySlot = document.getElementById('keySlot');
        const treasureSlot = document.getElementById('treasureSlot');
        const messageDisplay = document.getElementById('messageDisplay');
        const stepsDisplay = document.getElementById('stepsDisplay');
        const treasuresDisplay = document.getElementById('treasuresDisplay');

        // Game constants
        const TILE_SIZE = 50;
        const MAP_SIZE = 10; // 10x10 grid

        // Game state
        let playerPos = { x: 0, y: 0 };
        let exitPos = { x: 9, y: 9 };
        let keyPos = { x: 0, y: 0 };
        let treasures = [];
        let hasKey = false;
        let treasuresCollected = 0;
        let steps = 0;
        let gameWon = false;
        
        // Map tiles (0 = floor, 1 = wall)
        let map = [];

        // Generate random dungeon
        function generateDungeon() {
            // Initialize empty map
            map = Array(MAP_SIZE).fill().map(() => Array(MAP_SIZE).fill(0));
            
            // Add walls (border)
            for (let i = 0; i < MAP_SIZE; i++) {
                map[0][i] = 1; // top wall
                map[MAP_SIZE-1][i] = 1; // bottom wall
                map[i][0] = 1; // left wall
                map[i][MAP_SIZE-1] = 1; // right wall
            }
            
            // Add random walls (20% of remaining tiles)
            for (let y = 1; y < MAP_SIZE-1; y++) {
                for (let x = 1; x < MAP_SIZE-1; x++) {
                    if (Math.random() < 0.2) {
                        map[y][x] = 1; // wall
                    }
                }
            }
            
            // Ensure start and exit are open
            map[1][1] = 0; // player start
            map[MAP_SIZE-2][MAP_SIZE-2] = 0; // exit area
            
            // Place player at (1,1)
            playerPos = { x: 1, y: 1 };
            
            // Place exit at (8,8)
            exitPos = { x: MAP_SIZE-2, y: MAP_SIZE-2 };
            
            // Place key at random open position
            do {
                keyPos = {
                    x: Math.floor(Math.random() * (MAP_SIZE-2)) + 1,
                    y: Math.floor(Math.random() * (MAP_SIZE-2)) + 1
                };
            } while ((keyPos.x === playerPos.x && keyPos.y === playerPos.y) || 
                     (keyPos.x === exitPos.x && keyPos.y === exitPos.y) ||
                     map[keyPos.y][keyPos.x] === 1);
            
            // Place treasures (3 of them)
            treasures = [];
            for (let t = 0; t < 3; t++) {
                let pos;
                do {
                    pos = {
                        x: Math.floor(Math.random() * (MAP_SIZE-2)) + 1,
                        y: Math.floor(Math.random() * (MAP_SIZE-2)) + 1
                    };
                } while ((pos.x === playerPos.x && pos.y === playerPos.y) || 
                         (pos.x === exitPos.x && pos.y === exitPos.y) ||
                         (pos.x === keyPos.x && pos.y === keyPos.y) ||
                         map[pos.y][pos.x] === 1 ||
                         treasures.some(t => t.x === pos.x && t.y === pos.y));
                
                treasures.push(pos);
            }
        }

        // Draw the game
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw grid and tiles
            for (let y = 0; y < MAP_SIZE; y++) {
                for (let x = 0; x < MAP_SIZE; x++) {
                    const tileX = x * TILE_SIZE;
                    const tileY = y * TILE_SIZE;
                    
                    // Draw tile background
                    if (map[y][x] === 1) {
                        // Wall
                        ctx.fillStyle = '#4a3e3e';
                        ctx.fillRect(tileX, tileY, TILE_SIZE-2, TILE_SIZE-2);
                        
                        // Wall texture
                        ctx.fillStyle = '#6b5a5a';
                        ctx.fillRect(tileX+5, tileY+5, TILE_SIZE-12, TILE_SIZE-12);
                    } else {
                        // Floor
                        ctx.fillStyle = (x + y) % 2 === 0 ? '#5b6b7a' : '#6f7f8f';
                        ctx.fillRect(tileX, tileY, TILE_SIZE-2, TILE_SIZE-2);
                        
                        // Floor pattern
                        ctx.fillStyle = '#ffffff20';
                        ctx.beginPath();
                        ctx.arc(tileX + 15, tileY + 15, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    
                    // Draw grid lines
                    ctx.strokeStyle = '#1a1f30';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                }
            }

            // Draw exit (door)
            ctx.fillStyle = '#8b6f3c';
            ctx.beginPath();
            ctx.arc(exitPos.x * TILE_SIZE + TILE_SIZE/2, exitPos.y * TILE_SIZE + TILE_SIZE/2, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // Door handle
            ctx.fillStyle = '#ffd966';
            ctx.beginPath();
            ctx.arc(exitPos.x * TILE_SIZE + TILE_SIZE/2 - 5, exitPos.y * TILE_SIZE + TILE_SIZE/2 - 5, 4, 0, Math.PI * 2);
            ctx.fill();

            // Draw key (if not collected)
            if (!hasKey) {
                ctx.fillStyle = '#ffaa44';
                ctx.beginPath();
                ctx.arc(keyPos.x * TILE_SIZE + TILE_SIZE/2, keyPos.y * TILE_SIZE + TILE_SIZE/2, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffd966';
                ctx.font = '20px Segoe UI';
                ctx.fillText('🔑', keyPos.x * TILE_SIZE + 15, keyPos.y * TILE_SIZE + 35);
            }

            // Draw treasures
            treasures.forEach(treasure => {
                ctx.fillStyle = '#ff69b4';
                ctx.beginPath();
                ctx.arc(treasure.x * TILE_SIZE + TILE_SIZE/2, treasure.y * TILE_SIZE + TILE_SIZE/2, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.font = '20px Segoe UI';
                ctx.fillText('💎', treasure.x * TILE_SIZE + 15, treasure.y * TILE_SIZE + 33);
            });

            // Draw player
            ctx.fillStyle = '#88ccff';
            ctx.shadowColor = '#aaddff';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(playerPos.x * TILE_SIZE + TILE_SIZE/2, playerPos.y * TILE_SIZE + TILE_SIZE/2, 18, 0, Math.PI * 2);
            ctx.fill();
            
            // Player eyes
            ctx.fillStyle = '#000000';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(playerPos.x * TILE_SIZE + TILE_SIZE/2 - 6, playerPos.y * TILE_SIZE + TILE_SIZE/2 - 5, 3, 0, Math.PI * 2);
            ctx.arc(playerPos.x * TILE_SIZE + TILE_SIZE/2 + 6, playerPos.y * TILE_SIZE + TILE_SIZE/2 - 5, 3, 0, Math.PI * 2);
            ctx.fill();

            // Update UI
            stepsDisplay.textContent = steps;
            treasuresDisplay.textContent = `${treasuresCollected}/3`;
            
            if (hasKey) {
                keySlot.classList.add('filled');
            } else {
                keySlot.classList.remove('filled');
            }
            
            if (treasuresCollected === 3) {
                treasureSlot.classList.add('filled');
            }
        }

        // Move player
        function movePlayer(dx, dy) {
            if (gameWon) {
                messageDisplay.textContent = "✨ You already escaped! Start a new game.";
                return;
            }

            const newX = playerPos.x + dx;
            const newY = playerPos.y + dy;

            // Check boundaries
            if (newX < 0 || newX >= MAP_SIZE || newY < 0 || newY >= MAP_SIZE) {
                messageDisplay.textContent = "❌ Can't move outside the dungeon!";
                return;
            }

            // Check walls
            if (map[newY][newX] === 1) {
                messageDisplay.textContent = "🧱 Hit a wall!";
                return;
            }

            // Move player
            playerPos.x = newX;
            playerPos.y = newY;
            steps++;
            
            // Check for key
            if (!hasKey && playerPos.x === keyPos.x && playerPos.y === keyPos.y) {
                hasKey = true;
                messageDisplay.textContent = "🔑 You found the golden key! Now find the exit!";
                statusText.textContent = "🔑 KEY ACQUIRED";
            }
            
            // Check for treasures
            const treasureIndex = treasures.findIndex(t => t.x === playerPos.x && t.y === playerPos.y);
            if (treasureIndex !== -1) {
                treasures.splice(treasureIndex, 1);
                treasuresCollected++;
                messageDisplay.textContent = "💎 Found a treasure!";
                if (treasuresCollected === 3) {
                    messageDisplay.textContent = "✨ All treasures collected! You're rich!";
                }
            }
            
            // Check for exit
            if (playerPos.x === exitPos.x && playerPos.y === exitPos.y) {
                if (hasKey) {
                    gameWon = true;
                    messageDisplay.textContent = "🎉 YOU ESCAPED! Congratulations!";
                    statusText.textContent = "🏆 VICTORY!";
                } else {
                    messageDisplay.textContent = "🔒 Door is locked! You need the key!";
                }
            }
            
            draw();
        }

        // New game
        function newGame() {
            generateDungeon();
            hasKey = false;
            treasuresCollected = 0;
            steps = 0;
            gameWon = false;
            messageDisplay.textContent = "🗝️ Find the key to escape!";
            statusText.textContent = "🔍 EXPLORE";
            draw();
        }

        // Hint system
        function giveHint() {
            if (gameWon) {
                messageDisplay.textContent = "🎉 You already won! Start a new game.";
                return;
            }
            
            if (!hasKey) {
                const dist = Math.abs(playerPos.x - keyPos.x) + Math.abs(playerPos.y - keyPos.y);
                messageDisplay.textContent = `🔑 Key is ${dist} steps away. ${dist < 3 ? "Very close!" : ""}`;
            } else {
                const dist = Math.abs(playerPos.x - exitPos.x) + Math.abs(playerPos.y - exitPos.y);
                messageDisplay.textContent = `🚪 Exit is ${dist} steps away. ${dist < 3 ? "Almost there!" : ""}`;
            }
        }

        // Event listeners
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp': movePlayer(0, -1); e.preventDefault(); break;
                case 'ArrowDown': movePlayer(0, 1); e.preventDefault(); break;
                case 'ArrowLeft': movePlayer(-1, 0); e.preventDefault(); break;
                case 'ArrowRight': movePlayer(1, 0); e.preventDefault(); break;
                case 'w': case 'W': movePlayer(0, -1); e.preventDefault(); break;
                case 's': case 'S': movePlayer(0, 1); e.preventDefault(); break;
                case 'a': case 'A': movePlayer(-1, 0); e.preventDefault(); break;
                case 'd': case 'D': movePlayer(1, 0); e.preventDefault(); break;
            }
        });

        // Button controls
        document.getElementById('moveN').addEventListener('click', () => movePlayer(0, -1));
        document.getElementById('moveS').addEventListener('click', () => movePlayer(0, 1));
        document.getElementById('moveW').addEventListener('click', () => movePlayer(-1, 0));
        document.getElementById('moveE').addEventListener('click', () => movePlayer(1, 0));
        document.getElementById('moveNW').addEventListener('click', () => movePlayer(-1, -1));
        document.getElementById('moveNE').addEventListener('click', () => movePlayer(1, -1));
        document.getElementById('moveSW').addEventListener('click', () => movePlayer(-1, 1));
        document.getElementById('moveSE').addEventListener('click', () => movePlayer(1, 1));
        document.getElementById('moveWait').addEventListener('click', () => {
            steps++;
            messageDisplay.textContent = "⏺ Waiting...";
            draw();
        });

        document.getElementById('newGameBtn').addEventListener('click', newGame);
        document.getElementById('hintBtn').addEventListener('click', giveHint);

        // Start game
        newGame();
    })();