const quarantineZone = document.getElementById('quarantineZone');
const scoreDisplay = document.getElementById('score');
const infectBtn = document.getElementById('btnInfect');

let physicsObjects = [];
let draggedObj = null;
let offsetX = 0;
let offsetY = 0;
let securedCount = 0;
let isRunning = false;

// Physics Constants
const GRAVITY = 0.4;
const FRICTION = 0.75;
const BOUNCE = -0.8;

infectBtn.addEventListener('click', () => {
    if (isRunning) return;
    infectBtn.style.display = 'none';
    startInfection();
});

function startInfection() {
    const targets = document.querySelectorAll('.infectable');
    
    targets.forEach(el => {
        // Get precise layout coordinates before converting to absolute
        const rect = el.getBoundingClientRect();
        
        // Force element dimensions to lock so they don't collapse
        el.style.width = `${rect.width}px`;
        el.style.height = `${rect.height}px`;
        
        // Setup physics state for each element
        physicsObjects.push({
            node: el,
            x: rect.left,
            y: rect.top,
            vx: (Math.random() - 0.5) * 15, // Random explosive X velocity
            vy: (Math.random() - 1) * 10,   // Upward pop Y velocity
            isDragging: false,
            isSecured: false
        });
        
        el.classList.add('infected');
    });

    isRunning = true;
    requestAnimationFrame(gameLoop);
}

// Mouse Drag Events
window.addEventListener('mousedown', (e) => {
    // Check if we clicked an infected element
    const targetNode = e.target.closest('.infected');
    if (!targetNode) return;

    // Find the matching physics object
    draggedObj = physicsObjects.find(obj => obj.node === targetNode);
    if (!draggedObj || draggedObj.isSecured) {
        draggedObj = null;
        return;
    }

    draggedObj.isDragging = true;
    
    // Calculate where on the element we clicked so it doesn't snap to top-left
    const rect = draggedObj.node.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    // Stop momentum while holding
    draggedObj.vx = 0;
    draggedObj.vy = 0;
});

window.addEventListener('mousemove', (e) => {
    if (!draggedObj) return;

    // Update position directly to mouse
    draggedObj.x = e.clientX - offsetX;
    draggedObj.y = e.clientY - offsetY;

    // Check overlap with drop zone for visual feedback
    if (checkCollision(draggedObj.node, quarantineZone)) {
        quarantineZone.classList.add('highlight');
    } else {
        quarantineZone.classList.remove('highlight');
    }
});

window.addEventListener('mouseup', () => {
    if (!draggedObj) return;

    // Release drop
    if (checkCollision(draggedObj.node, quarantineZone)) {
        secureElement(draggedObj);
    }

    quarantineZone.classList.remove('highlight');
    draggedObj.isDragging = false;
    draggedObj = null;
});

// AABB Collision Detection (Axis-Aligned Bounding Box)
function checkCollision(el1, el2) {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();

    return !(
        rect1.top > rect2.bottom ||
        rect1.right < rect2.left ||
        rect1.bottom < rect2.top ||
        rect1.left > rect2.right
    );
}

function secureElement(obj) {
    obj.isSecured = true;
    
    // Alter CSS classes
    obj.node.classList.remove('infected');
    obj.node.classList.add('secured');
    
    // Append it physically inside the quarantine div so we don't need absolute positioning anymore
    quarantineZone.appendChild(obj.node);
    
    // Reset inline styles
    obj.node.style.left = '';
    obj.node.style.top = '';
    obj.node.style.width = 'auto';
    obj.node.style.height = 'auto';
    obj.node.style.transform = '';

    securedCount++;
    scoreDisplay.innerText = `Secured: ${securedCount} / ${physicsObjects.length}`;
    
    if (securedCount === physicsObjects.length) {
        scoreDisplay.innerText = "THREAT NEUTRALIZED";
    }
}

// Physics Loop
function gameLoop() {
    physicsObjects.forEach(obj => {
        if (obj.isSecured) return;

        if (!obj.isDragging) {
            // Apply Gravity
            obj.vy += GRAVITY;
            
            // Apply Velocity
            obj.x += obj.vx;
            obj.y += obj.vy;
            
            // Floor Collision
            if (obj.y + obj.node.offsetHeight > window.innerHeight) {
                obj.y = window.innerHeight - obj.node.offsetHeight;
                obj.vy *= BOUNCE;
                obj.vx *= FRICTION;
            }
            
            // Ceiling Collision
            if (obj.y < 0) {
                obj.y = 0;
                obj.vy *= BOUNCE;
            }

            // Wall Collisions
            if (obj.x < 0) {
                obj.x = 0;
                obj.vx *= BOUNCE;
            }
            if (obj.x + obj.node.offsetWidth > window.innerWidth) {
                obj.x = window.innerWidth - obj.node.offsetWidth;
                obj.vx *= BOUNCE;
            }
        }

        // Apply updated coordinates to the actual DOM element
        obj.node.style.left = `${obj.x}px`;
        obj.node.style.top = `${obj.y}px`;
        
        // Add a slight spin based on horizontal velocity
        let rotation = obj.vx * 2;
        obj.node.style.transform = `rotate(${rotation}deg)`;
    });

    if (securedCount < physicsObjects.length) {
        requestAnimationFrame(gameLoop);
    }
}