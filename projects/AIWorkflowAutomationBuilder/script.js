const canvas = document.getElementById("canvas");
const statusText = document.getElementById("status");

let selectedType="AI";
let nodes=[];

/* select node type */
document.querySelectorAll("[data-type]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    selectedType=btn.dataset.type;
  });
});

/* add node */
canvas.addEventListener("click",e=>{
  if(e.target!==canvas) return;

  const node=document.createElement("div");
  node.className=`node ${selectedType.toLowerCase()}`;
  node.textContent=selectedType;

  node.style.left=e.offsetX+"px";
  node.style.top=e.offsetY+"px";

  makeDraggable(node);

  node.addEventListener("dblclick",()=>{
    const txt=prompt("Edit node name:",node.textContent);
    if(txt) node.textContent=txt;
  });

  canvas.appendChild(node);
  nodes.push(node);
});

/* drag logic */
function makeDraggable(el){
  let dragging=false,offX=0,offY=0;

  el.addEventListener("mousedown",e=>{
    dragging=true;
    offX=e.offsetX;
    offY=e.offsetY;
  });

  document.addEventListener("mousemove",e=>{
    if(!dragging) return;

    const rect=canvas.getBoundingClientRect();
    el.style.left=(e.clientX-rect.left-offX)+"px";
    el.style.top=(e.clientY-rect.top-offY)+"px";
  });

  document.addEventListener("mouseup",()=>{
    dragging=false;
  });
}

/* run workflow simulation */
function sleep(ms){
  return new Promise(r=>setTimeout(r,ms));
}

document.getElementById("runBtn")
  .addEventListener("click",async ()=>{

  if(nodes.length===0) return;

  statusText.textContent="Status: Running Workflow...";

  for(let node of nodes){
    node.classList.add("running");
    await sleep(600);
    node.classList.remove("running");
  }

  statusText.textContent="Status: Workflow Completed ✔";
});

/* clear */
document.getElementById("clearBtn")
  .addEventListener("click",()=>{
    nodes.forEach(n=>n.remove());
    nodes=[];
    statusText.textContent="Status: Idle";
});