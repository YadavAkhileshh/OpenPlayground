const LANES = [100, 300, 500];
const PLAYER_WIDTH = 50;
const OBSTACLE_WIDTH = 50;

let gameState = {
  running: false,
  score: 0,
  speed: 1.0,
  currentLane: 1,
  obstacles: [],
  lastSpawnTime: 0,
  lastObstacleY: -200
};

// Unpredictability system for controlled chaos
let unpredictabilityState = {
  speedSurgeActive: false,
  speedSurgeEndTime: 0,
  lastEventTime: 0,
  nextEventThreshold: 0,
  trackShakeActive: false,
  messageQueue: [],
  activeMessage: null
};

// Mistake-based learning model
const learningModel = {
  totalMistakes: 0,
  lanePreferences: [0, 0, 0],
  laneCollisions: [0, 0, 0],
  consecutiveLaneTime: { lane: 1, time: 0 },
  delayedSwitches: 0,
  lastLaneChange: Date.now(),
  currentLaneDuration: 0,
  preferredLane: -1,
  recentObstacles: [],
  // Rolling averages for mistake tracking
  mistakeRollingAverage: 0,
  mistakeSampleCount: 0,
  maxMistakeSamples: 10,
  laneCollisionRollingSums: [0, 0, 0],
  laneCollisionSampleCounts: [0, 0, 0]
};

let playerEl, animationId, trackEl, messageEl;

// Touch control state for mobile
let touchState = {
  startX: 0,
  startY: 0,
  isActive: false
};

// AI personality messages for unpredictable events
const aiMessages = {
  speedSurge: [
    "Too comfortable, huh?",
    "Let's pick up the pace.",
    "Wake up call!"
  ],
  trackShake: [
    "Did you feel that?",
    "Oops, my hand slipped.",
    "Just keeping you on your toes."
  ],
  collision: [
    "Yeah… I'm not letting you win that easily.",
    "Nice try.",
    "Almost had it.",
    "Getting predictable, aren't we?"
  ],
  nearMiss: [
    "That was close!",
    "Lucky.",
    "Barely made it."
  ]
};

function init() {
  playerEl = document.getElementById('player');
  trackEl = document.querySelector('.track');
  messageEl = document.getElementById('aiMessage');
  updatePlayerPosition();
  setupEventListeners();
}

