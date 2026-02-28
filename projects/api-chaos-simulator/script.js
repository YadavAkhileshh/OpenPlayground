const runBtn = document.getElementById("runBtn");
const output = document.getElementById("output");

const probabilityInput = document.getElementById("probability");
const probValue = document.getElementById("probValue");

probabilityInput.addEventListener("input", () => {
  probValue.textContent = probabilityInput.value;
});

runBtn.addEventListener("click", runSimulation);

async function runSimulation() {
  const failureType = document.getElementById("failureType").value;
  const probability = Number(probabilityInput.value);
  const retries = Number(document.getElementById("retries").value);
  const timeout = Number(document.getElementById("timeout").value);

  let attempts = 0;
  let success = false;
  let startTime = Date.now();

  while (attempts <= retries && !success) {
    attempts++;
    try {
      await fakeApiCall(failureType, probability, timeout);
      success = true;
    } catch (err) {
      if (attempts > retries) break;
    }
  }

  const duration = Date.now() - startTime;
  const result = success ? "SUCCESS ✅" : "FAILED ❌";

  saveHistory({ result, attempts, duration });

  output.innerHTML = `
    <strong>Result:</strong> ${result}<br/>
    <strong>Attempts:</strong> ${attempts}<br/>
    <strong>Total Time:</strong> ${duration} ms<br/>
    <p>${getFeedback(success, attempts)}</p>
  `;
  output.classList.remove("hidden");
}

function fakeApiCall(type, probability, timeout) {
  return new Promise((resolve, reject) => {
    const shouldFail = Math.random() * 100 < probability;

    setTimeout(() => {
      if (!shouldFail) {
        resolve("OK");
        return;
      }

      if (type === "random") {
        reject("Random failure");
      } else {
        reject(type);
      }
    }, timeout);
  });
}

function getFeedback(success, attempts) {
  if (success && attempts === 1)
    return "Perfect UX. No retries needed.";
  if (success)
    return "Retries saved the user experience.";
  return "User likely saw an error. Improve fallback or messaging.";
}

function saveHistory(entry) {
  const history = JSON.parse(localStorage.getItem("chaosHistory")) || [];
  history.push({ ...entry, date: new Date().toISOString() });
  localStorage.setItem("chaosHistory", JSON.stringify(history));
}