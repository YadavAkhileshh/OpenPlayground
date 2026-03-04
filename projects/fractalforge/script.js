const canvas = document.getElementById("fractalCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

function renderFractal() {
    const type = document.getElementById("fractalType").value;
    const maxIter = parseInt(document.getElementById("iterations").value);
    const zoomFactor = parseInt(document.getElementById("zoom").value) / 100;

    const start = performance.now();

    if (type === "mandelbrot") {
        renderMandelbrot(maxIter, zoomFactor);
    } else if (type === "julia") {
        renderJulia(maxIter, zoomFactor);
    } else {
        renderLorenz();
    }

    const end = performance.now();
    document.getElementById("renderTime").innerText = (end - start).toFixed(2);
}

function renderMandelbrot(maxIter, zoom) {
    const img = ctx.createImageData(canvas.width, canvas.height);

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {

            let zx = 0;
            let zy = 0;

            let cx = (x - canvas.width/2) / (200 * zoom);
            let cy = (y - canvas.height/2) / (200 * zoom);

            let iter = 0;

            while (zx*zx + zy*zy < 4 && iter < maxIter) {
                let tmp = zx*zx - zy*zy + cx;
                zy = 2*zx*zy + cy;
                zx = tmp;
                iter++;
            }

            const pixelIndex = (x + y * canvas.width) * 4;
            const color = getColor(iter, maxIter);

            img.data[pixelIndex] = color.r;
            img.data[pixelIndex+1] = color.g;
            img.data[pixelIndex+2] = color.b;
            img.data[pixelIndex+3] = 255;
        }
    }

    ctx.putImageData(img, 0, 0);
}

function renderJulia(maxIter, zoom) {
    const img = ctx.createImageData(canvas.width, canvas.height);
    const cx = -0.7;
    const cy = 0.27015;

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {

            let zx = (x - canvas.width/2) / (200 * zoom);
            let zy = (y - canvas.height/2) / (200 * zoom);

            let iter = 0;

            while (zx*zx + zy*zy < 4 && iter < maxIter) {
                let tmp = zx*zx - zy*zy + cx;
                zy = 2*zx*zy + cy;
                zx = tmp;
                iter++;
            }

            const pixelIndex = (x + y * canvas.width) * 4;
            const color = getColor(iter, maxIter);

            img.data[pixelIndex] = color.r;
            img.data[pixelIndex+1] = color.g;
            img.data[pixelIndex+2] = color.b;
            img.data[pixelIndex+3] = 255;
        }
    }

    ctx.putImageData(img, 0, 0);
}

function renderLorenz() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    let x = 0.01;
    let y = 0;
    let z = 0;

    const a = 10;
    const b = 28;
    const c = 8/3;

    for (let i = 0; i < 10000; i++) {
        const dx = a * (y - x) * 0.01;
        const dy = (x * (b - z) - y) * 0.01;
        const dz = (x * y - c * z) * 0.01;

        x += dx;
        y += dy;
        z += dz;

        const px = canvas.width/2 + x * 10;
        const py = canvas.height/2 + z * 5;

        ctx.fillStyle = "rgba(255,0,150,0.3)";
        ctx.fillRect(px, py, 1, 1);
    }
}

function getColor(iter, maxIter) {
    const t = iter / maxIter;
    return {
        r: 255 * t,
        g: 100 * (1 - t),
        b: 200 * (1 - t)
    };
}

renderFractal();