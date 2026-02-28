function initializeInput() {
    const lanes = document.querySelectorAll('.lane');

    lanes.forEach((lane, index) => {
        lane.addEventListener('click', () => handleLaneClick(index));

        lane.addEventListener('mouseenter', () => {
            lane.classList.add('active');
        });

        lane.addEventListener('mouseleave', () => {
            lane.classList.remove('active');
        });
    });

    document.addEventListener('keydown', (e) => {
        if (!GAME_STATE.isPlaying || GAME_STATE.isPaused) return;

        const keyMap = {
            'KeyD': 0,
            'KeyF': 1,
            'KeyJ': 2,
            'KeyK': 3,
            'Digit1': 0,
            'Digit2': 1,
            'Digit3': 2,
            'Digit4': 3
        };

        if (keyMap.hasOwnProperty(e.code)) {
            e.preventDefault();
            handleLaneClick(keyMap[e.code]);
        }
    });
}

function handleLaneClick(laneIndex) {
    if (!GAME_STATE.isPlaying || GAME_STATE.isPaused) return;

    const tile = getTileInLane(laneIndex);
    const lane = document.querySelectorAll('.lane')[laneIndex];

    if (!tile) {
        flashLane(laneIndex, 'miss');
        registerMiss();
        return;
    }

    const hitType = tile.hit();

    if (hitType === 'perfect') {
        flashLane(laneIndex, 'perfect');
        registerPerfectHit();
        showHitFeedback('PERFECT!', 'perfect');
        createHitParticles(laneIndex);
    } else if (hitType === 'good') {
        flashLane(laneIndex, 'good');
        registerGoodHit();
        showHitFeedback('GOOD', 'good');
    } else {
        flashLane(laneIndex, 'miss');
        registerMiss();
    }
}

function flashLane(laneIndex, type) {
    const lane = document.querySelectorAll('.lane')[laneIndex];

    lane.classList.remove('flash-perfect', 'flash-good', 'flash-miss');

    void lane.offsetWidth;

    lane.classList.add(`flash-${type}`);

    if (type === 'miss') {
        lane.classList.add('shake');
        setTimeout(() => lane.classList.remove('shake'), 300);
    }

    setTimeout(() => {
        lane.classList.remove(`flash-${type}`);
    }, 300);
}

function showHitFeedback(text, type) {
    const feedback = document.getElementById('hit-feedback');
    feedback.textContent = text;
    feedback.className = `feedback-text ${type}`;

    feedback.classList.remove('show');
    void feedback.offsetWidth;
    feedback.classList.add('show');

    setTimeout(() => {
        feedback.classList.remove('show');
    }, CONFIG.VISUAL.FEEDBACK_DURATION);
}

function createHitParticles(laneIndex) {
    const container = document.getElementById('game-area');
    const laneWidth = 100 / CONFIG.LANES;
    const centerX = (laneIndex * laneWidth) + (laneWidth / 2);
    const centerY = 85;

    for (let i = 0; i < CONFIG.VISUAL.PARTICLE_COUNT; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle burst';

        const angle = (Math.PI * 2 * i) / CONFIG.VISUAL.PARTICLE_COUNT;
        const distance = 50 + Math.random() * 30;
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;

        particle.style.left = `${centerX}%`;
        particle.style.top = `${centerY}%`;
        particle.style.setProperty('--end-x', `${endX}%`);
        particle.style.setProperty('--end-y', `${endY}%`);

        container.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 800);
    }
}

function showComboMilestone(combo) {
    const milestone = document.getElementById('combo-milestone');
    milestone.textContent = `${combo}X COMBO!`;

    milestone.classList.remove('show');
    void milestone.offsetWidth;
    milestone.classList.add('show');

    createScreenFlash();

    setTimeout(() => {
        milestone.classList.remove('show');
    }, CONFIG.VISUAL.MILESTONE_DURATION);
}

function createScreenFlash() {
    const flash = document.createElement('div');
    flash.className = 'screen-flash active';
    document.getElementById('game-container').appendChild(flash);

    setTimeout(() => {
        if (flash.parentNode) {
            flash.parentNode.removeChild(flash);
        }
    }, CONFIG.VISUAL.SCREEN_FLASH_DURATION);
}
