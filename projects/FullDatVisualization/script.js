const cardsDiv = document.getElementById("cards");
const barCanvas = document.getElementById("barChart");
const lineCanvas = document.getElementById("lineChart");

const barCtx = barCanvas.getContext("2d");
const lineCtx = lineCanvas.getContext("2d");

barCanvas.width = barCanvas.offsetWidth;
barCanvas.height = 260;
lineCanvas.width = lineCanvas.offsetWidth;
lineCanvas.height = 260;

let data=[];

function generateData(){
  data = Array.from({length:8},
    ()=>Math.floor(Math.random()*100)+10);

  renderCards();
  drawBarChart();
  drawLineChart();
}

function renderCards(){
  cardsDiv.innerHTML="";

  const total=data.reduce((a,b)=>a+b,0);
  const avg=(total/data.length).toFixed(2);
  const max=Math.max(...data);

  const stats=[
    ["Total",total],
    ["Average",avg],
    ["Max",max]
  ];

  stats.forEach(s=>{
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`<h3>${s[0]}</h3><p>${s[1]}</p>`;
    cardsDiv.appendChild(card);
  });
}

function drawBarChart(){
  barCtx.clearRect(0,0,barCanvas.width,barCanvas.height);

  const w=barCanvas.width/data.length;

  data.forEach((v,i)=>{
    const h=v*2;
    barCtx.fillStyle="#3b82f6";
    barCtx.fillRect(i*w+10,260-h,w-20,h);
  });
}

function drawLineChart(){
  lineCtx.clearRect(0,0,lineCanvas.width,lineCanvas.height);

  lineCtx.beginPath();
  lineCtx.strokeStyle="#ef4444";
  lineCtx.lineWidth=3;

  data.forEach((v,i)=>{
    const x=(lineCanvas.width/(data.length-1))*i;
    const y=260-v*2;

    if(i===0) lineCtx.moveTo(x,y);
    else lineCtx.lineTo(x,y);
  });

  lineCtx.stroke();
}

document.getElementById("generateBtn")
  .addEventListener("click",generateData);

document.getElementById("resetBtn")
  .addEventListener("click",()=>{
    data=[];
    cardsDiv.innerHTML="";
    barCtx.clearRect(0,0,barCanvas.width,barCanvas.height);
    lineCtx.clearRect(0,0,lineCanvas.width,lineCanvas.height);
  });

generateData();