function setupEventListeners() {
  document.addEventListener('keydown', handleKeyPress);
  
  // Touch controls for mobile
  const gameContainer = document.querySelector('.game-container');
  gameContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
  gameContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
  gameContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function handleKeyPress(e) {
  if (!gameState.running) return;

  switch(e.key) {
    case 'ArrowLeft':
      if (gameState.currentLane > 0) {
        // Track lane change timing
        const timeSinceLastChange = Date.now() - learningModel.lastLaneChange;
        if (timeSinceLastChange < 200) { // Player is switching quickly
          learningModel.delayedSwitches = Math.max(0, learningModel.delayedSwitches - 1);
        } else {
          // Check for potential last-moment lane switch to avoid obstacle in the old lane
          if (checkLastMomentSwitchInLane(gameState.currentLane)) {
            // Player waited too long to switch from this lane
            learningModel.delayedSwitches++; // Player took too long to react
          } else {
            learningModel.delayedSwitches++; // Regular slow reaction
          }
        }
        
        gameState.currentLane--;
        updatePlayerPosition();
        learningModel.lanePreferences[gameState.currentLane]++;
        learningModel.lastLaneChange = Date.now();
        
        // Update consecutive lane time
        if (learningModel.consecutiveLaneTime.lane !== gameState.currentLane) {
          learningModel.consecutiveLaneTime = { lane: gameState.currentLane, time: 0 };
        }
      }
      break;
    case 'ArrowRight':
      if (gameState.currentLane < 2) {
        // Track lane change timing
        const timeSinceLastChange = Date.now() - learningModel.lastLaneChange;
        if (timeSinceLastChange < 200) { // Player is switching quickly
          learningModel.delayedSwitches = Math.max(0, learningModel.delayedSwitches - 1);
        } else {
          // Check for potential last-moment lane switch to avoid obstacle in the old lane
          if (checkLastMomentSwitchInLane(gameState.currentLane)) {
            // Player waited too long to switch from this lane
            learningModel.delayedSwitches++; // Player took too long to react
          } else {
            learningModel.delayedSwitches++; // Regular slow reaction
          }
        }
        
        gameState.currentLane++;
        updatePlayerPosition();
        learningModel.lanePreferences[gameState.currentLane]++;
        learningModel.lastLaneChange = Date.now();
        
        // Update consecutive lane time
        if (learningModel.consecutiveLaneTime.lane !== gameState.currentLane) {
          learningModel.consecutiveLaneTime = { lane: gameState.currentLane, time: 0 };
        }
      }
      break;
  }
}

function updatePlayerPosition() {
  playerEl.style.left = LANES[gameState.currentLane] + 'px';
  // Note: CSS transform handles centering of player in lane
}

function handleTouchStart(e) {
  if (!gameState.running) return;
  e.preventDefault();
  
  const touch = e.touches[0];
  touchState.startX = touch.clientX;
  touchState.startY = touch.clientY;
  touchState.isActive = true;
}

function handleTouchMove(e) {
  if (!gameState.running || !touchState.isActive) return;
  e.preventDefault();
}

function handleTouchEnd(e) {
  if (!gameState.running || !touchState.isActive) return;
  e.preventDefault();
  
  const touch = e.changedTouches[0];
  const deltaX = touch.clientX - touchState.startX;
  const deltaY = touch.clientY - touchState.startY;
  
  // Determine if it's a horizontal swipe (ignore vertical swipes)
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
    if (deltaX > 0 && gameState.currentLane < 2) {
      // Swipe right
      const timeSinceLastChange = Date.now() - learningModel.lastLaneChange;
      if (timeSinceLastChange < 200) {
        learningModel.delayedSwitches = Math.max(0, learningModel.delayedSwitches - 1);
      } else {
        if (checkLastMomentSwitchInLane(gameState.currentLane)) {
          learningModel.delayedSwitches++;
        } else {
          learningModel.delayedSwitches++;
        }
      }
      
      gameState.currentLane++;
      updatePlayerPosition();
      learningModel.lanePreferences[gameState.currentLane]++;
      learningModel.lastLaneChange = Date.now();
      
      if (learningModel.consecutiveLaneTime.lane !== gameState.currentLane) {
        learningModel.consecutiveLaneTime = { lane: gameState.currentLane, time: 0 };
      }
    } else if (deltaX < 0 && gameState.currentLane > 0) {
      // Swipe left
      const timeSinceLastChange = Date.now() - learningModel.lastLaneChange;
      if (timeSinceLastChange < 200) {
        learningModel.delayedSwitches = Math.max(0, learningModel.delayedSwitches - 1);
      } else {
        if (checkLastMomentSwitchInLane(gameState.currentLane)) {
          learningModel.delayedSwitches++;
        } else {
          learningModel.delayedSwitches++;
        }
      }
      
      gameState.currentLane--;
      updatePlayerPosition();
      learningModel.lanePreferences[gameState.currentLane]++;
      learningModel.lastLaneChange = Date.now();
      
      if (learningModel.consecutiveLaneTime.lane !== gameState.currentLane) {
        learningModel.consecutiveLaneTime = { lane: gameState.currentLane, time: 0 };
      }
    }
  }
  
  touchState.isActive = false;
}

function checkLastMomentSwitchInLane(laneIndex) {
  // Check if there's an obstacle in the specified lane that's dangerously close to the player
  const playerBottomY = 550; // Bottom of player (same as in collision detection)
  
  for (let obstacle of gameState.obstacles) {
    if (obstacle.lane === laneIndex) {
      // Calculate obstacle's screen position using corrected coordinate system
      const obstacleScreenTop = obstacle.y;
      const obstacleScreenBottom = obstacle.y + (obstacle.type === 'high' ? 50 : 32);
      
      // If obstacle is very close to the player (within a threshold where collision is imminent)
      if (obstacleScreenBottom > playerBottomY - 80 && obstacleScreenTop < playerBottomY) { // Within collision range
        // This indicates a last-moment avoidance attempt
        return true;
      }
    }
  }
  return false;
}

