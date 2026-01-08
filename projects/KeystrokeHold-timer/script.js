let startTime = null;
const output = document.getElementById("output");

document.addEventListener("keydown", (e) => {
  if (startTime === null) {
    startTime = Date.now();
    output.textContent = `Holding "${e.key}"`;
  }
});

document.addEventListener("keyup", () => {
  if (startTime !== null) {
    const duration = Date.now() - startTime;
    output.textContent = `Held for ${duration} ms`;
    startTime = null;
  }
});
