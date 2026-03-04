function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getArray() {
  const input = document.getElementById("arrayInput").value;
  return input.split(",").map(x => parseInt(x.trim()));
}

async function runNGE() {
  const arr = getArray();
  if (!arr.length) return;

  let stack = [];
  let result = new Array(arr.length).fill(-1);

  const stackDiv = document.getElementById("stackDisplay");
  const resultDiv = document.getElementById("resultDisplay");

  stackDiv.innerHTML = "";
  resultDiv.innerHTML = "";

  for (let i = 0; i < arr.length; i++) {

    while (stack.length && arr[stack[stack.length - 1]] < arr[i]) {
      const idx = stack.pop();
      result[idx] = arr[i];
      await renderStack(stack, stackDiv);
      await sleep(500);
    }

    stack.push(i);
    await renderStack(stack, stackDiv, i);
    await sleep(500);
  }

  resultDiv.innerHTML = "Next Greater: " + result.join(", ");
}

async function runNSE() {
  const arr = getArray();
  if (!arr.length) return;

  let stack = [];
  let result = new Array(arr.length).fill(-1);

  const stackDiv = document.getElementById("stackDisplay");
  const resultDiv = document.getElementById("resultDisplay");

  stackDiv.innerHTML = "";
  resultDiv.innerHTML = "";

  for (let i = 0; i < arr.length; i++) {

    while (stack.length && arr[stack[stack.length - 1]] > arr[i]) {
      const idx = stack.pop();
      result[idx] = arr[i];
      await renderStack(stack, stackDiv);
      await sleep(500);
    }

    stack.push(i);
    await renderStack(stack, stackDiv, i);
    await sleep(500);
  }

  resultDiv.innerHTML = "Next Smaller: " + result.join(", ");
}

async function renderStack(stack, container, highlightIndex = -1) {
  container.innerHTML = "";

  stack.forEach(idx => {
    const div = document.createElement("span");
    div.className = "stack-item";
    div.textContent = idx;
    if (idx === highlightIndex) {
      div.classList.add("highlight");
    }
    container.appendChild(div);
  });
}