function startGame() {
  document.getElementById('startScreen').style.display = 'none';
  gameState.running = true;
  gameState.score = 0;
  gameState.speed = 1.0;
  gameState.currentLane = 1;
  gameState.obstacles = [];
  gameState.lastSpawnTime = Date.now();
  
  // Reset unpredictability system
  unpredictabilityState.speedSurgeActive = false;
  unpredictabilityState.lastEventTime = Date.now();
  unpredictabilityState.nextEventThreshold = getRandomEventThreshold();
  unpredictabilityState.trackShakeActive = false;
  unpredictabilityState.messageQueue = [];
  unpredictabilityState.activeMessage = null;
  hideMessage();
  
  updatePlayerPosition();
  gameLoop();
}

function restartGame() {
  document.getElementById('gameOver').classList.remove('show');
  clearObstacles();
  startGame();
}

function gameLoop() {
  if (!gameState.running) return;

  const now = Date.now();
  
  // Check for unpredictable events
  checkUnpredictableEvents(now);
  
  // Calculate base speed (with potential surge multiplier)
  let baseSpeed = 1.0 + (gameState.score / 500);
  
  // Apply speed surge if active
  if (unpredictabilityState.speedSurgeActive) {
    if (now >= unpredictabilityState.speedSurgeEndTime) {
      unpredictabilityState.speedSurgeActive = false;
      trackEl.classList.remove('speed-surge');
    } else {
      baseSpeed *= 1.5; // 50% speed increase during surge
    }
  }
  
  gameState.speed = baseSpeed;
  document.getElementById('speed').textContent = gameState.speed.toFixed(1);

  // Spawn obstacles based on adaptive logic
  if (now - gameState.lastSpawnTime > getAdaptiveSpawnInterval()) {
    spawnAdaptiveObstacle();
    gameState.lastSpawnTime = now;
  }

  // Update obstacles
  updateObstacles();

  // Check collisions and near misses
  checkCollisions();
  checkNearMisses();

  // Update score
  gameState.score++;
  document.getElementById('score').textContent = Math.floor(gameState.score / 10);

  // Track lane preference
  learningModel.consecutiveLaneTime.time++;
  if (learningModel.consecutiveLaneTime.lane !== gameState.currentLane) {
    learningModel.consecutiveLaneTime = { lane: gameState.currentLane, time: 0 };
  }

  updateAdaptationUI();

  animationId = requestAnimationFrame(gameLoop);
}

function getAdaptiveSpawnInterval() {
  // Base interval decreases with speed
  let interval = Math.max(800 - (gameState.speed * 100), 400);
  
  // Calculate confidence level based on total mistakes and patterns
  const confidenceLevel = Math.min(1, learningModel.totalMistakes / 20);
  
  // Adjust based on player's recent performance
  if (learningModel.totalMistakes > 5) {
    // As confidence in player patterns increases, spawn slightly faster
    interval *= (1.0 - (confidenceLevel * 0.2)); // Up to 20% faster spawning as AI gets smarter
  }
  
  return interval;
}

function spawnAdaptiveObstacle() {
  // Select lane and type for the new obstacle based on AI analysis
  const lane = selectAdaptiveLane();
  const type = selectAdaptiveType();
  
  const obstacle = {
    lane: lane,
    type: type,
    y: -100, // Start just off-screen above
    element: null
  };

  const obstacleEl = document.createElement('div');
  obstacleEl.className = `obstacle obstacle-${obstacle.type}`;
  obstacleEl.style.left = LANES[obstacle.lane] + 'px';
  obstacleEl.style.top = obstacle.y + 'px';
  
  document.getElementById('laneContainer').appendChild(obstacleEl);
  obstacle.element = obstacleEl;
  gameState.obstacles.push(obstacle);

  // Track for learning - only track this obstacle for future AI adjustments
  learningModel.recentObstacles.push({
    lane: obstacle.lane,
    type: obstacle.type,
    spawnTime: Date.now(),
    id: Date.now() // Unique identifier
  });
  if (learningModel.recentObstacles.length > 10) {
    learningModel.recentObstacles.shift();
  }

  gameState.lastObstacleY = obstacle.y;
}

