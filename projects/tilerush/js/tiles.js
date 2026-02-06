class Tile {
    constructor(lane, speed) {
        this.lane = lane;
        this.speed = speed;
        this.position = -CONFIG.TILE_HEIGHT;
        this.element = null;
        this.isActive = true;
        this.isHit = false;
        this.createdAt = Date.now();
    }

    create() {
        this.element = document.createElement('div');
        this.element.className = 'tile falling';
        this.element.style.left = `${this.lane * 25}%`;
        this.element.style.top = `${this.position}px`;

        const duration = (window.innerHeight - 80 + CONFIG.TILE_HEIGHT) / this.speed;
        this.element.style.animationDuration = `${duration}s`;

        document.getElementById('tiles-container').appendChild(this.element);
    }

    update(deltaTime) {
        if (!this.isActive || this.isHit) return;

        this.position += this.speed * (deltaTime / 1000);

        if (this.element) {
            const hitZoneStart = (window.innerHeight - 80) * CONFIG.TIMING.HIT_ZONE_START;
            const hitZoneEnd = (window.innerHeight - 80) * CONFIG.TIMING.HIT_ZONE_END;

            if (this.position >= hitZoneStart && this.position <= hitZoneEnd) {
                const distanceToOptimal = Math.abs(this.position - hitZoneEnd);
                const maxDistance = hitZoneEnd - hitZoneStart;
                const proximity = 1 - (distanceToOptimal / maxDistance);

                if (proximity > 0.8) {
                    this.element.classList.add('perfect-ready');
                    this.element.classList.remove('good-ready');
                } else if (proximity > 0.5) {
                    this.element.classList.add('good-ready');
                    this.element.classList.remove('perfect-ready');
                } else {
                    this.element.classList.remove('perfect-ready', 'good-ready');
                }
            }
        }

        if (this.position > window.innerHeight - 80) {
            this.handleMiss();
        }
    }

    handleMiss() {
        if (this.isHit) return;

        this.isActive = false;
        this.isHit = true;

        if (this.element) {
            this.element.classList.add('missed');
            setTimeout(() => this.destroy(), 300);
        }

        registerMiss();
    }

    hit() {
        if (this.isHit || !this.isActive) return null;

        const hitZoneEnd = (window.innerHeight - 80) * CONFIG.TIMING.HIT_ZONE_END;
        const timingDiff = Math.abs(this.position - hitZoneEnd);
        const pixelTolerance = this.speed * 0.1;

        let hitType = null;

        if (timingDiff <= pixelTolerance * (CONFIG.TIMING.PERFECT_WINDOW / 100)) {
            hitType = 'perfect';
        } else if (timingDiff <= pixelTolerance * (CONFIG.TIMING.GOOD_WINDOW / 100)) {
            hitType = 'good';
        } else {
            return null;
        }

        this.isHit = true;
        this.isActive = false;

        if (this.element) {
            this.element.classList.add(`hit-${hitType}`);
            setTimeout(() => this.destroy(), 300);
        }

        return hitType;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}

function spawnTile() {
    const lane = selectLane();
    const tile = new Tile(lane, GAME_STATE.currentSpeed);
    tile.create();
    GAME_STATE.tiles.push(tile);
    GAME_STATE.laneHistory.push(lane);

    if (GAME_STATE.laneHistory.length > 10) {
        GAME_STATE.laneHistory.shift();
    }
}

function selectLane() {
    const weights = new Array(CONFIG.LANES).fill(1.0);

    const recentLanes = GAME_STATE.laneHistory.slice(-CONFIG.PATTERNS.MAX_CONSECUTIVE_SAME_LANE);
    if (recentLanes.length === CONFIG.PATTERNS.MAX_CONSECUTIVE_SAME_LANE) {
        const allSame = recentLanes.every(l => l === recentLanes[0]);
        if (allSame) {
            weights[recentLanes[0]] = 0;
        }
    }

    for (let i = GAME_STATE.laneHistory.length - 1; i >= 0; i--) {
        const lane = GAME_STATE.laneHistory[i];
        const age = GAME_STATE.laneHistory.length - i;
        const decay = Math.pow(CONFIG.PATTERNS.LANE_WEIGHT_DECAY, age);
        weights[lane] *= decay;
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return i;
        }
    }

    return Math.floor(Math.random() * CONFIG.LANES);
}

function updateTiles(deltaTime) {
    for (let i = GAME_STATE.tiles.length - 1; i >= 0; i--) {
        const tile = GAME_STATE.tiles[i];
        tile.update(deltaTime);

        if (!tile.isActive && !tile.element) {
            GAME_STATE.tiles.splice(i, 1);
        }
    }
}

function getTileInLane(lane) {
    const hitZoneStart = (window.innerHeight - 80) * CONFIG.TIMING.HIT_ZONE_START;
    const hitZoneEnd = (window.innerHeight - 80) * CONFIG.TIMING.HIT_ZONE_END;

    const tilesInLane = GAME_STATE.tiles.filter(tile =>
        tile.lane === lane &&
        tile.isActive &&
        !tile.isHit &&
        tile.position >= hitZoneStart - 50 &&
        tile.position <= hitZoneEnd + 50
    );

    if (tilesInLane.length === 0) return null;

    tilesInLane.sort((a, b) => {
        const optimalPos = hitZoneEnd;
        const distA = Math.abs(a.position - optimalPos);
        const distB = Math.abs(b.position - optimalPos);
        return distA - distB;
    });

    return tilesInLane[0];
}

function clearAllTiles() {
    GAME_STATE.tiles.forEach(tile => tile.destroy());
    GAME_STATE.tiles = [];
    GAME_STATE.laneHistory = [];
}
