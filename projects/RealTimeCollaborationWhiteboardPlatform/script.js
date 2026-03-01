const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const clearBtn = document.getElementById("clearBtn");

let drawing = false;

/* Resize canvas */
function resizeCanvas(){
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
window.addEventListener("resize",resizeCanvas);
resizeCanvas();

/* Drawing */
canvas.addEventListener("mousedown",e=>{
  drawing=true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX,e.offsetY);
});

canvas.addEventListener("mousemove",e=>{
  if(!drawing) return;

  ctx.lineTo(e.offsetX,e.offsetY);
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = brushSize.value;
  ctx.lineCap = "round";
  ctx.stroke();

  simulateCollaborator();
});

canvas.addEventListener("mouseup",()=>drawing=false);
canvas.addEventListener("mouseleave",()=>drawing=false);

/* Clear board */
clearBtn.addEventListener("click",()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
});

/* Collaboration simulation (fake user strokes) */
function simulateCollaborator(){
  if(Math.random() > 0.98){
    ctx.beginPath();
    ctx.moveTo(Math.random()*canvas.width,
               Math.random()*canvas.height);

    ctx.lineTo(Math.random()*canvas.width,
               Math.random()*canvas.height);

    ctx.strokeStyle = "rgba(239,68,68,0.6)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}