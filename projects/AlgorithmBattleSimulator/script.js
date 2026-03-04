const SIZE = 25;

const bubbleContainer = document.getElementById("bubbleBars");
const selectionContainer = document.getElementById("selectionBars");

const bubbleStats = document.getElementById("bubbleStats");
const selectionStats = document.getElementById("selectionStats");

const winnerText = document.getElementById("winner");
const speedSlider = document.getElementById("speed");

let baseArray = [];

function sleep(ms){
  return new Promise(r=>setTimeout(r, ms));
}

// ---------- GENERATE ARRAY ----------
function generateArray(){
  baseArray = [];
  winnerText.textContent = "";

  bubbleContainer.innerHTML = "";
  selectionContainer.innerHTML = "";

  for(let i=0;i<SIZE;i++){
    const v = Math.floor(Math.random()*200)+20;
    baseArray.push(v);

    const b1 = document.createElement("div");
    b1.className="bar";
    b1.style.height=v+"px";
    bubbleContainer.appendChild(b1);

    const b2 = document.createElement("div");
    b2.className="bar";
    b2.style.height=v+"px";
    selectionContainer.appendChild(b2);
  }

  bubbleStats.textContent = "";
  selectionStats.textContent = "";
}

// ---------- UPDATE BARS ----------
function updateBars(container, arr){
  const bars = container.querySelectorAll(".bar");
  bars.forEach((bar,i)=>{
    bar.style.height = arr[i]+"px";
  });
}

// ---------- BUBBLE SORT ----------
async function bubbleSort(arr){
  let comps=0, swaps=0;
  const bars = bubbleContainer.querySelectorAll(".bar");

  const start = performance.now();

  for(let i=0;i<arr.length;i++){
    for(let j=0;j<arr.length-i-1;j++){

      bars[j].classList.add("active");
      bars[j+1].classList.add("active");

      await sleep(210-speedSlider.value);

      comps++;

      if(arr[j]>arr[j+1]){
        [arr[j],arr[j+1]]=[arr[j+1],arr[j]];
        swaps++;
        updateBars(bubbleContainer,arr);
      }

      bars[j].classList.remove("active");
      bars[j+1].classList.remove("active");
    }
    bars[arr.length-i-1].classList.add("done");
  }

  const end = performance.now();

  bubbleStats.textContent =
    `Comparisons: ${comps} | Swaps: ${swaps} | Time: ${(end-start).toFixed(1)}ms`;

  return end-start;
}

// ---------- SELECTION SORT ----------
async function selectionSort(arr){
  let comps=0, swaps=0;
  const bars = selectionContainer.querySelectorAll(".bar");

  const start = performance.now();

  for(let i=0;i<arr.length;i++){
    let min=i;
    bars[min].classList.add("active");

    for(let j=i+1;j<arr.length;j++){
      bars[j].classList.add("active");
      await sleep(210-speedSlider.value);

      comps++;

      if(arr[j]<arr[min]){
        bars[min].classList.remove("active");
        min=j;
        bars[min].classList.add("active");
      } else {
        bars[j].classList.remove("active");
      }
    }

    [arr[i],arr[min]]=[arr[min],arr[i]];
    swaps++;
    updateBars(selectionContainer,arr);

    bars[min].classList.remove("active");
    bars[i].classList.add("done");
  }

  const end = performance.now();

  selectionStats.textContent =
    `Comparisons: ${comps} | Swaps: ${swaps} | Time: ${(end-start).toFixed(1)}ms`;

  return end-start;
}

// ---------- START BATTLE ----------
async function startBattle(){
  winnerText.textContent="⚔️ Battle Running...";

  const arr1=[...baseArray];
  const arr2=[...baseArray];

  const [t1,t2] = await Promise.all([
    bubbleSort(arr1),
    selectionSort(arr2)
  ]);

  if(t1<t2){
    winnerText.textContent="🏆 Winner: Bubble Sort";
  }else if(t2<t1){
    winnerText.textContent="🏆 Winner: Selection Sort";
  }else{
    winnerText.textContent="🤝 It's a Tie!";
  }
}

// EVENTS
document.getElementById("generate").onclick = generateArray;
document.getElementById("startBattle").onclick = startBattle;

// INIT
generateArray();