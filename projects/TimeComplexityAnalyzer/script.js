const sizeInput = document.getElementById("sizeInput");
const sizeValue = document.getElementById("sizeValue");
const resultText = document.getElementById("resultText");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

sizeInput.oninput = () => {
  sizeValue.textContent = sizeInput.value;
};

// ---------- SIMULATED ALGORITHMS ----------
function linearSearch(arr, target){
  for(let i=0;i<arr.length;i++){
    if(arr[i]===target) return i;
  }
  return -1;
}

function binarySearch(arr, target){
  let l=0,r=arr.length-1;
  while(l<=r){
    let m=Math.floor((l+r)/2);
    if(arr[m]===target) return m;
    if(arr[m]<target) l=m+1;
    else r=m-1;
  }
  return -1;
}

function bubbleSort(arr){
  for(let i=0;i<arr.length;i++){
    for(let j=0;j<arr.length-i-1;j++){
      if(arr[j]>arr[j+1]){
        [arr[j],arr[j+1]]=[arr[j+1],arr[j]];
      }
    }
  }
}

// ---------- DRAW CHART ----------
function drawChart(points,label){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle="white";
  ctx.beginPath();
  ctx.moveTo(40,300);
  ctx.lineTo(650,300);
  ctx.lineTo(650,30);
  ctx.stroke();

  ctx.fillStyle="white";
  ctx.fillText("Input Size (n)",300,330);
  ctx.fillText("Time (ms)",10,20);

  ctx.strokeStyle="#38bdf8";
  ctx.beginPath();

  points.forEach((p,i)=>{
    const x = 40 + (i/(points.length-1))*600;
    const y = 300 - p*200;

    if(i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  });

  ctx.stroke();

  ctx.fillStyle="#22c55e";
  ctx.fillText(label,500,50);
}

// ---------- ANALYZE ----------
function analyze(){
  const n = Number(sizeInput.value);
  const algo = document.getElementById("algoSelect").value;

  let points=[];

  for(let size=20; size<=n; size+=20){

    const arr = Array.from({length:size},()=>Math.random()*1000);
    const target = arr[Math.floor(Math.random()*size)];

    const start = performance.now();

    if(algo==="linear") linearSearch(arr,target);
    if(algo==="binary"){
      arr.sort((a,b)=>a-b);
      binarySearch(arr,target);
    }
    if(algo==="bubble") bubbleSort([...arr]);

    const end = performance.now();

    points.push((end-start)/5);
  }

  const label =
    algo==="linear" ? "O(n)" :
    algo==="binary" ? "O(log n)" :
    "O(n²)";

  resultText.textContent =
    `Analyzed ${label} with input size up to ${n}`;

  drawChart(points,label);
}

document.getElementById("runBtn").onclick = analyze;