function selectAdaptiveLane() {
  // Analyze player's lane preferences
  const totalPreference = learningModel.lanePreferences.reduce((a, b) => a + b, 0);
  
  // Calculate confidence level based on total mistakes and patterns
  const confidenceLevel = Math.min(1, learningModel.totalMistakes / 20);
  
  if (totalPreference === 0 || Math.random() > confidenceLevel) {
    // Early game or low confidence: distribute evenly
    return Math.floor(gameState.score / 100) % 3;
  }

  // If player has a predictable pattern, exploit it
  if (learningModel.preferredLane !== -1 && confidenceLevel > 0.3) {
    return learningModel.preferredLane;
  }

  // If player stays in one lane too long, target it
  if (learningModel.consecutiveLaneTime.time > 30 && confidenceLevel > 0.2) {
    return learningModel.consecutiveLaneTime.lane;
  }

  // Calculate weighted scores based on normalized collision data
  const normalizedLaneCollisions = [
    learningModel.laneCollisionRollingSums[0] / Math.max(1, learningModel.laneCollisionSampleCounts[0]),
    learningModel.laneCollisionRollingSums[1] / Math.max(1, learningModel.laneCollisionSampleCounts[1]),
    learningModel.laneCollisionRollingSums[2] / Math.max(1, learningModel.laneCollisionSampleCounts[2])
  ];
  
  // If player takes too long to switch lanes, target where they were
  if (learningModel.delayedSwitches > 2 && confidenceLevel > 0.4) {
    // Calculate probability based on lane preferences and normalized collisions
    const laneScores = [];
    for (let i = 0; i < 3; i++) {
      // Higher score means more likely to place obstacle
      // Prioritize lanes that player frequents but collides with
      const preferenceScore = learningModel.lanePreferences[i] * 0.7;
      const collisionScore = normalizedLaneCollisions[i] * 2.0;
      const totalScore = preferenceScore + collisionScore;
      laneScores.push(totalScore);
    }
    
    // Return lane with highest score
    return laneScores.indexOf(Math.max(...laneScores));
  }

  // Otherwise, target lanes with more normalized collisions (where player struggles)
  return normalizedLaneCollisions.indexOf(Math.max(...normalizedLaneCollisions));
}

function selectAdaptiveType() {
  // In lane-based gameplay, obstacle height is determined by the AI based on player patterns
  // Since there's no jumping/sliding, we can vary the obstacle heights to challenge player
  
  // As player makes more mistakes, increase the variety of obstacle types
  const mistakeRatio = learningModel.totalMistakes / 10;
  
  // If player has a lot of mistakes, vary the obstacle heights more randomly
  if (mistakeRatio > 0.5) {
    return Math.random() > 0.5 ? 'high' : 'low';
  }
  
  // Otherwise, use a pattern based on score to add some unpredictability
  return gameState.score % 7 < 4 ? 'high' : 'low';
}

function updateObstacles() {
  for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
    const obstacle = gameState.obstacles[i];
    obstacle.y += 3 * gameState.speed;
    // Convert internal coordinate to screen coordinate
    obstacle.element.style.top = obstacle.y + 'px';

    // Remove off-screen obstacles that have passed the player
    if (obstacle.y > 700) { // Changed from 600 to 700 to ensure obstacles go fully past player
      obstacle.element.remove();
      gameState.obstacles.splice(i, 1);
    }
  }
}

function checkCollisions() {
  // Player position: CSS sets bottom: 50px, and player height is 50px
  // So player's bottom is at screen Y = 50 from bottom = 600-50 = 550
  // Player's top is at screen Y = 550 - 50 = 500
  const playerTopY = 500; // Top of player (from top of screen)
  const playerBottomY = 550; // Bottom of player (from top of screen)
  const playerWidth = 50;

  for (let obstacle of gameState.obstacles) {
    if (obstacle.lane !== gameState.currentLane) continue;

    // Calculate obstacle's screen position
    // Internal coordinate system: y increases downward as obstacles move toward player
    // Screen coordinate system: obstacle element's top position
    const obstacleScreenTop = obstacle.y; // Direct mapping since internal y is screen y
    const obstacleScreenBottom = obstacle.y + (obstacle.type === 'high' ? 50 : 32);
    const obstacleWidth = OBSTACLE_WIDTH;
    
    // Check for collision in both X and Y axes
    // Both player and obstacle are in the same lane, so X positions should overlap
    const xOverlap = true; // Since both are in the same lane, they occupy the same X range
    const yOverlap = playerTopY < obstacleScreenBottom && playerBottomY > obstacleScreenTop;
    
    if (xOverlap && yOverlap) {
      // Collision detected
      analyzeMistake(obstacle);
      
      // Show AI personality message if event was active
      if (unpredictabilityState.speedSurgeActive || unpredictabilityState.trackShakeActive) {
        showMessage(getRandomMessage(aiMessages.collision), 2000);
      }
      
      endGame();
      return;
    }
  }
}

