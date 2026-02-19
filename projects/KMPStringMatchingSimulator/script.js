function computeLPS(pattern) {
  let lps = new Array(pattern.length).fill(0);
  let len = 0;
  let i = 1;

  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else {
      if (len !== 0) {
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        i++;
      }
    }
  }
  return lps;
}

async function runKMP() {
  const text = document.getElementById("textInput").value;
  const pattern = document.getElementById("patternInput").value;

  if (!text || !pattern) return;

  const lps = computeLPS(pattern);
  document.getElementById("lpsDisplay").textContent = lps.join(" ");

  let i = 0, j = 0;
  let matches = [];

  const matchDiv = document.getElementById("matchDisplay");
  matchDiv.innerHTML = "";

  while (i < text.length) {
    await sleep(400);

    if (pattern[j] === text[i]) {
      matchDiv.innerHTML += `✔ Match at text[${i}] and pattern[${j}]<br>`;
      i++;
      j++;
    }

    if (j === pattern.length) {
      matches.push(i - j);
      matchDiv.innerHTML += `🎯 Pattern found at index ${i - j}<br><br>`;
      j = lps[j - 1];
    } else if (i < text.length && pattern[j] !== text[i]) {
      matchDiv.innerHTML += `❌ Mismatch at text[${i}] and pattern[${j}]<br>`;
      if (j !== 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
  }

  document.getElementById("result").textContent =
    matches.length > 0
      ? `Pattern found at indices: ${matches.join(", ")}`
      : "No match found";
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
