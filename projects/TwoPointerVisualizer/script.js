const container = document.getElementById("arrayContainer");
const infoText = document.getElementById("infoText");

let arr = [];
const SIZE = 10;

function sleep(ms){
  return new Promise(r=>setTimeout(r,ms));
}

// ---------- GENERATE ARRAY ----------
function generateArray(){
  arr = [];
  container.innerHTML = "";

  for(let i=0;i<SIZE;i++){
    const v = Math.floor(Math.random()*20)+1;
    arr.push(v);

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = (v*10+30)+"px";
    bar.textContent = v;
    container.appendChild(bar);
  }

  infoText.textContent = "Window Sum: 0 | Max Sum: 0";
}

function getBars(){
  return document.querySelectorAll(".bar");
}

// ---------- VISUALIZE ----------
async function visualizeSlidingWindow(){
  const k = Number(document.getElementById("kInput").value);
  if(k<=0 || k>arr.length) return;

  const bars = getBars();

  // reset colors
  bars.forEach(b=>{
    b.className="bar";
  });

  let windowSum = 0;
  let maxSum = 0;

  // first window
  for(let i=0;i<k;i++){
    bars[i].classList.add("window");
    windowSum += arr[i];
    await sleep(300);
  }

  maxSum = windowSum;
  infoText.textContent = `Window Sum: ${windowSum} | Max Sum: ${maxSum}`;

  let left = 0;

  for(let right=k; right<arr.length; right++){

    // highlight pointers
    bars[left].classList.add("left");
    bars[right].classList.add("right");

    await sleep(400);

    // slide window
    bars[left].classList.remove("window");
    windowSum -= arr[left];
    left++;

    bars[right].classList.remove("right");
    bars[right].classList.add("window");

    windowSum += arr[right];
    maxSum = Math.max(maxSum, windowSum);

    infoText.textContent =
      `Window Sum: ${windowSum} | Max Sum: ${maxSum}`;

    await sleep(300);

    bars[left-1].classList.remove("left");
  }
}

// EVENTS
document.getElementById("generateBtn").onclick = generateArray;
document.getElementById("startBtn").onclick = visualizeSlidingWindow;

// INIT
generateArray();