function analyzeMistake(obstacle) {
  // Update rolling average for total mistakes
  learningModel.mistakeRollingAverage = ((learningModel.mistakeRollingAverage * learningModel.mistakeSampleCount) + 1) / 
    Math.min(learningModel.maxMistakeSamples, learningModel.mistakeSampleCount + 1);
  if (learningModel.mistakeSampleCount < learningModel.maxMistakeSamples) {
    learningModel.mistakeSampleCount++;
  }
  
  learningModel.totalMistakes++;
  
  // Update rolling sum for lane collisions
  learningModel.laneCollisionRollingSums[obstacle.lane]++;
  if (learningModel.laneCollisionSampleCounts[obstacle.lane] < learningModel.maxMistakeSamples) {
    learningModel.laneCollisionSampleCounts[obstacle.lane]++;
  } else {
    // Normalize by reducing the oldest samples to prevent overreaction
    learningModel.laneCollisions[obstacle.lane] = Math.max(0, learningModel.laneCollisions[obstacle.lane] - 1);
  }
  
  learningModel.laneCollisions[obstacle.lane]++;
  
  // Update the AI based on the confirmed mistake
  updateAIOnMistake(obstacle);
}

function updateAIOnMistake(obstacle) {
  // Identify patterns in player's mistakes
  const mostPreferredLane = learningModel.lanePreferences.indexOf(Math.max(...learningModel.lanePreferences));
  
  // Calculate normalized lane collision values using rolling averages
  const normalizedLaneCollisions = [
    learningModel.laneCollisionRollingSums[0] / Math.max(1, learningModel.laneCollisionSampleCounts[0]),
    learningModel.laneCollisionRollingSums[1] / Math.max(1, learningModel.laneCollisionSampleCounts[1]),
    learningModel.laneCollisionRollingSums[2] / Math.max(1, learningModel.laneCollisionSampleCounts[2])
  ];
  
  const mostCollidedLane = normalizedLaneCollisions.indexOf(Math.max(...normalizedLaneCollisions));
  
  // If player repeatedly stays in one lane, target that lane more in future
  if (learningModel.consecutiveLaneTime.time > 30 && learningModel.consecutiveLaneTime.lane === mostPreferredLane) {
    learningModel.preferredLane = mostPreferredLane;
  }
  
  // If player keeps colliding in a specific lane, they might be struggling with that lane
  // Increase targeting of this lane in future obstacles
  if (mostCollidedLane === obstacle.lane) {
    // Increase targeting of this lane since player struggles here
    // But normalize the weight to prevent overreaction
    const normalizedWeight = Math.min(5, 2 + (learningModel.totalMistakes / 10));
    learningModel.laneCollisions[obstacle.lane] += normalizedWeight;
  }
  
  // If player takes too long to switch lanes, target the lanes they're avoiding
  if (learningModel.delayedSwitches > 2) {
    // Find the least used lane and target it in future obstacles
    const leastUsedLane = learningModel.lanePreferences.indexOf(Math.min(...learningModel.lanePreferences));
    if (leastUsedLane !== -1) {
      learningModel.lanePreferences[leastUsedLane] += 1;
    }
  }
  
  // Reset consecutive lane time when player makes a mistake
  learningModel.consecutiveLaneTime.time = 0;
}

function updateAdaptationUI() {
  document.getElementById('totalMistakes').textContent = learningModel.totalMistakes;

  const maxCollisions = Math.max(...learningModel.laneCollisions);
  const problematicLane = learningModel.laneCollisions.indexOf(maxCollisions);
  const laneNames = ['Left', 'Center', 'Right'];
  document.getElementById('favoredLane').textContent = 
    maxCollisions > 0 ? laneNames[problematicLane] : 'None';

  let timingText = 'Learning...';
  if (learningModel.delayedSwitches > 5) {
    timingText = 'Slow to switch lanes';
  } else if (learningModel.preferredLane !== -1) {
    timingText = 'Predictable pattern detected';
  } else if (learningModel.totalMistakes > 3) {
    timingText = 'Adapting to your habits';
  }
  document.getElementById('jumpTiming').textContent = timingText;
}

