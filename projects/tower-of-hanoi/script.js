let rods = { A: [], B: [], C: [] };
let moveCount = 0;

function startGame() {
  const n = parseInt(document.getElementById("diskCount").value);
  rods = { A: [], B: [], C: [] };
  moveCount = 0;

  for (let i = n; i >= 1; i--) rods.A.push(i);

  document.getElementById("status").innerText = "";
  updateUI();
}

function updateUI() {
  document.getElementById("moves").innerText = `Moves: ${moveCount}`;

  ["A", "B", "C"].forEach(rod => {
    const rodDiv = document.getElementById(rod);
    rodDiv.innerHTML = "";

    rods[rod].forEach(disk => {
      const diskDiv = document.createElement("div");
      diskDiv.className = "disk";
      diskDiv.draggable = true;
      diskDiv.dataset.size = disk;
      diskDiv.dataset.rod = rod;
      diskDiv.style.width = `${disk * 22}px`;
      diskDiv.ondragstart = drag;
      rodDiv.appendChild(diskDiv);
    });
  });
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  const disk = ev.target;
  const rod = disk.dataset.rod;

  if (rods[rod][rods[rod].length - 1] != disk.dataset.size) {
    ev.preventDefault();
    return;
  }

  ev.dataTransfer.setData("diskSize", disk.dataset.size);
  ev.dataTransfer.setData("fromRod", rod);
}

function drop(ev) {
  ev.preventDefault();
  const toRod = ev.currentTarget.id;
  const fromRod = ev.dataTransfer.getData("fromRod");
  const diskSize = parseInt(ev.dataTransfer.getData("diskSize"));

  if (!fromRod || fromRod === toRod) return;

  const topTo = rods[toRod][rods[toRod].length - 1];

  if (topTo && topTo < diskSize) {
    document.getElementById("status").innerText = "❌ Invalid move!";
    return;
  }

  rods[fromRod].pop();
  rods[toRod].push(diskSize);
  moveCount++;

  document.getElementById("status").innerText = "";
  updateUI();
}
