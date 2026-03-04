let interval;

function startDP() {
  clearInterval(interval);

  const s1 = document.getElementById("str1").value;
  const s2 = document.getElementById("str2").value;

  const m = s1.length;
  const n = s2.length;

  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  const container = document.getElementById("tableContainer");
  container.innerHTML = "";

  const table = document.createElement("table");

  for (let i = 0; i <= m; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j <= n; j++) {
      const cell = document.createElement("td");
      cell.id = `cell-${i}-${j}`;
      cell.textContent = 0;
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  container.appendChild(table);

  let i = 1, j = 1;

  interval = setInterval(() => {

    if (i > m) {
      clearInterval(interval);
      reconstructLCS(dp, s1, s2);
      return;
    }

    highlight(i, j);

    if (s1[i - 1] === s2[j - 1]) {
      dp[i][j] = dp[i - 1][j - 1] + 1;
      document.getElementById(`cell-${i}-${j}`).classList.add("match");
    } else {
      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }

    document.getElementById(`cell-${i}-${j}`).textContent = dp[i][j];

    j++;
    if (j > n) {
      j = 1;
      i++;
    }

  }, 200);
}

function highlight(i, j) {
  document.querySelectorAll("td").forEach(c => c.classList.remove("active"));
  document.getElementById(`cell-${i}-${j}`).classList.add("active");
}

function reconstructLCS(dp, s1, s2) {
  let i = s1.length;
  let j = s2.length;
  let lcs = "";

  while (i > 0 && j > 0) {
    if (s1[i - 1] === s2[j - 1]) {
      lcs = s1[i - 1] + lcs;
      document.getElementById(`cell-${i}-${j}`).classList.add("path");
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  document.getElementById("result").textContent =
    "Longest Common Subsequence: " + lcs;
}

function reset() {
  clearInterval(interval);
  document.getElementById("tableContainer").innerHTML = "";
  document.getElementById("result").textContent = "";
}
