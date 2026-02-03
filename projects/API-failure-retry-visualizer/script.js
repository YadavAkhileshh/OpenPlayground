const failureRateInput = document.getElementById("failureRate");
const failureValue = document.getElementById("failureValue");
const maxRetriesInput = document.getElementById("maxRetries");
const baseDelayInput = document.getElementById("baseDelay");

const startBtn = document.getElementById("startBtn");
const logList = document.getElementById("logList");

failureRateInput.addEventListener("input", () => {
  failureValue.textContent = `${failureRateInput.value}%`;
});

startBtn.addEventListener("click", () => {
  logList.innerHTML = "";
  simulateRequest();
});

async function simulateRequest() {
  const failureRate = Number(failureRateInput.value);
  const maxRetries = Number(maxRetriesInput.value);
  const baseDelay = Number(baseDelayInput.value);

  let attempt = 0;

  while (attempt <= maxRetries) {
    log(`Attempt ${attempt + 1}: Sending request...`, "retry");

    const success = Math.random() * 100 > failureRate;

    if (success) {
      log(`Request succeeded on attempt ${attempt + 1}`, "success");
      return;
    } else {
      log(`Request failed ❌`, "fail");

      if (attempt === maxRetries) {
        log("Max retries reached. Giving up.", "fail");
        return;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      log(`Retrying in ${delay} ms...`, "retry");

      await wait(delay);
      attempt++;
    }
  }
}

function log(message, type) {
  const li = document.createElement("li");
  li.textContent = message;
  li.classList.add(type);
  logList.appendChild(li);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}