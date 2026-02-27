const usersEl = document.getElementById("users");
const revenueEl = document.getElementById("revenue");
const conversionEl = document.getElementById("conversion");
const sessionsEl = document.getElementById("sessions");

const canvas = document.getElementById("chartCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = 280;

function randomData() {
  return {
    users: Math.floor(Math.random() * 5000 + 1000),
    revenue: Math.floor(Math.random() * 50000 + 10000),
    conversion: (Math.random() * 10 + 2).toFixed(2),
    sessions: Math.floor(Math.random() * 800 + 100)
  };
}

function updateCards() {
  const data = randomData();

  usersEl.textContent = data.users;
  revenueEl.textContent = "$" + data.revenue;
  conversionEl.textContent = data.conversion + "%";
  sessionsEl.textContent = data.sessions;
}

function drawChart() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const points = [];
  for(let i=0;i<10;i++){
    points.push(Math.random()*200 + 30);
  }

  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#3b82f6";

  points.forEach((p,i)=>{
    const x = (canvas.width/9)*i;
    const y = canvas.height - p;
    if(i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  });

  ctx.stroke();
}

document.getElementById("refreshBtn")
  .addEventListener("click", () => {
    updateCards();
    drawChart();
  });

updateCards();
drawChart();