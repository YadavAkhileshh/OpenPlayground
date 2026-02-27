const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

// Settings
const settings = {
    density: 0.3, // alpha value for the gradient
    clickSize: 30, // Size of the tracked area.
    demoMode: true,
    clearScreen: function() {
        ctx.clearRect(0, 0, width, height);
    }
}

let drawing = false;

/* 
    This is the only thing that really matters for the heat map out of all the rest of the code.
    All you do is check the alpha value, and set the color when its between a certain threshold you set.
    For example an alpha of 255 or greater meants its going to be red.
    
    Not even going to lie I've been using this code for years, I can't even remember where I got the threshhold/values but they work and look great.
*/
function makeItHot(x, y, width, height) {
    // Generate the colors
    let imgData = ctx.getImageData(x, y, width, height),
        pixData = imgData.data;

    for (let i = 0, len = pixData.length; i < len; i += 4) {
        if (pixData[i + 3] !== 0) {
            
            let alpha = pixData[i + 3],
                r = 0,
                g = 0,
                b = 0,
                comp = 0;

            if (alpha <= 255 && alpha >= 235) {
                comp = 255 - alpha;
                r = 255 - comp;
                g = comp * 12;
            } else if (alpha <= 234 && alpha >= 200) {
                comp = 234 - alpha;
                r = 255 - (comp * 8);
                g = 255;
            } else if (alpha <= 199 && alpha >= 150) {
                comp = 199 - alpha;
                g = 255;
                b = comp * 5;
            } else if (alpha <= 149 && alpha >= 100) {
                comp = 149 - alpha;
                g = 255 - (comp * 5);
                b = 255;
            } else {
                b = 255;
            }

            pixData[i] = r;
            pixData[i + 1] = g;
            pixData[i + 2] = b;
            pixData[i + 3] = alpha;
        }
    }

    ctx.putImageData(imgData, x, y);
}

// Just some events.
canvas.addEventListener('mousedown', (e) => {
    settings.demoMode = false;
    if (!drawing) {
        drawing = true;
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (drawing) {
        drawing = false;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        plotPoint(e.clientX, e.clientY);
    }
});

/* 
   Creates the gradient and plots the point. Gradient creation could be done outside of this one time instead of each
   time, but since I have settings that change on the demo I do it here.
*/
function plotPoint(x, y) {
    let clickGradient = ctx.createRadialGradient(0, 0, 1, 0, 0, settings.clickSize);

    clickGradient.addColorStop(0, `rgba(0,0,0,${settings.density})`);
    clickGradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = clickGradient;

    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, settings.clickSize, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    makeItHot(x - settings.clickSize, y - settings.clickSize, settings.clickSize * 2, settings.clickSize * 2);
}

// Demo Mode not important for the actual heat map.
let marker = {
    x: 0,
    y: 0,
    tx: Math.random() * width,
    ty: Math.random() * height,
};

function demo() {
    if (settings.demoMode) {

        let dx = marker.tx - marker.x,
            dy = marker.ty - marker.y,
            dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 30) {
            marker.x += dx / 20;
            marker.y += dy / 30;
        } else {
            marker.tx = Math.random() * width;
            marker.ty = Math.random() * height;
        }
        plotPoint(marker.x, marker.y);
    }
    requestAnimationFrame(demo);
}

var gui = new dat.GUI();

gui.add(settings, 'density', 0.0, 1.0).listen();
gui.add(settings, 'clickSize', 2);
gui.add(settings, 'demoMode').listen();
gui.add(settings, 'clearScreen');

demo();