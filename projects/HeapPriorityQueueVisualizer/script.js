const container = document.getElementById("treeContainer");
const heapText = document.getElementById("heapArray");

let heap = [];

// ---------- HEAP HELPERS ----------
function parent(i){ return Math.floor((i-1)/2); }
function left(i){ return 2*i+1; }
function right(i){ return 2*i+2; }

function swap(i,j){
  [heap[i],heap[j]]=[heap[j],heap[i]];
}

// ---------- INSERT ----------
function insert(value){
  heap.push(value);
  let i = heap.length-1;

  while(i>0 && heap[parent(i)] > heap[i]){
    swap(i,parent(i));
    i = parent(i);
  }

  updateUI();
}

// ---------- EXTRACT MIN ----------
function extractMin(){
  if(heap.length===0) return;

  heap[0] = heap[heap.length-1];
  heap.pop();

  heapify(0);
  updateUI();
}

// ---------- HEAPIFY ----------
function heapify(i){
  let smallest = i;
  let l = left(i);
  let r = right(i);

  if(l<heap.length && heap[l] < heap[smallest])
    smallest = l;

  if(r<heap.length && heap[r] < heap[smallest])
    smallest = r;

  if(smallest !== i){
    swap(i,smallest);
    heapify(smallest);
  }
}

// ---------- RENDER TREE ----------
function renderTree(){
  container.innerHTML = "";

  heap.forEach(v=>{
    const node = document.createElement("div");
    node.className="node";
    node.textContent=v;
    container.appendChild(node);
  });
}

// ---------- UPDATE UI ----------
function updateUI(){
  heapText.textContent = "Heap Array: [" + heap.join(", ") + "]";
  renderTree();
}

// ---------- EVENTS ----------
document.getElementById("insertBtn").onclick = ()=>{
  const val = Number(document.getElementById("valueInput").value);
  if(!isNaN(val)){
    insert(val);
    document.getElementById("valueInput").value="";
  }
};

document.getElementById("extractBtn").onclick = extractMin;