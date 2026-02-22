const canvas = document.getElementById("geoCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

let points = [];
let hull = [];

function generatePoints(count = 30) {
    points = [];
    hull = [];
    for(let i=0;i<count;i++){
        points.push({
            x: Math.random()*canvas.width,
            y: Math.random()*canvas.height
        });
    }
    draw();
}

function orientation(p, q, r) {
    return (q.y - p.y)*(r.x - q.x) -
           (q.x - p.x)*(r.y - q.y);
}

function computeHull() {
    hull = convexHull(points);
    document.getElementById("hullCount").innerText = hull.length;
    document.getElementById("areaValue").innerText = polygonArea(hull).toFixed(2);
    draw();
}

function convexHull(points) {
    const pts = [...points].sort((a,b)=>a.x-b.x || a.y-b.y);
    const lower = [];
    const upper = [];

    for(let p of pts){
        while(lower.length >=2 &&
              orientation(lower[lower.length-2],
                          lower[lower.length-1], p) <= 0){
            lower.pop();
        }
        lower.push(p);
    }

    for(let i=pts.length-1;i>=0;i--){
        const p = pts[i];
        while(upper.length>=2 &&
              orientation(upper[upper.length-2],
                          upper[upper.length-1], p) <=0){
            upper.pop();
        }
        upper.push(p);
    }

    upper.pop();
    lower.pop();
    return lower.concat(upper);
}

function polygonArea(poly) {
    let area = 0;
    for(let i=0;i<poly.length;i++){
        let j = (i+1)%poly.length;
        area += poly[i].x * poly[j].y;
        area -= poly[j].x * poly[i].y;
    }
    return Math.abs(area/2);
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "#333";
    points.forEach(p=>{
        ctx.beginPath();
        ctx.arc(p.x,p.y,3,0,2*Math.PI);
        ctx.fill();
    });

    if(hull.length>1){
        ctx.strokeStyle = "#e74c3c";
        ctx.beginPath();
        ctx.moveTo(hull[0].x,hull[0].y);
        for(let i=1;i<hull.length;i++){
            ctx.lineTo(hull[i].x,hull[i].y);
        }
        ctx.closePath();
        ctx.stroke();
    }
}

function clipPolygon() {
    alert("Polygon clipping algorithm can be added next (Sutherland–Hodgman).");
}

function clearCanvas(){
    points=[];
    hull=[];
    draw();
}

generatePoints();