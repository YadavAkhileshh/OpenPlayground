    (function() {
        // ---------- RHYTHM RUNNER GAME ----------
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const pulseCircle = document.getElementById('pulseCircle');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const perfectDisplay = document.getElementById('perfectDisplay');
        const comboDisplay = document.getElementById('comboDisplay');
        const bpmText = document.getElementById('bpmText');
        const startBtn = document.getElementById('startBtn');
        const bpmUp = document.getElementById('bpmUp');
        const bpmDown = document.getElementById('bpmDown');

        // Game constants
        const GROUND_Y = 340;
        const PLAYER_X = 150;
        const PLAYER_WIDTH = 30;
        const PLAYER_HEIGHT = 40;

        // Game state
        let gameActive = false;
        let score = 0;
        let perfectCount = 0;
        let currentCombo = 0;
        let maxCombo = 0;
        let bpm = 120;
        let beatInterval = 60000 / bpm; // ms per beat
        let lastBeat = 0;
        let beatCount = 0;
        
        // Player
        let playerY = GROUND_Y - PLAYER_HEIGHT;
        let playerVY = 0;
        let isJumping = false;
        let canJump = true;
        const GRAVITY = 0.6;
        const JUMP_FORCE = -12;

        // Obstacles (notes)
        let obstacles = [];
        const NOTE_SPEED = 3;
        const NOTE_WIDTH = 20;
        const NOTE_HEIGHT = 30;
        const BEAT_DISTANCE = 400; // pixels from right to left

        // Timing window (in ms)
        const PERFECT_WINDOW = 80;
        const GOOD_WINDOW = 150;

        // Game loop
        let gameLoop = null;
        let beatTimer = null;
        let lastTimestamp = 0;

        // Update BPM
        function updateBPM(newBpm) {
            bpm = Math.max(80, Math.min(200, newBpm));
            bpmText.textContent = bpm;
            beatInterval = 60000 / bpm;
            
            // Restart beat timer if game active
            if (gameActive) {
                if (beatTimer) clearInterval(beatTimer);
                beatTimer = setInterval(beatPulse, beatInterval);
            }
        }

        // Beat pulse animation
        function beatPulse() {
            if (!gameActive) return;
            
            beatCount++;
            pulseCircle.classList.add('beat');
            setTimeout(() => {
                pulseCircle.classList.remove('beat');
            }, 100);

            // Spawn a new note on every 2nd beat (to make it playable)
            if (beatCount % 2 === 0) {
                spawnNote();
            }
        }

        // Spawn a note/obstacle
        function spawnNote() {
            obstacles.push({
                x: 550, // right side
                y: GROUND_Y - NOTE_HEIGHT,
                width: NOTE_WIDTH,
                height: NOTE_HEIGHT,
                active: true
            });
        }

        // Jump action
        function jump() {
            if (!gameActive || !canJump || isJumping) return;
            
            playerVY = JUMP_FORCE;
            isJumping = true;
            canJump = false;
            
            // Check timing with nearest note
            checkTiming();
            
            // Reset canJump after short cooldown
            setTimeout(() => {
                canJump = true;
            }, 200);
        }

        // Check jump timing against nearest note
        function checkTiming() {
            if (obstacles.length === 0) return;

            // Find closest note to player
            let closestNote = null;
            let closestDist = Infinity;

            obstacles.forEach(note => {
                if (!note.active) return;
                const noteCenterX = note.x + NOTE_WIDTH/2;
                const playerCenterX = PLAYER_X + PLAYER_WIDTH/2;
                const dist = Math.abs(noteCenterX - playerCenterX);
                
                if (dist < closestDist) {
                    closestDist = dist;
                    closestNote = note;
                }
            });

            if (!closestNote) return;

            // Check timing based on distance (converted to time)
            // Note: distance to time conversion is approximate
            const distThreshold = NOTE_SPEED * 10; // Rough timing window
            
            if (closestDist < distThreshold * 0.5) {
                // PERFECT!
                score += 100;
                perfectCount++;
                currentCombo++;
                maxCombo = Math.max(maxCombo, currentCombo);
                
                // Remove the note
                closestNote.active = false;
                
                // Visual feedback
                pulseCircle.style.backgroundColor = '#ffaa44';
                setTimeout(() => {
                    pulseCircle.style.backgroundColor = '';
                }, 100);
                
            } else if (closestDist < distThreshold) {
                // GOOD
                score += 50;
                currentCombo = Math.max(1, currentCombo + 0.5);
                closestNote.active = false;
            } else {
                // MISS - reset combo
                currentCombo = 0;
            }

            // Update displays
            updateDisplays();
        }

        // Update all displays
        function updateDisplays() {
            scoreDisplay.textContent = Math.floor(score);
            perfectDisplay.textContent = perfectCount;
            comboDisplay.textContent = maxCombo;
        }

        // Draw everything
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Sky gradient
            const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
            sky.addColorStop(0, '#2a3366');
            sky.addColorStop(1, '#4a5599');
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, canvas.width, GROUND_Y);

            // Ground
            ctx.fillStyle = '#3f4e8c';
            ctx.fillRect(0, GROUND_Y, canvas.width, 60);
            
            // Ground pattern (beat lines)
            ctx.fillStyle = '#5f6db3';
            for (let i = 0; i < 8; i++) {
                const x = (i * 75 + beatCount * 5) % 600;
                ctx.fillRect(x, GROUND_Y, 10, 10);
            }

            // Draw notes (obstacles)
            obstacles.forEach(note => {
                if (!note.active) return;
                
                // Pulse effect based on beat
                const pulseScale = beatCount % 2 === 0 ? 1.2 : 1;
                ctx.fillStyle = '#ffaa44';
                ctx.shadowColor = '#ffdd88';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.roundRect(note.x, note.y, note.width, note.height * pulseScale, 8);
                ctx.fill();
                
                // Inner glow
                ctx.fillStyle = '#ffffaa';
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.roundRect(note.x + 3, note.y + 3, note.width - 6, note.height * pulseScale - 6, 5);
                ctx.fill();
            });

            // Draw player
            ctx.shadowColor = '#88aaff';
            ctx.shadowBlur = 20;
            
            // Body
            ctx.fillStyle = '#88ccff';
            ctx.beginPath();
            ctx.roundRect(PLAYER_X, playerY, PLAYER_WIDTH, PLAYER_HEIGHT, 10);
            ctx.fill();
            
            // Head
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(PLAYER_X + PLAYER_WIDTH/2, playerY - 5, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(PLAYER_X + PLAYER_WIDTH/2 - 5, playerY - 9, 2, 0, Math.PI * 2);
            ctx.arc(PLAYER_X + PLAYER_WIDTH/2 + 5, playerY - 9, 2, 0, Math.PI * 2);
            ctx.fill();

            // Reset shadow
            ctx.shadowBlur = 0;
        }

        // Update game state
        function update() {
            if (!gameActive) return;

            // Player physics
            if (isJumping) {
                playerVY += GRAVITY;
                playerY += playerVY;

                if (playerY >= GROUND_Y - PLAYER_HEIGHT) {
                    playerY = GROUND_Y - PLAYER_HEIGHT;
                    playerVY = 0;
                    isJumping = false;
                }
            }

            // Move obstacles
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const note = obstacles[i];
                if (!note.active) {
                    obstacles.splice(i, 1);
                    continue;
                }

                note.x -= NOTE_SPEED;

                // Remove if off screen
                if (note.x + note.width < 0) {
                    obstacles.splice(i, 1);
                    // Missed note = combo break
                    currentCombo = 0;
                }
            }

            draw();
        }

        // Start game
        function startGame() {
            gameActive = true;
            score = 0;
            perfectCount = 0;
            currentCombo = 0;
            maxCombo = 0;
            obstacles = [];
            beatCount = 0;
            
            updateDisplays();
            
            startBtn.disabled = true;
            bpmUp.disabled = true;
            bpmDown.disabled = true;
            
            // Start beat timer
            if (beatTimer) clearInterval(beatTimer);
            beatTimer = setInterval(beatPulse, beatInterval);
            
            // Start game loop
            if (gameLoop) cancelAnimationFrame(gameLoop);
            gameLoop = requestAnimationFrame(function loop() {
                update();
                gameLoop = requestAnimationFrame(loop);
            });
        }

        // Stop game
        function stopGame() {
            gameActive = false;
            
            if (beatTimer) {
                clearInterval(beatTimer);
                beatTimer = null;
            }
            
            if (gameLoop) {
                cancelAnimationFrame(gameLoop);
                gameLoop = null;
            }
            
            startBtn.disabled = false;
            bpmUp.disabled = false;
            bpmDown.disabled = false;
            
            // Reset player
            playerY = GROUND_Y - PLAYER_HEIGHT;
            playerVY = 0;
            isJumping = false;
            
            draw();
        }

        // Helper for rounded rect
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            this.moveTo(x + r, y);
            this.lineTo(x + w - r, y);
            this.quadraticCurveTo(x + w, y, x + w, y + r);
            this.lineTo(x + w, y + h - r);
            this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            this.lineTo(x + r, y + h);
            this.quadraticCurveTo(x, y + h, x, y + h - r);
            this.lineTo(x, y + r);
            this.quadraticCurveTo(x, y, x + r, y);
            return this;
        };

        // Event listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                jump();
            }
        });

        canvas.addEventListener('click', jump);
        
        startBtn.addEventListener('click', startGame);
        
        bpmUp.addEventListener('click', () => {
            updateBPM(bpm + 5);
        });
        
        bpmDown.addEventListener('click', () => {
            updateBPM(bpm - 5);
        });

        // Initial draw
        draw();
    })();