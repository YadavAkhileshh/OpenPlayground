const nozzle = document.getElementById("nozzle");
let printing = false;

document.addEventListener("mousemove", (e) => {
  if (!printing) {
    nozzle.style.left = e.clientX - 250 + "px";
    nozzle.style.top = e.clientY + "px";
  }
});

function selectMat(m) {
  alert(`Material set to: ${m}`);
}

document.getElementById("printBtn").addEventListener("click", () => {
  printing = true;
  nozzle.style.boxShadow = "0 0 50px 20px #00ffaa";
  setTimeout(() => {
    printing = false;
    nozzle.style.boxShadow = "0 0 15px #00ffaa";
    alert("Print Complete: Molecular structure stabilized.");
  }, 3000);
});
