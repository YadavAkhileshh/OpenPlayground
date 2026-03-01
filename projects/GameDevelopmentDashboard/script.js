const projectsEl=document.getElementById("projects");
const tasksEl=document.getElementById("tasks");
const bugsEl=document.getElementById("bugs");
const ratingEl=document.getElementById("rating");

const designFill=document.getElementById("designFill");
const devFill=document.getElementById("devFill");
const testFill=document.getElementById("testFill");

const canvas=document.getElementById("chartCanvas");
const ctx=canvas.getContext("2d");

canvas.width=canvas.offsetWidth;
canvas.height=260;

function randomStats(){
  return {
    projects:Math.floor(Math.random()*5)+1,
    tasks:Math.floor(Math.random()*80)+20,
    bugs:Math.floor(Math.random()*40)+5,
    rating:(Math.random()*2+3).toFixed(1),
    design:Math.floor(Math.random()*100),
    dev:Math.floor(Math.random()*100),
    test:Math.floor(Math.random()*100)
  };
}

function updateDashboard(){
  const d=randomStats();

  projectsEl.textContent=d.projects;
  tasksEl.textContent=d.tasks;
  bugsEl.textContent=d.bugs;
  ratingEl.textContent=d.rating+"⭐";

  designFill.style.width=d.design+"%";
  devFill.style.width=d.dev+"%";
  testFill.style.width=d.test+"%";

  drawChart();
}

function drawChart(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const points=[];
  for(let i=0;i<7;i++){
    points.push(Math.random()*180+40);
  }

  ctx.beginPath();
  ctx.lineWidth=3;
  ctx.strokeStyle="#3b82f6";

  points.forEach((p,i)=>{
    const x=(canvas.width/6)*i;
    const y=260-p;

    if(i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  });

  ctx.stroke();
}

document.getElementById("refreshBtn")
  .addEventListener("click",updateDashboard);

updateDashboard();