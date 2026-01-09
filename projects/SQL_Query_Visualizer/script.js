const draggables = document.querySelectorAll('.draggable-item');
const dropZones = document.querySelectorAll('.drop-zone');
const joinTypeSelect = document.getElementById('joinType');
const sqlCode = document.getElementById('sqlCode');
const canvas = document.getElementById('vennCanvas');
const ctx = canvas.getContext('2d');
const explanationDisplay = document.getElementById('explanation');

let state = {
    leftTable: null,
    rightTable: null,
    joinType: null
};

// Colors
const COLOR_A = 'rgba(59, 130, 246, 0.6)'; // Blue
const COLOR_B = 'rgba(239, 68, 68, 0.6)';  // Red
const COLOR_INTERSECTION = 'rgba(139, 92, 246, 0.8)'; // Purple Mix
const COLOR_OUTLINE = '#374151';

// Setup Event Listeners
draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', draggable.id);
        e.dataTransfer.effectAllowed = 'copy';
    });
});

dropZones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain');
        const originalElement = document.getElementById(id);

        if (originalElement) {
            handleDrop(zone, originalElement);
        }
    });
});

joinTypeSelect.addEventListener('change', (e) => {
    state.joinType = e.target.value;
    updateUI();
});

function handleDrop(zone, element) {
    const clone = element.cloneNode(true);
    clone.style.margin = '0';
    clone.style.boxShadow = 'none';
    clone.draggable = false;

    // Clear zone and append clone
    zone.innerHTML = '';
    zone.appendChild(clone);
    zone.style.borderStyle = 'solid';

    // Update state
    if (zone.id === 'slotLeft') {
        state.leftTable = element.innerText.trim();
    } else {
        state.rightTable = element.innerText.trim();
    }

    checkReady();
}

function checkReady() {
    if (state.leftTable && state.rightTable) {
        joinTypeSelect.disabled = false;
        // Default to Inner if not selected
        if (!state.joinType) {
            joinTypeSelect.value = "INNER";
            state.joinType = "INNER";
        }
        updateUI();
    }
}

function updateUI() {
    updateSQL();
    drawVenn();
    updateExplanation();
}

function updateSQL() {
    if (!state.leftTable || !state.rightTable || !state.joinType) return;

    const tableA = state.leftTable.split(' ')[0];
    const tableB = state.rightTable.split(' ')[0];
    const joinMap = {
        'INNER': 'INNER JOIN',
        'LEFT': 'LEFT JOIN',
        'RIGHT': 'RIGHT JOIN',
        'FULL': 'FULL OUTER JOIN'
    };

    sqlCode.innerText = `SELECT *\nFROM ${tableA}\n${joinMap[state.joinType]} ${tableB}\nON ${tableA}.id = ${tableB}.id;`;
}

function updateExplanation() {
    const explanations = {
        'INNER': 'Returns records that have matching values in both tables.',
        'LEFT': 'Returns all records from the left table, and the matched records from the right table.',
        'RIGHT': 'Returns all records from the right table, and the matched records from the left table.',
        'FULL': 'Returns all records when there is a match in either left or right table.'
    };
    explanationDisplay.innerText = explanations[state.joinType] || "Select a join type to see explanation.";
}

function drawVenn() {
    if (!state.joinType) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;
    const offset = 60; // Distance from center

    const circleA = { x: centerX - offset, y: centerY, r: radius };
    const circleB = { x: centerX + offset, y: centerY, r: radius };

    // Function to draw a circle path
    function pathCircle(circle) {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
        ctx.closePath();
    }

    // Draw Based on Join Type
    ctx.save();

    // 1. Fill Left Circle (Table A) if LEFT or FULL
    if (state.joinType === 'LEFT' || state.joinType === 'FULL') {
        pathCircle(circleA);
        ctx.fillStyle = COLOR_A;
        ctx.fill();
    }

    // 2. Fill Right Circle (Table B) if RIGHT or FULL
    if (state.joinType === 'RIGHT' || state.joinType === 'FULL') {
        pathCircle(circleB);
        ctx.fillStyle = COLOR_B;
        ctx.fill();
    }

    // 3. Fill Intersection if INNER
    // Note: If FULL, A and B are already filled, so intersection is naturally mixed/covered.
    // If LEFT, A is filled (covering intersection).
    // If RIGHT, B is filled (covering intersection).
    // So distinct Logic is needed mainly for INNER or to ensure colors mix correctly.

    if (state.joinType === 'INNER') {
        ctx.save();
        pathCircle(circleA);
        ctx.clip(); // Restrict drawing to inside A
        pathCircle(circleB);
        ctx.fillStyle = COLOR_INTERSECTION;
        ctx.fill();
        ctx.restore();
    }

    ctx.restore();

    // Always draw outlines
    ctx.strokeStyle = COLOR_OUTLINE;
    ctx.lineWidth = 2;

    pathCircle(circleA);
    ctx.stroke();

    pathCircle(circleB);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Table A', circleA.x - 40, circleA.y - 120);
    ctx.fillText('Table B', circleB.x + 40, circleB.y - 120);
}

// Initial draw (empty)
ctx.strokeStyle = '#e5e7eb';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(190, 175, 100, 0, Math.PI * 2);
ctx.stroke();
ctx.beginPath();
ctx.arc(310, 175, 100, 0, Math.PI * 2);
ctx.stroke();
