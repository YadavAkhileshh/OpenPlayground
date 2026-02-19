/**
 * Wireframe Earth Engine
 * 3D Sphere Projection logic & API Integration.
 */

const canvas = document.getElementById('globe-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GLOBE_RADIUS = 200;
const DOT_DENSITY = 40; // Lat/Lon steps
const ROTATION_SPEED = 0.005;

// --- State ---
let width, height;
let rotation = 0;
let points = []; // Sphere vertices
let markers = []; // {lat, lon, label, color}
let activeArc = null; // {start: {x,y,z}, end: {x,y,z}, progress}

// --- 3D Math Helper ---
function project(x, y, z) {
    // 1. Rotate Y (Spin)
    const ry = rotation;
    const x1 = x * Math.cos(ry) - z * Math.sin(ry);
    const z1 = z * Math.cos(ry) + x * Math.sin(ry);
    
    // 2. Rotate X (Tilt - Fixed)
    const rx = 0.3; 
    const y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
    const z2 = z1 * Math.cos(rx) + y * Math.sin(rx);
    
    // 3. Perspective Projection
    const scale = 800 / (800 - z2);
    return {
        x: width/2 + x1 * scale,
        y: height/2 + y2 * scale,
        z: z2,
        scale: scale,
        visible: z2 < 0 // Only draw front if z < 0 (standard right-handed) -> Actually depends on cam Z. 
        // Let's rely on z-sorting for dots, or alpha fading.
    };
}

// Convert Lat/Lon to 3D Cartesian on Sphere
function latLonToVector(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    
    return {x, y, z};
}

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    generateGlobePoints();
    
    // Get User Location (estimate)
    trackIP(''); 
    
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

function generateGlobePoints() {
    points = [];
    // Lat Lines
    for(let lat = -80; lat <= 80; lat += 20) {
        for(let lon = 0; lon < 360; lon += 10) {
            points.push(latLonToVector(lat, lon, GLOBE_RADIUS));
        }
    }
    // Lon Lines
    for(let lon = 0; lon < 360; lon += 20) {
        for(let lat = -80; lat <= 80; lat += 10) {
            points.push(latLonToVector(lat, lon, GLOBE_RADIUS));
        }
    }
}

// --- API Logic ---

async function trackIP(ipInput = null) {
    if (ipInput === null) ipInput = document.getElementById('ip-input').value;
    
    log(`Fetching data for ${ipInput || 'Current User'}...`);
    
    try {
        // Using ipwho.is (Free, no key, HTTPS support)
        const url = ipInput ? `https://ipwho.is/${ipInput}` : `https://ipwho.is/`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (!data.success) {
            log(`Error: ${data.message}`);
            return;
        }

        updateUI(data);
        
        // Add Marker
        const newMarker = {
            lat: data.latitude,
            lon: data.longitude,
            label: data.city,
            color: ipInput ? '#00ccff' : '#00ff41' // Cyan for target, Green for self
        };
        
        // If we have existing markers, draw arc from last to new
        if (markers.length > 0) {
            const start = markers[0]; // Usually self
            createArc(start, newMarker);
        }
        
        // If first load (self), keep it as origin
        if (markers.length === 0 || !ipInput) {
            markers = [newMarker];
        } else {
            // If tracking target, keep origin, replace target
            markers[1] = newMarker;
        }
        
        log(`Locked onto: ${data.city}, ${data.country}`);

    } catch (e) {
        log("Network Error. Check console.");
        console.error(e);
    }
}

function updateUI(data) {
    document.getElementById('data-panel').classList.remove('hidden');
    document.getElementById('res-ip').innerText = data.ip;
    document.getElementById('res-loc').innerText = `${data.city}, ${data.country_code}`;
    document.getElementById('res-isp').innerText = data.connection.isp;
    document.getElementById('res-coords').innerText = `${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)}`;
}

function log(msg) {
    const box = document.getElementById('log-box');
    const p = document.createElement('p');
    p.innerText = `> ${msg}`;
    box.prepend(p);
}

// --- Animation Logic ---

function createArc(startGeo, endGeo) {
    // Calculate 3D points
    const p1 = latLonToVector(startGeo.lat, startGeo.lon, GLOBE_RADIUS);
    const p2 = latLonToVector(endGeo.lat, endGeo.lon, GLOBE_RADIUS);
    
    // Midpoint (control point) is higher to create arc
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const midZ = (p1.z + p2.z) / 2;
    // Normalize and extend
    const len = Math.sqrt(midX*midX + midY*midY + midZ*midZ);
    const altitude = GLOBE_RADIUS * 1.5;
    
    const cp = {
        x: (midX / len) * altitude,
        y: (midY / len) * altitude,
        z: (midZ / len) * altitude
    };
    
    activeArc = { p1, p2, cp, progress: 0 };
}

function update() {
    rotation += ROTATION_SPEED;
    
    if (activeArc && activeArc.progress < 1) {
        activeArc.progress += 0.01;
    }
}

// --- Render ---

function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // 1. Draw Globe Dots/Wireframe 
    ctx.fillStyle = 'rgba(0, 255, 65, 0.4)';
    
    // Sort points by Z for depth? Simple dots don't strictly need it if alpha is low
    // But let's check visibility
    
    for (let p of points) {
        const proj = project(p.x, p.y, p.z);
        
        // Depth fading
        const alpha = (proj.z + GLOBE_RADIUS) / (GLOBE_RADIUS * 2); 
        // Simple backface culling or dimming
        if (proj.scale > 0) {
            ctx.fillStyle = `rgba(0, 50, 0, ${Math.max(0.1, alpha)})`;
            ctx.fillRect(proj.x, proj.y, 2, 2);
        }
    }
    
    // 2. Draw Arc
    if (activeArc) {
        drawBezier3D(activeArc.p1, activeArc.cp, activeArc.p2, activeArc.progress);
    }
    
    // 3. Draw Markers
    for (let m of markers) {
        const pos3D = latLonToVector(m.lat, m.lon, GLOBE_RADIUS);
        const proj = project(pos3D.x, pos3D.y, pos3D.z);
        
        // Only draw if on front side
        // Check Z relative to rotation
        // Actually, project().z tells us depth.
        // If z > 0 (towards viewer) or whatever our coordinate system is.
        // Our project z2: positive is back? 
        // Let's use alpha check or calculate dot product with camera normal
        
        if (proj.scale > 0) { // Valid projection
             // Draw Pin
             ctx.beginPath();
             ctx.moveTo(proj.x, proj.y);
             ctx.lineTo(proj.x, proj.y - 20);
             ctx.strokeStyle = m.color;
             ctx.stroke();
             
             ctx.fillStyle = m.color;
             ctx.fillText(m.label, proj.x + 5, proj.y - 20);
             
             // Ping effect
             ctx.beginPath();
             ctx.arc(proj.x, proj.y, 3, 0, Math.PI*2);
             ctx.fill();
        }
    }
}

function drawBezier3D(p1, cp, p2, tMax) {
    ctx.beginPath();
    ctx.strokeStyle = '#00ccff';
    ctx.lineWidth = 2;
    
    let started = false;
    
    // Sample curve
    for (let t = 0; t <= tMax; t += 0.05) {
        // Quadratic Bezier in 3D
        const x = (1-t)*(1-t)*p1.x + 2*(1-t)*t*cp.x + t*t*p2.x;
        const y = (1-t)*(1-t)*p1.y + 2*(1-t)*t*cp.y + t*t*p2.y;
        const z = (1-t)*(1-t)*p1.z + 2*(1-t)*t*cp.z + t*t*p2.z;
        
        const proj = project(x, y, z);
        if (!started) {
            ctx.moveTo(proj.x, proj.y);
            started = true;
        } else {
            ctx.lineTo(proj.x, proj.y);
        }
    }
    ctx.stroke();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
init();