function endGame() {
  gameState.running = false;
  cancelAnimationFrame(animationId);
  document.getElementById('finalScore').textContent = Math.floor(gameState.score / 10);
  document.getElementById('finalMistakes').textContent = learningModel.totalMistakes;
  document.getElementById('gameOver').classList.add('show');
}

function clearObstacles() {
  gameState.obstacles.forEach(obs => obs.element.remove());
  gameState.obstacles = [];
}

// Unpredictability system functions
function getRandomEventThreshold() {
  // Events occur every 8-15 seconds on average
  return 8000 + Math.random() * 7000;
}

function checkUnpredictableEvents(now) {
  // Don't trigger events too early in the game
  if (gameState.score < 300) return;
  
  // Check if enough time has passed since last event
  const timeSinceLastEvent = now - unpredictabilityState.lastEventTime;
  
  if (timeSinceLastEvent > unpredictabilityState.nextEventThreshold) {
    // Randomly choose between speed surge and track shake
    const eventType = Math.random() > 0.5 ? 'speedSurge' : 'trackShake';
    
    if (eventType === 'speedSurge' && !unpredictabilityState.speedSurgeActive) {
      triggerSpeedSurge(now);
    } else if (eventType === 'trackShake' && !unpredictabilityState.trackShakeActive) {
      triggerTrackShake(now);
    }
    
    unpredictabilityState.lastEventTime = now;
    unpredictabilityState.nextEventThreshold = getRandomEventThreshold();
  }
}

function triggerSpeedSurge(now) {
  unpredictabilityState.speedSurgeActive = true;
  unpredictabilityState.speedSurgeEndTime = now + 2000; // 2 seconds duration
  trackEl.classList.add('speed-surge');
  showMessage(getRandomMessage(aiMessages.speedSurge), 1500);
}

function triggerTrackShake(now) {
  unpredictabilityState.trackShakeActive = true;
  trackEl.classList.add('shake');
  showMessage(getRandomMessage(aiMessages.trackShake), 1500);
  
  // Remove shake after short duration
  setTimeout(() => {
    unpredictabilityState.trackShakeActive = false;
    trackEl.classList.remove('shake');
  }, 800); // 0.8 seconds shake duration
}

function checkNearMisses() {
  // Check for close calls when player is in unpredictable event
  if (!unpredictabilityState.speedSurgeActive && !unpredictabilityState.trackShakeActive) return;
  if (unpredictabilityState.activeMessage) return; // Don't spam messages
  
  const playerTopY = 500;
  const playerBottomY = 550;
  
  for (let obstacle of gameState.obstacles) {
    if (obstacle.lane !== gameState.currentLane) {
      // Check if obstacle just passed the player in adjacent lane
      const obstacleScreenTop = obstacle.y;
      const obstacleScreenBottom = obstacle.y + (obstacle.type === 'high' ? 50 : 32);
      
      // Near miss: obstacle in adjacent lane, just passing player level
      if (obstacleScreenTop > playerBottomY && obstacleScreenTop < playerBottomY + 50) {
        // Mark obstacle as checked to avoid repeated messages
        if (!obstacle.nearMissChecked) {
          obstacle.nearMissChecked = true;
          if (Math.random() > 0.7) { // 30% chance to comment on near miss
            showMessage(getRandomMessage(aiMessages.nearMiss), 1200);
          }
        }
      }
    }
  }
}

function getRandomMessage(messageArray) {
  return messageArray[Math.floor(Math.random() * messageArray.length)];
}

function showMessage(text, duration = 2000) {
  if (!messageEl) return;
  
  unpredictabilityState.activeMessage = text;
  messageEl.textContent = text;
  messageEl.classList.add('show');
  
  setTimeout(() => {
    hideMessage();
  }, duration);
}

function hideMessage() {
  if (!messageEl) return;
  messageEl.classList.remove('show');
  unpredictabilityState.activeMessage = null;
}

// Initialize game when page loads
init();