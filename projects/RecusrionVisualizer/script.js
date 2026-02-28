const stackEl = document.getElementById("stack");
const resultText = document.getElementById("resultText");

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Create stack frame UI
function pushFrame(text) {
  const frame = document.createElement("div");
  frame.className = "frame active";
  frame.textContent = text;
  stackEl.appendChild(frame);
  return frame;
}

// Factorial visualization
async function factorialVisual(n) {
  const frame = pushFrame(`factorial(${n})`);

  await sleep(600);

  if (n === 0 || n === 1) {
    frame.classList.remove("active");
    frame.classList.add("returned");
    frame.textContent += " → return 1";
    await sleep(600);
    return 1;
  }

  const result = n * await factorialVisual(n - 1);

  frame.classList.remove("active");
  frame.classList.add("returned");
  frame.textContent += ` → return ${result}`;

  await sleep(600);
  return result;
}

// Start visualization
document.getElementById("startBtn").onclick = async () => {
  stackEl.innerHTML = "";
  resultText.textContent = "";

  const n = Number(document.getElementById("inputN").value);
  if (n < 0) return;

  const result = await factorialVisual(n);
  resultText.textContent = `Final Result: ${result}`;
};