function calculate() {

  const model = document.getElementById("model").value;
  const inputText = document.getElementById("inputText").value;
  const outputTokens = parseInt(document.getElementById("outputTokens").value);
  const monthlyRequests = parseInt(document.getElementById("monthlyRequests").value);

  if (!inputText) {
    alert("Please enter input text");
    return;
  }

  // Approx token estimation (1 token ≈ 4 characters)
  const inputTokens = Math.ceil(inputText.length / 4);
  const totalTokens = inputTokens + outputTokens;

  let inputCost = 0;
  let outputCost = 0;

  // Example pricing (illustrative only)
  if (model === "gpt4") {
    inputCost = 0.03 / 1000;
    outputCost = 0.06 / 1000;
  }

  if (model === "gpt35") {
    inputCost = 0.0015 / 1000;
    outputCost = 0.002 / 1000;
  }

  if (model === "claude") {
    inputCost = 0.008 / 1000;
    outputCost = 0.024 / 1000;
  }

  if (model === "gemini") {
    inputCost = 0.002 / 1000;
    outputCost = 0.004 / 1000;
  }

  const costPerRequest = (inputTokens * inputCost) + (outputTokens * outputCost);
  const monthlyCost = costPerRequest * monthlyRequests;

  document.getElementById("inputTokens").textContent = inputTokens;
  document.getElementById("outputTokenDisplay").textContent = outputTokens;
  document.getElementById("totalTokens").textContent = totalTokens;
  document.getElementById("costPerRequest").textContent = costPerRequest.toFixed(6);
  document.getElementById("monthlyCost").textContent = monthlyCost.toFixed(2);

  document.getElementById("results").classList.remove("hidden");
}
